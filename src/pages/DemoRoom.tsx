import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowRight, Scale, MapPin, Users, Search, LayoutGrid, Snowflake, Baby, X, SearchX } from "lucide-react";
import {
  DEMO_PATIENTS,
  completeness,
  openExampleCase,
  runDemo,
  useActiveExampleCase,
  restoreOwnCase,
  findSimilarCases,
  filterExampleCases,
  activeFilterCount,
  SITUATION_TAG_LABEL,
  TREATMENT_TAG_LABEL,
  type ExampleCaseFilters,
  type GeoFilter,
  type SituationTag,
  type TreatmentFilter,
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

const SITUATION_CHIPS: SituationTag[] = ["cross_border", "low_reserve", "male_factor", "endometriosis", "unexplained"];
const TREATMENT_CHIPS: TreatmentFilter[] = ["own_ivf", "donation", "iui", "freezing", "ropa_surrogacy"];
const treatmentLabel = (v: TreatmentFilter, l: Language) => v === "ropa_surrogacy" ? SITUATION_TAG_LABEL.ropa_surrogacy[l] : TREATMENT_TAG_LABEL[v][l];
const GEO_LABEL: Record<GeoFilter, Record<Language, string>> = {
  spain: { en: "Spain", es: "España" },
  rest_of_europe: { en: "Rest of Europe", es: "Resto de Europa" },
};

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

/** Optional single-choice chips: click again to clear. */
function Chips<T extends string>({ label, value, onChange, options }: { label: string; value: T | null | undefined; onChange: (v: T | null) => void; options: [T, string][] }) {
  return (
    <div className="min-w-0">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map(([v, l]) => {
          const on = value === v;
          return (
            <button key={v} type="button" aria-pressed={on} onClick={() => onChange(on ? null : v)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${on ? "border-primary bg-primary text-primary-foreground" : "border-border/80 bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterBar({ count, active, onClear, children }: { count: number; active: number; onClear: () => void; children: ReactNode }) {
  const { language } = useLanguage();
  const es = language === "es";
  return (
    <div className="space-y-4 rounded-lg border border-border/70 bg-card/60 p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-display tabular-nums text-foreground">{count}</span> {count === 1 ? (es ? "caso" : "case") : (es ? "casos" : "cases")}
        </p>
        {active > 0 && (
          <Button size="sm" variant="ghost" className="gap-1" onClick={onClear}>
            <X className="size-3.5" /> {es ? "Quitar filtros" : "Clear filters"}
          </Button>
        )}
      </div>
    </div>
  );
}

function NoCases({ onClear }: { onClear: () => void }) {
  const { language } = useLanguage();
  const es = language === "es";
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/80 p-8 text-center">
      <SearchX className="size-6 text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">{es ? "Ningún caso con estos filtros — prueba a quitar alguno." : "No cases with these filters — try removing one."}</p>
      <Button size="sm" variant="outline" className="gap-1" onClick={onClear}><X className="size-3.5" /> {es ? "Quitar filtros" : "Clear filters"}</Button>
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
  const loadedName = useActiveExampleCase()?.name;
  const [mode, setMode] = useState<"find" | "all">("find");
  const [goal, setGoal] = useState<"preserve" | "treatment" | null>(null);
  const [band, setBand] = useState<AgeBand | null>(null);
  const [family, setFamily] = useState<FamilyStructure | null>(null);
  // Shared theme/treatment/geography filters; age and family also apply in "Browse all".
  const [filters, setFilters] = useState<ExampleCaseFilters>({});
  const setF = <K extends keyof ExampleCaseFilters>(k: K) => (v: ExampleCaseFilters[K]) => setFilters((f) => ({ ...f, [k]: v }));
  const refine: ExampleCaseFilters = { situation: filters.situation, treatment: filters.treatment, geo: filters.geo };
  const refineActive = activeFilterCount(refine);
  const clearRefine = () => setFilters((f) => ({ ...f, situation: null, treatment: null, geo: null }));
  const clearAll = () => setFilters({});

  const pool = useMemo(() => filterExampleCases(DEMO_PATIENTS, refine), [filters.situation, filters.treatment, filters.geo]); // eslint-disable-line react-hooks/exhaustive-deps
  const poolForGoal = goal ? pool.filter((p) => p.goal === goal) : pool;
  const matches = useMemo(() => goal && band ? findSimilarCases(pool, { goal, ageBand: band, family: family ?? undefined }) : [], [pool, goal, band, family]);
  const allCases = useMemo(() => filterExampleCases(DEMO_PATIENTS, filters), [filters]);

  const sharedChips = (
    <>
      <Chips<SituationTag> label={es ? "Temática" : "Theme"} value={filters.situation} onChange={setF("situation")}
        options={SITUATION_CHIPS.map((v) => [v, SITUATION_TAG_LABEL[v][language]] as [SituationTag, string])} />
      <Chips<TreatmentFilter> label={es ? "Tratamiento" : "Treatment"} value={filters.treatment} onChange={setF("treatment")}
        options={TREATMENT_CHIPS.map((v) => [v, treatmentLabel(v, language)] as [TreatmentFilter, string])} />
      <Chips<GeoFilter> label={es ? "Geografía" : "Location"} value={filters.geo} onChange={setF("geo")}
        options={(["spain", "rest_of_europe"] as GeoFilter[]).map((v) => [v, GEO_LABEL[v][language]] as [GeoFilter, string])} />
    </>
  );

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
            <Button size="sm" variant="outline" className="gap-1" onClick={() => restoreOwnCase()}>
              <RotateCcw className="size-3.5" /> {es ? "Cerrar ejemplo" : "Close example"}
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
          <div className="space-y-2">
            <p className="text-sm font-medium">{es ? "Afina el resultado (opcional)" : "Narrow it down (optional)"}</p>
            <FilterBar count={poolForGoal.length} active={refineActive} onClear={clearRefine}>{sharedChips}</FilterBar>
          </div>
          {poolForGoal.length === 0
            ? <NoCases onClear={clearRefine} />
            : matches.length === 0
            ? <p className="text-sm text-muted-foreground">{es ? "Elige qué buscas y tu franja de edad para ver los casos más parecidos." : "Choose what you're looking for and your age band to see the closest cases."}</p>
            : (
              <>
                <p className="text-sm text-muted-foreground">{es ? `Los ${matches.length} casos más parecidos:` : `The ${matches.length} closest cases:`}</p>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{matches.map((p) => <CaseCard key={p.key} p={p} onPick={pick} />)}</div>
              </>
            )}
        </section>
      ) : (
        <section className="space-y-6">
          <FilterBar count={allCases.length} active={activeFilterCount(filters)} onClear={clearAll}>
            {sharedChips}
            <Chips<AgeBand> label={es ? "Edad" : "Age"} value={filters.ageBand} onChange={setF("ageBand")} options={AGE_BANDS} />
            <Chips<FamilyStructure> label={es ? "Familia" : "Family"} value={filters.family} onChange={setF("family")}
              options={FAMILIES.map((f) => [f, FAMILY_LABEL[f][language]] as [FamilyStructure, string])} />
          </FilterBar>
          {allCases.length === 0
            ? <NoCases onClear={clearAll} />
            : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{allCases.map((p) => <CaseCard key={p.key} p={p} onPick={pick} />)}</div>}
        </section>
      )}

      <p className="max-w-[65ch] border-t border-accent/40 pt-6 font-editorial text-base italic leading-loose text-muted-foreground">
        {es
          ? "Abrir un caso sustituye los datos que tengas en esta sesión. Usa «Borrar» para limpiarlos y elegir otro."
          : "Opening a case replaces any data currently in your session. Use “Reset” to clear it and pick another."}
      </p>
    </div>
  );
}
