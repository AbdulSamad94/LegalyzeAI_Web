"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from "react";

interface LanguageContextType {
  language: "en" | "ur";
  setLanguage: (lang: "en" | "ur") => void;
  translateText: (text: string) => Promise<string>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx)
    throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
};

interface LanguageProviderProps {
  children: ReactNode;
}

interface TranslateApiSuccess {
  success: true;
  translatedText: string;
  chunksProcessed: number;
  fallback?: boolean;
  geminiUsed?: boolean;
}

interface TranslateApiFailure {
  success: false;
  error: string;
  details?: string;
}

type TranslateApiResponse = TranslateApiSuccess | TranslateApiFailure;

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<"en" | "ur">("en");
  const [isTranslating, setIsTranslating] = useState(false);

  const cacheRef = useRef<Map<string, string>>(new Map());

  const translateText = useCallback(
    async (text: string): Promise<string> => {
      if (language === "en" || !text.trim()) return text;

      const cacheKey = text;
      const cache = cacheRef.current;
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)!;
      }

      setIsTranslating(true);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, source: "en", target: "ur" }),
        });

        if (!res.ok) {
          console.warn("Translation API returned status", res.status);
          return text;
        }

        const data = (await res.json()) as TranslateApiResponse;

        if (data.success) {
          const translated = data.translatedText;
          cache.set(cacheKey, translated);

          if (data.chunksProcessed && data.chunksProcessed > 1) {
            console.log(
              `[Translation] translated with ${data.chunksProcessed} chunks`
            );
          }
          if (data.fallback)
            console.log("[Translation] used fallback dictionary");
          if (data.geminiUsed)
            console.log("[Translation] Gemini processed the request");

          return translated;
        } else {
          console.warn(
            "Translation API error:",
            data.error,
            data.details ?? ""
          );
          return text;
        }
      } catch (err) {
        console.error("Translation request failed:", err);
        return text;
      } finally {
        setIsTranslating(false);
      }
    },
    [language]
  );

  const handleSetLanguage = useCallback((lang: "en" | "ur") => {
    setLanguage(lang);
    setIsTranslating(false);
    if (lang === "en") cacheRef.current.clear();
    console.log(`[Language] switched to ${lang}`);
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: (handleLanguage) => handleSetLanguage(handleLanguage),
        translateText,
        isTranslating,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
