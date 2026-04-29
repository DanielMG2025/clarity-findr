import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain,
  Dna,
  TestTube,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { storage, type AdvancedModules } from "@/lib/fertility";
import { toast } from "@/hooks/use-toast";

type ModuleKey = keyof AdvancedModules;

// Advanced questionnaire price range €30–€50 — we display midpoint
const ADVANCED_QUESTIONNAIRE_PRICE = 39;

const MODULES: {
  key: ModuleKey;
  icon: typeof Brain;
  title: string;
  basePrice: number; // 0 means partner-subsidized
  priceLabel: string;
  priceRange?: string;
  text: string;
  bullets: string[];
  partnerSubsidized: boolean;
  color: "primary" | "accent";
}[] = [
  {
    key: "advanced_questionnaire",
    icon: Brain,
    title: "Advanced questionnaire",
    basePrice: ADVANCED_QUESTIONNAIRE_PRICE,
    priceLabel: `€${ADVANCED_QUESTIONNAIRE_PRICE}`,
    priceRange: "range €30–€50",
    text: "Deep clinical profiling — diagnosis history, hormonal markers, prior protocols, lifestyle factors.",
    bullets: [
      "30+ targeted clinical questions",
      "Refines clinic match score by ~22%",
      "Highlights protocol-specific best fits",
    ],
    partnerSubsidized: false,
    color: "primary",
  },
  {
    key: "genetic_matching",
    icon: Dna,
    title: "Genetic matching",
    basePrice: 0,
    priceLabel: "Covered by partner",
    text: "Match clinics by their experience with your genetic profile. Free when you order genetic screening through a partner lab.",
    bullets: [
      "Carrier screening integration",
      "PGT-A clinic specialization match",
      "Free with partner lab order",
    ],
    partnerSubsidized: true,
    color: "accent",
  },
  {
    key: "home_kit",
    icon: TestTube,
    title: "Home fertility kit",
    basePrice: 0,
    priceLabel: "Covered by partner",
    text: "AMH, FSH and ovarian reserve testing from home. Results feed directly into the matching engine.",
    bullets: [
      "Lab-grade hormonal panel",
      "Results integrated into your match",
      "Free with partner kit purchase",
    ],
    partnerSubsidized: true,
    color: "accent",
  },
];

const PatientAdvanced = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<AdvancedModules>(() => storage.loadAdvanced());
  const [processing, setProcessing] = useState(false);

  const toggle = (k: ModuleKey) => setSelected((s) => ({ ...s, [k]: !s[k] }));
  const anySelected = Object.values(selected).some(Boolean);

  // Partner subsidy logic: if any partner module is on, advanced questionnaire becomes free.
  const hasPartner = selected.genetic_matching || selected.home_kit;
  const advancedFreeFromPartner = selected.advanced_questionnaire && hasPartner;

  const total = useMemo(() => {
    let t = 0;
    if (selected.advanced_questionnaire && !advancedFreeFromPartner) {
      t += ADVANCED_QUESTIONNAIRE_PRICE;
    }
    return t;
  }, [selected, advancedFreeFromPartner]);

  const handleActivate = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 800));
    storage.saveAdvanced(selected);
    toast({
      title: "Advanced modules activated",
      description:
        total > 0
          ? `€${total} simulated charge applied.`
          : advancedFreeFromPartner
            ? "Partner subsidy applied — advanced questionnaire is free."
            : "Free modules added to your profile.",
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
            Step 4 · Advanced matching
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-3 leading-tight">
            More signal,
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              better-fit clinics.
            </span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Modular by design. Pay only when partners don't cover it — and they often do.
          </p>

          {/* Partner subsidy banner */}
          <Card className="mt-6 p-4 bg-accent-soft/40 border-2 border-accent/30">
            <div className="flex items-start gap-3 text-sm">
              <Gift className="size-5 text-accent mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-foreground">Partner subsidy: </span>
                <span className="text-muted-foreground">
                  Order a genetic screening or home fertility kit through a partner and your{" "}
                  <span className="font-semibold text-foreground">advanced questionnaire becomes free</span>.
                  Partners pay us a referral fee — you pay nothing extra.
                </span>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-5 mt-8">
            {MODULES.map((m) => {
              const isOn = selected[m.key];
              const isAdvancedAndFree = m.key === "advanced_questionnaire" && advancedFreeFromPartner;
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
                  <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1 mb-3">
                    {isAdvancedAndFree ? (
                      <>
                        <span className="text-2xl font-extrabold text-accent">Free</span>
                        <Badge variant="outline" className="text-[10px] bg-accent/15 text-accent border-accent/30">
                          Partner subsidized
                        </Badge>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-extrabold">{m.priceLabel}</span>
                        {m.priceRange && (
                          <span className="text-xs text-muted-foreground">{m.priceRange}</span>
                        )}
                        {m.partnerSubsidized && (
                          <Badge variant="outline" className="text-[10px] bg-accent/15 text-accent border-accent/30">
                            Partner pays
                          </Badge>
                        )}
                      </>
                    )}
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
                      {advancedFreeFromPartner ? "advanced free via partner" : "free with partner products"}
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
                Activated modules feed into the scoring engine in real time. Confidence on each clinic
                jumps from medium to high once we ingest the new signals — and partners subsidize the
                cost so accurate decisions don't depend on your wallet.
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
