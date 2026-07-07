import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db/client";
import { analyses as analysesTable } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const userAnalyses = await db.query.analyses.findMany({
            where: eq(analysesTable.userId, session.user.id),
            orderBy: desc(analysesTable.createdAt),
        });

        return NextResponse.json({ success: true, data: userAnalyses }, { status: 200 });

    } catch (error) {
        console.error("[API/analyses] Error fetching analyses:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}