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
import { Badge } from "@/components/ui/badge";

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
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary">
      {children}
    </span>
  );
}

function IconChip({ icon: Icon }: { icon: typeof Lock }) {
  return (
    <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
      <Icon className="size-5" />
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative bg-gradient-hero overflow-hidden">
        <div className="container max-w-4xl py-24 md:py-32 text-center">
          <Eyebrow><Compass className="size-3" /> Explained, confidential orientation</Eyebrow>
          <h1 className="mt-7 text-4xl md:text-6xl font-semibold leading-[1.1] tracking-tight">
            From uncertainty to clarity
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              on your fertility journey.
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Fertility Compass helps you understand your options, estimate realistic costs, and weigh
            the factors that may influence treatment success.
          </p>
          <p className="mt-4 text-base text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Every number comes with its source, its date, and how sure we are — and what it doesn't
            tell you.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="gap-2 px-7 shadow-md">
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
      <section className="container max-w-3xl py-16 md:py-20 text-center">
        <Eyebrow>What many of us feel</Eyebrow>
        <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight mb-4">
          Looking for fertility information can feel confusing, lonely and exhausting.
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Forums, ads and clinic websites all say different things. It's hard to know what's
          relevant for your case, what questions to ask, and what to expect — emotionally and financially.
        </p>
      </section>

      {/* WHAT WE HELP YOU UNDERSTAND */}
      <section className="bg-muted/40 border-y">
        <div className="container max-w-6xl py-16 md:py-20">
          <div className="max-w-2xl mb-10">
            <Eyebrow>How we help</Eyebrow>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
              We help you understand — we don't decide for you.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {HELP.map((h) => (
              <Card key={h.title} className="rounded-2xl p-6">
                <IconChip icon={h.icon} />
                <h3 className="font-semibold mt-4 mb-1">{h.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{h.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="container max-w-6xl py-16 md:py-20">
        <div className="max-w-2xl mb-10">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">Five steps, at your own pace.</h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            No pressure and no forced paths. You can pause, come back, and complete it whenever you want.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">
          {STEPS.map((s) => (
            <Card key={s.n} className="rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-6 size-7 rounded-full bg-primary text-primary-foreground text-xs font-medium grid place-items-center">{s.n}</div>
              <h3 className="font-semibold mb-1 mt-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* TRUST & SAFETY */}
      <section className="bg-muted/40 border-y">
        <div className="container max-w-6xl py-16 md:py-20">
          <div className="max-w-2xl mb-10">
            <Eyebrow>Trust and privacy</Eyebrow>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
              Confidential, transparent and respectful.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {TRUST.map((t) => (
              <Card
                key={t.title}
                className={
                  t.featured
                    ? "rounded-2xl p-6 bg-primary-soft/50 ring-1 ring-primary/25 shadow-sm"
                    : "rounded-2xl p-6"
                }
              >
                <IconChip icon={t.icon} />
                <h3 className="font-semibold mt-4 mb-1">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                {t.featured && (
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-primary">
                    Source · date · confidence
                  </p>
                )}
              </Card>
            ))}
          </div>
          <Card className="rounded-2xl p-5 mt-6 bg-background/60 border-dashed">
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
      <section className="bg-gradient-primary text-primary-foreground">
        <div className="container max-w-3xl py-20 text-center space-y-5">
          <Heart className="size-8 mx-auto opacity-90" />
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Take the first step toward your clarity.
          </h2>
          <p className="opacity-90 max-w-2xl mx-auto leading-relaxed">
            Information, tools and guidance to make fertility decisions with more confidence,
            transparency and confidentiality — every figure explained.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <Button asChild size="lg" variant="secondary" className="gap-2 px-7 shadow-md">
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
