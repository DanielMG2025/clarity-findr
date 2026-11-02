import { FlaskConical } from "lucide-react";
import { isEnabled } from "@/config/features";
import { useLanguage } from "@/i18n/LanguageContext";
import { betaText } from "./betaCopy";

/** Thin, permanent private-beta ribbon for chrome layouts (never widgets). Not dismissible by design. */
export function BetaBanner() {
  const { language } = useLanguage();
  if (!isEnabled("betaBanner")) return null;
  return (
    <div
      role="note"
      className="no-print flex min-h-6 shrink-0 items-center justify-center gap-1.5 border-b border-accent/30 bg-accent-soft px-4 py-1 text-center text-[11px] font-medium leading-tight tracking-wide text-foreground/80"
    >
      <FlaskConical className="size-3 shrink-0 text-accent" aria-hidden />
      <span>{betaText("banner", language)}</span>
    </div>
  );
}
