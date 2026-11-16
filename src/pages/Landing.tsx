import { Link } from "react-router-dom";
import { logBetaClick } from "@/modules/beta-analytics/logger";
import {
  ArrowRight,
  ShieldCheck,
  Compass,
  Heart,
  Lock,
  Lightbulb,
  Newspaper,
  MessageCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translate";
import { usePublishedTopics } from "@/modules/content/conversation";

type L = Record<Language, string>;

const COPY = {
  masthead: { en: "Independent fertility guide", es: "Guía independiente de fertilidad" },
  eyebrow: { en: "Independent · every figure with its source and date", es: "Independiente · cada dato con su fuente y su fecha" },
  h1a: { en: "Understand and prepare your fertility treatment,", es: "Entiende y prepara tu tratamiento de fertilidad," },
  h1b: { en: "without losing months.", es: "sin perder meses." },
  support: {
    en: "Fertility Compass brings together in one place, independently, what would normally take you months: real prices comparable by country, what the law allows in each place, what the science says and what's shared in forums and communities — every figure with its source and date. Then it helps you take the step: finding the clinic that fits, financing, travel and recovery.",
    es: "Fertility Compass reúne en un sitio, de forma independiente, lo que normalmente te llevaría meses: precios reales comparables por país, qué permite la ley de cada sitio, qué dice la ciencia y lo que se cuenta en foros y comunidades — cada dato con su fuente y su fecha. Y luego te ayuda a dar el paso: encontrar la clínica que encaja, la financiación, el viaje y la recuperación.",
  },
  blocksLabel: { en: "Two halves, one place", es: "Dos mitades, un solo sitio" },
  soon: { en: "In progress", es: "En construcción" },
  demoLine: { en: "Want to see how it would work for someone like you?", es: "¿Quieres ver cómo funcionaría con alguien parecido a ti?" },
  demoLink: { en: "→ Example cases", es: "→ Casos de ejemplo" },
  disclaimer: {
    en: "Orientation based on public data and on what you choose to share. It does not replace a medical consultation.",
    es: "Orientación basada en datos públicos y en lo que eliges compartir. No sustituye una consulta médica.",
  },
  frameEyebrow: { en: "Why we exist", es: "Por qué existimos" },
  h2a: { en: "From uncertainty to clarity", es: "De la incertidumbre a la claridad" },
  h2b: { en: "on your fertility journey.", es: "en tu camino de fertilidad." },
  subhead: {
    en: "Your compass to understand your options, realistic costs and what truly matters — every figure explained.",
    es: "Tu brújula para entender tus opciones, costes realistas y lo que de verdad influye — con cada dato explicado.",
  },
  frameBody: {
    en: "Clinics, specialists, communities and public sources each hold part of the picture. We bring those parts together so you can arrive at a consultation knowing what to ask.",
    es: "Clínicas, especialistas, comunidades y fuentes públicas tienen cada una una parte del cuadro. Las juntamos para que llegues a la consulta sabiendo qué preguntar.",
  },
  hotEyebrow: { en: "Forum listening", es: "Escucha de foros" },
  hotTitle: { en: "Hot this week", es: "Lo más candente esta semana" },
  hotIntro: {
    en: "Themes patients are discussing right now, summarized neutrally. Anecdotal, not medical advice.",
    es: "Temas que las pacientes comentan ahora mismo, resumidos de forma neutral. Experiencias, no consejo médico.",
  },
  hotAll: { en: "See everything in Discover", es: "Ver todo en Descubre" },
  trustEyebrow: { en: "Trust and privacy", es: "Confianza y privacidad" },
  trustTitle: { en: "Confidential, transparent and respectful.", es: "Confidencial, transparente y respetuoso." },
  sdc: { en: "Source · date · confidence", es: "Fuente · fecha · confianza" },
  noticeLabel: { en: "Important notice:", es: "Aviso importante:" },
  notice: {
    en: "Fertility Compass provides orientation based on public data, statistical models and information you choose to share. It does not replace a medical consultation, diagnosis or treatment recommendation.",
    es: "Fertility Compass ofrece orientación basada en datos públicos, modelos estadísticos y la información que eliges compartir. No sustituye una consulta médica, un diagnóstico ni una recomendación de tratamiento.",
  },
} satisfies Record<string, L>;

type BlockItem = { label: L; to?: string };
type Block = {
  key: "discover" | "prepare";
  icon: typeof Heart;
  title: L;
  desc: L;
  items: BlockItem[];
  audience: L;
  cta: { to: string; label: L };
};

/** The two halves of the product. Every item points at a surface that already exists;
 *  items without a destination are shown honestly as "in progress". */
const BLOCKS: Block[] = [
  {
    key: "discover",
    icon: Newspaper,
    title: { en: "Discover", es: "Descubre" },
    desc: {
      en: "Understand before you decide. Come whenever you like — no data needed.",
      es: "Entiende antes de decidir. Ven cuando quieras, sin dejar ningún dato.",
    },
    items: [
      { label: { en: "Daily pills", es: "Píldoras" }, to: "/descubre#pildoras" },
      { label: { en: "Trusted voices", es: "Voces de confianza" }, to: "/descubre#voces" },
      { label: { en: "Scientific evidence", es: "Evidencia científica" }, to: "/descubre#evidencia" },
      { label: { en: "Regulation by country", es: "Regulación por país" }, to: "/descubre/regulacion" },
      { label: { en: "Reference prices", es: "Precios de referencia" }, to: "/costes" },
      { label: { en: "The forum conversation", es: "La conversación de los foros" }, to: "/descubre#conversacion" },
    ],
    audience: { en: "For any stage: just starting or experienced.", es: "Para cualquier etapa: empezando o con experiencia." },
    cta: { to: "/descubre", label: { en: "Go to Discover", es: "Entrar en Descubre" } },
  },
  {
    key: "prepare",
    icon: Heart,
    title: { en: "Prepare", es: "Prepara" },
    desc: {
      en: "Take the step with your own case: the factors that matter, normalized costs and the clinics that fit.",
      es: "Da el paso con tu propio caso: los factores que influyen, costes normalizados y las clínicas que encajan.",
    },
    items: [
      { label: { en: "Find the clinic that fits", es: "Encontrar la clínica que encaja" }, to: "/situacion" },
      { label: { en: "Financing", es: "Financiación" } },
      { label: { en: "Travel", es: "Viaje" } },
      { label: { en: "Recovery", es: "Recuperación" } },
    ],
    audience: {
      en: "If you're thinking about treatment or preserving your fertility — or aren't sure yet.",
      es: "Si piensas en un tratamiento o en preservar tu fertilidad, o aún no lo tienes claro.",
    },
    cta: { to: "/situacion", label: { en: "Check your case", es: "Estudia tu caso" } },
  },
];

const TRUST: { icon: typeof Lock; title: L; desc: L; featured: boolean }[] = [
  {
    icon: Lock,
    title: { en: "Confidential information", es: "Información confidencial" },
    desc: { en: "Your data is yours. You decide what to share, and with whom.", es: "Tus datos son tuyos. Tú decides qué compartir y con quién." },
    featured: false,
  },
  {
    icon: ShieldCheck,
    title: { en: "Not a substitute for a doctor", es: "No sustituye a un médico" },
    desc: { en: "It's orientation, not a diagnosis or a clinical recommendation.", es: "Es orientación, no un diagnóstico ni una recomendación clínica." },
    featured: false,
  },
  {
    icon: Lightbulb,
    title: { en: "Every result is explained", es: "Cada resultado, explicado" },
    desc: {
      en: "Every figure carries its source, its date and how confident we are — and tells you what it does not say.",
      es: "Cada cifra lleva su fuente, su fecha y nuestro nivel de confianza, y te dice también lo que no dice.",
    },
    featured: true,
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
      {children}
    </span>
  );
}

function IconChip({ icon: Icon, size = "md" }: { icon: typeof Lock; size?: "sm" | "md" }) {
  return (
    <div className={`grid shrink-0 place-items-center rounded-full border border-accent/60 bg-card text-primary ${size === "sm" ? "size-8" : "size-10"}`}>
      <Icon className={size === "sm" ? "size-4" : "size-5"} />
    </div>
  );
}

/** Discover + Prepare, side by side on the burgundy cover. */
function Blocks({ language }: { language: Language }) {
  const soon = COPY.soon[language];
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      {BLOCKS.map((b) => (
        <section
          key={b.key}
          aria-labelledby={`block-${b.key}`}
          className="flex min-w-0 flex-col rounded-2xl border border-accent/60 bg-background/[0.06] p-6 text-left shadow-elegant backdrop-blur-sm md:p-7"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-accent/70 text-accent">
              <b.icon className="size-5" />
            </span>
            <h2 id={`block-${b.key}`} className="font-display text-2xl font-medium leading-tight text-background md:text-3xl">
              {b.title[language]}
            </h2>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-background/80 md:text-base">{b.desc[language]}</p>
          <ul className="mt-4 flex flex-wrap gap-2 border-t border-accent/30 pt-4">
            {b.items.map((it) =>
              it.to ? (
                <li key={it.label.en}>
                  <Link
                    to={it.to}
                    className="inline-flex items-center rounded-full border border-accent/50 px-3 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:text-sm"
                  >
                    {it.label[language]}
                  </Link>
                </li>
              ) : (
                <li
                  key={it.label.en}
                  className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-background/30 px-3 py-1 text-xs text-background/70 md:text-sm"
                >
                  {it.label[language]}
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-background/50">· {soon}</span>
                </li>
              ),
            )}
          </ul>
          <p className="mt-4 mb-6 font-editorial text-sm italic text-background/70">{b.audience[language]}</p>
          <Link
            to={b.cta.to}
            onClick={() => { if (b.cta.to === "/situacion") logBetaClick("start_case", { from: "landing" }); }}
            className="group mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
          >
            {b.cta.label[language]}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </section>
      ))}
    </div>
  );
}

function HotThisWeek({ language }: { language: Language }) {
  const topics = usePublishedTopics().filter((t) => t.period === "week").slice(0, 4);
  if (topics.length === 0) return null;
  const es = language === "es";
  return (
    <section className="container max-w-6xl px-6 py-16 md:py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <Eyebrow><MessageCircle className="size-3.5" /> {COPY.hotEyebrow[language]}</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-medium leading-tight md:text-4xl">{COPY.hotTitle[language]}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{COPY.hotIntro[language]}</p>
        </div>
        <Link to="/descubre" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          {COPY.hotAll[language]} <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {topics.map((t) => (
          <Link
            key={t.id}
            to="/descubre"
            className="group flex min-w-0 flex-col rounded-lg border border-border/70 bg-card/60 p-5 transition-colors hover:border-accent/70"
          >
            <span className="w-fit max-w-full truncate rounded-full border border-accent/50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              {t.source_platform || t.source_forum}
            </span>
            <p className="mt-3 flex-1 font-display text-lg font-medium leading-snug">
              {(es ? t.question_es : t.question_en) || t.question_en || t.question_es}
            </p>
            <ArrowRight className="mt-4 size-4 text-primary transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Landing() {
  const { language } = useLanguage();
  const c = (k: keyof typeof COPY) => COPY[k][language];
  return (
    <div className="min-h-screen [&_h1]:text-balance [&_h2]:text-balance [&_h3]:text-balance">
      {/* HERO — headline, approved supporting line, then Discover + Prepare */}
      <section className="relative overflow-hidden border-b border-border text-background dark:[--foreground:var(--sidebar-background)] dark:[--background:var(--sidebar-accent-foreground)] dark:[--primary:var(--sidebar-accent)] before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent before:to-transparent after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-px after:bg-gradient-to-r after:from-transparent after:via-accent after:to-transparent">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-5%,hsl(var(--primary))_0%,hsl(var(--foreground))_55%,hsl(var(--foreground))_100%)]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center opacity-[0.14]">
          <svg
            viewBox="0 0 200 200"
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="1"
            strokeLinejoin="round"
            className="size-[min(80vw,560px)]"
          >
            <circle cx="100" cy="100" r="92" opacity="0.85" />
            {[0, 90, 180, 270].map((r) => (
              <path key={r} d="M100 4 L96 15 L104 15 Z" fill="hsl(var(--accent))" stroke="none" transform={`rotate(${r} 100 100)`} />
            ))}
            {[0, 30, 60, 90, 120, 150].map((r) => (
              <ellipse key={r} cx="100" cy="100" rx="9" ry="66" transform={`rotate(${r} 100 100)`} />
            ))}
            <circle cx="100" cy="100" r="9" fill="hsl(var(--accent))" stroke="none" />
          </svg>
        </div>

        <div className="relative container max-w-6xl px-6 text-center">
          {/* MASTHEAD */}
          <div className="flex items-center justify-between gap-4 border-b border-background/15 py-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-accent/70 text-accent">
                <Compass className="size-4" />
              </span>
              <span className="font-display text-lg md:text-xl tracking-[0.08em] text-background">
                Fertility Compass
              </span>
            </div>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-accent sm:inline">
              {c("masthead")}
            </span>
          </div>

          <div className="pt-12 pb-14 md:pt-16 md:pb-20">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              <Compass className="size-3 shrink-0" /> {c("eyebrow")}
            </span>
            <h1 className="mt-7 mx-auto max-w-5xl font-display text-[clamp(2.25rem,6.5vw,4.75rem)] font-medium leading-[1.08] tracking-normal">
              {c("h1a")}
              <span className="block text-accent italic">{c("h1b")}</span>
            </h1>
            <p className="mt-7 mx-auto max-w-[62ch] text-base leading-relaxed text-background/90 md:text-lg">
              {c("support")}
            </p>

            <div className="mx-auto mt-10 max-w-4xl">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-background/60">
                {c("blocksLabel")}
              </p>
              <Blocks language={language} />
            </div>

            <p className="mt-7 text-sm text-background/70">
              {c("demoLine")}{" "}
              <Link to="/demo" className="font-medium text-accent underline-offset-4 hover:underline">
                {c("demoLink")}
              </Link>
            </p>

            <p className="mt-8 text-xs text-background/60 max-w-xl mx-auto leading-relaxed">
              {c("disclaimer")}
            </p>
          </div>
        </div>
      </section>

      {/* 1. HOT THIS WEEK — substantiates the Discover half */}
      <HotThisWeek language={language} />

      {/* 2. SUPPORTING FRAME — the emotional "why", moved down from the hero */}
      <section className="border-y border-border/70 bg-card/40">
        <div className="container max-w-4xl px-6 py-16 text-center md:py-20">
          <Eyebrow><Compass className="size-3.5" /> {c("frameEyebrow")}</Eyebrow>
          <h2 className="mt-5 font-display text-3xl font-medium leading-tight md:text-5xl">
            {c("h2a")}
            <span className="block italic text-primary">{c("h2b")}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[46ch] font-editorial text-lg italic leading-relaxed text-muted-foreground md:text-xl">
            {c("subhead")}
          </p>
          <p className="mx-auto mt-5 max-w-[60ch] text-sm leading-relaxed text-muted-foreground md:text-base">
            {c("frameBody")}
          </p>
        </div>
      </section>

      {/* 3. TRUST & PRIVACY */}
      <section className="container max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-10 max-w-3xl">
          <Eyebrow>{c("trustEyebrow")}</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-medium leading-tight md:text-4xl">{c("trustTitle")}</h2>
        </div>
        <div className="grid items-stretch gap-6 md:grid-cols-3 md:gap-8">
          {TRUST.map((t) => (
            <Card
              key={t.title.en}
              className={`min-w-0 rounded-lg border bg-card/60 p-7 shadow-none ${t.featured ? "border-accent/60" : "border-border/70"}`}
            >
              <IconChip icon={t.icon} />
              <h3 className="mt-5 mb-3 font-display text-2xl font-medium leading-snug">{t.title[language]}</h3>
              <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">{t.desc[language]}</p>
              {t.featured && (
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{c("sdc")}</p>
              )}
            </Card>
          ))}
        </div>
        <p className="mt-10 max-w-[65ch] border-t border-border pt-8 text-sm leading-relaxed text-muted-foreground">
          <strong className="font-semibold text-foreground">{c("noticeLabel")}</strong> {c("notice")}
        </p>
      </section>

    </div>
  );
}
