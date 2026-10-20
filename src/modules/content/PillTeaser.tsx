import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { usePublishedPills } from "./usePublishedPills";

/** Subtle one-line "Pill of the day" peek for the landing hero. */
export function PillTeaser() {
  const { language } = useLanguage();
  const pill = usePublishedPills()[0];
  return (
    <Link to="/descubre" className="group mx-auto mt-8 flex max-w-xl items-center justify-center gap-2 text-sm text-background/75 hover:text-background">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        {language === "es" ? "Píldora del día" : "Pill of the day"}
      </span>
      <span className="min-w-0 truncate">{pill.title[language]}</span>
      <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
