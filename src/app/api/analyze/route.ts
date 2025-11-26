import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/database/mongoDB";
import Analytics from "@/lib/database/models/Analysis";
import mongoose from "mongoose";
import { LegalAnalysisResult, parseStreamData, RiskItem } from "@/lib/types";

// This new function will read the stream, find the final analysis result,
// and save it to the database.
async function collectAndSaveAnalysis(
    stream: ReadableStream<Uint8Array>,
    userId: mongoose.Types.ObjectId,
    documentName: string
) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let fullStreamContent = "";
    console.log(`[DB] Starting to collect stream for user: ${userId}`);

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            fullStreamContent += decoder.decode(value, { stream: true });
        }

        // The stream sends data in Server-Sent Events (SSE) format.
        // We need to parse each 'data:' line and find the last complete JSON object.
        const lines = fullStreamContent.split('\n');
        let analysisResult: LegalAnalysisResult['analysis'] | null = null;

        for (const line of lines) {
            if (line.startsWith('data:')) {
                const dataString = line.substring(5).trim(); // Remove 'data:' prefix
                try {
                    const parsedData = JSON.parse(dataString);
                    const finalResult = parseStreamData(parsedData);
                    if (finalResult && finalResult.type === 'legal_analysis') {
                        analysisResult = finalResult.analysis;
                    }
                } catch (jsonError) {
                    // console.warn("[DB] Could not parse line as JSON (might be a partial or non-JSON event):", dataString);
                }
            }
        }

        if (!analysisResult) {
            console.error("[DB] No valid JSON analysis objects found in the stream.");
            return;
        }


        // Check if the result has the expected structure and correctly map risks
        if (analysisResult.summary && analysisResult.risks && analysisResult.verdict) {
            await dbConnect();

            const newAnalysis = new Analytics({
                userId,
                documentName,
                documentType: 'General',
                summary: analysisResult.summary,
                risks: analysisResult.risks.filter(Boolean),
                verdict: analysisResult.verdict,
            });

            await newAnalysis.save();
            console.log(`[DB] Successfully saved analysis for document: ${documentName}`);
        } else {
            console.error("[DB] Final JSON object from stream is missing required analysis fields.");
        }
    } catch (error) {
        console.error("[DB] Error collecting and saving analysis:", error);
    }
}


export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }
        // Ensure session.user.id is a valid string before creating a new ObjectId
        if (typeof session.user.id !== 'string' || !mongoose.Types.ObjectId.isValid(session.user.id)) {
            console.error("[API] Invalid userId format:", session.user.id);
            return NextResponse.json({ success: false, error: "Unauthorized: Invalid user ID" }, { status: 401 });
        }
        const userId = new mongoose.Types.ObjectId(session.user.id);

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

        const [dbStreamClone, forwardStream] = response.body.tee();

        // Start collecting and saving the analysis in the background.
        // DO NOT await this, as it would block the response to the client.
        collectAndSaveAnalysis(dbStreamClone, userId, file.name);

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
