import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db/client";
import { user as userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DAILY_UPLOAD_LIMIT } from "@/lib/constants/UserConstants";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const user = await db.query.user.findFirst({
            where: eq(userTable.id, session.user.id),
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        // Logic to reset count if it's a new day (display purposes, actual reset happens on upload too)
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
            limit: DAILY_UPLOAD_LIMIT
        });

    } catch (error) {
        console.error("Error fetching usage:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
