import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { text, source, target } = await req.json();

        if (!text || !source || !target) {
            return NextResponse.json(
                { success: false, error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // More reliable translation services
        const translationServices = [
            {
                name: "MyMemory",
                url: "https://api.mymemory.translated.net/get",
                method: "GET",
                buildUrl: (text: string, source: string, target: string) =>
                    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`,
                parseResponse: (data: { responseData?: { translatedText: string } }) => data.responseData?.translatedText
            },
            {
                name: "LibreTranslate Public",
                url: "https://translate.terraprint.co/translate",
                method: "POST",
                body: (text: string, source: string, target: string) => ({
                    q: text,
                    source: source,
                    target: target,
                    format: "text",
                }),
                parseResponse: (data: { translatedText: string }) => data.translatedText
            }
        ];

        // Enhanced fallback translations
        const fallbackTranslations: Record<string, string> = {
            // UI Elements
            "Summary": "خلاصہ",
            "Risk Analysis": "خطرے کا تجزیہ",
            "Analysis Complete": "تجزیہ مکمل",
            "Upload Document": "دستاویز اپ لوڈ کریں",
            "Processing": "پروسیسنگ",
            "Results": "نتائج",
            "Document Summary": "دستاویز کا خلاصہ",
            "AI Verdict": "AI فیصلہ",

            // Risk Levels
            "Critical": "انتہائی اہم",
            "High": "زیادہ",
            "Medium": "درمیانہ",
            "Low": "کم",
            "Unknown": "نامعلوم",
            "Recommendation": "تجویز",

            // Common Legal Terms
            "contract": "معاہدہ",
            "agreement": "رضامندی",
            "clause": "شق",
            "liability": "ذمہ داری",
            "terms": "شرائط",
            "conditions": "حالات",
            "breach": "خلاف ورزی",
            "violation": "نقض",
            "penalty": "سزا",
            "damages": "نقصانات",
            "compensation": "معاوضہ",
            "legal": "قانونی",
            "document": "دستاویز",
            "review": "جائزہ",
            "analysis": "تجزیہ"
        };

        let lastError: string = "";

        // Try each translation service
        for (const service of translationServices) {
            try {
                console.log(`[Translate API] Trying ${service.name}...`);

                let response;

                if (service.method === "GET" && service.buildUrl) {
                    const url = service.buildUrl(text, source, target);
                    response = await fetch(url, {
                        method: "GET",
                        headers: {
                            "User-Agent": "LegalyzeAI/1.0",
                        },
                        signal: AbortSignal.timeout(15000), // 15 second timeout
                    });
                } else if (service.method === "POST" && service.body) {
                    response = await fetch(service.url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "User-Agent": "LegalyzeAI/1.0",
                        },
                        body: JSON.stringify(service.body(text, source, target)),
                        signal: AbortSignal.timeout(15000),
                    });
                } else {
                    continue;
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`[Translate API] ${service.name} error (${response.status}):`, errorText.substring(0, 200));
                    lastError = `${service.name}: ${response.status}`;
                    continue;
                }

                const data = await response.json();
                const translatedText = service.parseResponse(data);

                if (translatedText && translatedText.trim() && translatedText !== text) {
                    console.log(`[Translate API] Success with ${service.name}`);
                    return NextResponse.json({
                        success: true,
                        translatedText: translatedText.trim()
                    });
                } else {
                    console.error(`[Translate API] ${service.name} returned invalid translation:`, translatedText);
                    lastError = `${service.name}: Invalid translation response`;
                    continue;
                }

            } catch (serviceError) {
                console.error(`[Translate API] ${service.name} request failed:`, serviceError);
                lastError = `${service.name}: ${serviceError instanceof Error ? serviceError.message : 'Network error'}`;
                continue;
            }
        }

        // Enhanced fallback logic
        console.log("[Translate API] All services failed, using enhanced fallback");

        // Try direct word matching first
        const directTranslation = fallbackTranslations[text];
        if (directTranslation) {
            return NextResponse.json({
                success: true,
                translatedText: directTranslation,
                fallback: true
            });
        }

        // Try partial matching for longer text
        let translatedText = text;
        for (const [english, urdu] of Object.entries(fallbackTranslations)) {
            const regex = new RegExp(`\\b${english}\\b`, 'gi');
            translatedText = translatedText.replace(regex, urdu);
        }

        // If we made any changes, return the partially translated text
        if (translatedText !== text) {
            return NextResponse.json({
                success: true,
                translatedText,
                fallback: true
            });
        }

        // Last resort: return original text
        return NextResponse.json({
            success: true,
            translatedText: text,
            fallback: true,
            error: `All translation services failed: ${lastError}`
        });

    } catch (error: unknown) {
        console.error("[Translate API] Unexpected error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json(
            { success: false, error: "Translation service unavailable", details: errorMessage },
            { status: 500 }
        );
    }
}