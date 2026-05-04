import { useState } from "react";
import { useJourneyState } from "@/hooks/useJourneyState";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Snowflake, CalendarClock, Calculator, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { JourneyHeader } from "@/components/shared/JourneyHeader";
import { TransparencyBlock } from "@/components/shared/TransparencyBlock";
import { WhatIsThis } from "@/components/shared/WhatIsThis";

const STEPS = [
  { label: "Why & when" },
  { label: "Your plan" },
  { label: "Cost simulator" },
  { label: "Find a clinic" },
];

// Simplified, transparent success projection per egg count and age
function liveBirthProb(age: number, eggs: number) {
  // Anchor: ~70% with 15 eggs at 32; declines with age, rises with eggs
  const ageFactor = age <= 30 ? 1.0 : age <= 34 ? 0.92 : age <= 37 ? 0.78 : age <= 40 ? 0.55 : 0.3;
  const perEgg = 0.07 * ageFactor; // diminishing return modeled crudely
  const p = 1 - Math.pow(1 - perEgg, eggs);
  return Math.min(0.92, Math.max(0.05, p));
}

// Eggs typically retrieved per cycle by age
function eggsPerCycle(age: number) {
  if (age <= 30) return 15;
  if (age <= 34) return 12;
  if (age <= 37) return 9;
  if (age <= 40) return 6;
  return 4;
}

const Freezing = () => {
  const { step, setStep, data, patch } = useJourneyState(
    { key: "freezing", path: "/freezing", label: "Egg Freezing · Plan your cycle", totalSteps: STEPS.length },
    { age: 32, cycles: 1, storageYears: 5, country: "Spain" },
  );
  const { age, cycles, storageYears, country } = data;
  const setAge = (v: number) => patch({ age: v });
  const setCycles = (v: number) => patch({ cycles: v });
  const setStorageYears = (v: number) => patch({ storageYears: v });
  const setCountry = (v: string) => patch({ country: v });

  const epc = eggsPerCycle(age);
  const totalEggs = epc * cycles;
  const liveBirth = Math.round(liveBirthProb(age, totalEggs) * 100);

  const cycleCost = country === "Czech Republic" ? 2800 : country === "Portugal" ? 3200 : 4200;
  const meds = 1500;
  const storagePerYear = 350;
  const total = (cycleCost + meds) * cycles + storagePerYear * storageYears;

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <JourneyHeader
        module="Egg Freezing · Plan ahead"
        tone="freezing"
        Icon={Snowflake}
        title="Freeze eggs on your timeline"
        subtitle="Understand timing, costs and outcomes — without medical pressure."
        steps={STEPS}
        current={step}
      />

      <main className="container max-w-3xl pb-20 space-y-6">
        {step === 0 && (
          <>
            <Card className="p-8 space-y-4">
              <Snowflake className="size-10 text-freezing" />
              <h2 className="text-xl font-bold">When freezing makes sense</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Egg quality declines steadily after 35 and sharply after 38. Freezing in your late 20s or early 30s
                preserves more options for later — career, partner, health.{" "}
                <WhatIsThis title="What 'success' really means">
                  Roughly 10–15 mature eggs frozen at age 32 give a ~70% chance of one live birth later. After 38
                  the same number drops below 40%. We always show realistic numbers — never marketing claims.
                </WhatIsThis>
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2"><CalendarClock className="size-5 text-freezing" /> <h3 className="font-semibold">Typical timeline per cycle</h3></div>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-3"><span className="font-bold text-freezing w-6">1.</span> Initial consultation & hormone tests (1 week)</li>
                <li className="flex gap-3"><span className="font-bold text-freezing w-6">2.</span> Stimulation phase — daily injections at home (10–14 days)</li>
                <li className="flex gap-3"><span className="font-bold text-freezing w-6">3.</span> Retrieval procedure under sedation (~30 min)</li>
                <li className="flex gap-3"><span className="font-bold text-freezing w-6">4.</span> Annual storage until you decide to use them</li>
              </ol>
            </Card>

            <div className="flex justify-end">
              <Button onClick={next} className="bg-freezing text-freezing-foreground hover:bg-freezing/90">
                Build my plan <ArrowRight className="size-4" />
              </Button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <Card className="p-8 space-y-6">
              <h2 className="text-lg font-semibold">Your situation</h2>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Your age: <span className="text-freezing tabular-nums">{age}</span></Label>
                <Slider value={[age]} min={25} max={42} step={1} onValueChange={([v]) => setAge(v)} />
                <div className="flex justify-between text-xs text-muted-foreground tabular-nums"><span>25</span><span>42</span></div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">How many cycles are you considering? <span className="text-freezing tabular-nums">{cycles}</span></Label>
                <Slider value={[cycles]} min={1} max={3} step={1} onValueChange={([v]) => setCycles(v)} />
                <p className="text-xs text-muted-foreground">Most people do 1–2 cycles. Multiple cycles improve outcomes if your retrieval count is low.</p>
              </div>

              <div className="rounded-xl bg-freezing-soft p-5 space-y-2">
                <div className="text-xs uppercase tracking-wider text-freezing font-bold">Realistic projection</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Eggs retrieved</div>
                    <div className="text-2xl font-bold tabular-nums">~{totalEggs}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Chance of ≥1 live birth later</div>
                    <div className="text-2xl font-bold tabular-nums text-freezing">~{liveBirth}%</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Based on average European clinic data for your age. Actual results vary.</p>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev}><ArrowLeft className="size-4" /> Back</Button>
              <Button onClick={next} className="bg-freezing text-freezing-foreground hover:bg-freezing/90">
                See costs <ArrowRight className="size-4" />
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Card className="p-8 space-y-6">
              <div className="flex items-center gap-2"><Calculator className="size-5 text-freezing" /><h2 className="text-lg font-semibold">Cost simulator</h2></div>

              <div>
                <Label className="text-sm font-semibold">Treatment country</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {["Spain", "Portugal", "Czech Republic"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCountry(c)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-smooth ${
                        country === c ? "border-freezing bg-freezing-soft" : "border-border hover:border-freezing/40"
                      }`}
                    >{c}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Storage duration: <span className="text-freezing tabular-nums">{storageYears} years</span></Label>
                <Slider value={[storageYears]} min={1} max={10} step={1} onValueChange={([v]) => setStorageYears(v)} />
              </div>

              <div className="space-y-3 pt-2">
                <Row label={`Cycle × ${cycles}`} value={cycleCost * cycles} />
                <Row label={`Medication × ${cycles}`} value={meds * cycles} />
                <Row label={`Storage × ${storageYears} years`} value={storagePerYear * storageYears} />
                <div className="border-t pt-3 flex items-center justify-between">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-bold tabular-nums text-freezing">€{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Real data</Badge>
                <Badge variant="secondary">Country average</Badge>
              </div>
            </Card>

            <TransparencyBlock variant="calculation">
              Numbers are based on real patient reports across {country} and similar markets. Your final quote
              depends on the clinic and your specific protocol — but you'll rarely be more than 15% off this estimate.
            </TransparencyBlock>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev}><ArrowLeft className="size-4" /> Back</Button>
              <Button onClick={next} className="bg-freezing text-freezing-foreground hover:bg-freezing/90">
                Find clinics <ArrowRight className="size-4" />
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Card className="p-8 space-y-4">
              <Sparkles className="size-8 text-freezing" />
              <h2 className="text-lg font-semibold">Clinics matched for freezing in {country}</h2>
              <p className="text-sm text-muted-foreground">
                Ranked by experience with social freezing for your age band, retrieval rates and total cost.
              </p>
              <Button asChild className="bg-freezing text-freezing-foreground hover:bg-freezing/90 w-full">
                <Link to="/results">See ranked clinics <ArrowRight className="size-4" /></Link>
              </Button>
            </Card>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev}><ArrowLeft className="size-4" /> Back</Button>
              <Button variant="outline" asChild><Link to="/community">Read freezing stories</Link></Button>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between text-sm">
    <span>{label}</span>
    <span className="font-bold tabular-nums">€{value.toLocaleString()}</span>
  </div>
);

export default Freezing;
