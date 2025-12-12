import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import User from "@/lib/database/models/User";
import dbConnect from "@/lib/database/mongoDB";

export async function GET(req: NextRequest) {
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
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        // Logic to reset count if it's a new day (display purposes, actual reset happens on upload too)
        // We replicate the logic here so the UI shows the correct potential state
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastUploadDate = user.lastUploadDate ? new Date(user.lastUploadDate) : null;
        if (lastUploadDate) {
            lastUploadDate.setHours(0, 0, 0, 0);
        }

        let dailyUploadCount = user.dailyUploadCount || 0;

        if (!lastUploadDate || lastUploadDate.getTime() < today.getTime()) {
            dailyUploadCount = 0;
        }

        return NextResponse.json({
            success: true,
            dailyUploadCount,
            limit: 3
        });

    } catch (error) {
        console.error("Error fetching usage:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
