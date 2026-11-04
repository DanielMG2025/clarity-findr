import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUp, ChevronDown, ExternalLink, FlaskConical, Library, Scale, Sparkles } from "lucide-react";
import { BasicsSection } from "@/modules/content/BasicsSection";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from "@/i18n/LanguageContext";
import { AUDIENCE_LABEL, LIBRARY, VOICES, usePublishedPills, type Audience, type Resource } from "@/modules/content";
import { PillCard } from "@/modules/content/PillCard";
import { ConversationSection } from "@/modules/content/ConversationSection";

const FILTERS: (Audience | "all")[] = ["all", "planners", "first-steps", "experienced", "men", "lgbt"];

/** Section nav — order matches the page order. */
const SECTIONS = [
  { id: "referencias", es: "Regulación y evidencia", en: "Regulation and evidence" },
  { id: "conversacion", es: "Conversación", en: "Conversation" },
  { id: "pildoras", es: "Píldoras", en: "Pills" },
  { id: "basicos", es: "Guías", en: "Guides" },
  { id: "biblioteca", es: "Biblioteca", en: "Library" },
  { id: "voces", es: "Voces", en: "Voices" },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];
const ALL_OPEN = Object.fromEntries(SECTIONS.map((s) => [s.id, true])) as Record<SectionId, boolean>;

/** Collapsible top-level section of the hub; the wrapper carries the section id for index and deep links. */
function Panel({ id, open, onOpenChange, es, children }: { id: SectionId; open: boolean; onOpenChange: (o: boolean) => void; es: boolean; children: ReactNode }) {
  const s = SECTIONS.find((x) => x.id === id)!;
  return (
    <Collapsible id={id} open={open} onOpenChange={onOpenChange} className="mt-12 scroll-mt-28 border-t border-border pt-4">
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 rounded-sm py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{es ? s.es : s.en}</span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-primary">
          {open ? (es ? "Plegar" : "Collapse") : (es ? "Desplegar" : "Expand")}
          <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-6">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function BackToTop({ es }: { es: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  const label = es ? "Volver arriba" : "Back to top";
  return (
    <button type="button" aria-label={label} title={label} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="no-print fixed bottom-20 right-4 z-40 grid size-11 place-items-center rounded-full border border-accent/70 bg-card text-primary shadow-lg transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:bottom-24 sm:right-6">
      <ArrowUp className="size-5" aria-hidden />
    </button>
  );
}

const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.18em] text-primary";

function SourceCard({ r, es, language }: { r: Resource; es: boolean; language: "en" | "es" }) {
  return (
    <Card className="flex min-w-0 flex-col rounded-lg border-border/70 bg-card/60 p-5 shadow-none">
      <h3 className="font-display text-lg font-medium leading-snug break-words">{r.name}</h3>
      <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground break-words">{r.platform}{r.handle ? ` · ${r.handle}` : ""}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed">{r.blurb[language]}</p>
      <div className="mt-4 space-y-1 border-t border-border pt-3">
        <Badge variant="outline" className="border-accent/50 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
          {es ? "Transparencia" : "Why trust it"}
        </Badge>
        <p className="text-xs text-muted-foreground">{r.affiliation[language]}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          {es ? "Visitar" : "Visit"} <ExternalLink className="size-3.5" />
        </a>
        {r.links?.map((l) => (
          <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            {l.label} <ExternalLink className="size-3.5" />
          </a>
        ))}
      </div>
    </Card>
  );
}

export default function Descubre() {
  const { language } = useLanguage();
  const es = language === "es";
  const [filter, setFilter] = useState<Audience | "all">("all");
  const [today, ...rest] = usePublishedPills();
  const match = (a: Audience[]) => filter === "all" || a.includes(filter);
  const feed = rest.filter((p) => match(p.audiences));
  const voices = VOICES.filter((r) => match(r.audiences));
  const creators = voices.filter((r) => r.kind === "creator");
  const communities = voices.filter((r) => r.kind === "community");

  const [open, setOpen] = useState<Record<SectionId, boolean>>(ALL_OPEN);
  const setPanel = (id: SectionId) => (o: boolean) => setOpen((prev) => ({ ...prev, [id]: o }));

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView(), 100);
  }, []);

  const go = (id: SectionId) => {
    setOpen((prev) => ({ ...prev, [id]: true }));
    window.history.replaceState(null, "", `#${id}`);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }));
  };

  return (
    <div className="container max-w-5xl px-6 py-14 md:py-20 [&_h2]:text-balance">
      <header className="max-w-3xl">
        <span className={`${eyebrow} inline-flex items-center gap-2`}><Sparkles className="size-3" /> {es ? "Descubre" : "Discover"}</span>
        <h1 className="mt-5 font-display text-4xl md:text-6xl font-medium leading-tight text-balance">
          {es ? "Recursos para apoyarte, estés donde estés en tu camino." : "Resources to support you, wherever you are on your journey."}
        </h1>
        <p className="mt-4 font-editorial italic text-xl md:text-2xl text-muted-foreground">
          {es
            ? "Da igual si estás empezando o si llevas tiempo en fertilidad: aquí tienes todo para informarte, abierto y sin pedirte ningún dato."
            : "Whether you're just starting or you've been in fertility for a while: everything to inform yourself, open and with no data asked."}
        </p>
        <p className="mt-5 text-sm text-muted-foreground">
          {es ? "¿Quieres ver tu caso?" : "Want to look at your case?"}{" "}
          <Link to="/situacion" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
            {es ? "Estudia tu caso" : "Check your case"} <ArrowRight className="size-3.5" />
          </Link>
        </p>
      </header>

      <nav aria-label={es ? "Secciones" : "Sections"}
        className="no-print sticky top-10 z-30 -mx-6 mt-8 flex gap-2 overflow-x-auto border-b border-border/60 bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:flex-wrap">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} onClick={(e) => { e.preventDefault(); go(s.id); }}
            className="shrink-0 rounded-full border border-border bg-card px-3.5 py-1 text-sm text-foreground transition-colors hover:border-accent hover:text-primary">
            {es ? s.es : s.en}
          </a>
        ))}
      </nav>

      <Panel id="referencias" open={open.referencias} onOpenChange={setPanel("referencias")} es={es}>
      <Link to="/descubre/regulacion" className="group block">
        <Card className="flex items-center gap-4 rounded-lg border-accent/50 bg-card/60 p-5 shadow-none transition-colors group-hover:border-accent">
          <Scale className="size-6 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-medium leading-snug">{es ? "Regulación comparada por país" : "Regulation compared by country"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{es ? "Qué permite cada país, con fuente y fecha" : "What each country allows, with source and date"}</p>
          </div>
          <ArrowRight className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden />
        </Card>
      </Link>

      <Link to="/descubre/ciencia" className="group mt-3 block">
        <Card className="flex items-center gap-4 rounded-lg border-accent/50 bg-card/60 p-5 shadow-none transition-colors group-hover:border-accent">
          <FlaskConical className="size-6 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-medium leading-snug">{es ? "Qué dice la evidencia" : "What the evidence says"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{es ? "Edad, técnicas y 'extras': lo que mueve de verdad tus probabilidades" : "Age, techniques and 'add-ons': what really moves your odds"}</p>
          </div>
          <ArrowRight className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden />
        </Card>
      </Link>
      </Panel>

      <Panel id="conversacion" open={open.conversacion} onOpenChange={setPanel("conversacion")} es={es}>
        <ConversationSection />
      </Panel>

      <Panel id="pildoras" open={open.pildoras} onOpenChange={setPanel("pildoras")} es={es}>
      <section>
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
      </Panel>

      <Panel id="basicos" open={open.basicos} onOpenChange={setPanel("basicos")} es={es}>
        <BasicsSection />
      </Panel>

      <Panel id="biblioteca" open={open.biblioteca} onOpenChange={setPanel("biblioteca")} es={es}>
      <section>
        <h2 className="flex items-center gap-2 font-display text-3xl font-medium">
          <Library className="size-6 text-primary" /> {es ? "Biblioteca científica" : "Scientific library"}
        </h2>
        <p className="mt-2 max-w-[65ch] text-sm text-muted-foreground">
          {es
            ? "Instituciones, registros y sociedades médicas: las fuentes de las que salen los datos de fertilidad."
            : "Institutions, registries and medical societies: the sources fertility data comes from."}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LIBRARY.map((r) => <SourceCard key={r.id} r={r} es={es} language={language} />)}
        </div>
        <Link to="/library" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          {es ? "Ver la biblioteca de referencias completa, con cifras clave" : "See the full reference library, with key figures"} <ArrowRight className="size-4" />
        </Link>
      </section>
      </Panel>

      <Panel id="voces" open={open.voces} onOpenChange={setPanel("voces")} es={es}>
      <section>
        <h2 className="font-display text-3xl font-medium">{es ? "Voces de confianza" : "Trusted voices"}</h2>
        <p className="mt-2 max-w-[65ch] text-sm text-muted-foreground">
          {es
            ? "Médicos creadores en YouTube, Instagram y podcasts, y comunidades que nos gusta escuchar — con quién habla y qué interés tiene, siempre a la vista. El filtro de perfil de arriba también se aplica aquí."
            : "Doctor-creators on YouTube, Instagram and podcasts, and communities we like to listen to — with who is talking and their interest always in view. The audience filter above applies here too."}
        </p>
        {creators.length > 0 && (
          <>
            <p className={`${eyebrow} mt-8`}>{es ? "Creadores y voces" : "Creators and voices"}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {creators.map((r) => <SourceCard key={r.id} r={r} es={es} language={language} />)}
            </div>
          </>
        )}
        {communities.length > 0 && (
          <>
            <p className={`${eyebrow} mt-10`}>{es ? "Comunidades y organizaciones" : "Communities and organizations"}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {communities.map((r) => <SourceCard key={r.id} r={r} es={es} language={language} />)}
            </div>
          </>
        )}
      </section>
      </Panel>

      <p className="mt-16 max-w-[65ch] border-t border-border pt-6 text-sm text-muted-foreground leading-relaxed">
        {es
          ? "Una nota de transparencia: la mayoría de las voces sobre fertilidad son médicos que ejercen en clínicas. Por eso siempre indicamos quién habla y qué interés tiene."
          : "A note on transparency: most fertility voices are practising clinicians. That is why we always label who is talking and what their interest is."}
      </p>
      <BackToTop es={es} />
    </div>
  );
}
