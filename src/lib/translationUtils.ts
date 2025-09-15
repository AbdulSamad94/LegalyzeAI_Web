import { type RiskLevel } from "./types";

export const RESULTS_MARKERS = {
    VERDICT: "__VERDICT__",
    SUMMARY: "__SUMMARY__",
    RISKS: "__RISKS__",
    RSTART: "__RSTART__",
    REND: "__REND__",
};

export const buildCombinedText = (
    verdict: string,
    summary: string,
    risks: {
        description: string;
        recommendation: string;
        level: RiskLevel;
        category: string;
    }[]
) => {
    // Build a single string with clear markers that we instruct the translator to preserve.
    const parts: string[] = [];
    parts.push(RESULTS_MARKERS.VERDICT);
    parts.push(verdict || "");
    parts.push("");
    parts.push(RESULTS_MARKERS.SUMMARY);
    parts.push(summary || "");
    parts.push("");
    parts.push(RESULTS_MARKERS.RISKS);

    for (const r of risks) {
        parts.push(RESULTS_MARKERS.RSTART);
        parts.push(`CATEGORY: ${r.category}`);
        parts.push(`LEVEL: ${r.level}`);
        parts.push("DESCRIPTION:");
        parts.push(r.description || "");
        parts.push("RECOMMENDATION:");
        parts.push(r.recommendation || "");
        parts.push(RESULTS_MARKERS.REND);
    }

    // join with double newlines to give the translator clear paragraph separators
    return parts.join("\n\n");
};

export const parseCombinedTranslated = (translated: string) => {
    // Try to locate markers and extract content between them.
    const result: {
        verdict: string;
        summary: string;
        risks: {
            category: string;
            level: string;
            description: string;
            recommendation: string;
        }[];
    } = {
        verdict: "",
        summary: "",
        risks: [],
    };

    const normalized = translated;
    const sections = normalized.split(RESULTS_MARKERS.VERDICT);
    if (sections.length < 2) {
        // markers missing -> parsing failed
        return null;
    }

    const afterVerdict = sections[1];
    const [verdictAndRest] = [afterVerdict];
    const sSummarySplit = verdictAndRest.split(RESULTS_MARKERS.SUMMARY);
    if (sSummarySplit.length < 2) return null;
    result.verdict = sSummarySplit[0].trim();

    const afterSummary = sSummarySplit[1];
    const sRisksSplit = afterSummary.split(RESULTS_MARKERS.RISKS);
    if (sRisksSplit.length < 2) return null;
    result.summary = sRisksSplit[0].trim();

    const risksSection = sRisksSplit[1];
    // split by RSTART markers
    const rawRisks = risksSection
        .split(RESULTS_MARKERS.RSTART)
        .map((r) => r.trim())
        .filter(Boolean);
    for (const raw of rawRisks) {
        // each raw ends with REND; ensure we trim trailing marker
        const parts = raw.split(RESULTS_MARKERS.REND)[0].trim();
        // now parse by lines
        const lines = parts
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);

        let category = "";
        let level = "";
        let description = "";
        let recommendation = "";
        let mode: "none" | "desc" | "rec" = "none";

        for (const line of lines) {
            const up = line.toUpperCase();
            if (up.startsWith("CATEGORY:")) {
                category = line.substring(line.indexOf(":") + 1).trim();
                mode = "none";
                continue;
            }
            if (up.startsWith("LEVEL:")) {
                level = line.substring(line.indexOf(":") + 1).trim();
                mode = "none";
                continue;
            }
            if (up.startsWith("DESCRIPTION:")) {
                mode = "desc";
                continue;
            }
            if (up.startsWith("RECOMMENDATION:")) {
                mode = "rec";
                continue;
            }
            if (mode === "desc") {
                description += (description ? "\n" : "") + line;
            } else if (mode === "rec") {
                recommendation += (recommendation ? "\n" : "") + line;
            }
        }

        result.risks.push({
            category,
            level,
            description: description.trim(),
            recommendation: recommendation.trim(),
        });
    }

    return result;
};