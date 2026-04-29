import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Lock,
  Gift,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Eye,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { storage } from "@/lib/fertility";
import { toast } from "@/hooks/use-toast";

// Intent-based pricing — value scales with depth, not features.
const PEEK_PRICE = 7;          // €5–€10 — reveal names + ranking only
const FULL_UNLOCK_PRICE = 19;  // €15–€30 — full access: pricing ranges, comparison, breakdowns

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
      title: "Free referral requested",
      description: "We'll connect you to your top-matched clinics within 24h.",
    });
    navigate("/patient/referral");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-gradient-hero">
        <div className="container max-w-6xl py-12 md:py-16">
          <Link to="/results" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to results
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full">
            Step 2 · Intent decision
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-3 leading-tight">
            How serious are you,
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              right now?
            </span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Pick the path that matches your intent. Pay for self-serve depth, or let clinics
            compete for you — for free.
          </p>

          {/* THREE intent-based paths */}
          <div className="grid md:grid-cols-3 gap-5 mt-10">
            {/* PATH A — Peek (€5–€10) */}
            <Card className="p-7 shadow-card border-2 border-primary/20 flex flex-col">
              <div className="size-11 rounded-xl bg-primary-soft grid place-items-center mb-4">
                <Eye className="size-5 text-primary" />
              </div>
              <Badge variant="outline" className="self-start mb-2 text-[10px] bg-primary/10 text-primary border-primary/30">
                Just curious
              </Badge>
              <h2 className="text-xl font-bold mb-1">Peek the names</h2>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-3xl font-extrabold tabular-nums">€{PEEK_PRICE}</span>
                <span className="text-xs text-muted-foreground">one-time · range €5–€10</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Reveal which clinics matched. Names, locations, basic ranking only.
              </p>
              <ul className="space-y-1.5 text-xs mb-5 flex-1">
                {["Real clinic names", "Geographic ranking", "Match tier (good / strong / best)"].map((b) => (
                  <li key={b} className="flex gap-2">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handlePay("peek")}
                disabled={processing !== null}
              >
                {processing === "pay" ? "Processing…" : `Peek for €${PEEK_PRICE}`}
              </Button>
            </Card>

            {/* PATH B — Full access (€15–€30) RECOMMENDED */}
            <Card className="p-7 shadow-elegant bg-gradient-card border-2 border-primary relative flex flex-col">
              <div className="absolute -top-3 left-5 bg-gradient-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                Most chosen
              </div>
              <div className="size-11 rounded-xl bg-primary-soft grid place-items-center mb-4">
                <Lock className="size-5 text-primary" />
              </div>
              <Badge variant="outline" className="self-start mb-2 text-[10px] bg-primary/15 text-primary border-primary/40">
                Ready to compare
              </Badge>
              <h2 className="text-xl font-bold mb-1">Full access</h2>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-3xl font-extrabold tabular-nums">€{FULL_UNLOCK_PRICE}</span>
                <span className="text-xs text-muted-foreground">one-time · range €15–€30</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Everything you need to make an informed shortlist on your own.
              </p>
              <ul className="space-y-1.5 text-xs mb-5 flex-1">
                {[
                  "Everything in Peek",
                  "Real pricing ranges per clinic",
                  "Detailed breakdown: base + meds + extras",
                  "Confidence score and side-by-side comparison",
                ].map((b) => (
                  <li key={b} className="flex gap-2">
                    <CheckCircle2 className="size-3.5 text-accent shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="hero"
                className="w-full"
                onClick={() => handlePay("full")}
                disabled={processing !== null}
              >
                {processing === "pay" ? "Processing…" : (
                  <>Unlock for €{FULL_UNLOCK_PRICE} <ArrowRight className="size-4" /></>
                )}
              </Button>
            </Card>

            {/* PATH C — Free referral */}
            <Card className="p-7 shadow-card border-2 border-accent/30 flex flex-col">
              <div className="size-11 rounded-xl bg-accent-soft grid place-items-center mb-4">
                <Gift className="size-5 text-accent" />
              </div>
              <Badge variant="outline" className="self-start mb-2 text-[10px] bg-accent/15 text-accent border-accent/30">
                Let clinics come to you
              </Badge>
              <h2 className="text-xl font-bold mb-1">Free referral</h2>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-3xl font-extrabold text-accent tabular-nums">€0</span>
                <span className="text-xs text-muted-foreground">clinics pay us</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                We hand-introduce you to your top-matched clinics. You stay anonymous until you reply.
              </p>
              <ul className="space-y-1.5 text-xs mb-5 flex-1">
                {[
                  "Top 3 clinics hand-picked",
                  "Direct intro from us",
                  "Includes everything in Full access",
                  "Anonymous until you reply",
                ].map((b) => (
                  <li key={b} className="flex gap-2">
                    <CheckCircle2 className="size-3.5 text-accent shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full border-accent/40 text-accent hover:bg-accent-soft"
                onClick={handleReferral}
                disabled={processing !== null}
              >
                {processing === "referral" ? "Requesting…" : (
                  <>Request free referral <ArrowRight className="size-4" /></>
                )}
              </Button>
            </Card>
          </div>

          <div className="text-[11px] text-muted-foreground mt-3 inline-flex items-center gap-1">
            <ShieldCheck className="size-3" /> Demo mode — payments are simulated.
          </div>

          {/* Premium upsell */}
          <Card className="mt-10 p-6 md:p-7 shadow-elegant bg-foreground/[0.03] border-2 border-foreground/15">
            <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
              <div className="size-12 rounded-xl bg-foreground/10 grid place-items-center shrink-0">
                <Crown className="size-6 text-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-wider text-foreground/70 mb-1">
                  Step 5 · Premium referral
                </div>
                <h3 className="text-xl font-bold mb-1.5">Let clinics review your case</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your case is flagged as a high-quality lead. Top-matched clinics review and
                  prioritize your file — faster replies, better fit, higher outcome odds.
                </p>
                <Button asChild variant="outline">
                  <Link to="/patient/referral">
                    Explore premium referral <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>

          {/* Transparency */}
          <Card className="mt-8 p-6 bg-card border-2 border-dashed">
            <div className="flex items-start gap-3">
              <Sparkles className="size-5 text-primary mt-1 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">How we make money — transparently. </span>
                Either you pay €{PEEK_PRICE}–€{FULL_UNLOCK_PRICE} for self-serve depth, or clinics pay
                us a referral fee when you opt in. Same data quality on both paths. We never rank
                clinics by who pays the most. Partners subsidize advanced modules so accurate
                matching stays accessible to everyone.
              </div>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default PatientUnlock;
