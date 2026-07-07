import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db/client";
import { analyses as analysesTable } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

interface RouteContext {
    params: Promise<{
        analysisId: string;
    }>;
}

export async function GET(req: Request, { params }: RouteContext) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { analysisId } = await params;

        const analysis = await db.query.analyses.findFirst({
            where: and(
                eq(analysesTable.id, analysisId),
                eq(analysesTable.userId, session.user.id)
            ),
        });

        if (!analysis) {
            return NextResponse.json({ success: false, error: "Analysis not found or access denied" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: analysis });

    } catch (error) {
        console.error(`[API/analyses/:id] Error fetching analysis ${(await params).analysisId}:`, error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: RouteContext) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { analysisId } = await params;

        const [deleted] = await db
            .delete(analysesTable)
            .where(
                and(
                    eq(analysesTable.id, analysisId),
                    eq(analysesTable.userId, session.user.id)
                )
            )
            .returning({ id: analysesTable.id });

        if (!deleted) {
            return NextResponse.json({ success: false, error: "Analysis not found or access denied" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: { id: deleted.id } });

    } catch (error) {
        console.error(`[API/analyses/:id] Error deleting analysis ${(await params).analysisId}:`, error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
