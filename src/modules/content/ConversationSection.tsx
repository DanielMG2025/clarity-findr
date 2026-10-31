import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, MessageCircle, TrendingUp, Minus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/i18n/LanguageContext";
import { AUDIENCE_LABEL, type Audience } from "./types";
import { usePublishedTopics, filterTopics, platformFamily, groupPlatforms, type Period, type TopicRow } from "./conversation";

const AUDS: Audience[] = ["planners", "first-steps", "experienced", "men", "lgbt"];
const GEO_EN: Record<string, string> = { "España": "Spain", "Europa": "Europe", "Chequia": "Czechia", "España/Chequia": "Spain/Czechia", "Europa/EE. UU.": "Europe/US", "Chipre": "Cyprus", "Grecia": "Greece", "EE. UU.": "US" };
const ALL = "__all";

function GroupLabel({ children, id }: { children: React.ReactNode; id?: string }) {
  return <span id={id} className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{children}</span>;
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-pressed={on} onClick={onClick} className={`h-8 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${on ? "border-primary bg-primary text-primary-foreground" : "border-border/80 bg-background text-muted-foreground hover:border-accent hover:text-foreground"}`}>{children}</button>;
}

function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: [T, string][]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid h-10 grid-cols-2 rounded-md border border-border/80 bg-background p-1">
      {options.map(([v, l]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}
          className={`whitespace-nowrap rounded-[5px] px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${value === v ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

function TopicCard({ t }: { t: TopicRow }) {
  const { language } = useLanguage();
  const es = language === "es";
  const up = t.trend === "up";
  return (
    <Card className="flex min-w-0 flex-col rounded-lg border-border/70 bg-card/60 p-6 shadow-none">
      <div className="flex flex-wrap items-center gap-2">
        {(t.audiences as Audience[]).slice(0, 2).map((a) => (
          <Badge key={a} variant="outline" className="border-accent/60 bg-accent/10 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            {AUDIENCE_LABEL[a]?.[language] ?? a}
          </Badge>
        ))}
        {t.treatment && <Badge variant="secondary" className="text-[10px]">{es ? t.treatment : (t.treatment_en || t.treatment)}</Badge>}
        {t.geography && <Badge variant="secondary" className="text-[10px]">{es ? t.geography : (GEO_EN[t.geography] ?? t.geography)}</Badge>}
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          {up ? <TrendingUp className="size-3 text-primary" /> : <Minus className="size-3" />}
          {up ? (es ? "en aumento" : "rising") : (es ? "estable" : "steady")}
        </span>
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        ≈ {t.mentions_estimate} {es ? "menciones · anónimo" : "mentions · anonymous"}
      </p>
      <p className="mt-1 text-[10px] text-muted-foreground">{es ? "Publicaciones del feed, no personas únicas" : "Feed items, not unique people"}</p>
      <h3 className="mt-2 font-display text-xl font-medium leading-snug text-balance">{es ? t.question_es : t.question_en}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{es ? t.answer_es : t.answer_en}</p>
      <p className="mt-3 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString(es ? "es-ES" : "en-GB")} · {es ? "Confianza" : "Confidence"}: {es ? ({ low: "baja", medium: "media", high: "alta" }[t.confidence] ?? t.confidence) : t.confidence}</p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          <MessageCircle className="size-2.5" aria-hidden /> {es ? "lo que se dice · señal anecdótica" : "what people say · anecdotal signal"}
        </span>
        {t.source_url ? (
          <a href={t.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            {t.source_platform || t.source_forum} <ExternalLink className="size-3" />
          </a>
        ) : <span className="text-xs text-muted-foreground">{t.source_platform || t.source_forum}</span>}
      </div>
      <Link to="/situacion" className="mt-4 inline-flex items-center gap-1 border-t border-border/60 pt-3 text-sm font-medium text-primary hover:underline">
        {es ? "¿Y en tu caso? → Brujulea tu situación" : "And in your case? → Check your situation"} <ArrowRight className="size-3.5" />
      </Link>
    </Card>
  );
}

/** Browsable forum conversation: search + time + forum + audience + treatment filters. Hidden when nothing is published. */
export function ConversationSection() {
  const { language } = useLanguage();
  const es = language === "es";
  const topics = usePublishedTopics();
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<Period>("week");
  const [platform, setPlatform] = useState<string | null>(null);
  const [audience, setAudience] = useState<string | null>(null);
  const [treatment, setTreatment] = useState<string | null>(null);
  const platforms = useMemo(() => [...new Set(topics.map((t) => t.source_platform || t.source_forum).filter(Boolean))].sort(), [topics]);
  const families = useMemo(() => [...new Set(platforms.map(platformFamily))], [platforms]);
  const forumGroups = useMemo(() => groupPlatforms(platforms), [platforms]);
  const treatments = useMemo(() => [...new Map(topics.filter((t) => t.treatment).map((t) => [t.treatment, es ? t.treatment : (t.treatment_en || t.treatment)])).entries()].sort((a, b) => a[1].localeCompare(b[1])), [topics, es]);
  const rows = useMemo(() => filterTopics(topics.map((t) => ({ ...t, source_platform: t.source_platform || t.source_forum })), { query, period, platform, audience, treatment }), [topics, query, period, platform, audience, treatment]);
  if (topics.length === 0) return null;
  return (
    <section className="mt-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{es ? "Escuchando foros: " : "Listening to forums: "}{families.join(", ")}</p>
      <h2 className="mt-2 font-display text-3xl font-medium">{es ? "La conversación" : "The conversation"}</h2>
      <p className="mt-2 max-w-[65ch] text-sm text-muted-foreground">
        {es
          ? "Las preguntas que más se repiten en foros públicos de pacientes, resumidas sin nombres ni historias personales. Es lo que se dice, no consejo médico. Las menciones son aproximadas."
          : "The questions people ask most in public patient forums, summarised with no names or personal stories. It is what people say, not medical advice. Mention counts are approximate."}
      </p>
      <div className="mt-6 space-y-4">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} className="h-11 pl-9" aria-label={es ? "Busca un tema" : "Search a topic"}
            placeholder={es ? "Busca un tema: baja reserva, ovodonación, Chequia…" : "Search a topic: low reserve, egg donation, Czechia…"} />
        </div>
        <div className="rounded-lg border border-border/70 bg-card/60 p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto]">
            <div className="min-w-0 border-l-2 border-accent pl-3">
              <GroupLabel id="conv-theme">{es ? "Temática" : "Theme"}</GroupLabel>
              <Select value={treatment ?? ALL} onValueChange={(v) => setTreatment(v === ALL ? null : v)}>
                <SelectTrigger aria-labelledby="conv-theme" className={`h-10 bg-background font-medium ${treatment ? "border-primary text-primary" : ""}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectItem value={ALL}>{es ? "Todas las temáticas" : "All themes"}</SelectItem>
                  <SelectSeparator />
                  {treatments.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0">
              <GroupLabel id="conv-forum">{es ? "Foro" : "Forum"}</GroupLabel>
              <Select value={platform ?? ALL} onValueChange={(v) => setPlatform(v === ALL ? null : v)}>
                <SelectTrigger aria-labelledby="conv-forum" className={`h-10 bg-background ${platform ? "border-primary text-primary" : ""}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectItem value={ALL}>{es ? "Todos los foros" : "All forums"}</SelectItem>
                  {forumGroups.map((g) => g.items.length > 1 ? (
                    <SelectGroup key={g.family}>
                      <SelectSeparator />
                      <SelectLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{g.family}</SelectLabel>
                      {g.items.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                    </SelectGroup>
                  ) : <SelectItem key={g.family} value={g.items[0].value}>{g.items[0].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 md:col-span-2 lg:col-span-1">
              <GroupLabel>{es ? "Tiempo" : "Time"}</GroupLabel>
              <Segmented value={period} onChange={setPeriod} label={es ? "Tiempo" : "Time"}
                options={[["week", es ? "Esta semana" : "This week"], ["3m", es ? "Últimos 3 meses" : "Last 3 months"]]} />
            </div>
          </div>
          <div className="mt-4 border-t border-border/60 pt-4">
            <GroupLabel id="conv-profile">{es ? "Perfil" : "Profile"}</GroupLabel>
            <div role="group" aria-labelledby="conv-profile" className="flex flex-wrap gap-2">
              <Chip on={!audience} onClick={() => setAudience(null)}>{es ? "Todos" : "All"}</Chip>
              {AUDS.map((a) => <Chip key={a} on={audience === a} onClick={() => setAudience(a)}>{AUDIENCE_LABEL[a][language]}</Chip>)}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-lg text-foreground" aria-live="polite">{rows.length} <span className="text-sm text-muted-foreground">{es ? (rows.length === 1 ? "tema" : "temas") : (rows.length === 1 ? "topic" : "topics")}</span></p>
          {(query || platform || audience || treatment || period !== "week") && (
            <button type="button" onClick={() => { setQuery(""); setPlatform(null); setAudience(null); setTreatment(null); setPeriod("week"); }}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              <X className="size-3" aria-hidden /> {es ? "Quitar filtros" : "Clear filters"}
            </button>
          )}
        </div>
      </div>
      {rows.length === 0
        ? <p className="mt-6 text-sm text-muted-foreground">{es ? "No hay temas con estos filtros. Prueba «Últimos 3 meses» o quita algún filtro." : "No topics match these filters. Try “Last 3 months” or remove a filter."}</p>
        : <div className="mt-6 grid gap-6 md:grid-cols-2">{rows.map((t) => <TopicCard key={t.id} t={t} />)}</div>}
    </section>
  );
}
