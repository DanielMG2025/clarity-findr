import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowRight, Scale, MapPin, Users, Search, LayoutGrid, Snowflake, Baby } from "lucide-react";
import {
  DEMO_PATIENTS,
  completeness,
  openExampleCase,
  startOwnCase,
  runDemo,
  useMasterRecord,
  findSimilarCases,
  type AgeBand,
  type DemoPatientSeed,
} from "@/modules/master-record";
import { byCode, type FamilyStructure } from "@/modules/regulatory";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translate";
import { StudyOwnCaseCta } from "@/components/patient/ExampleCasePanel";

const LEVEL_TONE: Record<DemoPatientSeed["data_level"], string> = {
  high: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  low: "bg-muted text-muted-foreground border-border",
};
const LEVEL_LABEL: Record<DemoPatientSeed["data_level"], Record<Language, string>> = {
  high: { en: "High data", es: "Muchos datos" },
  medium: { en: "Medium data", es: "Datos medios" },
  low: { en: "Low data", es: "Pocos datos" },
};
const FAMILY_LABEL: Record<FamilyStructure, Record<Language, string>> = {
  hetero_couple: { en: "Hetero couple", es: "Pareja heterosexual" },
  female_couple: { en: "Female couple", es: "Pareja de mujeres" },
  single_woman: { en: "Single woman", es: "Mujer sola" },
  male_couple: { en: "Male couple", es: "Pareja de hombres" },
  single_man: { en: "Single man", es: "Hombre solo" },
};
const AGE_BANDS: [AgeBand, string][] = [["under_32", "< 32"], ["32_35", "32–35"], ["36_39", "36–39"], ["40_plus", "40+"]];
const FAMILIES: FamilyStructure[] = ["single_woman", "hetero_couple", "female_couple", "male_couple", "single_man"];

/** "Legal case" = the regulatory engine says something this case needs isn't available at home. */
const LEGAL_CASE = new Set(DEMO_PATIENTS.filter((p) => runDemo(p).step0_regulatory?.needs_to_travel).map((p) => p.key));

function Seg<T extends string>({ value, onChange, options, label }: { value: T | null; onChange: (v: T) => void; options: [T, string][]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1 rounded-md border border-border/80 bg-background p-1">
      {options.map(([v, l]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}
          className={`rounded-[5px] px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${value === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

function CaseCard({ p, onPick }: { p: DemoPatientSeed; onPick: (p: DemoPatientSeed) => void }) {
  const { language, t } = useLanguage();
  const es = language === "es";
  const family = p.family_structure ?? "hetero_couple";
  const country = t(byCode(p.country)?.label ?? p.country);
  return (
    <button type="button" onClick={() => onPick(p)}
      className="text-left rounded-2xl border border-border/70 bg-card p-5 flex flex-col gap-4 shadow-none hover:border-primary/40 hover:shadow-sm transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display text-lg font-medium tracking-tight">{p.name} · {p.age}</div>
          <div className="text-xs text-muted-foreground leading-relaxed">{es ? p.label_es : p.label}</div>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${LEVEL_TONE[p.data_level]}`}>
          {LEVEL_LABEL[p.data_level][language]}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 text-[11px]">
        <span className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 text-primary">
          {p.goal === "preserve" ? <Snowflake className="size-3" /> : <Baby className="size-3" />}
          {p.goal === "preserve" ? (es ? "Preservar" : "Preserve") : (es ? "Tratamiento" : "Treatment")}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5"><MapPin className="size-3" /> {country}</span>
        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5"><Users className="size-3" /> {FAMILY_LABEL[family][language]}</span>
        {LEGAL_CASE.has(p.key) && (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 text-rose-600 px-2 py-0.5 font-medium">
            <Scale className="size-3" /> {es ? "Caso legal" : "Legal case"}
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-foreground/85">{es ? p.story_es : p.story}</p>
      <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3">
        <span className="text-[11px] text-muted-foreground">
          <span className="font-display tabular-nums">{completeness(p)}%</span> {es ? "del perfil completo" : "profile complete"}
        </span>
        <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
          {es ? "Ver su informe" : "See their report"} <ArrowRight className="size-3.5" />
        </span>
      </div>
    </button>
  );
}

export default function DemoRoom() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const es = language === "es";
  const loadedName = useMasterRecord((s) => s.identity.name);
  const [mode, setMode] = useState<"find" | "all">("find");
  const [goal, setGoal] = useState<"preserve" | "treatment" | null>(null);
  const [band, setBand] = useState<AgeBand | null>(null);
  const [family, setFamily] = useState<FamilyStructure | null>(null);
  const matches = useMemo(() => goal && band ? findSimilarCases(DEMO_PATIENTS, { goal, ageBand: band, family: family ?? undefined }) : [], [goal, band, family]);

  const pick = (seed: DemoPatientSeed) => {
    openExampleCase(seed);
    navigate("/report");
  };

  return (
    <div className="container max-w-6xl py-10 space-y-10">
      <header className="space-y-4 max-w-3xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">{es ? "Casos de ejemplo" : "Example cases"}</p>
        <h1 className="font-display text-3xl md:text-4xl font-medium tracking-tight text-balance">
          {es ? "¿Quieres ver cómo funcionaría con alguien parecido a ti?" : "Want to see how it would work for someone like you?"}
        </h1>
        <div className="h-px w-16 bg-accent/60" />
        <p className="text-muted-foreground leading-loose max-w-[65ch]">
          {es
            ? "Elige un caso de ejemplo y verás su informe completo, sin dar tus datos. Los casos tienen más o menos información a propósito: cuantos más datos, más confianza en la orientación."
            : "Pick an example case and you'll see their full report, without sharing your own data. Some cases have more information than others on purpose: the more data, the more confident the orientation."}
        </p>
      </header>

      {loadedName && (
        <Card className="p-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-primary/20 bg-primary-soft/30 shadow-none">
          <div className="text-sm leading-relaxed">
            {es ? "Caso abierto ahora: " : "Case open now: "}<strong className="font-display font-medium">{loadedName}</strong>.
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => startOwnCase()}>
              <RotateCcw className="size-3.5" /> {es ? "Borrar" : "Reset"}
            </Button>
            <Button size="sm" className="gap-1" onClick={() => navigate("/report")}>
              {es ? "Ver informe" : "See report"} <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </Card>
      )}
      {loadedName && <StudyOwnCaseCta />}

      <div role="tablist" aria-label={es ? "Modo" : "Mode"} className="inline-flex rounded-md border border-border/80 bg-card p-1">
        {([["find", Search, es ? "Búscame un caso parecido" : "Find a case like me"], ["all", LayoutGrid, es ? "Ver todos los casos" : "Browse all cases"]] as const).map(([m, Icon, l]) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
            className={`inline-flex items-center gap-2 rounded-[5px] px-4 py-2 text-sm font-medium transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <Icon className="size-4" aria-hidden /> {l}
          </button>
        ))}
      </div>

      {mode === "find" ? (
        <section className="space-y-6">
          <div className="grid gap-5 rounded-lg border border-border/70 bg-card/60 p-5 md:grid-cols-3">
            <div className="min-w-0">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{es ? "¿Qué buscas?" : "What are you looking for?"}</span>
              <Seg<"preserve" | "treatment"> value={goal} onChange={setGoal} label={es ? "¿Qué buscas?" : "What are you looking for?"}
                options={[["preserve", es ? "Preservar" : "Preserve"], ["treatment", es ? "Tratamiento" : "Treatment"]]} />
            </div>
            <div className="min-w-0">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{es ? "Edad" : "Age"}</span>
              <Seg<AgeBand> value={band} onChange={setBand} label={es ? "Edad" : "Age"} options={AGE_BANDS} />
            </div>
            <div className="min-w-0">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{es ? "Familia (opcional)" : "Family (optional)"}</span>
              <Seg<FamilyStructure> value={family} onChange={(v) => setFamily(v === family ? null : v)} label={es ? "Familia" : "Family"}
                options={FAMILIES.map((f) => [f, FAMILY_LABEL[f][language]] as [FamilyStructure, string])} />
            </div>
          </div>
          {matches.length === 0
            ? <p className="text-sm text-muted-foreground">{es ? "Elige qué buscas y tu franja de edad para ver los casos más parecidos." : "Choose what you're looking for and your age band to see the closest cases."}</p>
            : (
              <>
                <p className="text-sm text-muted-foreground">{es ? `Los ${matches.length} casos más parecidos:` : `The ${matches.length} closest cases:`}</p>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{matches.map((p) => <CaseCard key={p.key} p={p} onPick={pick} />)}</div>
              </>
            )}
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{DEMO_PATIENTS.map((p) => <CaseCard key={p.key} p={p} onPick={pick} />)}</div>
      )}

      <p className="max-w-[65ch] border-t border-accent/40 pt-6 font-editorial text-base italic leading-loose text-muted-foreground">
        {es
          ? "Abrir un caso sustituye los datos que tengas en esta sesión. Usa «Borrar» para limpiarlos y elegir otro."
          : "Opening a case replaces any data currently in your session. Use “Reset” to clear it and pick another."}
      </p>
    </div>
  );
}
