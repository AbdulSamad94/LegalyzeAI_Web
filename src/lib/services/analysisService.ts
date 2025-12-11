import mongoose from "mongoose";
import dbConnect from "@/lib/database/mongoDB";
import Analytics from "@/lib/database/models/Analysis";
import { LegalAnalysisResult, parseStreamData } from "@/lib/types";

export class AnalysisService {
    /**
     * Reads a stream, reconstructs server-sent events, parses the final JSON analysis,
     * and saves it to the database associated with the user.
     */
    static async collectAndSaveAnalysis(
        stream: ReadableStream<Uint8Array>,
        userId: mongoose.Types.ObjectId,
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
                    } catch (jsonError) {
                        // Ignore partial JSON chunks
                    }
                }
            }

            if (!analysisResult) {
                console.error("[AnalysisService] No valid JSON analysis objects found.");
                return;
            }

            if (analysisResult.summary && analysisResult.risks && analysisResult.verdict) {
                await dbConnect();

                const newAnalysis = new Analytics({
                    userId,
                    documentName,
                    documentType: 'General',
                    summary: analysisResult.summary,
                    risks: analysisResult.risks.filter(Boolean),
                    verdict: analysisResult.verdict,
                });

                await newAnalysis.save();
                console.log(`[AnalysisService] Successfully saved analysis for: ${documentName}`);
            } else {
                console.error("[AnalysisService] Missing required fields in analysis result.");
            }
        } catch (error) {
            console.error("[AnalysisService] Error collecting and saving analysis:", error);
        }
    }
}
