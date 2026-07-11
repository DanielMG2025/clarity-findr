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
      "Some people carry a recessive condition without knowing it. Genetic information can help you and your doctor understand which options may suit your situation.",
    when_to_use:
      "Often considered before starting IVF or egg donation, or after a previous cycle that didn't work.",
    impact: [
      "Helps ground the orientation in real data",
      "Informs conversations about which treatments to consider",
      "Highlights clinics with the relevant lab capabilities",
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
      "Without hormone data, any read on ovarian reserve is only an estimate. Real results give you and your clinic something more concrete to talk about.",
    when_to_use:
      "Anytime before clinic conversations — some people consider it when thinking about social freezing.",
    impact: [
      "Reduces uncertainty before clinic visits",
      "A more grounded picture before clinic conversations",
      "Helps clinics discuss a realistic treatment plan",
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
      "Cost weighs heavily on fertility decisions. Spreading it over time can leave room to choose a clinic that fits you, not only the least expensive one.",
    when_to_use:
      "Once you've shortlisted clinics and want to compare monthly cost rather than the sticker price.",
    impact: [
      "Lets cost weigh less heavily in your choice",
      "Helps keep more clinics within reach",
      "Supports choosing on fit, not only this month's budget",
    ],
    cta_target: "/patient/unlock",
    color: "primary",
  },
  {
    icon: Stethoscope,
    category: "Expert consultation",
    examples: "Independent fertility doctors · 30-min video",
    description:
      "An independent second opinion from a fertility specialist with no ties to the clinics on your list.",
    why_matters:
      "Each clinic tends to favour its own protocol. An independent professional can look at your situation and help you weigh the options calmly.",
    when_to_use:
      "Helpful when two or three clinics are suggesting very different paths or quotes.",
    impact: [
      "Offers a second perspective on your options",
      "Helps you ask the right questions before deciding",
      "Can bring more confidence to your decision",
    ],
    cta_target: "/patient/advanced",
    color: "accent",
  },
];

const Partners = () => (
  <div className="min-h-screen flex flex-col">

    <main className="flex-1">
      {/* Hero */}
      <section className="bg-gradient-hero">
        <div className="container py-16 md:py-20 max-w-5xl">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full">
            Expert guidance · Complementary services
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-3 leading-[1.05]">
            When you need
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              a second opinion.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
            Independent professionals and services that can give you clarity — from hormonal tests
            to financial advice. You decide when and how to use them.
          </p>

          {/* Trust banner */}
          <div className="mt-8 rounded-2xl border-2 border-primary/30 bg-card/80 backdrop-blur p-5 flex flex-wrap items-center gap-4">
            <div className="size-10 rounded-xl bg-primary/10 grid place-items-center shrink-0">
              <Database className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-[260px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
                Orientation, never prescription
              </div>
              <p className="text-sm text-foreground/90 leading-snug">
                These services complement your own research and your medical conversations. They
                don't replace a clinical consultation.
              </p>
            </div>
            <Badge variant="secondary" className="rounded-full">
              <Zap className="size-3 mr-1" /> Confidential
            </Badge>
          </div>
        </div>
      </section>

      {/* Partner cards */}
      <section className="container py-16">
        <div className="max-w-3xl mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Four ways to gain clarity</h2>
          <p className="text-muted-foreground mt-2">
            Each partner adds a concrete piece: medical data, expert opinion, or financial help.
            Pick the ones that fit where you are on your journey.
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
                    Partner-funded
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
                      Learn more about this option
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center leading-snug">
                    Funded by our partners — no extra cost to you, and always disclosed.
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
                A fertility decision deserves good information. These partners are here because
                they can add something concrete — data, an expert view, or a little financial
                breathing room — while keeping the cost off you.
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
              <div className="font-bold mb-1">Adds real information</div>
              <p className="text-sm text-muted-foreground">
                Each partner can add something concrete — hormone levels, genetic carrier status,
                an independent expert opinion — that helps ground your decision.
              </p>
            </Card>
            <Card className="p-6">
              <HeartPulse className="size-5 text-accent mb-3" />
              <div className="font-bold mb-1">Supports a calmer decision</div>
              <p className="text-sm text-muted-foreground">
                Having more of the picture — hormones, genetics, an independent view — can make
                the next steps feel clearer and less overwhelming.
              </p>
            </Card>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="hero">
              <Link to="/partners">
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
          Funded by those who benefit — not by you alone.
        </h2>
        <p className="text-muted-foreground mt-3">
          You only pay for what's purely for you. Anything that also benefits a clinic or a
          partner is funded by them — always disclosed, never hidden.
        </p>
      </section>
    </main>

  </div>
);

export default Partners;
