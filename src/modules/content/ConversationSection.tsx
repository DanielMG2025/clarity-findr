import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, MessageCircle, TrendingUp, Minus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageContext";
import { AUDIENCE_LABEL, type Audience } from "./types";
import { usePublishedTopics, filterTopics, platformFamily, type Period, type TopicRow } from "./conversation";

const AUDS: Audience[] = ["planners", "first-steps", "experienced", "men", "lgbt"];
const GEO_EN: Record<string, string> = { "España": "Spain", "Europa": "Europe", "Chequia": "Czechia", "España/Chequia": "Spain/Czechia", "Europa/EE. UU.": "Europe/US" };

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-pressed={on} onClick={onClick} className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-accent hover:text-foreground"}`}>{children}</button>;
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
      <div className="mt-6 space-y-3">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" aria-label={es ? "Busca un tema" : "Search a topic"}
            placeholder={es ? "Busca un tema: baja reserva, ovodonación, Chequia…" : "Search a topic: low reserve, egg donation, Czechia…"} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip on={period === "week"} onClick={() => setPeriod("week")}>{es ? "Esta semana" : "This week"}</Chip>
          <Chip on={period === "3m"} onClick={() => setPeriod("3m")}>{es ? "Últimos 3 meses" : "Last 3 months"}</Chip>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip on={!platform} onClick={() => setPlatform(null)}>{es ? "Todos los foros" : "All forums"}</Chip>
          {platforms.map((p) => <Chip key={p} on={platform === p} onClick={() => setPlatform(p)}>{p}</Chip>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip on={!audience} onClick={() => setAudience(null)}>{es ? "Todas" : "All"}</Chip>
          {AUDS.map((a) => <Chip key={a} on={audience === a} onClick={() => setAudience(a)}>{AUDIENCE_LABEL[a][language]}</Chip>)}
          <select value={treatment ?? ""} onChange={(e) => setTreatment(e.target.value || null)} aria-label={es ? "Tratamiento" : "Treatment"}
            className="h-8 max-w-full rounded-full border border-border bg-card px-3 text-xs text-foreground">
            <option value="">{es ? "Todos los tratamientos" : "All treatments"}</option>
            {treatments.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <p className="text-xs text-muted-foreground">{rows.length} {es ? "temas" : "topics"}</p>
      </div>
      {rows.length === 0
        ? <p className="mt-6 text-sm text-muted-foreground">{es ? "No hay temas con estos filtros. Prueba «Últimos 3 meses» o quita algún filtro." : "No topics match these filters. Try “Last 3 months” or remove a filter."}</p>
        : <div className="mt-6 grid gap-6 md:grid-cols-2">{rows.map((t) => <TopicCard key={t.id} t={t} />)}</div>}
    </section>
  );
}
