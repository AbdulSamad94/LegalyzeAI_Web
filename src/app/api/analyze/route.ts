import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import { AnalysisService } from "@/lib/services/analysisService";
import { handleApiError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        if (typeof session.user.id !== 'string' || !mongoose.Types.ObjectId.isValid(session.user.id)) {
            return NextResponse.json({ success: false, error: "Unauthorized: Invalid user ID" }, { status: 401 });
        }

        const userId = new mongoose.Types.ObjectId(session.user.id);
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        // Prepare request to Python backend
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
            throw new Error(`Backend error (${response.status}): ${errorText}`);
        }

        const [dbStreamClone, forwardStream] = response.body.tee();

        // Use the Service to handle the background saving
        // deliberately not awaiting this to allow streaming to continue
        AnalysisService.collectAndSaveAnalysis(dbStreamClone, userId, file.name);

        const headers: Record<string, string> = {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Connection": "keep-alive",
        };
        const sessionId = response.headers.get('X-Session-ID');
        if (sessionId) {
            headers["X-Session-ID"] = sessionId;
        }

        return new NextResponse(forwardStream, { headers });

    } catch (error) {
        return handleApiError(error);
    }
}
