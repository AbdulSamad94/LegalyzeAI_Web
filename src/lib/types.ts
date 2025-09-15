
export type RiskLevel = "critical" | "high" | "medium" | "low" | "unknown";

export interface RiskItem {
    description: string;
    level: RiskLevel;
    category: string;
    recommendation: string;
    clause_reference: string;
}

export interface DocumentInfo {
    filename: string;
    word_count: number;
    estimated_pages: number;
    estimated_read_time: number;
    processed_at: string;
}

export interface Analysis {
    summary: string;
    risks: RiskItem[];
    verdict: string;
    disclaimer: string;
}


export interface LegalAnalysisResult {
    type: "legal_analysis";
    document_info: DocumentInfo;
    analysis: Analysis;
    friendly_message: string;
    session_id: string;
}

export interface ErrorResult {
    type: "error";
    friendly_message: string;
    session_id: string;
}

export type AnalysisResultShape = LegalAnalysisResult | ErrorResult;

export interface TranslatedRisk {
    description: string;
    recommendation: string;
    level: RiskLevel;
    category: string;
}

export interface ProcessingUpdate {
    step: string;
    status: "processing" | "completed" | "failed";
    message: string;
    progress: number;
    timestamp: string;
    details?: Record<string, unknown>;
}

export type ProgressState = "pending" | "translating" | "completed" | "error";

export interface TranslationProgress {
    verdict: ProgressState;
    summary: ProgressState;
    risks: ProgressState[];
}

export interface TranslatedContent {
    verdict: string;
    summary: string;
    risks: TranslatedRisk[];
}


function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(data: Record<string, unknown>, key: string, fallback = ""): string {
    const value = data[key];
    return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
}

function getNumber(data: Record<string, unknown>, key: string, fallback = 0): number {
    const value = data[key];
    return typeof value === 'number' ? value : fallback;
}

/**
 * Safely parses the raw stream data, handling both successful analysis results
 * and error cases.
 *
 * @param rawData The raw object parsed from an SSE message.
 * @returns A fully typed `AnalysisResultShape` object, or `null` if the data is not a final result.
 */
export function parseStreamData(rawData: unknown): AnalysisResultShape | null {
    if (!isObject(rawData)) return null;

    // Check if this is a final_result wrapper
    if ('final_result' in rawData && isObject(rawData.final_result)) {
        const finalResult = rawData.final_result;
        const resultType = getString(finalResult, 'type');

        // Handle error results
        if (resultType === 'error') {
            return {
                type: 'error',
                session_id: getString(finalResult, 'session_id', 'unknown'),
                friendly_message: getString(finalResult, 'message', 'An error occurred during analysis.'),
            };
        }

        // Handle legal analysis results
        if (resultType === 'legal_analysis') {
            // Parse document info
            const docInfo = isObject(finalResult.document_info) ? finalResult.document_info : {};
            const documentInfo: DocumentInfo = {
                filename: getString(docInfo, 'filename', 'Unknown'),
                word_count: getNumber(docInfo, 'word_count', 0),
                estimated_pages: getNumber(docInfo, 'estimated_pages', 0),
                estimated_read_time: getNumber(docInfo, 'estimated_read_time', 0),
                processed_at: getString(docInfo, 'processed_at', new Date().toISOString()),
            };

            // Parse analysis
            const analysisData = isObject(finalResult.analysis) ? finalResult.analysis : {};

            // Parse risks array
            const risksArray = Array.isArray(analysisData.risks) ? analysisData.risks : [];
            const risks: RiskItem[] = risksArray.map((risk): RiskItem => {
                if (!isObject(risk)) {
                    return {
                        description: '',
                        level: 'unknown',
                        category: '',
                        recommendation: '',
                        clause_reference: '',
                    };
                }

                let level = getString(risk, 'level', 'unknown').toLowerCase() as RiskLevel;
                const validLevels: RiskLevel[] = ["critical", "high", "medium", "low", "unknown"];
                if (!validLevels.includes(level)) {
                    level = 'unknown';
                }

                return {
                    description: getString(risk, 'description'),
                    level,
                    category: getString(risk, 'category'),
                    recommendation: getString(risk, 'recommendation'),
                    clause_reference: getString(risk, 'clause_reference'),
                };
            });

            const analysis: Analysis = {
                summary: getString(analysisData, 'summary'),
                risks,
                verdict: getString(analysisData, 'verdict'),
                disclaimer: getString(analysisData, 'disclaimer',
                    'This analysis is for informational purposes only and does not constitute legal advice.'),
            };

            return {
                type: 'legal_analysis',
                document_info: documentInfo,
                analysis,
                friendly_message: getString(finalResult, 'friendly_message',
                    'Your document analysis is complete. Please review the report below.'),
                session_id: getString(finalResult, 'session_id', 'unknown'),
            };
        }

        // Handle casual response
        if (resultType === 'casual_response') {
            return {
                type: 'error', // Map to error for simplicity since your UI only handles legal_analysis and error
                friendly_message: getString(finalResult, 'message', 'Response generated.'),
                session_id: getString(finalResult, 'session_id', 'unknown'),
            };
        }
    }

    // Not a final result
    return null;
}