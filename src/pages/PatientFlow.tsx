import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Sparkles, Lock, Gift, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const Step = ({
  n,
  title,
  text,
  status,
}: {
  n: string;
  title: string;
  text: string;
  status: "active" | "next" | "future";
}) => (
  <div
    className={`flex gap-4 p-4 rounded-xl border-2 ${
      status === "active"
        ? "border-primary/40 bg-primary-soft"
        : status === "next"
          ? "border-accent/30 bg-accent-soft/40"
          : "border-border bg-muted/30"
    }`}
  >
    <div
      className={`size-10 shrink-0 rounded-xl grid place-items-center font-bold ${
        status === "active"
          ? "bg-primary text-primary-foreground"
          : status === "next"
            ? "bg-accent text-accent-foreground"
            : "bg-muted text-muted-foreground"
      }`}
    >
      {n}
    </div>
    <div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-muted-foreground">{text}</div>
    </div>
  </div>
);

const PatientFlow = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-gradient-hero">
        <div className="container max-w-4xl py-12 md:py-16">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full">
            Patient journey
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-3 leading-tight">
            Your fertility decision —
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              5 simple steps.
            </span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Start free. Unlock more depth as you go. You stay in control of how much you share.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mt-10">
            <Step
              n="1"
              title="Free qualification"
              text="2-min questionnaire — age, budget, location → anonymized clinic shortlist."
              status="active"
            />
            <Step
              n="2"
              title="Unlock options"
              text="Pay €19 to reveal clinic names, or get a free intro via our referral team."
              status="next"
            />
            <Step
              n="3"
              title="Advanced services"
              text="Optional: deeper questionnaire, genetic matching, home fertility kit."
              status="future"
            />
            <Step
              n="4"
              title="Decision dashboard"
              text="Ranked clinics with explainability and confidence levels."
              status="future"
            />
            <Step
              n="5"
              title="Referral"
              text="If you want, we connect you to your top match — at no cost."
              status="future"
            />
          </div>

          <Card className="mt-10 p-8 shadow-elegant bg-gradient-card border-2 border-primary/30">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-primary-soft grid place-items-center shrink-0">
                <Sparkles className="size-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  Step 1 · Free
                </div>
                <h2 className="text-2xl font-bold mb-2">Start your free qualification</h2>
                <p className="text-muted-foreground mb-5">
                  Tell us about your situation. We'll generate an anonymized clinic shortlist
                  ranked by price fit, treatment match and geography. No payment, no email required.
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
                      Start free questionnaire <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/results">I've done it — see results</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-12 grid md:grid-cols-3 gap-4">
            <Card className="p-5 shadow-card">
              <Lock className="size-5 text-primary mb-2" />
              <div className="font-semibold text-sm">Step 2 — €19 unlock</div>
              <div className="text-xs text-muted-foreground mt-1">
                Reveal clinic names, pricing breakdowns and detailed ranges.
              </div>
            </Card>
            <Card className="p-5 shadow-card">
              <Gift className="size-5 text-accent mb-2" />
              <div className="font-semibold text-sm">Step 2 — Free referral</div>
              <div className="text-xs text-muted-foreground mt-1">
                We hand-introduce you to top-matched clinics, at no cost to you.
              </div>
            </Card>
            <Card className="p-5 shadow-card">
              <BarChart3 className="size-5 text-primary mb-2" />
              <div className="font-semibold text-sm">Step 3+ — Advanced</div>
              <div className="text-xs text-muted-foreground mt-1">
                Add deeper matching, genetic screening and at-home fertility tests.
              </div>
            </Card>
          </div>

          <div className="mt-12 rounded-2xl bg-card border-2 border-dashed border-border p-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground mb-1">
              <Users className="size-4 text-accent" /> Why we ask first, sell second
            </div>
            This platform combines data, personalization, and real-world pricing. Step 1 is free
            because matching only works when we understand who you are.
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default PatientFlow;
