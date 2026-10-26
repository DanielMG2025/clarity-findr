import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, Compass, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BasicsSection } from "@/modules/content/BasicsSection";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageContext";
import { AUDIENCE_LABEL, RESOURCES, usePublishedPills, type Audience } from "@/modules/content";
import { PillCard } from "@/modules/content/PillCard";
import { ConversationSection } from "@/modules/content/ConversationSection";

const FILTERS: (Audience | "all")[] = ["all", "planners", "first-steps", "experienced", "men", "lgbt"];

export default function Descubre() {
  const { language } = useLanguage();
  const es = language === "es";
  const [filter, setFilter] = useState<Audience | "all">("all");
  const [today, ...rest] = usePublishedPills();
  const match = (a: Audience[]) => filter === "all" || a.includes(filter);
  const feed = rest.filter((p) => match(p.audiences));
  const voices = RESOURCES.filter((r) => match(r.audiences));

  const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.18em] text-primary";

  return (
    <div className="container max-w-5xl px-6 py-14 md:py-20 [&_h2]:text-balance">
      <header className="max-w-3xl">
        <span className={`${eyebrow} inline-flex items-center gap-2`}><Sparkles className="size-3" /> {es ? "Descubre" : "Discover"}</span>
        <h1 className="mt-5 font-display text-4xl md:text-6xl font-medium leading-tight text-balance">
          {es ? "Tu brújula para orientarte en el tratamiento de fertilidad." : "Your compass to navigate fertility treatment."}
        </h1>
        <p className="mt-4 font-editorial italic text-xl md:text-2xl text-muted-foreground">
          {es ? "Información de fuentes públicas y lo que se dice en los foros, seleccionado para ti." : "Information from public sources and what people say in forums, selected for you."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/situacion"><Compass className="size-4" /> {es ? "Explora tu caso" : "Explore your case"} <ArrowRight className="size-4" /></Link>
          </Button>
          <Button variant="ghost" size="lg" className="gap-2" onClick={() => document.getElementById("contenido")?.scrollIntoView({ behavior: "smooth" })}>
            {es ? "Descubre lo que se mueve" : "See what's moving"} <ArrowDown className="size-4" />
          </Button>
        </div>
      </header>

      <div id="contenido" className="scroll-mt-24" />
      <ConversationSection />

      <section className="mt-12">
        <p className={`${eyebrow} mb-4`}>{es ? "Píldora del día" : "Pill of the day"}</p>
        <PillCard pill={today} featured />
      </section>

      <div className="mt-14 flex flex-wrap gap-2" role="group" aria-label={es ? "Filtrar por perfil" : "Filter by audience"}>
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <button key={f} type="button" aria-pressed={active} onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${active ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card text-foreground hover:border-accent/60"}`}>
              {f === "all" ? (es ? "Todas" : "All") : AUDIENCE_LABEL[f][language]}
            </button>
          );
        })}
      </div>

      <section className="mt-8">
        <h2 className="font-display text-3xl font-medium">{es ? "Más píldoras" : "More pills"}</h2>
        {feed.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{es ? "Aún no hay más píldoras para este perfil." : "No more pills for this audience yet."}</p>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2">{feed.map((p) => <PillCard key={p.id} pill={p} />)}</div>
        )}
      </section>

      <section className="mt-16">
        <h2 className="font-display text-3xl font-medium">{es ? "Voces de confianza" : "Trusted voices"}</h2>
        <p className="mt-2 max-w-[65ch] text-sm text-muted-foreground">
          {es ? "Personas e instituciones que nos gusta escuchar — con quién habla y qué interés tiene, siempre a la vista." : "People and institutions we like to listen to — with who is talking and their interest always in view."}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {voices.map((r) => (
            <Card key={r.id} className="flex min-w-0 flex-col rounded-lg border-border/70 bg-card/60 p-5 shadow-none">
              <h3 className="font-display text-lg font-medium leading-snug break-words">{r.name}</h3>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground break-words">{r.platform}{r.handle ? ` · ${r.handle}` : ""}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed">{r.blurb[language]}</p>
              <div className="mt-4 space-y-1 border-t border-border pt-3">
                <Badge variant="outline" className="border-accent/50 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                  {es ? "Transparencia" : "Why trust it"}
                </Badge>
                <p className="text-xs text-muted-foreground">{r.affiliation[language]}</p>
              </div>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                {es ? "Visitar" : "Visit"} <ExternalLink className="size-3.5" />
              </a>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-20 border-t border-border pt-12">
        <BasicsSection />
      </section>

      <p className="mt-16 max-w-[65ch] border-t border-border pt-6 text-sm text-muted-foreground leading-relaxed">
        {es
          ? "Una nota de transparencia: la mayoría de las voces sobre fertilidad son médicos que ejercen en clínicas. Por eso siempre indicamos quién habla y qué interés tiene."
          : "A note on transparency: most fertility voices are practising clinicians. That is why we always label who is talking and what their interest is."}
      </p>
    </div>
  );
}
