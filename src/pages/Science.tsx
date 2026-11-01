import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, FlaskConical, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  ADDONS, ADDON_RATING_LABEL, ADDON_RATING_MEANING, FINDINGS, STRENGTH_HELP, STRENGTH_LABEL,
  type AddonRating, type Finding,
} from "@/modules/content/science";

const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.18em] text-primary";

/** HFEA traffic-light colours — data colours for the rating dots, not theme colours. */
const DOT: Record<AddonRating, string> = {
  red: "#dc2626", black: "#111827", yellow: "#d97706", grey: "#6b7280", green: "#16a34a",
};
const RATING_ORDER: AddonRating[] = ["red", "black", "yellow", "grey", "green"];

function Dot({ rating, label }: { rating: AddonRating; label: string }) {
  return <span role="img" aria-label={label} className="inline-block size-2.5 shrink-0 rounded-full ring-1 ring-border" style={{ backgroundColor: DOT[rating] }} />;
}

function AddonsTable({ es }: { es: boolean }) {
  const lang = es ? "es" : "en";
  const sorted = [...ADDONS].sort((a, b) => RATING_ORDER.indexOf(a.rating) - RATING_ORDER.indexOf(b.rating));
  return (
    <div className="mt-4">
      <ul className="divide-y divide-border rounded-md border border-border/70 bg-muted/40">
        {sorted.map((a) => {
          const label = ADDON_RATING_LABEL[a.rating][lang];
          return (
            <li key={a.name_en} className="flex items-center gap-3 px-3 py-2 text-sm">
              <Dot rating={a.rating} label={label} />
              <span className="min-w-0 flex-1">{es ? a.name_es : a.name_en}</span>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
            </li>
          );
        })}
      </ul>
      <dl className="mt-3 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
        {(["green", "yellow", "grey", "black", "red"] as AddonRating[]).map((r) => (
          <div key={r} className="flex items-start gap-2">
            <span className="mt-1"><Dot rating={r} label={ADDON_RATING_LABEL[r][lang]} /></span>
            <div><dt className="inline font-semibold text-foreground">{ADDON_RATING_LABEL[r][lang]}:</dt> <dd className="inline">{ADDON_RATING_MEANING[r][lang]}</dd></div>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FindingCard({ f, es, highlight }: { f: Finding; es: boolean; highlight?: boolean }) {
  const L = (e: string, n: string) => (es ? e : n);
  const strength = STRENGTH_LABEL[f.strength];
  return (
    <Card id={f.id} className={`scroll-mt-24 rounded-lg border-border bg-card p-5 shadow-none ring-accent transition-shadow duration-700 md:p-6 ${highlight ? "ring-2" : "ring-0"}`}>
      <h3 className="font-display text-xl font-medium leading-snug md:text-2xl">{L(f.title_es, f.title_en)}</h3>
      <p className="mt-3 leading-relaxed">{L(f.summary_es, f.summary_en)}</p>
      {f.is_addons && <AddonsTable es={es} />}
      <div className="mt-4 border-l-2 border-accent pl-3">
        <p className={eyebrow}>{L("Qué significa para ti", "What it means for you")}</p>
        <p className="mt-1 leading-relaxed">{L(f.means_es, f.means_en)}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <span className="text-muted-foreground">{L(f.evidence_type_es, f.evidence_type_en)}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="inline-flex items-center gap-1">
              <Badge variant="outline" className="border-accent/60 text-primary">
                {L("Fuerza", "Strength")}: {L(strength.es, strength.en)}
              </Badge>
              <Info className="size-3.5 text-muted-foreground" aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">{STRENGTH_HELP[es ? "es" : "en"]}</TooltipContent>
        </Tooltip>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {L("Fuente", "Source")}:{" "}
        <a href={f.source_url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
          {f.source_label} <ExternalLink className="size-3.5" />
        </a>{" "}· {f.source_year}
      </p>
    </Card>
  );
}

export default function Science() {
  const { language } = useLanguage();
  const es = language === "es";
  const L = (e: string, n: string) => (es ? e : n);
  const [params] = useSearchParams();
  const deepFinding = params.get("finding");
  const target = deepFinding && FINDINGS.some((f) => f.id === deepFinding) ? deepFinding : null;
  const [highlighted, setHighlighted] = useState<string | null>(target);

  useEffect(() => {
    if (!target) return;
    setHighlighted(target);
    const scroll = window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    const fade = window.setTimeout(() => setHighlighted(null), 2200);
    return () => { window.clearTimeout(scroll); window.clearTimeout(fade); };
  }, [target]);

  const themes: { key: string; es: string; en: string; items: Finding[] }[] = [];
  for (const f of FINDINGS) {
    let t = themes.find((x) => x.key === f.theme_en);
    if (!t) { t = { key: f.theme_en, es: f.theme_es, en: f.theme_en, items: [] }; themes.push(t); }
    t.items.push(f);
  }

  return (
    <div className="container max-w-4xl px-6 py-14 md:py-20">
      <Link to="/descubre" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> {L("Descubre", "Discover")}
      </Link>
      <header className="mt-6 max-w-3xl">
        <span className={`${eyebrow} inline-flex items-center gap-2`}><FlaskConical className="size-3" /> {L("Referencia", "Reference")}</span>
        <h1 className="mt-4 font-display text-4xl md:text-5xl font-medium leading-tight text-balance">
          {L("Qué dice la evidencia", "What the evidence says")}
        </h1>
        <p className="mt-4 font-editorial italic text-xl text-muted-foreground">
          {L("Qué dice hoy la evidencia sobre lo que de verdad mueve tus probabilidades. Cada dato con su fuente, su fecha y la fuerza de los estudios que lo respaldan.",
            "What the evidence says today about what really moves your odds. Every finding with its source, its date and the strength of the studies behind it.")}
        </p>
      </header>

      {themes.map((t) => (
        <section key={t.key} className="mt-12" aria-label={L(t.es, t.en)}>
          <h2 className={`${eyebrow} border-b-2 border-primary/40 pb-2`}>{L(t.es, t.en)}</h2>
          <div className="mt-5 space-y-5">
            {t.items.map((f) => <FindingCard key={f.id} f={f} es={es} highlight={highlighted === f.id} />)}
          </div>
        </section>
      ))}

      <footer className="mt-12 rounded-lg border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
        {L("Resumen divulgativo de evidencia pública, no consejo médico. Las cifras son promedios de población (no una predicción personal) y cambian con cada actualización de los registros. Decide siempre con tu equipo médico.",
          "Plain-language summary of public evidence, not medical advice. Figures are population averages (not a personal prediction) and change with each registry update. Always decide with your medical team.")}
      </footer>
    </div>
  );
}
