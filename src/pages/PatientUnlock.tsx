import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Gift, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { storage } from "@/lib/fertility";
import { toast } from "@/hooks/use-toast";

const PEEK_PRICE = 5;       // Soft paywall — names + ranking only
const FULL_UNLOCK_PRICE = 19; // Full access — pricing breakdown + ranges

const PatientUnlock = () => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState<"pay" | "referral" | null>(null);

  const handlePay = async (tier: "peek" | "full") => {
    setProcessing("pay");
    await new Promise((r) => setTimeout(r, 900));
    storage.unlockNames();
    if (tier === "full") storage.unlock();
    toast({
      title: "Unlock successful",
      description: `€${tier === "full" ? FULL_UNLOCK_PRICE : PEEK_PRICE} simulated payment — access granted.`,
    });
    navigate("/results");
  };

  const handleReferral = async () => {
    setProcessing("referral");
    await new Promise((r) => setTimeout(r, 700));
    storage.unlockNames();
    storage.setReferral("requested");
    toast({
      title: "Referral request received",
      description: "We'll connect you to your top-matched clinics within 24h.",
    });
    navigate("/patient/referral");
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
            Step 2 · Unlock
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-3 leading-tight">
            Two ways to go further.
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Choose how you want to access your full results. No subscription, no commitment.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-10">
            {/* Option A — Pay */}
            <Card className="p-8 shadow-elegant bg-gradient-card border-2 border-primary/30">
              <div className="size-12 rounded-xl bg-primary-soft grid place-items-center mb-4">
                <Lock className="size-6 text-primary" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                Option A · Self-serve
              </div>
              <h2 className="text-2xl font-bold mb-2">Unlock everything</h2>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-extrabold tabular-nums">€{UNLOCK_PRICE}</span>
                <span className="text-sm text-muted-foreground">one-time</span>
              </div>
              <ul className="space-y-2 text-sm mb-6">
                {[
                  "Reveal all clinic names and locations",
                  "Detailed price breakdown (base + meds + extras)",
                  "Confidence level + price ranges per clinic",
                  "Compare clinics side-by-side",
                ].map((b) => (
                  <li key={b} className="flex gap-2">
                    <CheckCircle2 className="size-4 text-accent shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handlePay}
                disabled={processing !== null}
              >
                {processing === "pay" ? "Processing…" : (
                  <>Unlock for €{UNLOCK_PRICE} <ArrowRight className="size-4" /></>
                )}
              </Button>
              <div className="text-[11px] text-muted-foreground mt-3 inline-flex items-center gap-1">
                <ShieldCheck className="size-3" /> Demo mode — payment is simulated
              </div>
            </Card>

            {/* Option B — Free referral */}
            <Card className="p-8 shadow-elegant bg-gradient-card border-2 border-accent/30">
              <div className="size-12 rounded-xl bg-accent-soft grid place-items-center mb-4">
                <Gift className="size-6 text-accent" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-accent mb-1">
                Option B · Concierge
              </div>
              <h2 className="text-2xl font-bold mb-2">Free clinic referral</h2>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-extrabold text-accent tabular-nums">€0</span>
                <span className="text-sm text-muted-foreground">we earn from clinics</span>
              </div>
              <ul className="space-y-2 text-sm mb-6">
                {[
                  "We hand-pick your best-matched clinics",
                  "We make the introduction directly",
                  "You stay anonymous until you reply",
                  "Includes everything in Option A",
                ].map((b) => (
                  <li key={b} className="flex gap-2">
                    <CheckCircle2 className="size-4 text-accent shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-accent/40 text-accent hover:bg-accent-soft"
                onClick={handleReferral}
                disabled={processing !== null}
              >
                {processing === "referral" ? "Requesting…" : (
                  <>Request free referral <ArrowRight className="size-4" /></>
                )}
              </Button>
              <div className="text-[11px] text-muted-foreground mt-3">
                Marked as a high-quality lead. No spam — clinics pay us, never you.
              </div>
            </Card>
          </div>

          {/* Storytelling */}
          <Card className="mt-10 p-6 bg-card border-2 border-dashed">
            <div className="flex items-start gap-3">
              <Sparkles className="size-5 text-primary mt-1 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">How we make money — transparently. </span>
                Either you pay €{UNLOCK_PRICE} to access everything yourself, or clinics pay us a referral
                fee when you opt in to a free intro. Both paths give you the same data quality. We never
                rank clinics by who pays the most.
              </div>
            </div>
          </Card>

          <div className="text-center mt-8">
            <Link to="/patient/advanced" className="text-sm text-primary hover:underline">
              Looking for advanced matching? See our €30 advanced module →
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default PatientUnlock;
