import { es } from "./translations";

export type Language = "en" | "es";
export const LANGUAGE_KEY = "fertility-compass-language";

export function initialLanguage(): Language {
  try { return localStorage.getItem(LANGUAGE_KEY) === "es" ? "es" : "en"; }
  catch { return "en"; }
}

export function translate(text: string, language: Language): string {
  if (language === "en" || !text.trim()) return text;
  const normalized = text.replace(/\s+/g, " ").trim();
  const uppercaseKey = normalized === normalized.toUpperCase()
    ? Object.keys(es).find(key => key.toUpperCase() === normalized)
    : undefined;
  let translated = es[normalized] ?? (uppercaseKey ? es[uppercaseKey] : undefined);
  if (translated === undefined) {
    const library = normalized.match(/^A curated, growing library of the public references we rely on — each one pre-digested so you don't have to hunt for it\. (\d+) references and growing\.$/);
    if (library) translated = `Una biblioteca de referencias públicas seleccionadas, en constante crecimiento y explicadas para que no tengas que buscarlas. ${library[1]} referencias, y seguimos ampliándola.`;
    const breakdown = normalized.match(/^Detailed breakdown · (.+)$/);
    if (breakdown) translated = `Desglose detallado · ${translate(breakdown[1], language)}`;
    const count = normalized.match(/^(\d+) (transactions|days ago)$/);
    if (count) translated = count[2] === "transactions" ? `${count[1]} transacciones` : `hace ${count[1]} días`;
    const confidence = normalized.match(/^Confidence (High|Medium|Low)$/);
    if (confidence) translated = `Confianza ${translate(confidence[1], language).toLowerCase()}`;
  }
  if (translated === undefined) return text;
  return `${text.match(/^\s*/)?.[0] ?? ""}${translated}${text.match(/\s*$/)?.[0] ?? ""}`;
}