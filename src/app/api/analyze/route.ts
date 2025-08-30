import { NextRequest, NextResponse } from "next/server";

// Helper function to log the content of a ReadableStream
async function logStream(stream: ReadableStream<Uint8Array>, prefix: string) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    console.log(`\n--- START ${prefix} ---`);
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            console.log(`--- END ${prefix} ---\n`);
            break;
        }
        const chunk = decoder.decode(value, { stream: true });
        // Log the actual text content of the stream chunk
        console.log(chunk);
    }
}


export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        const backendFormData = new FormData();
        backendFormData.append("file", file);

        const fastApiUrl = `${process.env.WEB_URL || 'http://127.0.0.1:8000'}/analyze/`;

        console.log(`[API] Sending request to: ${fastApiUrl}`);
        const response = await fetch(fastApiUrl, {
            method: "POST",
            body: backendFormData,
            headers: { 'Accept': 'text/event-stream' },
        });

        if (!response.ok || !response.body) {
            const errorText = await response.text();
            console.error(`[API] Backend error (${response.status}):`, errorText);
            return NextResponse.json({ success: false, error: `Backend error: ${response.status}`, details: errorText }, { status: response.status });
        }

        // --- THE MAGIC IS HERE ---
        // .tee() splits the stream into two identical, independent streams.
        // We can log one and forward the other to the browser without interference.
        const [logStreamClone, forwardStream] = response.body.tee();

        // Start logging the content of the first stream in the background.
        // DO NOT await this, or it will block the response.
        logStream(logStreamClone, `BACKEND RESPONSE STREAM at ${new Date().toISOString()}`);

        const headers: Record<string, string> = {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Connection": "keep-alive",
        };
        const sessionId = response.headers.get('X-Session-ID');
        if (sessionId) {
            headers["X-Session-ID"] = sessionId;
        }

        // Return the second stream to the browser to be processed by the frontend.
        return new NextResponse(forwardStream, { headers });

    } catch (error: unknown) {
        console.error("[API] Unexpected error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return NextResponse.json({ status: "healthy" });
}
