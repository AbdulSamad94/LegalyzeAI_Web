import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import { AnalysisService } from "@/lib/services/analysisService";
import { handleApiError } from "@/lib/api-utils";
import User from "@/lib/database/models/User";
import dbConnect from "@/lib/database/mongoDB";
import { DAILY_UPLOAD_LIMIT } from "@/lib/constants/UserConstants";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        if (typeof session.user.id !== 'string' || !mongoose.Types.ObjectId.isValid(session.user.id)) {
            return NextResponse.json({ success: false, error: "Unauthorized: Invalid user ID" }, { status: 401 });
        }

        const userId = new mongoose.Types.ObjectId(session.user.id);

        // Atomic limit check and increment to prevent race conditions
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Step 1: Atomically reset the count if the last upload was before today.
        await User.updateOne(
            { _id: userId, $or: [{ lastUploadDate: { $lt: todayStart } }, { lastUploadDate: null }] },
            { $set: { dailyUploadCount: 0 } }
        );

        // Step 2: Atomically find and increment the user's count if they are under the limit.
        // We update lastUploadDate on every upload
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId, dailyUploadCount: { $lt: DAILY_UPLOAD_LIMIT } },
            { $inc: { dailyUploadCount: 1 }, $set: { lastUploadDate: new Date() } }
        );

        if (!updatedUser) {
            return NextResponse.json({
                success: false,
                error: `Daily limit reached. You can only upload ${DAILY_UPLOAD_LIMIT} documents per day.`
            }, { status: 429 });
        }

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
