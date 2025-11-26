import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/database/mongoDB";
import Analytics from "@/lib/database/models/Analysis";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Ensure session.user.id is a valid string before creating a new ObjectId
        if (typeof session.user.id !== 'string' || !mongoose.Types.ObjectId.isValid(session.user.id)) {
            console.error("[API/analyses] Invalid userId format:", session.user.id);
            return NextResponse.json({ success: false, error: "Unauthorized: Invalid user ID" }, { status: 401 });
        }

        await dbConnect();

        const analyses = await Analytics.find({ userId: session.user.id }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: analyses }, { status: 200 });

    } catch (error) {
        console.error("[API/analyses] Error fetching analyses:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}