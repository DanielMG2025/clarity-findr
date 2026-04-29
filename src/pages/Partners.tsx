import { Link } from "react-router-dom";
import {
  Dna,
  TestTube,
  Building2,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  HandCoins,
  Sparkles,
  Zap,
  Database,
  ShieldCheck,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

type PartnerCategory = {
  icon: typeof Dna;
  category: string;
  examples: string;
  description: string;
  why_matters: string;
  when_to_use: string;
  impact: string[];
  cta_target: string;
  color: "primary" | "accent";
};

const PARTNERS: PartnerCategory[] = [
  {
    icon: Dna,
    category: "Genetic screening",
    examples: "Igenomix · Veritas · Eugin Lab",
    description:
      "Carrier screening + PGT-A panel ordered through partner labs. Results sync into your match profile.",
    why_matters:
      "1 in 4 couples carry a recessive condition without knowing. Genetic data changes which treatment and which clinic actually fits you.",
    when_to_use:
      "Before starting IVF or egg donation, or if you've had a previous failed cycle or miscarriage.",
    impact: [
      "Improves matching accuracy",
      "Avoids unnecessary treatments",
      "Surfaces clinics with the right lab capabilities",
    ],
    cta_target: "/patient/advanced",
    color: "primary",
  },
  {
    icon: TestTube,
    category: "Home fertility tests",
    examples: "AMH · FSH · full hormonal panel",
    description:
      "Lab-grade hormonal panel sent to your home. Results feed back into the decision engine within 7 days.",
    why_matters:
      "Without real hormone data we can only estimate your ovarian reserve. With it, your match score becomes ~30% more accurate.",
    when_to_use:
      "Anytime before clinic conversations — especially if you're 35+, or considering social freezing.",
    impact: [
      "Reduces uncertainty before clinic visits",
      "Sharper match scores for your top clinics",
      "Helps clinics quote a realistic treatment plan",
    ],
    cta_target: "/patient/advanced",
    color: "accent",
  },
  {
    icon: Building2,
    category: "Financing & insurance",
    examples: "0% cycle financing · partial reimbursement",
    description:
      "Partner financing for IVF cycles and medication, integrated at the unlock step — no out-of-pocket required to apply.",
    why_matters:
      "Cost is the #1 reason patients delay treatment. Spreading it makes the right clinic possible, not just the cheapest one.",
    when_to_use:
      "Once you've shortlisted clinics and need to compare real monthly cost rather than sticker price.",
    impact: [
      "Removes price as the deciding factor",
      "Unlocks higher-success clinics that were previously out of reach",
      "Lets you choose on quality, not on what you can pay this month",
    ],
    cta_target: "/patient/unlock",
    color: "primary",
  },
  {
    icon: Stethoscope,
    category: "Expert consultation",
    examples: "Independent fertility doctors · 30-min video",
    description:
      "Unbiased second opinion from a fertility specialist who doesn't work for any clinic in your shortlist.",
    why_matters:
      "Clinics each pitch their own protocol. An independent expert reads your data and tells you which path actually fits.",
    when_to_use:
      "When two or three clinics are giving you very different recommendations or quotes.",
    impact: [
      "Confirms or challenges the engine's top match",
      "Catches red flags before you commit",
      "Reduces decision regret",
    ],
    cta_target: "/patient/advanced",
    color: "accent",
  },
];

const Partners = () => (
  <div className="min-h-screen flex flex-col">
    <SiteHeader />
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-gradient-hero">
        <div className="container py-16 md:py-20 max-w-5xl">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full">
            Decision layer · Partner ecosystem
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-3 leading-[1.05]">
            Better data in →
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              better decisions out.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
            Partners are not a marketplace. Each one plugs into the matching engine and makes
            your personalized clinic ranking measurably more accurate.
          </p>

          {/* Data integration banner */}
          <div className="mt-8 rounded-2xl border-2 border-primary/30 bg-card/80 backdrop-blur p-5 flex flex-wrap items-center gap-4">
            <div className="size-10 rounded-xl bg-primary/10 grid place-items-center shrink-0">
              <Database className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-[260px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
                Data integration
              </div>
              <p className="text-sm text-foreground/90 leading-snug">
                Results from every partner feed directly into your personalized clinic matching —
                in real time, on the same scoring engine you already use.
              </p>
            </div>
            <Badge variant="secondary" className="rounded-full">
              <Zap className="size-3 mr-1" /> Live integration
            </Badge>
          </div>
        </div>
      </section>

      {/* Partner cards */}
      <section className="container py-16">
        <div className="max-w-3xl mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Four ways to upgrade your matching</h2>
          <p className="text-muted-foreground mt-2">
            Each partner adds a specific signal to the decision engine. Pick the ones that match
            where you are in your journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {PARTNERS.map((p) => {
            const accent = p.color === "primary";
            return (
              <Card
                key={p.category}
                className="p-7 shadow-card hover:shadow-elegant transition-smooth flex flex-col bg-gradient-card border-2"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-12 rounded-xl grid place-items-center shrink-0 ${
                        accent ? "bg-primary-soft" : "bg-accent-soft"
                      }`}
                    >
                      <p.icon
                        className={`size-6 ${accent ? "text-primary" : "text-accent"}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold truncate">{p.category}</h3>
                      <div className="text-xs text-muted-foreground truncate">
                        {p.examples}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider whitespace-nowrap shrink-0 ${
                      accent
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                    }`}
                  >
                    Covered by partner
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{p.description}</p>

                {/* Why it matters */}
                <div className="rounded-xl bg-muted/40 border border-border p-3 mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1 flex items-center gap-1">
                    <HeartPulse className="size-3" /> Why it matters
                  </div>
                  <p className="text-sm text-foreground/85 leading-snug">{p.why_matters}</p>
                </div>

                {/* When to use */}
                <div className="rounded-xl bg-muted/40 border border-border p-3 mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1 flex items-center gap-1">
                    <ShieldCheck className="size-3" /> When to use it
                  </div>
                  <p className="text-sm text-foreground/85 leading-snug">{p.when_to_use}</p>
                </div>

                {/* Impact on your journey */}
                <div
                  className={`rounded-xl p-4 mb-5 border-2 ${
                    accent
                      ? "border-primary/30 bg-primary-soft/60"
                      : "border-accent/30 bg-accent-soft/60"
                  }`}
                >
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${
                      accent ? "text-primary" : "text-accent"
                    }`}
                  >
                    <Zap className="size-3" /> Impact on your journey
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {p.impact.map((i) => (
                      <li key={i} className="flex gap-2">
                        <CheckCircle2
                          className={`size-3.5 mt-0.5 shrink-0 ${
                            accent ? "text-primary" : "text-accent"
                          }`}
                        />
                        <span className="text-foreground/85">{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto space-y-3">
                  <Button asChild variant="hero" className="w-full">
                    <Link to={p.cta_target}>
                      Use this to improve your results
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center leading-snug">
                    Partners subsidize this service and pay a referral fee — you pay nothing
                    extra.
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Story block — Why partners are part of the platform */}
      <section className="bg-muted/40 border-y">
        <div className="container py-16 max-w-5xl">
          <div className="flex items-start gap-4 mb-10">
            <div className="size-12 rounded-xl bg-primary-soft grid place-items-center shrink-0">
              <HandCoins className="size-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Why partners are part of the platform
              </h2>
              <p className="text-muted-foreground mt-2 max-w-3xl">
                A fertility decision is too important — and too expensive — to make on guesswork.
                Partners exist on this platform because they make that decision measurably better
                while removing cost from the patient.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <Card className="p-6">
              <HandCoins className="size-5 text-accent mb-3" />
              <div className="font-bold mb-1">Reduces patient cost</div>
              <p className="text-sm text-muted-foreground">
                Genetic panels, home tests and financing are paid for by partners, not by you.
                The platform stays free where it should be.
              </p>
            </Card>
            <Card className="p-6">
              <Database className="size-5 text-primary mb-3" />
              <div className="font-bold mb-1">Improves decision quality</div>
              <p className="text-sm text-muted-foreground">
                Each partner adds a real data signal — hormone levels, genetic carrier status,
                independent expert opinion — that sharpens your match.
              </p>
            </Card>
            <Card className="p-6">
              <HeartPulse className="size-5 text-accent mb-3" />
              <div className="font-bold mb-1">Enables better outcomes</div>
              <p className="text-sm text-muted-foreground">
                Patients who use 2+ partner inputs pick clinics with measurably higher reported
                success rates and fewer additional cycles.
              </p>
            </Card>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="hero">
              <Link to="/patient/advanced">
                See partner-funded modules <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/pricing-dashboard">Admin · revenue model</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="container py-16 max-w-3xl text-center">
        <Sparkles className="size-8 text-primary mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold">
          A decision engine funded by who benefits.
        </h2>
        <p className="text-muted-foreground mt-3">
          You pay only for what's purely for you (€5–€19 unlocks, advanced questionnaires).
          Everything that also benefits a clinic or a partner — they pay for. Always disclosed,
          never hidden.
        </p>
      </section>
    </main>
    <SiteFooter />
  </div>
);

export default Partners;
