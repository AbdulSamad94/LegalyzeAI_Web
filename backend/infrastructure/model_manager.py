"""Model initialization and management for OpenAI and OpenRouter."""

from typing import Optional
from agents import AsyncOpenAI, OpenAIChatCompletionsModel, OpenAIResponsesModel, ModelSettings
from config import settings


class ModelManager:
    """Manages AI model initialization following openai-agents-sdk patterns"""

    def __init__(self):
        """Initialize model manager"""
        self.openai_client: Optional[AsyncOpenAI] = None
        self.openai_model: Optional[OpenAIResponsesModel] = None
        self.openrouter_client: Optional[AsyncOpenAI] = None
        self.openrouter_model: Optional[OpenAIChatCompletionsModel] = None
        self.model_settings: Optional[ModelSettings] = None

    def initialize(self) -> tuple[bool, list[str]]:
        """
        Initialize all models based on configuration.

        Returns:
            Tuple of (success: bool, errors: list[str])
        """
        errors = []

        try:
            # Initialize model settings (shared across models)
            self.model_settings = ModelSettings(
                temperature=settings.openai.temperature,
                top_p=settings.openai.top_p,
                max_tokens=settings.openai.max_tokens,
            )

            # Initialize OpenAI model
            if settings.openai.is_configured:
                try:
                    self.openai_client = AsyncOpenAI(api_key=settings.openai.api_key)
                    self.openai_model = OpenAIResponsesModel(
                        openai_client=self.openai_client,
                        model=settings.openai.model
                    )
                    print(f"[MODEL] OpenAI model initialized: {settings.openai.model}")
                except Exception as e:
                    errors.append(f"OpenAI init failed: {str(e)}")
            else:
                errors.append("OpenAI not configured")

            # Initialize OpenRouter model (for demo)
            if settings.openrouter.is_configured:
                try:
                    self.openrouter_client = AsyncOpenAI(
                        api_key=settings.openrouter.api_key,
                        base_url=settings.openrouter.base_url
                    )
                    self.openrouter_model = OpenAIChatCompletionsModel(
                        openai_client=self.openrouter_client,
                        model=settings.openrouter.model
                    )
                    print(f"[MODEL] OpenRouter model initialized: {settings.openrouter.model}")
                except Exception as e:
                    errors.append(f"OpenRouter init failed: {str(e)}")
            else:
                errors.append("OpenRouter not configured")

            success = len(errors) == 0 or self.openai_model is not None
            return success, errors

        except Exception as e:
            return False, [f"Model initialization failed: {str(e)}"]

    def get_openai_model(self) -> Optional[OpenAIResponsesModel]:
        """Get OpenAI model instance"""
        return self.openai_model

    def get_openrouter_model(self) -> Optional[OpenAIChatCompletionsModel]:
        """Get OpenRouter model instance"""
        return self.openrouter_model

    def get_model_settings(self, max_tokens: Optional[int] = None) -> ModelSettings:
        """
        Get model settings. Pass `max_tokens` to override the shared default for
        agents whose structured output can legitimately exceed it (e.g. an agent
        that must return a full summary + risk list, not just a short decision) —
        `settings.openai.max_tokens` is tuned for small classification-style
        outputs and will silently truncate larger JSON outputs mid-generation,
        producing invalid JSON that looks like a random model failure.
        """
        if max_tokens is not None:
            return ModelSettings(
                temperature=settings.openai.temperature,
                top_p=settings.openai.top_p,
                max_tokens=max_tokens,
            )

        if self.model_settings is None:
            self.model_settings = ModelSettings(
                temperature=settings.openai.temperature,
                top_p=settings.openai.top_p,
                max_tokens=settings.openai.max_tokens,
            )
        return self.model_settings


# Global model manager instance
model_manager = ModelManager()
