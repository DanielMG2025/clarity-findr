import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Compass,
  Wallet,
  Building2,
  Heart,
  Stethoscope,
  Lock,
  Lightbulb,
  HeartHandshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";


const HELP = [
  { icon: Lightbulb,   title: "What factors may influence your case", desc: "Age, ovarian reserve, history and diagnosis explained without jargon." },
  { icon: Stethoscope, title: "What treatments are usually considered", desc: "Options that people with similar profiles often explore." },
  { icon: Wallet,      title: "How much it could cost",                desc: "Normalized ranges with what's included — and what's not." },
  { icon: Building2,   title: "Which clinics may fit",                 desc: "A transparent comparison, ordered by your priorities." },
  { icon: HeartHandshake, title: "When to talk to an expert",          desc: "We tell you when a second medical opinion may bring real clarity." },
];

const STEPS = [
  { n: 1, title: "Share your situation",          desc: "Share only what you want. Each block improves the orientation." },
  { n: 2, title: "Get an explained orientation",  desc: "An approximate read of the factors that may influence your case." },
  { n: 3, title: "Explore normalized costs",      desc: "Realistic ranges per scenario, with what's typically included." },
  { n: 4, title: "Compare clinics",               desc: "Options that may fit your case and your priorities." },
  { n: 5, title: "Decide your next steps",        desc: "Expert guidance or clinic contact — only if you choose to." },
];

const TRUST = [
  { icon: Lock,        title: "Confidential information", desc: "Your data is yours. You decide what to share, and with whom.", featured: false },
  { icon: ShieldCheck, title: "Not a substitute for a doctor", desc: "It's orientation, not a diagnosis or a clinical recommendation.", featured: false },
  { icon: Lightbulb,   title: "Every result is explained", desc: "Every figure carries its source, its date and how confident we are — and tells you what it does not say.", featured: true },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
      {children}
    </span>
  );
}

function IconChip({ icon: Icon }: { icon: typeof Lock }) {
  return (
    <div className="size-10 rounded-full border border-accent/40 bg-background text-primary grid place-items-center">
      <Icon className="size-5" />
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen [&_h1]:text-balance [&_h2]:text-balance [&_h3]:text-balance">
      {/* HERO */}
      <section className="relative bg-background overflow-hidden border-b border-border before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-border before:via-accent before:to-border">
        <div className="container max-w-6xl px-6 pt-16 pb-14 md:pt-24 md:pb-20 text-center">
          <Eyebrow><Compass className="size-3" /> Explained, confidential orientation</Eyebrow>
          <h1 className="mt-8 mx-auto max-w-5xl font-display text-5xl md:text-7xl lg:text-8xl font-medium leading-[1.08] tracking-normal">
            From uncertainty to clarity
            <span className="block text-primary">
              on your fertility journey.
            </span>
          </h1>
          <p className="mt-8 font-editorial italic text-2xl md:text-3xl text-foreground max-w-2xl mx-auto leading-relaxed">
            Fertility Compass helps you understand your options, estimate realistic costs, and weigh
            the factors that may influence treatment success.
          </p>
          <p className="mt-5 text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Every number comes with its source, its date, and how sure we are — and what it doesn't
            tell you.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="gap-2 px-7 shadow-elegant">
              <Link to="/situacion">Start my assessment <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <Link to="#how-it-works">See how it works</Link>
            </Button>
          </div>
          <p className="mt-10 text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Orientation based on public data and on what you choose to share. It does not replace a medical consultation.
          </p>
          <p className="mt-2 text-xs">
            <Link to="/demo" className="text-muted-foreground/70 hover:text-primary underline underline-offset-4">
              Running a live demo? Load a sample patient →
            </Link>
          </p>
        </div>
      </section>

      {/* EMOTIONAL PROBLEM */}
      <section className="container max-w-4xl px-6 py-20 md:py-28 text-center">
        <Eyebrow>What many of us feel</Eyebrow>
        <h2 className="mt-6 font-display text-3xl md:text-5xl font-medium leading-tight tracking-normal mb-6">
          Looking for fertility information can feel confusing, lonely and exhausting.
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Forums, ads and clinic websites all say different things. It's hard to know what's
          relevant for your case, what questions to ask, and what to expect — emotionally and financially.
        </p>
      </section>

      {/* WHAT WE HELP YOU UNDERSTAND */}
      <section className="bg-muted/20 border-y border-border">
        <div className="container max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-12 md:mb-16">
            <Eyebrow>How we help</Eyebrow>
            <h2 className="mt-6 font-display text-3xl md:text-5xl font-medium leading-tight tracking-normal">
              We help you understand — we don't decide for you.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {HELP.map((h) => (
              <Card key={h.title} className="rounded-lg p-7 bg-card shadow-none">
                <IconChip icon={h.icon} />
                <h3 className="font-display text-2xl font-medium leading-snug mt-5 mb-3">{h.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{h.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="container max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-3xl mb-12 md:mb-16">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-6 font-display text-3xl md:text-5xl font-medium leading-tight tracking-normal">Five steps, at your own pace.</h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            No pressure and no forced paths. You can pause, come back, and complete it whenever you want.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
          {STEPS.map((s) => (
            <Card key={s.n} className="rounded-lg p-7 bg-card shadow-none relative">
              <div className="absolute -top-3 left-6 size-7 rounded-full bg-primary text-primary-foreground text-xs font-medium grid place-items-center">{s.n}</div>
              <h3 className="font-display text-xl font-medium leading-snug mb-3 mt-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* TRUST & SAFETY */}
      <section className="bg-muted/20 border-y border-border">
        <div className="container max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-12 md:mb-16">
            <Eyebrow>Trust and privacy</Eyebrow>
            <h2 className="mt-6 font-display text-3xl md:text-5xl font-medium leading-tight tracking-normal">
              Confidential, transparent and respectful.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-stretch">
            {TRUST.map((t) => (
              <Card
                key={t.title}
                className={
                  t.featured
                    ? "rounded-lg p-7 bg-primary-soft/40 border-accent/60 shadow-card"
                    : "rounded-lg p-7 bg-card shadow-none"
                }
              >
                <IconChip icon={t.icon} />
                <h3 className="font-display text-2xl font-medium leading-snug mt-5 mb-3">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                {t.featured && (
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Source · date · confidence
                  </p>
                )}
              </Card>
            ))}
          </div>
          <Card className="rounded-none p-0 pt-8 mt-10 bg-transparent border-0 border-t border-border shadow-none">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground font-semibold">Important notice:</strong> Fertility Compass
              provides orientation based on public data, statistical models and information you
              choose to share. It does not replace a medical consultation, diagnosis or treatment
              recommendation.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-primary text-primary-foreground before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-primary before:via-accent before:to-primary">
        <div className="container max-w-4xl px-6 py-20 md:py-28 text-center space-y-7">
          <Heart className="size-8 mx-auto opacity-90" />
          <h2 className="font-display text-4xl md:text-5xl font-medium leading-tight tracking-normal">
            Take the first step toward your clarity.
          </h2>
          <p className="opacity-90 max-w-2xl mx-auto leading-relaxed">
            Information, tools and guidance to make fertility decisions with more confidence,
            transparency and confidentiality — every figure explained.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <Button asChild size="lg" variant="secondary" className="gap-2 px-7 shadow-elegant">
              <Link to="/situacion">Start my assessment <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/costes"><Sparkles className="size-4" /> Explore costs</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
