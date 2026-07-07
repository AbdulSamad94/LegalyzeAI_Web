import { db } from "@/lib/db/client";
import { analyses } from "@/lib/db/schema";
import { LegalAnalysisResult, parseStreamData } from "@/lib/types";

export class AnalysisService {
    static async collectAndSaveAnalysis(
        stream: ReadableStream<Uint8Array>,
        userId: string,
        documentName: string
    ) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let fullStreamContent = "";
        console.log(`[AnalysisService] Starting to collect stream for user: ${userId}`);

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                fullStreamContent += decoder.decode(value, { stream: true });
            }

            // Parse SSE data
            const lines = fullStreamContent.split('\n');
            let analysisResult: LegalAnalysisResult['analysis'] | null = null;

            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const dataString = line.substring(5).trim();
                    try {
                        const parsedData = JSON.parse(dataString);
                        const finalResult = parseStreamData(parsedData);
                        if (finalResult && finalResult.type === 'legal_analysis') {
                            analysisResult = finalResult.analysis;
                        }
                    } catch {
                        // Ignore partial JSON chunks
                    }
                }
            }

            if (!analysisResult) {
                console.error("[AnalysisService] No valid JSON analysis objects found.");
                return;
            }

            if (analysisResult.summary && analysisResult.risks && analysisResult.verdict) {
                await db.insert(analyses).values({
                    id: crypto.randomUUID(),
                    userId,
                    documentName,
                    documentType: 'General',
                    summary: analysisResult.summary,
                    risks: analysisResult.risks.filter(Boolean),
                    verdict: analysisResult.verdict,
                });

                console.log(`[AnalysisService] Successfully saved analysis for: ${documentName}`);
            } else {
                console.error("[AnalysisService] Missing required fields in analysis result.");
            }
        } catch (error) {
            console.error("[AnalysisService] Error collecting and saving analysis:", error);
        }
    }
}
