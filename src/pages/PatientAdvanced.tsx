import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Dna, TestTube, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { storage, type AdvancedModules } from "@/lib/fertility";
import { toast } from "@/hooks/use-toast";

type ModuleKey = keyof AdvancedModules;

const MODULES: {
  key: ModuleKey;
  icon: typeof Brain;
  title: string;
  price: string;
  priceNote: string;
  text: string;
  bullets: string[];
  color: "primary" | "accent";
}[] = [
  {
    key: "advanced_questionnaire",
    icon: Brain,
    title: "Advanced questionnaire",
    price: "€30",
    priceNote: "standalone",
    text: "Deep clinical profiling — diagnosis history, hormonal markers, prior protocols, lifestyle factors.",
    bullets: [
      "30+ targeted clinical questions",
      "Refines clinic match score by ~22%",
      "Highlights protocol-specific best fits",
    ],
    color: "primary",
  },
  {
    key: "genetic_matching",
    icon: Dna,
    title: "Genetic matching",
    price: "Free",
    priceNote: "with partner test",
    text: "Match clinics by their experience with your genetic profile. Free if you order genetic screening through a partner lab.",
    bullets: [
      "Carrier screening integration",
      "PGT-A clinic specialization match",
      "Free if ordered through partner",
    ],
    color: "accent",
  },
  {
    key: "home_kit",
    icon: TestTube,
    title: "Home fertility kit",
    price: "Free",
    priceNote: "with partner kit",
    text: "AMH, FSH, and ovarian reserve testing from home. Results feed directly into the matching engine.",
    bullets: [
      "Lab-grade hormonal panel",
      "Results integrated into your match",
      "Free with partner kit purchase",
    ],
    color: "accent",
  },
];

const PatientAdvanced = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<AdvancedModules>(() => storage.loadAdvanced());
  const [processing, setProcessing] = useState(false);

  const toggle = (k: ModuleKey) => setSelected((s) => ({ ...s, [k]: !s[k] }));
  const anySelected = Object.values(selected).some(Boolean);

  const total = selected.advanced_questionnaire ? 30 : 0;

  const handleActivate = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 800));
    storage.saveAdvanced(selected);
    toast({
      title: "Advanced modules activated",
      description: total > 0 ? `€${total} simulated charge applied.` : "Free modules added to your profile.",
    });
    navigate("/results?advanced=1");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-gradient-hero">
        <div className="container max-w-5xl py-12 md:py-16">
          <Link to="/results" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to results
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full">
            Step 3 · Advanced
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-3 leading-tight">
            Go deeper with
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              precision matching modules.
            </span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Modular by design. Pick what's relevant — pay nothing for the rest.
          </p>

          <div className="grid md:grid-cols-3 gap-5 mt-10">
            {MODULES.map((m) => {
              const isOn = selected[m.key];
              return (
                <Card
                  key={m.key}
                  className={`p-6 transition-smooth cursor-pointer border-2 ${
                    isOn
                      ? m.color === "primary"
                        ? "border-primary shadow-elegant ring-2 ring-primary/20"
                        : "border-accent shadow-elegant ring-2 ring-accent/20"
                      : "border-border hover:border-primary/40"
                  }`}
                  onClick={() => toggle(m.key)}
                >
                  <div
                    className={`size-12 rounded-xl grid place-items-center mb-4 ${
                      m.color === "primary" ? "bg-primary-soft" : "bg-accent-soft"
                    }`}
                  >
                    <m.icon className={`size-6 ${m.color === "primary" ? "text-primary" : "text-accent"}`} />
                  </div>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="text-lg font-bold">{m.title}</h3>
                    {isOn && <CheckCircle2 className="size-5 text-accent" />}
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-extrabold">{m.price}</span>
                    <span className="text-xs text-muted-foreground">{m.priceNote}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{m.text}</p>
                  <ul className="space-y-1.5 text-xs">
                    {m.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="text-accent">●</span>
                        <span className="text-foreground/80">{b}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>

          <Card className="mt-10 p-6 md:p-8 shadow-elegant bg-gradient-card border-2 border-primary/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total today
                </div>
                <div className="text-3xl font-extrabold tabular-nums">
                  €{total}
                  {total === 0 && anySelected && (
                    <span className="text-sm text-muted-foreground font-normal ml-2">
                      free with partner products
                    </span>
                  )}
                </div>
              </div>
              <Button
                size="lg"
                variant="hero"
                disabled={!anySelected || processing}
                onClick={handleActivate}
              >
                {processing ? "Activating…" : (
                  <>Activate selected modules <ArrowRight className="size-4" /></>
                )}
              </Button>
            </div>
          </Card>

          <Card className="mt-8 p-6 bg-card border-2 border-dashed">
            <div className="flex items-start gap-3">
              <Sparkles className="size-5 text-primary mt-1 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">More data → more accurate matching. </span>
                Activated modules feed into the scoring engine in real time. Confidence level on each clinic
                will jump from medium to high once we ingest the new signals.
              </div>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default PatientAdvanced;
