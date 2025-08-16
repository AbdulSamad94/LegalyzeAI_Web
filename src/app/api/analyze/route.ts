import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return new NextResponse("No file uploaded.", { status: 400 });
        }

        const backendFormData = new FormData();
        backendFormData.append("file", file);

        const fastApiUrl = `${process.env.WEB_URL}/analyze/`;

        const response = await fetch(fastApiUrl, {
            method: "POST",
            body: backendFormData,
        });

        if (!response.ok || !response.body) {
            const errorText = await response.text();
            console.error("FastAPI backend error:", errorText);
            return new NextResponse(`Error from analysis service: ${errorText}`, { status: response.status });
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
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}