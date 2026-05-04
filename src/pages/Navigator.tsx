import { useState } from "react";
import { useJourneyState } from "@/hooks/useJourneyState";
import { Link } from "react-router-dom";
import { ArrowRight, Calculator, Sparkles, Upload, Beaker, Dna, Search } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { JourneyHeader } from "@/components/shared/JourneyHeader";
import { WhatIsThis } from "@/components/shared/WhatIsThis";
import { TransparencyBlock } from "@/components/shared/TransparencyBlock";
import { ClinicCardV2 } from "@/components/shared/ClinicCardV2";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STEPS = [
  { label: "Your profile" },
  { label: "Optional data" },
  { label: "Compare" },
  { label: "Plan & financing" },
];

const MOCK_CLINICS = [
  {
    id: "c1",
    name: "IVI Barcelona",
    city: "Barcelona",
    country: "Spain",
    estimatedPrice: 7800,
    priceLow: 6800,
    priceHigh: 9200,
    matchScore: 92,
    successRate: 58,
    distance: 320,
    highlights: ["Strong IVF success", "English speaking", "Genetic testing on-site"],
    reason: "Top success-rate match for your age, with prices within 8% of your budget and great clinical fit for your profile.",
    badge: "best-match" as const,
  },
  {
    id: "c2",
    name: "Reprofit Brno",
    city: "Brno",
    country: "Czech Republic",
    estimatedPrice: 5400,
    priceLow: 4900,
    priceHigh: 6100,
    matchScore: 87,
    successRate: 54,
    distance: 1450,
    highlights: ["Excellent value", "Donor program", "Multilingual staff"],
    reason: "Best value in your shortlist — 31% below your country average for the same treatment quality.",
    badge: "best-value" as const,
  },
  {
    id: "c3",
    name: "Eugin Madrid",
    city: "Madrid",
    country: "Spain",
    estimatedPrice: 8200,
    priceLow: 7400,
    priceHigh: 9800,
    matchScore: 84,
    successRate: 56,
    distance: 90,
    highlights: ["Closest to you", "Modern lab", "Donor bank"],
    reason: "Closest match geographically, solid clinical history and balanced pricing.",
    badge: "closest" as const,
  },
];

const Navigator = () => {
  const { step, setStep, data, patch } = useJourneyState(
    { key: "navigator", path: "/navigator", label: "Navigator · Smart match", totalSteps: STEPS.length },
    { age: 34, budget: 8000, months: 24 },
  );
  const { age, budget, months } = data;
  const setAge = (v: number) => patch({ age: v });
  const setBudget = (v: number) => patch({ budget: v });
  const setMonths = (v: number) => patch({ months: v });

  const treatmentTotal = 7800;
  const monthlyPayment = Math.round((treatmentTotal * 1.08) / months);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <JourneyHeader
        module="Navigator · Precision matching"
        tone="navigator"
        Icon={Search}
        title="Precision matching for your case"
        subtitle="You've already done research. We'll go deeper — and explain every recommendation."
        steps={STEPS}
        current={step}
      />

      <main className="container max-w-5xl pb-20 space-y-6">
        {step === 0 && (
          <Card className="p-8 space-y-6">
            <div>
              <h2 className="font-semibold text-lg">Tell us a bit more about you</h2>
              <p className="text-sm text-muted-foreground">All optional. The more we know, the better the match.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <Label>Age</Label>
                <Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} />
              </div>
              <div>
                <Label>Budget per cycle (€)</Label>
                <Input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
              </div>
              <div>
                <Label className="inline-flex items-center gap-2">
                  AMH (ng/mL)
                  <WhatIsThis title="What is AMH?">
                    AMH (anti-Müllerian hormone) reflects ovarian reserve. Typical values: 1.0–3.5 ng/mL. Optional but improves matching.
                  </WhatIsThis>
                </Label>
                <Input type="number" placeholder="e.g. 2.1" />
              </div>
              <div>
                <Label className="inline-flex items-center gap-2">
                  Diagnosis
                  <WhatIsThis title="Why we ask">Specific diagnoses (e.g. PCOS, endometriosis) shift which clinics perform best for you.</WhatIsThis>
                </Label>
                <Input placeholder="e.g. PCOS, endometriosis" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(1)}>Continue <ArrowRight className="size-4" /></Button>
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card className="p-8 space-y-6">
            <div>
              <h2 className="font-semibold text-lg">Optional: upload medical info</h2>
              <p className="text-sm text-muted-foreground">
                Hormone results, prior treatment history, etc. Increases matching precision.{" "}
                <WhatIsThis title="What we do with this">
                  Files are processed only to refine your matching. Stored encrypted, never shared with clinics
                  unless you explicitly request an appointment.
                </WhatIsThis>
              </p>
            </div>
            <label className="border-2 border-dashed border-border rounded-xl p-10 text-center block cursor-pointer hover:border-primary transition-smooth">
              <Upload className="size-8 text-muted-foreground mx-auto mb-2" />
              <div className="font-semibold">Drop a file or click to upload</div>
              <div className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG · max 10MB · optional</div>
              <input type="file" className="hidden" />
            </label>
            <TransparencyBlock variant="data">
              You can skip this and still get a great match. We never share medical info with clinics until
              you explicitly request an appointment.
            </TransparencyBlock>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={() => setStep(2)}>Continue <ArrowRight className="size-4" /></Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Your matched clinics</h2>
              <Badge variant="secondary">3 of 142 clinics</Badge>
            </div>

            {/* Comparison table */}
            <Card className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clinic</TableHead>
                    <TableHead className="text-right">Match</TableHead>
                    <TableHead className="text-right">Est. price</TableHead>
                    <TableHead className="text-right">Success</TableHead>
                    <TableHead className="text-right">Distance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_CLINICS.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.city}, {c.country}</div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary tabular-nums">{c.matchScore}</TableCell>
                      <TableCell className="text-right tabular-nums">€{c.estimatedPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums">{c.successRate}%</TableCell>
                      <TableCell className="text-right tabular-nums">{c.distance} km</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* AI explanation */}
            <TransparencyBlock variant="method" title="Why these clinics, in this order">
              We weighted clinical fit (50%), value-for-money (30%) and distance (20%) for your profile (age {age}, budget €{budget.toLocaleString()}).
              IVI Barcelona leads on clinical fit. Reprofit wins on value. Eugin wins on proximity. You decide what matters most.
            </TransparencyBlock>

            {/* Cards */}
            <div className="grid lg:grid-cols-2 gap-5">
              {MOCK_CLINICS.map((c) => <ClinicCardV2 key={c.id} clinic={c} />)}
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Plan & financing <ArrowRight className="size-4" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <Card className="p-8 space-y-5">
              <div className="flex items-center gap-2">
                <Calculator className="size-5 text-primary" />
                <h2 className="text-lg font-semibold">Financing simulator</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Estimate monthly payments for a treatment around €{treatmentTotal.toLocaleString()}.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Term: {months} months</Label>
                  <Slider value={[months]} min={6} max={48} step={6} onValueChange={([v]) => setMonths(v)} className="mt-3" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1 tabular-nums">
                    <span>6 mo</span><span>48 mo</span>
                  </div>
                </div>
                <div className="rounded-xl bg-primary-soft p-5">
                  <div className="text-xs text-muted-foreground">Estimated monthly payment</div>
                  <div className="text-3xl font-bold text-primary tabular-nums">€{monthlyPayment}</div>
                  <div className="text-xs text-muted-foreground mt-1 tabular-nums">≈ 8% APR · indicative only</div>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-5">
              <Card className="p-6">
                <Beaker className="size-8 text-accent mb-3" />
                <h3 className="font-bold">Add a home fertility kit</h3>
                <p className="text-sm text-muted-foreground mt-1">Hormone panel at home. Sharper matching.</p>
                <Button variant="outline" className="mt-3" asChild><Link to="/partners">Explore partners</Link></Button>
              </Card>
              <Card className="p-6">
                <Dna className="size-8 text-primary mb-3" />
                <h3 className="font-bold">Add genetic testing</h3>
                <p className="text-sm text-muted-foreground mt-1">Carrier screening to inform treatment choice.</p>
                <Button variant="outline" className="mt-3" asChild><Link to="/partners">Explore partners</Link></Button>
              </Card>
            </div>

            <TransparencyBlock variant="calculation">
              Financing rates are indicative. Actual offers depend on the lender and your profile. We don't earn
              commissions when you change the term — it just helps you plan.
            </TransparencyBlock>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>Back to clinics</Button>
              <Button asChild><Link to="/community"><Sparkles className="size-4" /> See people like you</Link></Button>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default Navigator;
