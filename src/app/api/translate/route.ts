// app/api/translate/route.ts
import { NextRequest, NextResponse } from "next/server";

interface TranslateApiSuccess {
    success: true;
    translatedText: string;
    chunksProcessed: number; // will be 1 in this single-request flow
    fallback?: boolean;
    geminiUsed?: boolean;
}

interface TranslateApiFailure {
    success: false;
    error: string;
    details?: string;
}

type TranslateApiResponse = TranslateApiSuccess | TranslateApiFailure;

type TranslationResultMethod = "gemini" | "service" | "fallback" | "none";

interface TranslationResult {
    translated: string;
    method: TranslationResultMethod;
    serviceName?: string;
}

/* -------------------------
   Local fallback dictionary
   ------------------------- */
function getFallbackTranslation(text: string): string {
    const fallbackDict: Record<string, string> = {
        Summary: "خلاصہ",
        "Risk Analysis": "خطرے کا تجزیہ",
        "Analysis Complete": "تجزیہ مکمل",
        "Document Summary": "دستاویز کا خلاصہ",
        "AI Verdict": "AI فیصلہ",
        Recommendation: "تجویز",
        Critical: "انتہائی اہم",
        High: "زیادہ",
        Medium: "درمیانہ",
        Low: "کم",
        Unknown: "نامعلوم",
        contract: "معاہدہ",
        agreement: "رضامندی",
        clause: "شق",
        liability: "ذمہ داری",
        terms: "شرائط",
        conditions: "حالات",
        breach: "خلاف ورزی",
        violation: "نقض",
        penalty: "سزا",
        damages: "نقصانات",
        compensation: "معاوضہ",
        legal: "قانونی",
        document: "دستاویز",
        review: "جائزہ",
        analysis: "تجزیہ",
        "The document": "دستاویز",
        "This agreement": "یہ معاہدہ",
        "shall be": "ہوگا",
        "may be": "ہو سکتا ہے",
        "must be": "ہونا چاہیے",
        "should be": "ہونا چاہیے",
    };

    let out = text;
    for (const [en, ur] of Object.entries(fallbackDict)) {
        // escape any regex metacharacters in the english phrase
        const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\b${escaped}\\b`, "gi");
        out = out.replace(regex, ur);
    }
    return out;
}

/* -------------------------
   Gemini helpers (typed)
   ------------------------- */

async function tryGeminiTranslate(text: string, source: string, target: string): Promise<string | null> {
    const apiKey =
        process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? process.env.GOOGLE_GENERATIVE_API_KEY;
    if (!apiKey) return null;

    const endpoint =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    const prompt = `Translate the following text from ${source} to ${target}. Only output the translated text. Preserve paragraph breaks, lists, and special markers like __VERDICT__ or __RSTART__ exactly as-is.\n\n"""${text}"""`;

    const body = {
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }],
            },
        ],
        generationConfig: {
            maxOutputTokens: Math.min(65500, Math.max(1024, Math.ceil(text.length / 1.5))),
            temperature: 0.0,
        },
    };

    async function callOnce(): Promise<{ ok: boolean; status: number; parsed?: unknown; rawText: string }> {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey,
            } as HeadersInit,
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(30000),
        });

        const rawText = await res.text().catch(() => "");
        let parsed: unknown | undefined = undefined;
        try {
            parsed = rawText ? JSON.parse(rawText) : undefined;
        } catch {
            parsed = undefined;
        }

        return { ok: res.ok, status: res.status, parsed, rawText };
    }

    try {
        const first = await callOnce();

        if (first.ok) {
            const extracted = extractGeminiText(first.parsed);
            if (extracted && extracted.trim()) return extracted.trim();
            return null;
        }

        if (first.status === 429) {
            const retryDelaySeconds = extractRetryDelaySeconds(first.parsed);
            const waitMs = retryDelaySeconds ? Math.max(1000, retryDelaySeconds * 1000) : 30000;
            await new Promise((r) => setTimeout(r, waitMs));
            const second = await callOnce();
            if (second.ok) {
                const extracted = extractGeminiText(second.parsed);
                if (extracted && extracted.trim()) return extracted.trim();
            }
            return null;
        }

        return null;
    } catch {
        return null;
    }
}

function extractRetryDelaySeconds(parsed: unknown): number | null {
    if (!parsed || typeof parsed !== "object") return null;
    const p = parsed as Record<string, unknown>;
    const err = p["error"] as Record<string, unknown> | undefined;
    if (!err) return null;
    const details = err["details"] as unknown[] | undefined;
    if (!details) return null;
    for (const d of details) {
        if (typeof d === "object" && d !== null && "@type" in d && (d as Record<string, unknown>)["@type"] === "type.googleapis.com/google.rpc.RetryInfo") {
            const info = d as Record<string, unknown>;
            const retryDelay = info["retryDelay"] as string | undefined; // e.g. "29s"
            if (retryDelay && retryDelay.endsWith("s")) {
                const secs = parseInt(retryDelay.slice(0, -1), 10);
                if (!Number.isNaN(secs)) return secs;
            }
        }
    }
    return null;
}

function extractGeminiText(parsed: unknown): string | undefined {
    if (!parsed) return undefined;
    if (typeof parsed === "string") return parsed;
    if (typeof parsed !== "object") return undefined;
    const obj = parsed as Record<string, unknown>;

    const candidates = obj["candidates"];
    if (Array.isArray(candidates) && candidates.length > 0) {
        const first = candidates[0] as Record<string, unknown>;
        const content = first["content"];
        if (content && typeof content === "object") {
            // case content.parts
            const partsCandidate = (content as { parts?: unknown }).parts;
            if (Array.isArray(partsCandidate)) {
                return partsCandidate
                    .map((p) => {
                        if (p && typeof p === "object" && "text" in p) return String((p as Record<string, unknown>)["text"] ?? "");
                        return "";
                    })
                    .join("");
            }
            // case content is array [ { parts: [...] } ]
            if (Array.isArray(content)) {
                const firstC = (content as unknown[])[0] as Record<string, unknown> | undefined;
                if (firstC && Array.isArray(firstC["parts"])) {
                    return (firstC["parts"] as unknown[])
                        .map((p) => (typeof p === "object" && p !== null && "text" in p ? String((p as Record<string, unknown>)["text"] ?? "") : ""))
                        .join("");
                }
            }
        }
    }

    if (typeof obj["text"] === "string") return obj["text"] as string;
    if (typeof obj["output_text"] === "string") return obj["output_text"] as string;

    return undefined;
}

/* -------------------------
   Public fallback services (typed)
   ------------------------- */

type PublicServiceDef =
    | {
        name: string;
        method: "POST";
        url: string;
        body: (t: string, source: string, target: string) => unknown;
        parse: (d: unknown) => string | undefined;
    }
    | {
        name: string;
        method: "GET";
        buildUrl: (t: string, source: string, target: string) => string;
        parse: (d: unknown) => string | undefined;
    };

async function tryPublicServiceTranslate(text: string, source: string, target: string): Promise<{ translated: string; service: string } | null> {
    const services: PublicServiceDef[] = [
        {
            name: "LibreTranslate",
            method: "POST",
            url: "https://libretranslate.com/translate",
            body: (t) => ({ q: t, source, target, format: "text" }),
            parse: (d) => {
                if (typeof d === "object" && d !== null && "translatedText" in d) return String((d as Record<string, unknown>)["translatedText"] ?? "");
                if (typeof d === "object" && d !== null && "translated" in d) return String((d as Record<string, unknown>)["translated"] ?? "");
                return undefined;
            },
        },
        {
            name: "ArgosOpenTech",
            method: "POST",
            url: "https://translate.argosopentech.com/translate",
            body: (t) => ({ q: t, source, target, format: "text" }),
            parse: (d) => {
                if (typeof d === "object" && d !== null && "translatedText" in d) return String((d as Record<string, unknown>)["translatedText"] ?? "");
                if (typeof d === "object" && d !== null && "translated" in d) return String((d as Record<string, unknown>)["translated"] ?? "");
                return undefined;
            },
        },
        {
            name: "MyMemory",
            method: "GET",
            buildUrl: (t, s, trg) => `https://api.mymemory.translated.net/get?q=${encodeURIComponent(t)}&langpair=${s}|${trg}`,
            parse: (d) => {
                if (typeof d === "object" && d !== null && "responseData" in d) {
                    const resp = (d as Record<string, unknown>)["responseData"] as Record<string, unknown> | undefined;
                    if (resp && typeof resp["translatedText"] === "string") return resp["translatedText"] as string;
                }
                return undefined;
            },
        },
    ];

    for (const svc of services) {
        try {
            if (svc.method === "GET") {
                const url = svc.buildUrl(text, source, target);
                const res = await fetch(url, { method: "GET", headers: { "User-Agent": "LegalyzeAI/1.0" }, signal: AbortSignal.timeout(20000) });
                if (!res.ok) continue;
                const parsed = await res.json().catch(() => undefined);
                const translated = svc.parse(parsed);
                if (translated && translated.trim()) return { translated: translated.trim(), service: svc.name };
            } else {
                const res = await fetch(svc.url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "User-Agent": "LegalyzeAI/1.0" },
                    body: JSON.stringify(svc.body(text, source, target)),
                    signal: AbortSignal.timeout(30000),
                });
                if (!res.ok) continue;
                const parsed = await res.json().catch(() => undefined);
                const translated = svc.parse(parsed);
                if (translated && translated.trim()) return { translated: translated.trim(), service: svc.name };
            }
        } catch {
            // network or parse error -> try next service
            continue;
        }
    }

    return null;
}

/* -------------------------
   API Handler
   ------------------------- */

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as { text?: string; source?: string; target?: string } | undefined;
        const text = body?.text ?? "";
        const source = body?.source ?? "en";
        const target = body?.target ?? "ur";

        if (!text || !source || !target) {
            const fail: TranslateApiFailure = { success: false, error: "Missing required parameters" };
            return NextResponse.json(fail, { status: 400 });
        }

        // 1) Gemini attempt (single large request)
        const gemini = await tryGeminiTranslate(text, source, target);
        if (gemini) {
            const ok: TranslateApiSuccess = {
                success: true,
                translatedText: gemini,
                chunksProcessed: 1,
                geminiUsed: true,
            };
            return NextResponse.json(ok);
        }

        // 2) Public service fallbacks
        const svcResult = await tryPublicServiceTranslate(text, source, target);
        if (svcResult?.translated) {
            const ok: TranslateApiSuccess = {
                success: true,
                translatedText: svcResult.translated,
                chunksProcessed: 1,
                geminiUsed: false,
            };
            return NextResponse.json(ok);
        }

        // 3) Last-resort local fallback dictionary
        const fallback = getFallbackTranslation(text);
        const usedFallback = fallback !== text;

        const ok: TranslateApiSuccess = {
            success: true,
            translatedText: fallback,
            chunksProcessed: 1,
            fallback: usedFallback || undefined,
            geminiUsed: false,
        };
        return NextResponse.json(ok);
    } catch (err) {
        const details = err instanceof Error ? err.message : String(err);
        const failure: TranslateApiFailure = { success: false, error: "Translation failed", details };
        return NextResponse.json(failure, { status: 500 });
    }
}
