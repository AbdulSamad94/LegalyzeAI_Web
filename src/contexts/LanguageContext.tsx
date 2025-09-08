"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
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

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<"en" | "ur">("en");
  const [isTranslating, setIsTranslating] = useState(false);

  // NO UI DIRECTION CHANGES - Keep UI in LTR, only translate content

  const translateText = useCallback(
    async (text: string): Promise<string> => {
      // No need to translate if the target language is English or text is empty
      if (language === "en" || !text.trim()) {
        return text;
      }

      // Set translating state
      setIsTranslating(true);

      try {
        // Call our own backend API route
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text,
            source: "en",
            target: "ur",
          }),
        });

        if (!response.ok) {
          console.warn(
            `Translation failed with status ${response.status}, falling back to original text`
          );
          return text;
        }

        const data = await response.json();

        if (data.success && data.translatedText) {
          if (data.fallback) {
            console.info(
              "Using fallback translation for:",
              text.substring(0, 50)
            );
          }
          return data.translatedText;
        } else {
          console.warn("Translation response missing translated text:", data);
          return text;
        }
      } catch (error) {
        console.warn("Translation request error:", error);
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
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        translateText,
        isTranslating,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
