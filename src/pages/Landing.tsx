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
  { icon: Lock,        title: "Confidential information", desc: "Your data is yours. You decide what to share, and with whom." },
  { icon: ShieldCheck, title: "Not a substitute for a doctor", desc: "It's orientation, not a diagnosis or a clinical recommendation." },
  { icon: Lightbulb,   title: "Every result is explained", desc: "You'll always see why you see what you see, and what data influences it." },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative bg-gradient-hero overflow-hidden">
        <div className="container max-w-5xl py-20 md:py-28 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full">
            <Compass className="size-3" /> From uncertainty to clarity
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
            From uncertainty to clarity
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              on your fertility journey.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fertility Compass helps you understand your options, estimate realistic costs, weigh the
            factors that may influence treatment success, and find expert support or clinics that
            fit your needs.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="gap-2">
              <Link to="/situacion">Start my assessment <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="#how-it-works">See how it works</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground pt-2 max-w-xl mx-auto">
            Orientation based on public data and on what you choose to share. It does not replace a medical consultation.
          </p>
        </div>
      </section>

      {/* EMOTIONAL PROBLEM */}
      <section className="container max-w-4xl py-16 md:py-20 text-center">
        <Badge variant="secondary" className="mb-3">What many of us feel</Badge>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
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
            <Badge variant="secondary" className="mb-3">How we help</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              We help you understand — we don't decide for you.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {HELP.map((h) => (
              <Card key={h.title} className="p-6">
                <h.icon className="size-7 text-primary mb-3" />
                <h3 className="font-bold mb-1">{h.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{h.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="container max-w-6xl py-16 md:py-20">
        <div className="max-w-2xl mb-10">
          <Badge variant="secondary" className="mb-3">How it works</Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Five steps, at your own pace.</h2>
          <p className="text-muted-foreground mt-3">
            No pressure and no forced paths. You can pause, come back, and complete it whenever you want.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">
          {STEPS.map((s) => (
            <Card key={s.n} className="p-6 relative">
              <div className="absolute -top-3 left-6 size-7 rounded-full bg-primary text-primary-foreground text-xs font-bold grid place-items-center">{s.n}</div>
              <h3 className="font-bold mb-1 mt-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* TRUST & SAFETY */}
      <section className="bg-muted/40 border-y">
        <div className="container max-w-6xl py-16 md:py-20">
          <div className="max-w-2xl mb-10">
            <Badge variant="secondary" className="mb-3">Trust and privacy</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Confidential, transparent and respectful.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TRUST.map((t) => (
              <Card key={t.title} className="p-6">
                <t.icon className="size-7 text-primary mb-3" />
                <h3 className="font-bold mb-1">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
              </Card>
            ))}
          </div>
          <Card className="p-5 mt-6 bg-background/60 border-dashed">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Important notice:</strong> Fertility Compass
              provides orientation based on public data, statistical models and information you
              choose to share. It does not replace a medical consultation, diagnosis or treatment
              recommendation.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-primary text-primary-foreground">
        <div className="container max-w-4xl py-16 text-center space-y-5">
          <Heart className="size-8 mx-auto opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Take the first step toward your clarity.
          </h2>
          <p className="opacity-90 max-w-2xl mx-auto">
            Information, tools and guidance to make fertility decisions with more confidence,
            transparency and confidentiality.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild size="lg" variant="secondary" className="gap-2">
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
