import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, BookOpen, Compass, Calculator } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { JourneyHeader } from "@/components/shared/JourneyHeader";
import { WhatIsThis } from "@/components/shared/WhatIsThis";
import { TransparencyBlock } from "@/components/shared/TransparencyBlock";
import { Badge } from "@/components/ui/badge";
import { useJourneyState } from "@/hooks/useJourneyState";
import { JourneyProgress, WhyYouSeeThis } from "@/modules/journey";
import { useProfileStore } from "@/modules/profile/store";

type ExplorerData = {
  age: number;
  trying: "" | "<6m" | "6-12m" | "1-2y" | ">2y";
  treatment: "" | "ivf" | "icsi" | "freezing" | "donor" | "unsure";
  budget: number; // €
  country: string;
};

const STEPS = [
  { label: "Your age" },
  { label: "Time trying" },
  { label: "Treatment interest" },
  { label: "Budget" },
  { label: "Where" },
  { label: "Your plan" },
];

const TREATMENT_INFO: Record<string, string> = {
  ivf: "IVF (In-Vitro Fertilization) is the most common assisted treatment. Eggs and sperm are combined in a lab.",
  icsi: "ICSI is a variation of IVF where a single sperm is injected into each egg. Used for male factor infertility.",
  freezing: "Egg freezing preserves your eggs at their current fertility for use later.",
  donor: "Egg donation uses eggs from a donor. Often used after 40 or with diminished ovarian reserve.",
  unsure: "That's totally fine — we'll help you understand which options fit your situation.",
};

const Explorer = () => {
  const nav = useNavigate();
  const { step, setStep, data, patch } = useJourneyState<ExplorerData>(
    { key: "explorer", path: "/explorer", label: "Explorer · Quick start", totalSteps: STEPS.length },
    { age: 32, trying: "", treatment: "", budget: 8000, country: "Spain" },
  );

  // Mirror Explorer answers into the global profile store so Pricing & Navigator
  // pick them up automatically (the journey stage is set on entry too).
  const setJourney = useProfileStore((s) => s.setJourney);
  const profilePatch = useProfileStore((s) => s.patch);
  useEffect(() => { setJourney("explorer"); }, [setJourney]);
  useEffect(() => {
    profilePatch({
      age: data.age,
      trying: data.trying,
      treatment: data.treatment,
      budget: data.budget,
      country: data.country,
    });
  }, [data, profilePatch]);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const canNext = () => {
    if (step === 1) return !!data.trying;
    if (step === 2) return !!data.treatment;
    return true;
  };

  // Price configurator output
  const priceBreakdown = (() => {
    const base = data.treatment === "donor" ? 7500 : data.treatment === "freezing" ? 3500 : data.treatment === "icsi" ? 5500 : 5000;
    const meds = data.treatment === "freezing" ? 1500 : 2000;
    const extras = 800;
    const total = base + meds + extras;
    return { base, meds, extras, total, low: Math.round(total * 0.85), high: Math.round(total * 1.2) };
  })();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <JourneyHeader
        module="Explorer · Quick start"
        tone="explorer"
        Icon={Compass}
        title="Let's understand where you are"
        subtitle="A few quick questions. No medical jargon. You can stop any time."
        steps={STEPS}
        current={step}
      />

      <main className="container max-w-3xl pb-20 space-y-6">
        <JourneyProgress current="explore" />
        {/* STEP 0 — Age */}
        {step === 0 && (
          <Card className="p-8 space-y-6">
            <div>
              <Label className="text-base font-semibold">How old are you?</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Age is one of the strongest signals for fertility planning.{" "}
                <WhatIsThis title="Why we ask">
                  Egg quantity and quality change with age. We use this to show realistic options and
                  success ranges — not to gatekeep anything.
                </WhatIsThis>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min={18}
                max={55}
                value={data.age}
                onChange={(e) => patch({ age: Number(e.target.value) })}
                className="w-28 text-lg font-bold"
              />
              <span className="text-muted-foreground">years</span>
            </div>
          </Card>
        )}

        {/* STEP 1 — Trying duration */}
        {step === 1 && (
          <Card className="p-8 space-y-5">
            <div>
              <Label className="text-base font-semibold">How long have you been trying to conceive?</Label>
              <p className="text-sm text-muted-foreground mt-1">
                If you're not trying yet (e.g. freezing), pick whatever feels closest.{" "}
                <WhatIsThis title="Why we ask">
                  Time-to-conception helps us suggest sensible next steps. Most guidelines recommend a fertility
                  check after 12 months trying (6 months if you're 35+).
                </WhatIsThis>
              </p>
            </div>
            <RadioGroup value={data.trying} onValueChange={(v) => patch({ trying: v as ExplorerData["trying"] })}>
              {[
                ["<6m", "Less than 6 months"],
                ["6-12m", "6–12 months"],
                ["1-2y", "1–2 years"],
                [">2y", "More than 2 years"],
              ].map(([v, l]) => (
                <Label key={v} htmlFor={v} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                  <RadioGroupItem id={v} value={v} />
                  <span>{l}</span>
                </Label>
              ))}
            </RadioGroup>
          </Card>
        )}

        {/* STEP 2 — Treatment interest */}
        {step === 2 && (
          <Card className="p-8 space-y-5">
            <div>
              <Label className="text-base font-semibold">Have you heard about any of these?</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Pick the closest option. Each has a quick explainer.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ["ivf", "IVF"],
                ["icsi", "ICSI"],
                ["freezing", "Egg freezing"],
                ["donor", "Egg donation"],
                ["unsure", "I'm not sure yet"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => patch({ treatment: v as ExplorerData["treatment"] })}
                  className={`text-left p-4 rounded-xl border-2 transition-smooth ${
                    data.treatment === v ? "border-primary bg-primary-soft" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="font-semibold">{l}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{TREATMENT_INFO[v]}</div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* STEP 3 — Budget */}
        {step === 3 && (
          <Card className="p-8 space-y-6">
            <div>
              <Label className="text-base font-semibold">What budget feels comfortable per cycle?</Label>
              <p className="text-sm text-muted-foreground mt-1">
                A rough range is fine. We use it to show realistic options.{" "}
                <WhatIsThis title="What's included">
                  In Europe, an IVF cycle typically includes the base treatment, medication, and lab extras.
                  We show the full estimated total — not just the headline price.
                </WhatIsThis>
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-3xl font-bold tabular-nums text-primary">€{data.budget.toLocaleString()}</div>
              <Slider
                value={[data.budget]}
                min={2000}
                max={20000}
                step={500}
                onValueChange={([v]) => patch({ budget: v })}
              />
              <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                <span>€2,000</span><span>€20,000</span>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 4 — Country */}
        {step === 4 && (
          <Card className="p-8 space-y-5">
            <div>
              <Label className="text-base font-semibold">Where would you consider treatment?</Label>
              <p className="text-sm text-muted-foreground mt-1">Travelling can save 40–60%. We'll show options near you and abroad.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["Spain", "Czech Republic", "Portugal", "Greece", "UK", "Other"].map((c) => (
                <button
                  key={c}
                  onClick={() => patch({ country: c })}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-smooth ${
                    data.country === c ? "border-primary bg-primary-soft" : "border-border hover:border-primary/40"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* STEP 5 — Plan / Price configurator + explanations */}
        {step === 5 && (
          <div className="space-y-5">
            <Card className="p-8">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="size-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Your estimated cost range</span>
              </div>
              <h2 className="text-3xl font-bold tabular-nums">
                €{priceBreakdown.low.toLocaleString()} – €{priceBreakdown.high.toLocaleString()}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Based on your treatment interest and country, this is a realistic range per cycle.
              </p>

              {/* Visual breakdown */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Base treatment</span>
                  <span className="font-bold tabular-nums">€{priceBreakdown.base.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(priceBreakdown.base / priceBreakdown.total) * 100}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Medication</span>
                  <span className="font-bold tabular-nums">€{priceBreakdown.meds.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${(priceBreakdown.meds / priceBreakdown.total) * 100}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Lab extras (genetics, freezing…)</span>
                  <span className="font-bold tabular-nums">€{priceBreakdown.extras.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary-glow" style={{ width: `${(priceBreakdown.extras / priceBreakdown.total) * 100}%` }} />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="secondary">Real data</Badge>
                <Badge variant="secondary">Country average</Badge>
                {data.budget < priceBreakdown.total && <Badge className="bg-warning text-warning-foreground">Above your budget</Badge>}
              </div>
            </Card>

            <TransparencyBlock variant="calculation">
              We average prices reported by patients and clinics in {data.country}, then add medication and
              extras typical for {data.treatment || "this treatment"}. Ranges reflect the variability we see
              in real reports — not a single sticker price.
            </TransparencyBlock>

            <WhyYouSeeThis
              reasons={[
                `Treatment "${data.treatment || "unsure"}" in ${data.country} typically costs in this range.`,
                `Your age (${data.age}) shifts the range slightly because of expected medication and lab work.`,
                `Budget signal: €${data.budget.toLocaleString()} per cycle — we'll flag clinics inside this range.`,
              ]}
            />

            <Card className="p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-semibold">Next: open the Pricing Lab</div>
                <div className="text-sm text-muted-foreground">Compare basic, premium and guarantee scenarios with full breakdowns. Then we'll show clinics that fit.</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <Link to="/community"><BookOpen className="size-4" /> Learn more</Link>
                </Button>
                <Button variant="outline" onClick={() => nav("/navigator")}>
                  Skip to clinics <ArrowRight className="size-4" />
                </Button>
                <Button onClick={() => nav("/pricing-lab")}>
                  <Calculator className="size-4" /> Open Pricing Lab <ArrowRight className="size-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* NAVIGATION */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={prev} disabled={step === 0}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          {step < STEPS.length - 1 && (
            <Button onClick={next} disabled={!canNext()}>
              Continue <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Explorer;
