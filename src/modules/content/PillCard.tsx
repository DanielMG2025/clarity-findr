import { useState } from "react";
import { Info, Share2, Check, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/i18n/LanguageContext";
import { CONFIDENCE_LABEL, MOLD_LABEL, type Pill } from "./types";

export function PillSourceChip({ source }: { source: Pill["source"] }) {
  const { language } = useLanguage();
  const conf = CONFIDENCE_LABEL[source.confidence][language];
  const label = [source.name, source.date, conf].filter(Boolean).join(" · ");
  const chip = (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground align-middle">
      <Info className="size-2.5 shrink-0" aria-hidden />
      <span className="min-w-0 break-words">{label}</span>
      {source.url && <ExternalLink className="size-2.5 shrink-0" aria-hidden />}
    </span>
  );
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer" className="max-w-full">{chip}</a> : chip}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">
        {source.note?.[language] ?? label}
      </TooltipContent>
    </Tooltip>
  );
}

export function PillCard({ pill, featured = false }: { pill: Pill; featured?: boolean }) {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${window.location.origin}/descubre#${pill.id}`;
    try {
      if (navigator.share) await navigator.share({ title: pill.title[language], url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* user cancelled */ }
  };
  return (
    <Card id={pill.id} className={`min-w-0 rounded-lg p-6 shadow-none ${featured ? "border-accent/60 bg-accent/5 md:p-10" : "border-border/70 bg-card/60"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="outline" className="border-accent/60 bg-accent/10 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          {MOLD_LABEL[pill.mold][language]}
        </Badge>
        {featured && (
          <Button variant="ghost" size="sm" onClick={share} className="gap-1.5 text-xs">
            {copied ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
            {copied ? (language === "es" ? "Enlace copiado" : "Link copied") : (language === "es" ? "Compartir" : "Share")}
          </Button>
        )}
      </div>
      <h3 className={`mt-4 font-display font-medium leading-snug text-balance ${featured ? "text-3xl md:text-4xl" : "text-xl"}`}>{pill.title[language]}</h3>
      <p className={`mt-3 max-w-[65ch] leading-relaxed text-muted-foreground ${featured ? "text-base md:text-lg" : "text-sm"}`}>{pill.body[language]}</p>
      <div className="mt-5"><PillSourceChip source={pill.source} /></div>
    </Card>
  );
}
