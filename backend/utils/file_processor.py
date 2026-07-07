"""File processing and document extraction utilities."""

from typing import Tuple, List
import pdfplumber
from docx import Document
from PIL import Image
import pytesseract
from pdf2image import convert_from_bytes


SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg"}

# Binary container signatures that should never appear in real extracted text.
# If any of these show up, extraction was skipped/failed and raw bytes leaked through.
_BINARY_SIGNATURES = (b"PK\x03\x04", b"%PDF-", b"\xff\xd8\xff", b"\x89PNG")


def is_probably_text(text: str, sample_size: int = 4096) -> bool:
    """
    Heuristic check that a string is real extracted text, not raw binary
    that was decoded byte-for-byte (e.g. a zip/PDF/image signature passed
    through `.decode("utf-8", errors="ignore")`).

    Used as the fail-fast gate before any text reaches an LLM agent.
    """
    if not text or not text.strip():
        return False

    sample = text[:sample_size]
    sample_bytes = sample.encode("utf-8", errors="ignore")

    if any(sample_bytes.startswith(sig) for sig in _BINARY_SIGNATURES):
        return False

    if "\x00" in sample:
        return False

    # Real text (including non-Latin scripts like Urdu/Arabic) never contains
    # more than a tiny fraction of C0 control characters other than whitespace.
    control_chars = sum(1 for ch in sample if ord(ch) < 32 and ch not in "\n\r\t")
    if control_chars / max(len(sample), 1) > 0.05:
        return False

    return True


class FileProcessor:
    """Handles file upload processing and text extraction"""

    @staticmethod
    def get_supported_extensions() -> List[str]:
        """Get list of supported file extensions"""
        return list(SUPPORTED_EXTENSIONS)

    @staticmethod
    async def process_file(file_content: bytes, filename: str) -> Tuple[str, str]:
        """
        Process uploaded file and extract text.

        Args:
            file_content: File bytes
            filename: Original filename

        Returns:
            Tuple of (extracted_text, original_filename)

        Raises:
            ValueError: If file type not supported
        """
        extension = "." + filename.split(".")[-1].lower()

        if extension not in SUPPORTED_EXTENSIONS:
            raise ValueError(f"Unsupported file type: {extension}")

        if extension == ".pdf":
            text, name = await FileProcessor._process_pdf(file_content, filename)
        elif extension == ".docx":
            text, name = FileProcessor._process_docx(file_content, filename)
        elif extension == ".txt":
            text, name = FileProcessor._process_text(file_content, filename)
        elif extension in {".png", ".jpg", ".jpeg"}:
            text, name = await FileProcessor._process_image(file_content, filename)
        else:
            raise ValueError(f"Unsupported file type: {extension}")

        if not is_probably_text(text):
            raise ValueError(
                f"Extraction for '{filename}' did not produce readable text "
                f"(result looks binary, empty, or corrupted). Refusing to send "
                f"this content to the AI agent."
            )

        return text, name

    @staticmethod
    async def _process_pdf(file_content: bytes, filename: str) -> Tuple[str, str]:
        """Extract text from PDF"""
        try:
            from io import BytesIO
            with pdfplumber.open(BytesIO(file_content)) as pdf:
                text = ""
                for page in pdf.pages:
                    text += page.extract_text() or ""
                return text or "", filename
        except Exception as e:
            raise ValueError(f"PDF processing failed: {str(e)}")

    @staticmethod
    def _process_docx(file_content: bytes, filename: str) -> Tuple[str, str]:
        """Extract text from DOCX"""
        try:
            from io import BytesIO
            doc = Document(BytesIO(file_content))
            text = "\n".join([para.text for para in doc.paragraphs])
            return text or "", filename
        except Exception as e:
            raise ValueError(f"DOCX processing failed: {str(e)}")

    @staticmethod
    def _process_text(file_content: bytes, filename: str) -> Tuple[str, str]:
        """Extract text from plain text file"""
        try:
            text = file_content.decode("utf-8", errors="ignore")
            return text or "", filename
        except Exception as e:
            raise ValueError(f"Text processing failed: {str(e)}")

    @staticmethod
    async def _process_image(file_content: bytes, filename: str) -> Tuple[str, str]:
        """Extract text from image using OCR"""
        try:
            from io import BytesIO
            image = Image.open(BytesIO(file_content))
            text = pytesseract.image_to_string(image)
            return text or "", filename
        except Exception as e:
            raise ValueError(f"Image processing failed: {str(e)}")


# Global file processor instance
file_processor = FileProcessor()
