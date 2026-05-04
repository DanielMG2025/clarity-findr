import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Calculator,
  Building2,
  User,
  Search,
  EyeOff,
  HeartHandshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TransparencyBlock } from "@/components/shared/TransparencyBlock";

const STEPS = [
  { n: 1, title: "Build your profile",   desc: "Add only what you want. Each block unlocks more accuracy.",            icon: User },
  { n: 2, title: "See your real cost",   desc: "Transparent ranges with what's included — and what isn't.",           icon: Calculator },
  { n: 3, title: "Compare clinics",      desc: "Side-by-side, normalized prices and clinical fit, ranked for you.",   icon: Building2 },
  { n: 4, title: "Decide with clarity",  desc: "Save, share, or contact clinics on your terms — never pushed.",       icon: HeartHandshake },
];

const PROBLEMS = [
  { icon: EyeOff,   title: "Opaque pricing",     desc: "Headline prices hide medication, lab work and add-ons that often double the bill." },
  { icon: Search,   title: "Endless research",   desc: "Forums, ads and clinic websites contradict each other. There is no neutral ground." },
  { icon: ShieldCheck, title: "No clear path",   desc: "Every clinic pushes its own protocol. You're left to compare apples and oranges alone." },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative bg-gradient-hero overflow-hidden">
        <div className="container max-w-5xl py-20 md:py-28 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full">
            <Sparkles className="size-3" /> Fertility, finally clear
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
            Understand your fertility care.
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Then decide with confidence.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One profile. Transparent prices. Clinics that actually fit your case — explained
            in plain language, with no pressure to convert.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="gap-2">
              <Link to="/profile">Build my profile <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="/pricing-lab"><Calculator className="size-4" /> Try the configurator</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="container max-w-6xl py-16 md:py-20">
        <div className="max-w-2xl mb-10">
          <Badge variant="secondary" className="mb-3">The problem</Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Fertility care is too important to be this confusing.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {PROBLEMS.map((p) => (
            <Card key={p.title} className="p-6">
              <p.icon className="size-7 text-muted-foreground mb-3" />
              <h3 className="font-bold mb-1">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* SOLUTION */}
      <section className="bg-muted/40 border-y">
        <div className="container max-w-6xl py-16 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <Badge variant="secondary" className="mb-3">The solution</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              A single profile that powers everything.
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Instead of forcing you down a funnel, we give you a personal profile that grows over
              time. The more you share, the more accurate your pricing, your clinic shortlist and
              your recommendations get — at your own pace.
            </p>
            <ul className="space-y-3 text-sm">
              {[
                "No medical jargon — every term has a plain-language explainer.",
                "Real prices from real patients, normalized across countries.",
                "Clinic ranking with a transparent 'why you see this' reason.",
                "Your data stays yours. Nothing is shared without your say-so.",
              ].map((t) => (
                <li key={t} className="flex gap-2"><span className="text-primary">•</span><span>{t}</span></li>
              ))}
            </ul>
          </div>
          <Card className="p-6 bg-gradient-card border-2 shadow-elegant">
            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Patient profile</div>
            <div className="text-2xl font-bold mb-4">Your fertility, in one place</div>
            <div className="space-y-2 text-sm">
              {[
                ["Basic info",        "Required · Unlocks pricing"],
                ["Medical context",   "Optional · Sharper estimates"],
                ["Treatment history", "Optional · Avoid repeating mistakes"],
                ["Preferences",       "Optional · Personalised ranking"],
                ["Documents & quotes","Optional · Crowd-validated prices"],
              ].map(([t, d]) => (
                <div key={t} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="font-medium">{t}</span>
                  <span className="text-xs text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
            <Button asChild className="w-full mt-5">
              <Link to="/profile">Start my profile <ArrowRight className="size-4 ml-1" /></Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container max-w-6xl py-16 md:py-20">
        <div className="max-w-2xl mb-10">
          <Badge variant="secondary" className="mb-3">How it works</Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Four steps. Zero pressure.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s) => (
            <Card key={s.n} className="p-6 relative">
              <div className="absolute -top-3 left-6 size-7 rounded-full bg-primary text-primary-foreground text-xs font-bold grid place-items-center">{s.n}</div>
              <s.icon className="size-7 text-primary mt-2 mb-3" />
              <h3 className="font-bold mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* TRANSPARENCY */}
      <section className="container max-w-5xl pb-16">
        <TransparencyBlock variant="method" title="How we stay neutral">
          We combine real clinic prices with anonymous patient reports. Our matching engine always
          explains its reasoning. We don't sell your data, and clinics only hear from you when you
          choose to reach out.
        </TransparencyBlock>
      </section>

      {/* CTA */}
      <section className="bg-gradient-primary text-primary-foreground">
        <div className="container max-w-4xl py-16 text-center space-y-5">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to see what your fertility journey could really look like?
          </h2>
          <p className="opacity-90 max-w-2xl mx-auto">
            Build your profile in under 2 minutes. No account required to get started.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link to="/profile">Build my profile <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/pricing-lab">Try the configurator</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
