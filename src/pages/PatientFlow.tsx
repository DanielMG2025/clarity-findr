import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Lock,
  Gift,
  Brain,
  Crown,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

type StepStatus = "free" | "decision" | "paid" | "modular" | "premium";

const STATUS_META: Record<
  StepStatus,
  { label: string; ring: string; pillBg: string; pillText: string }
> = {
  free: {
    label: "Free",
    ring: "border-accent/40 bg-accent-soft/40",
    pillBg: "bg-accent/15",
    pillText: "text-accent",
  },
  decision: {
    label: "Your choice",
    ring: "border-primary/40 bg-primary-soft",
    pillBg: "bg-primary/15",
    pillText: "text-primary",
  },
  paid: {
    label: "€15–€30",
    ring: "border-primary/30 bg-card",
    pillBg: "bg-primary/10",
    pillText: "text-primary",
  },
  modular: {
    label: "From €0",
    ring: "border-accent/30 bg-card",
    pillBg: "bg-accent/15",
    pillText: "text-accent",
  },
  premium: {
    label: "Premium",
    ring: "border-foreground/20 bg-foreground/[0.03]",
    pillBg: "bg-foreground/10",
    pillText: "text-foreground",
  },
};

const STEPS: {
  n: string;
  title: string;
  text: string;
  icon: typeof Search;
  status: StepStatus;
  cta?: { to: string; label: string };
}[] = [
  {
    n: "1",
    title: "Free discovery",
    text: "Basic questionnaire. Anonymized clinic shortlist with limited scoring — no payment, no email.",
    icon: Search,
    status: "free",
    cta: { to: "/assessment", label: "Start free questionnaire" },
  },
  {
    n: "2",
    title: "Intent decision",
    text: "Two paths: pay €5–€10 to peek at clinic names, or request a free referral and let clinics come to you.",
    icon: Gift,
    status: "decision",
    cta: { to: "/patient/unlock", label: "Choose your path" },
  },
  {
    n: "3",
    title: "Full access",
    text: "Clinic names, real pricing ranges, basic ranking and side-by-side comparison.",
    icon: Lock,
    status: "paid",
  },
  {
    n: "4",
    title: "Advanced matching",
    text: "Deeper questionnaire (€30–€50). Genetic matching and home test kit are free when ordered through a partner.",
    icon: Brain,
    status: "modular",
    cta: { to: "/patient/advanced", label: "See advanced modules" },
  },
  {
    n: "5",
    title: "Premium referral",
    text: "Let clinics review your case. Prioritized handling, faster replies, better fit — clinics pay, you don't.",
    icon: Crown,
    status: "premium",
    cta: { to: "/patient/referral", label: "Request premium referral" },
  },
];

const PatientFlow = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-gradient-hero">
        <div className="container max-w-5xl py-12 md:py-16">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full">
            Patient journey · intent-based
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-3 leading-tight">
            You only pay when
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              you decide to go further.
            </span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Monetization tracks intent, not features. Discover for free. Unlock when you're serious.
            Get clinics chasing you when you're ready to move.
          </p>

          {/* Steps */}
          <div className="mt-10 space-y-4">
            {STEPS.map((s) => {
              const meta = STATUS_META[s.status];
              return (
                <Card
                  key={s.n}
                  className={`p-5 md:p-6 border-2 ${meta.ring} shadow-card`}
                >
                  <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
                    <div className="size-12 rounded-xl bg-background border-2 border-border grid place-items-center shrink-0">
                      <s.icon className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Step {s.n}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${meta.pillBg} ${meta.pillText} border-current/20`}
                        >
                          {meta.label}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-lg mt-1">{s.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{s.text}</p>
                    </div>
                    {s.cta && (
                      <Button asChild variant="outline" className="shrink-0">
                        <Link to={s.cta.to}>
                          {s.cta.label} <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Hero CTA */}
          <Card className="mt-12 p-8 shadow-elegant bg-gradient-card border-2 border-primary/30">
            <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
              <div className="size-12 rounded-xl bg-primary-soft grid place-items-center shrink-0">
                <Sparkles className="size-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  Start here · always free
                </div>
                <h2 className="text-2xl font-bold mb-2">Your free discovery starts now</h2>
                <p className="text-muted-foreground mb-5">
                  2 minutes. No payment, no email. You'll see how the engine ranks clinics for someone
                  with your profile — anonymized and limited, but real.
                </p>
                <ul className="space-y-2 text-sm mb-6">
                  {[
                    "Age, diagnosis, treatment of interest",
                    "Budget range and country preference",
                    "Anonymized list of best-matching clinics",
                  ].map((b) => (
                    <li key={b} className="flex gap-2">
                      <CheckCircle2 className="size-4 text-accent shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="hero" size="lg">
                    <Link to="/assessment">
                      Start free discovery <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/results">I've done it — see results</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Storytelling */}
          <Card className="mt-10 p-6 bg-card border-2 border-dashed">
            <div className="flex items-start gap-3">
              <Users className="size-5 text-accent mt-1 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  This is a decision platform, not a marketplace.{" "}
                </span>
                We monetize when you signal intent — not when you click. Free discovery for everyone,
                paid depth when you're ready, premium referral when you want clinics to come to you.
                Partners subsidize advanced modules so the most accurate matching stays accessible.
              </div>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default PatientFlow;
