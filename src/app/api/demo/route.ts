import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        const backendFormData = new FormData();
        backendFormData.append("file", file);

        const fastApiUrl = `${process.env.WEB_URL}/demo/`;

        // Forward the real visitor IP so the backend's per-IP rate limiter
        // doesn't see every request as coming from this proxy.
        const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

        const response = await fetch(fastApiUrl, {
            method: "POST",
            body: backendFormData,
            headers: { "X-Forwarded-For": clientIp },
        });

        if (!response.ok || !response.body) {
            const errorText = await response.text();
            console.error("FastAPI backend error:", errorText);
            return NextResponse.json({ success: false, error: `Error from analysis service: ${errorText}` }, { status: response.status });
        }

        const readableStream = new ReadableStream({
            async start(controller) {
                const reader = response.body!.getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    controller.enqueue(value);
                }
                controller.close();
            },
        });

        return new NextResponse(readableStream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error) {
        console.error("Error in Next.js API route:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}