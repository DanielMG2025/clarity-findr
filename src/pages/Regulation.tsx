import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, ExternalLink, Info, Scale } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/i18n/LanguageContext";
import { CONFIDENCE_LABEL, EU_SOHO, REGULATION, SOURCE_TIER_HELP, SOURCE_TIER_LABEL, TERM_HELP, type RegRow } from "@/modules/content/regulation";

const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.18em] text-primary";
const CONF_HELP = {
  es: "La confianza refleja cuántas fuentes concuerdan y cómo de reciente es el dato",
  en: "Confidence reflects how many sources agree and how recent the datum is",
};

type Term = keyof typeof TERM_HELP;
const TERM_LABEL: Record<Term, { es: string; en: string }> = {
  access: { es: "Quién puede acceder", en: "Who can access" },
  egg: { es: "Ovodonación", en: "Egg donation" },
  sperm: { es: "Semen donante", en: "Donor sperm" },
  surrogacy: { es: "Subrogación", en: "Surrogacy" },
  anonymity: { es: "Anonimato", en: "Anonymity" },
};

/** A dimension label with a plain-language definition on hover/tap. */
function TermLabel({ term, es, className }: { term: Term; es: boolean; className: string }) {
  const lang = es ? "es" : "en";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className={`inline-flex items-center gap-1 text-left ${className}`}>
          {TERM_LABEL[term][lang]} <Info className="size-3 shrink-0 opacity-70" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">{TERM_HELP[term][lang]}</TooltipContent>
    </Tooltip>
  );
}

const GRID = "md:grid md:grid-cols-[1.1fr_2fr_1.6fr_1.6fr_1.2fr] md:gap-4";

function Cell({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="min-w-0">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:hidden">{label}</span>
      <p className={strong ? "font-display text-lg font-medium leading-snug" : "text-sm leading-snug"}>{value}</p>
    </div>
  );
}

function Row({ r, es }: { r: RegRow; es: boolean }) {
  const L = (e: string, n: string) => (es ? e : n);
  const conf = CONFIDENCE_LABEL[r.confidence];
  const change = es ? r.change_es : r.change_en;
  return (
    <AccordionItem value={r.country_en} id={`reg-${encodeURIComponent(r.country_en)}`} className="scroll-mt-24 border-border">
      <AccordionTrigger className="items-start gap-3 text-left hover:no-underline [&>svg]:mt-2">
        <div className={`flex-1 space-y-2 md:space-y-0 ${GRID}`}>
          <Cell strong label={L("País", "Country")} value={L(r.country_es, r.country_en)} />
          <Cell label={L("Quién puede acceder", "Who can access")} value={L(r.access_es, r.access_en)} />
          <Cell label={L("Ovodonación", "Egg donation")} value={L(r.egg_es, r.egg_en)} />
          <Cell label={L("Subrogación", "Surrogacy")} value={L(r.surrogacy_es, r.surrogacy_en)} />
          <Cell label={L("Anonimato", "Anonymity")} value={L(r.anonymity_es, r.anonymity_en)} />
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <p className="mb-4 max-w-[70ch] text-base leading-relaxed">{L(r.summary_es, r.summary_en)}</p>
        <div className="grid gap-4 rounded-md border border-border/70 bg-muted/40 p-4 sm:grid-cols-2">
          <div>
            <TermLabel term="sperm" es={es} className={eyebrow} />
            <p className="mt-1">{L(r.sperm_es, r.sperm_en)}</p>
          </div>
          <div>
            <p className={eyebrow}>{L("Base legal", "Legal basis")}</p>
            <p className="mt-1">{es ? r.legal_basis : r.legal_basis_en ?? r.legal_basis}</p>
            <a href={r.source_url} target="_blank" rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              {r.source_label} <ExternalLink className="size-3.5" />
            </a>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {SOURCE_TIER_LABEL[r.source_tier][es ? "es" : "en"]}
                  <Info className="size-3" aria-hidden />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">{SOURCE_TIER_HELP[es ? "es" : "en"]}</TooltipContent>
            </Tooltip>
          </div>
          <div>
            <p className={eyebrow}>{L("Actualización", "Updated")}</p>
            <p className="mt-1">{L(r.updated_es, r.updated_en)}</p>
          </div>
          <div>
            <p className={eyebrow}>{L("Confianza", "Confidence")}</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="mt-1 inline-flex items-center gap-1">
                  <Badge variant="outline" className="border-accent/60 text-primary">{L(conf.es, conf.en)}</Badge>
                  <Info className="size-3.5 text-muted-foreground" aria-hidden />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">{CONF_HELP[es ? "es" : "en"]}</TooltipContent>
            </Tooltip>
          </div>
          {change && (
            <div className="border-l-2 border-accent pl-3 sm:col-span-2">
              <p className={eyebrow}>{L("Qué ha cambiado / se espera", "What changed / is expected")}</p>
              <p className="mt-1 leading-relaxed">{change}</p>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function Regulation() {
  const { language } = useLanguage();
  const es = language === "es";
  const L = (e: string, n: string) => (es ? e : n);
  const [params] = useSearchParams();
  const deepCountry = params.get("country");
  const target = deepCountry && REGULATION.some((r) => r.country_en === deepCountry) ? deepCountry : null;
  const [open, setOpen] = useState<string[]>(target ? [target] : []);

  useEffect(() => {
    if (!target) return;
    setOpen((v) => (v.includes(target) ? v : [...v, target]));
    const id = window.setTimeout(() => {
      document.getElementById(`reg-${encodeURIComponent(target)}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => window.clearTimeout(id);
  }, [target]);

  return (
    <div className="container max-w-6xl px-6 py-14 md:py-20">
      <Link to="/descubre" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> {L("Descubre", "Discover")}
      </Link>
      <header className="mt-6 max-w-3xl">
        <span className={`${eyebrow} inline-flex items-center gap-2`}><Scale className="size-3" /> {L("Referencia", "Reference")}</span>
        <h1 className="mt-4 font-display text-4xl md:text-5xl font-medium leading-tight text-balance">
          {L("Regulación comparada en Europa", "Regulation compared across Europe")}
        </h1>
        <p className="mt-4 font-editorial italic text-xl text-muted-foreground">
          {L("Qué permite cada país y con qué norma. Cada dato lleva su fuente y su fecha.",
            "What each country allows and under which law. Every datum carries its source and date.")}
        </p>
      </header>

      <Card className="mt-8 rounded-lg border-accent/50 bg-accent/10 p-5 shadow-none">
        <p className={eyebrow}>{L(EU_SOHO.title_es, EU_SOHO.title_en)}</p>
        <p className="mt-2 text-sm leading-relaxed">{L(EU_SOHO.body_es, EU_SOHO.body_en)}</p>
        <a href={EU_SOHO.source_url} target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          {EU_SOHO.source_label} <ExternalLink className="size-3.5" />
        </a>
      </Card>

      <section className="mt-10" aria-label={L("Tabla comparativa", "Comparison table")}>
        <p className="max-w-[70ch] text-sm leading-relaxed text-muted-foreground">
          {L("Cada país decide quién puede tratarse, qué donación permite y bajo qué condiciones. Toca un país para leer su resumen y el detalle, con la norma, su fuente y su fecha. Pasa el cursor por los términos para ver qué significan.",
            "Each country decides who can be treated, what donation it allows and under what conditions. Tap a country to read its summary and the detail, with the law, its source and its date. Hover the terms to see what they mean.")}
        </p>
        <Collapsible className="mt-3">
          <CollapsibleTrigger className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            {L("¿Qué significan estos términos?", "What do these terms mean?")}
            <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <dl className="mt-3 grid gap-3 rounded-md border border-border/70 bg-card p-4 text-sm sm:grid-cols-2">
              {(Object.keys(TERM_HELP) as Term[]).map((k) => (
                <div key={k}>
                  <dt className="font-semibold text-primary">{TERM_LABEL[k][es ? "es" : "en"]}</dt>
                  <dd className="mt-0.5 leading-relaxed text-muted-foreground">{TERM_HELP[k][es ? "es" : "en"]}</dd>
                </div>
              ))}
            </dl>
          </CollapsibleContent>
        </Collapsible>
        <div className={`mt-6 hidden border-b-2 border-primary/40 pb-2 pr-8 ${GRID}`}>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{L("País", "Country")}</span>
          {(["access", "egg", "surrogacy", "anonymity"] as Term[]).map((k) => (
            <TermLabel key={k} term={k} es={es} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary" />
          ))}
        </div>
        <Accordion type="multiple" value={open} onValueChange={setOpen}>
          {REGULATION.map((r) => <Row key={r.country_en} r={r} es={es} />)}
        </Accordion>
        <p className="mt-3 text-xs text-muted-foreground">
          {L("Toca un país para ver su resumen, semen donante, base legal, fuente, fecha y confianza.",
            "Tap a country to see its summary, donor sperm, legal basis, source, date and confidence.")}
        </p>
      </section>

      <footer className="mt-12 rounded-lg border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
        {L("Base de trabajo, no asesoramiento legal. La regulación cambia; algunos puntos están pendientes de anclaje final a la norma primaria. Verifica siempre con una fuente oficial o un profesional antes de decidir.",
          "Working reference, not legal advice. Regulation changes; some points are pending final anchoring to the primary law. Always check an official source or a professional before deciding.")}
      </footer>
    </div>
  );
}
