import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Compass,
  Wallet,
  Building2,
  Heart,
  Stethoscope,
  Lock,
  Lightbulb,
  HeartHandshake,
  Newspaper,
  MessageCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translate";
import { usePublishedTopics } from "@/modules/content/conversation";

type L = Record<Language, string>;

const COPY = {
  masthead: { en: "Explained orientation", es: "Orientación explicada" },
  eyebrow: { en: "Explained, confidential orientation", es: "Orientación explicada y confidencial" },
  h1a: { en: "From uncertainty to clarity", es: "De la incertidumbre a la claridad" },
  h1b: { en: "on your fertility journey.", es: "en tu camino de fertilidad." },
  subhead: {
    en: "Your compass to understand your options, realistic costs and what truly matters — every figure explained.",
    es: "Tu brújula para entender tus opciones, costes realistas y lo que de verdad influye — con cada dato explicado.",
  },
  doorsLabel: { en: "Choose where to start", es: "Elige por dónde empezar" },
  demoLine: { en: "Just exploring the product?", es: "¿Solo quieres curiosear el producto?" },
  demoLink: { en: "Enter demo mode with a sample case.", es: "Entra en modo demo con un caso de ejemplo." },
  disclaimer: {
    en: "Orientation based on public data and on what you choose to share. It does not replace a medical consultation.",
    es: "Orientación basada en datos públicos y en lo que eliges compartir. No sustituye una consulta médica.",
  },
  hotEyebrow: { en: "Forum listening", es: "Escucha de foros" },
  hotTitle: { en: "Hot this week", es: "Lo más candente esta semana" },
  hotIntro: {
    en: "Themes patients are discussing right now, summarized neutrally. Anecdotal, not medical advice.",
    es: "Temas que las pacientes comentan ahora mismo, resumidos de forma neutral. Experiencias, no consejo médico.",
  },
  hotAll: { en: "See everything in Explore", es: "Ver todo en Infórmate" },
  caseEyebrow: { en: "The other door", es: "La otra puerta" },
  caseTitle: { en: "If you want to study your case", es: "Si quieres estudiar tu caso" },
  caseIntro: {
    en: "We help you understand — we don't decide for you. Five steps, at your own pace; pause and come back whenever you want.",
    es: "Te ayudamos a entender, no decidimos por ti. Cinco pasos, a tu ritmo; puedes pausar y volver cuando quieras.",
  },
  helpLabel: { en: "What you'll understand", es: "Lo que entenderás" },
  stepsLabel: { en: "Five steps", es: "Cinco pasos" },
  trustEyebrow: { en: "Trust and privacy", es: "Confianza y privacidad" },
  trustTitle: { en: "Confidential, transparent and respectful.", es: "Confidencial, transparente y respetuoso." },
  sdc: { en: "Source · date · confidence", es: "Fuente · fecha · confianza" },
  noticeLabel: { en: "Important notice:", es: "Aviso importante:" },
  notice: {
    en: "Fertility Compass provides orientation based on public data, statistical models and information you choose to share. It does not replace a medical consultation, diagnosis or treatment recommendation.",
    es: "Fertility Compass ofrece orientación basada en datos públicos, modelos estadísticos y la información que eliges compartir. No sustituye una consulta médica, un diagnóstico ni una recomendación de tratamiento.",
  },
  ctaTitle: { en: "Take the first step toward your clarity.", es: "Da el primer paso hacia tu claridad." },
  ctaText: {
    en: "Start by getting informed, or go straight to your own case. Both doors stay open.",
    es: "Empieza informándote o ve directamente a tu caso. Las dos puertas siguen abiertas.",
  },
} satisfies Record<string, L>;

const DOORS = [
  {
    to: "/descubre",
    icon: Newspaper,
    title: { en: "Explore", es: "Infórmate" },
    desc: {
      en: "What's moving in the forums this week, daily pills and resources. Come whenever you like — no data needed.",
      es: "Lo que se mueve en los foros esta semana, píldoras diarias y recursos. Ven cuando quieras, sin dejar ningún dato.",
    },
  },
  {
    to: "/situacion",
    icon: Heart,
    title: { en: "Check your case", es: "Estudia tu caso" },
    desc: {
      en: "A personalized read of your situation: the factors that matter, normalized costs and clinics that fit.",
      es: "Una lectura personalizada de tu situación: los factores que influyen, costes normalizados y clínicas que encajan.",
    },
  },
] as const;

const HELP: { icon: typeof Lock; title: L }[] = [
  { icon: Lightbulb, title: { en: "What factors may influence your case", es: "Qué factores pueden influir en tu caso" } },
  { icon: Stethoscope, title: { en: "What treatments are usually considered", es: "Qué tratamientos se suelen valorar" } },
  { icon: Wallet, title: { en: "How much it could cost", es: "Cuánto podría costar" } },
  { icon: Building2, title: { en: "Which clinics may fit", es: "Qué clínicas pueden encajar" } },
  { icon: HeartHandshake, title: { en: "When to talk to an expert", es: "Cuándo hablar con un experto" } },
];

const STEPS: L[] = [
  { en: "Share your situation", es: "Comparte tu situación" },
  { en: "Get an explained orientation", es: "Recibe una orientación explicada" },
  { en: "Explore normalized costs", es: "Explora costes normalizados" },
  { en: "Compare clinics", es: "Compara clínicas" },
  { en: "Decide your next steps", es: "Decide tus siguientes pasos" },
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

/** The two equal doors. `tone="cover"` sits on the burgundy cover. */
function Doors({ language, tone = "cover" }: { language: Language; tone?: "cover" }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      {DOORS.map((d) => (
        <Link
          key={d.to}
          to={d.to}
          className="group flex min-w-0 flex-col rounded-2xl border border-accent/60 bg-background/[0.06] p-6 text-left shadow-elegant backdrop-blur-sm transition-colors hover:border-accent hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:p-7"
          data-tone={tone}
        >
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-accent/70 text-accent">
              <d.icon className="size-5" />
            </span>
            <span className="font-display text-2xl font-medium leading-tight text-background md:text-3xl">
              {d.title[language]}
            </span>
            <ArrowRight className="ml-auto size-5 shrink-0 text-accent transition-transform group-hover:translate-x-1" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-background/80 md:text-base">{d.desc[language]}</p>
        </Link>
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
      {/* HERO — magazine cover with the two-door fork */}
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
              <Compass className="size-3" /> {c("eyebrow")}
            </span>
            <h1 className="mt-7 mx-auto max-w-5xl font-display text-[clamp(2.5rem,8vw,5.5rem)] font-medium leading-[1.05] tracking-normal">
              {c("h1a")}
              <span className="block text-accent italic">{c("h1b")}</span>
            </h1>
            <p className="mt-7 font-editorial italic text-xl md:text-2xl text-background/90 max-w-[46ch] mx-auto leading-relaxed">
              {c("subhead")}
            </p>

            <div className="mx-auto mt-10 max-w-4xl">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-background/60">
                {c("doorsLabel")}
              </p>
              <Doors language={language} />
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

      {/* 1. HOT THIS WEEK — substantiates the Explore door */}
      <HotThisWeek language={language} />

      {/* 2. SUPPORTING THE OTHER DOOR — slim, secondary */}
      <section id="how-it-works" className="border-y border-border bg-muted/20">
        <div className="container max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-10 max-w-3xl">
            <Eyebrow>{c("caseEyebrow")}</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-medium leading-tight md:text-4xl">{c("caseTitle")}</h2>
            <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-muted-foreground md:text-base">{c("caseIntro")}</p>
          </div>
          <div className="grid gap-10 md:grid-cols-2">
            <div className="min-w-0">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{c("helpLabel")}</p>
              <ul className="space-y-3">
                {HELP.map((h) => (
                  <li key={h.title.en} className="flex items-center gap-3">
                    <IconChip icon={h.icon} size="sm" />
                    <span className="text-base leading-snug">{h.title[language]}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="min-w-0">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{c("stepsLabel")}</p>
              <ol className="space-y-3">
                {STEPS.map((s, i) => (
                  <li key={s.en} className="flex items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-accent/60 bg-card font-display text-base font-medium tabular-nums text-primary">
                      {i + 1}
                    </span>
                    <span className="text-base leading-snug">{s[language]}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <Link to="/situacion" className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            {DOORS[1].title[language]} <ArrowRight className="size-4" />
          </Link>
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

      {/* 4. FINAL CTA — both doors again */}
      <section className="relative overflow-hidden bg-foreground text-background dark:[--foreground:var(--sidebar-background)] dark:[--background:var(--sidebar-accent-foreground)] dark:[--primary:var(--sidebar-accent)] before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent before:to-transparent">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-5%,hsl(var(--primary))_0%,hsl(var(--foreground))_55%,hsl(var(--foreground))_100%)]" />
        <div className="relative container max-w-4xl px-6 py-16 md:py-24 text-center">
          <Heart className="mx-auto size-8 text-accent" />
          <h2 className="mt-6 font-display text-3xl font-medium leading-tight md:text-5xl">{c("ctaTitle")}</h2>
          <p className="mx-auto mt-4 max-w-[60ch] leading-relaxed text-background/85">{c("ctaText")}</p>
          <div className="mt-10">
            <Doors language={language} />
          </div>
        </div>
      </section>
    </div>
  );
}
