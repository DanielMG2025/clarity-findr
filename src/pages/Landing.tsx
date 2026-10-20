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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PillTeaser } from "@/modules/content/PillTeaser";


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
    <div className="grid size-10 shrink-0 place-items-center rounded-full border border-accent/60 bg-card text-primary">
      <Icon className="size-5" />
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen [&_h1]:text-balance [&_h2]:text-balance [&_h3]:text-balance">
      {/* HERO — magazine cover */}
      <section className="relative overflow-hidden border-b border-border text-background dark:[--foreground:var(--sidebar-background)] dark:[--background:var(--sidebar-accent-foreground)] dark:[--primary:var(--sidebar-accent)] before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent before:to-transparent after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-px after:bg-gradient-to-r after:from-transparent after:via-accent after:to-transparent">
        {/* Cover gradient: burgundy bleeding into near-black ink */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-5%,hsl(var(--primary))_0%,hsl(var(--foreground))_55%,hsl(var(--foreground))_100%)]"
        />
        {/* Decorative fine-line compass bloom */}
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
            <path d="M100 4 L96 15 L104 15 Z" fill="hsl(var(--accent))" stroke="none" />
            <path d="M100 4 L96 15 L104 15 Z" fill="hsl(var(--accent))" stroke="none" transform="rotate(90 100 100)" />
            <path d="M100 4 L96 15 L104 15 Z" fill="hsl(var(--accent))" stroke="none" transform="rotate(180 100 100)" />
            <path d="M100 4 L96 15 L104 15 Z" fill="hsl(var(--accent))" stroke="none" transform="rotate(270 100 100)" />
            <ellipse cx="100" cy="100" rx="9" ry="66" transform="rotate(0 100 100)" />
            <ellipse cx="100" cy="100" rx="9" ry="66" transform="rotate(30 100 100)" />
            <ellipse cx="100" cy="100" rx="9" ry="66" transform="rotate(60 100 100)" />
            <ellipse cx="100" cy="100" rx="9" ry="66" transform="rotate(90 100 100)" />
            <ellipse cx="100" cy="100" rx="9" ry="66" transform="rotate(120 100 100)" />
            <ellipse cx="100" cy="100" rx="9" ry="66" transform="rotate(150 100 100)" />
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
              Explained orientation
            </span>
          </div>

          <div className="pt-14 pb-16 md:pt-20 md:pb-24">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              <Compass className="size-3" /> Explained, confidential orientation
            </span>
            <h1 className="mt-8 mx-auto max-w-5xl font-display text-[clamp(2.75rem,9vw,6rem)] font-medium leading-[1.05] tracking-normal">
              From uncertainty to clarity
              <span className="block text-accent italic">
                on your fertility journey.
              </span>
            </h1>
            <p className="mt-8 font-editorial italic text-2xl md:text-3xl text-background/90 max-w-[40ch] mx-auto leading-relaxed">
              Fertility Compass helps you understand your options, estimate realistic costs, and weigh
              the factors that may influence treatment success.
            </p>
            <p className="mt-5 text-sm md:text-base text-background/70 max-w-xl mx-auto leading-relaxed">
              Every number comes with its source, its date, and how sure we are — and what it doesn't
              tell you.
            </p>
            <div className="mt-8 space-y-6">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-background/60">
                  For patients
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Button asChild size="lg" className="gap-2 rounded-full bg-accent px-7 text-accent-foreground shadow-elegant hover:bg-accent/90">
                    <Link to="/situacion">Start my assessment <ArrowRight className="size-4" /></Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost" className="gap-2 rounded-full border border-background/25 text-background/80 hover:bg-background/10 hover:text-background">
                    <Link to="#how-it-works">See how it works</Link>
                  </Button>
                </div>
              </div>

              <div aria-hidden className="flex items-center gap-4 text-background/50">
                <span className="h-px flex-1 bg-background/15" />
                <span className="text-[11px] font-medium uppercase tracking-[0.18em]">or</span>
                <span className="h-px flex-1 bg-background/15" />
              </div>

              <div className="mx-auto w-full max-w-xl rounded-2xl border border-accent/50 bg-accent/10 p-6 text-left shadow-elegant">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <Badge variant="outline" className="border-accent/60 bg-accent/15 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                      Demo
                    </Badge>
                    <h2 className="font-display text-xl font-medium leading-snug text-background md:text-2xl">
                      Just exploring the product?
                    </h2>
                    <p className="max-w-[46ch] text-sm leading-relaxed text-background/80">
                      Enter demo mode and we'll load a sample patient so you can walk through the
                      entire journey — no data needed.
                    </p>
                  </div>
                  <Button asChild className="mt-1 shrink-0 gap-2 rounded-full border border-accent/70 bg-transparent px-5 text-accent hover:bg-accent/15 hover:text-accent">
                    <Link to="/demo">Enter demo mode <ArrowRight className="size-4" /></Link>
                  </Button>
                </div>
              </div>
            </div>
            <PillTeaser />
            <p className="mt-10 text-xs text-background/70 max-w-xl mx-auto leading-relaxed">
              Orientation based on public data and on what you choose to share. It does not replace a medical consultation.
            </p>
          </div>
        </div>
      </section>

      {/* EMOTIONAL PROBLEM */}
      <section className="container max-w-4xl px-6 py-20 md:py-28 text-center">
        <Eyebrow>What many of us feel</Eyebrow>
        <h2 className="mt-6 font-display text-3xl md:text-5xl font-medium leading-tight tracking-normal mb-6">
          Looking for fertility information can feel confusing, lonely and exhausting.
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-[65ch] mx-auto">
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
              <Card key={h.title} className="min-w-0 rounded-lg border border-border/70 bg-card/60 p-7 shadow-none">
                <IconChip icon={h.icon} />
                <h3 className="font-display text-2xl font-medium leading-snug mt-5 mb-3">{h.title}</h3>
                <p className="max-w-[65ch] text-sm text-muted-foreground leading-relaxed">{h.desc}</p>
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
          <p className="max-w-[65ch] text-muted-foreground mt-3 leading-relaxed">
            No pressure and no forced paths. You can pause, come back, and complete it whenever you want.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {STEPS.map((s) => (
            <Card key={s.n} className="min-w-0 rounded-lg border border-border/70 bg-card/60 p-7 shadow-none">
              <div className="grid size-10 shrink-0 place-items-center rounded-full border border-accent/60 bg-card font-display text-2xl font-medium tabular-nums text-primary">{s.n}</div>
              <h3 className="font-display text-2xl font-medium leading-snug mt-5 mb-3">{s.title}</h3>
              <p className="max-w-[65ch] text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
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
                    ? "min-w-0 rounded-lg border border-accent/60 bg-card/60 p-7 shadow-none"
                    : "min-w-0 rounded-lg border border-border/70 bg-card/60 p-7 shadow-none"
                }
              >
                <IconChip icon={t.icon} />
                <h3 className="font-display text-2xl font-medium leading-snug mt-5 mb-3">{t.title}</h3>
                <p className="max-w-[65ch] text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                {t.featured && (
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Source · date · confidence
                  </p>
                )}
              </Card>
            ))}
          </div>
          <Card className="rounded-none p-0 pt-8 mt-10 bg-transparent border-0 border-t border-border shadow-none">
            <p className="max-w-[65ch] text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground font-semibold">Important notice:</strong> Fertility Compass
              provides orientation based on public data, statistical models and information you
              choose to share. It does not replace a medical consultation, diagnosis or treatment
              recommendation.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-foreground text-background dark:[--foreground:var(--sidebar-background)] dark:[--background:var(--sidebar-accent-foreground)] dark:[--primary:var(--sidebar-accent)] before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent before:to-transparent">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-5%,hsl(var(--primary))_0%,hsl(var(--foreground))_55%,hsl(var(--foreground))_100%)]" />
        <div className="relative container max-w-4xl px-6 py-20 md:py-28 text-center space-y-7">
          <Heart className="size-8 mx-auto text-accent" />
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight tracking-normal">
            Take the first step toward your clarity.
          </h2>
          <p className="text-background/90 max-w-[65ch] mx-auto leading-relaxed">
            Information, tools and guidance to make fertility decisions with more confidence,
            transparency and confidentiality — every figure explained.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <Button asChild size="lg" variant="secondary" className="gap-2 rounded-full bg-accent px-7 text-accent-foreground shadow-elegant hover:bg-accent/90">
              <Link to="/situacion">Start my assessment <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
