import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/database/mongoDB";
import Analytics from "@/lib/database/models/Analysis";
import mongoose from "mongoose";

interface RouteContext {
    params: Promise<{
        analysisId: string;
    }>;
}

export async function GET(req: Request, { params }: RouteContext) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { analysisId } = await params;
        if (!mongoose.Types.ObjectId.isValid(analysisId)) {
            return NextResponse.json({ success: false, error: "Invalid Analysis ID" }, { status: 400 });
        }

        await dbConnect();

        const userId = new mongoose.Types.ObjectId(session.user.id);

        const analysis = await Analytics.findOne({
            _id: analysisId,
            userId: userId, // CRITICAL: Ensure the analysis belongs to the logged-in user
        }).lean();

        if (!analysis) {
            return NextResponse.json({ success: false, error: "Analysis not found or access denied" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: analysis });

    } catch (error) {
        console.error(`[API/analyses/:id] Error fetching analysis ${(await params).analysisId}:`, error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
