import { Link } from "react-router-dom";
import { ArrowRight, Headset, FileCheck, ClipboardList, MessageSquare, CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { JourneyHeader } from "@/components/shared/JourneyHeader";
import { TransparencyBlock } from "@/components/shared/TransparencyBlock";
import { useState } from "react";
import { useJourneyState } from "@/hooks/useJourneyState";
import { toast } from "sonner";

const STEPS = [
  { label: "About you" },
  { label: "Documents" },
  { label: "Confirm service" },
  { label: "Tracking" },
];

const TIMELINE = [
  { label: "Request received", desc: "We've got your case. A senior advisor is reviewing it.", state: "done" as const },
  { label: "Profile analysis", desc: "Cross-checking your case against our clinic database.", state: "active" as const },
  { label: "Shortlist prepared", desc: "3–5 best-fit clinics with explanations and price ranges.", state: "next" as const },
  { label: "Intro calls", desc: "We facilitate intro calls with shortlisted clinics.", state: "next" as const },
];

const Expert = () => {
  const { step, setStep } = useJourneyState(
    { key: "expert", path: "/expert", label: "Expert · Concierge", totalSteps: STEPS.length },
    {},
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <JourneyHeader
        module="Expert · Concierge"
        tone="expert"
        Icon={Headset}
        title="A senior advisor takes it from here"
        subtitle="We do the research, paperwork and intro calls. You decide."
        steps={STEPS}
        current={step}
      />

      <main className="container max-w-3xl pb-20 space-y-6">
        {step === 0 && (
          <Card className="p-8 space-y-5">
            <div className="flex items-center gap-3">
              <Headset className="size-6 text-primary" />
              <h2 className="text-lg font-semibold">Tell us about your case</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Full name</Label><Input placeholder="Jane Doe" /></div>
              <div><Label>Email</Label><Input type="email" placeholder="you@example.com" /></div>
              <div><Label>Age</Label><Input type="number" placeholder="34" /></div>
              <div><Label>Country</Label><Input placeholder="Spain" /></div>
            </div>
            <div>
              <Label>Where are you in your journey?</Label>
              <Textarea rows={4} placeholder="A few sentences about your situation, treatments tried, and what matters to you." />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(1)}>Continue <ArrowRight className="size-4" /></Button>
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card className="p-8 space-y-5">
            <div className="flex items-center gap-3">
              <ClipboardList className="size-6 text-primary" />
              <h2 className="text-lg font-semibold">Document checklist</h2>
            </div>
            <ul className="space-y-3">
              {[
                "Hormone panel (AMH, FSH, LH) — last 12 months",
                "Ultrasound report (antral follicle count)",
                "Sperm analysis (if applicable)",
                "Prior treatment summary (if any)",
              ].map((d) => (
                <li key={d} className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileCheck className="size-5 text-accent" />
                  <span className="text-sm">{d}</span>
                  <Badge variant="secondary" className="ml-auto">Optional</Badge>
                </li>
              ))}
            </ul>
            <TransparencyBlock variant="data">
              You can send these later. We never share documents with clinics without your written approval.
            </TransparencyBlock>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={() => setStep(2)}>Continue <ArrowRight className="size-4" /></Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-8 space-y-5">
            <h2 className="text-lg font-semibold">Confirm your concierge service</h2>
            <div className="rounded-xl border-2 border-primary p-5 bg-primary-soft/40">
              <div className="font-bold text-lg">Personalised Concierge</div>
              <div className="text-sm text-muted-foreground">Senior advisor · 3–5 clinic shortlist · Intro calls · Document support</div>
              <div className="text-2xl font-bold text-primary mt-3 tabular-nums">€349</div>
              <div className="text-xs text-muted-foreground">Refunded if you book through us.</div>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => { toast.success("Service requested. Check your email."); setStep(3); }}>
                Confirm
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="size-6 text-primary" />
              <h2 className="text-lg font-semibold">We're analyzing your case</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Your advisor will reach out within 24h. You can follow progress here.
            </p>
            <ol className="relative border-l-2 border-border ml-3 space-y-6 pl-6">
              {TIMELINE.map((t, i) => (
                <li key={i} className="relative">
                  <span
                    className={`absolute -left-[34px] top-1 size-6 rounded-full grid place-items-center ${
                      t.state === "done" ? "bg-accent text-accent-foreground" :
                      t.state === "active" ? "bg-primary text-primary-foreground animate-pulse" :
                      "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.state === "done" ? <CheckCircle2 className="size-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </span>
                  <div className="font-semibold">{t.label}</div>
                  <div className="text-sm text-muted-foreground">{t.desc}</div>
                </li>
              ))}
            </ol>
            <Button variant="outline" asChild className="w-full"><Link to="/account/patient">Open my space</Link></Button>
          </Card>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

export default Expert;
