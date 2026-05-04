import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, HeartHandshake, ShieldCheck, CheckCircle2, AlertTriangle, Calendar, Euro } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { JourneyHeader } from "@/components/shared/JourneyHeader";
import { TransparencyBlock } from "@/components/shared/TransparencyBlock";
import { WhatIsThis } from "@/components/shared/WhatIsThis";
import { toast } from "sonner";

const STEPS = [
  { label: "Understand" },
  { label: "Eligibility" },
  { label: "Compensation" },
  { label: "Connect" },
];

const ELIGIBILITY = [
  { id: "age", label: "I'm between 18 and 35 years old" },
  { id: "health", label: "I'm in good general health" },
  { id: "smoke", label: "I don't smoke" },
  { id: "bmi", label: "My BMI is roughly between 18 and 28" },
  { id: "history", label: "No serious genetic conditions in my family" },
];

const COUNTRY_COMP = [
  { country: "Spain", min: 1000, max: 1200, note: "Most regulated EU market" },
  { country: "Czech Republic", min: 800, max: 1000, note: "Established donor program" },
  { country: "Portugal", min: 900, max: 1100, note: "Growing donor network" },
  { country: "UK", min: 750, max: 1000, note: "GBP-equivalent" },
];

const Donor = () => {
  const [step, setStep] = useState(0);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [country, setCountry] = useState("Spain");
  const [contact, setContact] = useState({ name: "", email: "", city: "" });

  const eligibleCount = Object.values(checks).filter(Boolean).length;
  const eligible = eligibleCount === ELIGIBILITY.length;
  const compensation = COUNTRY_COMP.find((c) => c.country === country)!;

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <JourneyHeader
        module="Donor · Become an egg donor"
        tone="donor"
        Icon={HeartHandshake}
        title="Help others build their family"
        subtitle="Learn what donation means, check your eligibility, and connect with verified clinics — anonymously."
        steps={STEPS}
        current={step}
      />

      <main className="container max-w-3xl pb-20 space-y-6">
        {step === 0 && (
          <>
            <Card className="p-8 space-y-4">
              <HeartHandshake className="size-10 text-donor" />
              <h2 className="text-xl font-bold">What egg donation involves</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You'll undergo a medical screening, hormonal stimulation (10–14 days) and a short retrieval procedure
                under sedation (~30 minutes). The whole process from first appointment to retrieval typically takes
                4–6 weeks.{" "}
                <WhatIsThis title="Is it safe?">
                  Egg donation is a well-established medical procedure with low risk. Most donors return to normal
                  activity within 1–2 days. Clinics monitor you closely throughout stimulation.
                </WhatIsThis>
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="font-semibold flex items-center gap-2"><Calendar className="size-4 text-donor" /> Typical timeline</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-3"><span className="font-bold text-donor w-6">1.</span> Medical & psychological screening (1–2 weeks)</li>
                <li className="flex gap-3"><span className="font-bold text-donor w-6">2.</span> Hormone stimulation injections at home (10–14 days)</li>
                <li className="flex gap-3"><span className="font-bold text-donor w-6">3.</span> Egg retrieval — short outpatient procedure</li>
                <li className="flex gap-3"><span className="font-bold text-donor w-6">4.</span> Recovery: 1–2 days rest</li>
              </ol>
            </Card>

            <TransparencyBlock variant="data">
              EU law requires donation to be voluntary and altruistic. Compensation covers your time, travel and
              inconvenience — not the eggs themselves. All clinics on our platform are licensed and regularly audited.
            </TransparencyBlock>

            <div className="flex justify-end">
              <Button onClick={next} className="bg-donor text-donor-foreground hover:bg-donor/90">
                Check my eligibility <ArrowRight className="size-4" />
              </Button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <Card className="p-8 space-y-5">
              <h2 className="text-lg font-semibold">Quick eligibility check</h2>
              <p className="text-sm text-muted-foreground">Tick what applies. This is a self-check — clinics run their own screening.</p>
              <div className="space-y-3">
                {ELIGIBILITY.map((c) => (
                  <label key={c.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                    <Checkbox
                      checked={!!checks[c.id]}
                      onCheckedChange={(v) => setChecks({ ...checks, [c.id]: !!v })}
                    />
                    <span className="text-sm">{c.label}</span>
                  </label>
                ))}
              </div>
              <div className={`rounded-lg p-4 text-sm ${eligible ? "bg-donor-soft text-donor" : eligibleCount >= 3 ? "bg-warning/10 text-warning-foreground" : "bg-muted"}`}>
                {eligible ? (
                  <span className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-4" /> Great — you likely qualify. Clinics will confirm with their own screening.</span>
                ) : (
                  <span className="flex items-center gap-2"><AlertTriangle className="size-4" /> {eligibleCount}/{ELIGIBILITY.length} criteria met. You can still apply — clinics may still be interested.</span>
                )}
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev}><ArrowLeft className="size-4" /> Back</Button>
              <Button onClick={next} className="bg-donor text-donor-foreground hover:bg-donor/90">
                See compensation <ArrowRight className="size-4" />
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Card className="p-8 space-y-5">
              <div className="flex items-center gap-2">
                <Euro className="size-5 text-donor" />
                <h2 className="text-lg font-semibold">Compensation by country</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Compensation covers time, travel and inconvenience. Pick where you'd consider donating.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {COUNTRY_COMP.map((c) => (
                  <button
                    key={c.country}
                    onClick={() => setCountry(c.country)}
                    className={`text-left p-4 rounded-xl border-2 transition-smooth ${
                      country === c.country ? "border-donor bg-donor-soft" : "border-border hover:border-donor/40"
                    }`}
                  >
                    <div className="font-semibold">{c.country}</div>
                    <div className="text-lg font-bold tabular-nums text-donor mt-1">€{c.min}–{c.max}</div>
                    <div className="text-xs text-muted-foreground mt-1">{c.note}</div>
                  </button>
                ))}
              </div>
              <div className="rounded-xl bg-donor-soft p-5">
                <div className="text-xs uppercase tracking-wider text-donor font-bold">Your indicative range in {country}</div>
                <div className="text-3xl font-bold text-donor tabular-nums mt-1">€{compensation.min} – €{compensation.max}</div>
                <div className="text-xs text-muted-foreground mt-1">Per completed cycle, paid by the clinic directly.</div>
              </div>
            </Card>

            <TransparencyBlock variant="calculation">
              Figures are typical ranges reported by patients and clinics in our database. Each clinic sets its
              own compensation policy within the legal framework of its country.
            </TransparencyBlock>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev}><ArrowLeft className="size-4" /> Back</Button>
              <Button onClick={next} className="bg-donor text-donor-foreground hover:bg-donor/90">
                Connect with a clinic <ArrowRight className="size-4" />
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Card className="p-8 space-y-5">
              <h2 className="text-lg font-semibold">Connect with verified clinics in {country}</h2>
              <p className="text-sm text-muted-foreground">
                We'll forward your interest anonymously to 2–3 vetted clinics. They'll reach out to schedule a
                free, no-commitment screening.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>First name</Label><Input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label>City (optional)</Label><Input value={contact.city} onChange={(e) => setContact({ ...contact, city: e.target.value })} /></div>
              </div>
              <Button
                className="w-full bg-donor text-donor-foreground hover:bg-donor/90"
                disabled={!contact.email}
                onClick={() => toast.success("Request sent. You'll hear from clinics within 48h.")}
              >
                Send my anonymous request <ArrowRight className="size-4" />
              </Button>
            </Card>

            <Card className="p-5 flex items-center gap-3">
              <ShieldCheck className="size-5 text-donor" />
              <div className="text-sm text-muted-foreground">
                Your name and contact info stay private until you decide to engage with a specific clinic.
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev}><ArrowLeft className="size-4" /> Back</Button>
              <Button variant="outline" asChild><Link to="/community">Read donor stories</Link></Button>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

export default Donor;
