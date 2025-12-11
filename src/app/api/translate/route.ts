import { NextRequest, NextResponse } from "next/server";
import { translateSchema } from "@/lib/validators/translate";
import { TranslationService } from "@/lib/services/translationService";
import { handleApiError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Validation (Zod)
        const validatedData = translateSchema.parse(body);

        // 2. Service Call
        const result = await TranslationService.translate(validatedData);

        // 3. Response
        return NextResponse.json({
            success: true,
            translatedText: result.translatedText,
            chunksProcessed: 1,
            geminiUsed: result.method === "gemini",
            fallback: result.method === "fallback",
            serviceUsed: result.serviceName
        });

    } catch (error) {
        return handleApiError(error);
    }
}
