import { createContext, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { initialLanguage, LANGUAGE_KEY, translate, type Language } from "./translate";

const LanguageContext = createContext({
  language: "en" as Language,
  setLanguage: (_language: Language) => {},
  t: (text: string) => text,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  useLayoutEffect(() => {
    document.documentElement.lang = language;
    try { localStorage.setItem(LANGUAGE_KEY, language); } catch { /* Private browsing can disable storage. */ }
  }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: (text: string) => translate(text, language) }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);