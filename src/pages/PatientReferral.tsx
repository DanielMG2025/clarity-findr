import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Mail, Phone, Sparkles, ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { storage } from "@/lib/fertility";
import { toast } from "@/hooks/use-toast";

const PatientReferral = () => {
  const [status, setStatus] = useState(storage.getReferral());
  const [contact, setContact] = useState({ email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    storage.unlockNames(); // referral path also unlocks
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.email && !contact.phone) {
      toast({ title: "Add an email or phone", description: "We need one way to reach you." });
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    storage.setReferral("matched");
    setStatus("matched");
    setSubmitting(false);
    toast({
      title: "You're flagged as a high-quality lead",
      description: "Top-matched clinics will be notified within 24h.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-gradient-hero">
        <div className="container max-w-3xl py-12 md:py-16">
          <Link to="/results" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to results
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent bg-accent-soft px-3 py-1.5 rounded-full">
            Step 5 · Referral
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-3 leading-tight">
            Want us to connect you?
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            We'll directly introduce you to your top-matched clinics. They'll have your match score
            and anonymized profile — but no contact details until you confirm.
          </p>

          {status === "matched" ? (
            <Card className="mt-10 p-8 shadow-elegant bg-gradient-card border-2 border-accent/40">
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-xl bg-accent-soft grid place-items-center shrink-0">
                  <CheckCircle2 className="size-6 text-accent" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-accent mb-1">
                    Lead status · High quality
                  </div>
                  <h2 className="text-2xl font-bold mb-2">You're all set.</h2>
                  <p className="text-muted-foreground mb-4">
                    Your profile has been marked as a high-quality lead and routed to your top
                    3 matched clinics. You'll hear from them within 24 hours.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="hero">
                      <Link to="/results">Back to my dashboard <ArrowRight className="size-4" /></Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/patient/advanced">Add advanced matching</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="mt-10 p-8 shadow-elegant bg-gradient-card border-2 border-primary/30">
              <form onSubmit={submit} className="space-y-5">
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold">
                    <Mail className="size-3.5 inline mr-1.5" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold">
                    <Phone className="size-3.5 inline mr-1.5" /> Phone (optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+34 600 000 000"
                    value={contact.phone}
                    onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div className="rounded-xl bg-primary-soft border border-primary/20 p-4 text-sm">
                  <div className="font-semibold text-primary mb-1 flex items-center gap-1.5">
                    <Sparkles className="size-4" /> What happens next
                  </div>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside text-[13px]">
                    <li>We share your anonymized match (age, treatment, budget) with top clinics</li>
                    <li>Clinics that fit reach out within 24h</li>
                    <li>You decide who, if any, you reply to</li>
                  </ul>
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? "Sending…" : (
                    <>Connect me to my matches <Send className="size-4" /></>
                  )}
                </Button>
                <div className="text-[11px] text-muted-foreground text-center">
                  Free for you. Clinics pay a referral fee. We never sell your data.
                </div>
              </form>
            </Card>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default PatientReferral;
