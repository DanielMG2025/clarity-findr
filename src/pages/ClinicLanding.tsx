import { Link } from "react-router-dom";
import { Building2, Users, Target, BarChart3, ArrowRight, CheckCircle2, Crown, HandCoins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const ClinicLanding = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* HERO */}
        <section className="bg-gradient-hero">
          <div className="container py-16 md:py-20 max-w-5xl">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Back
            </Link>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent bg-accent-soft px-3 py-1.5 rounded-full">
              For clinics
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mt-3 leading-[1.05]">
              Reach patients
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                already qualified for your clinic.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
              Patients arrive scored, matched and ready. You only see leads that fit your
              specialty, capacity and price range — never wasted enquiries.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Button asChild size="lg" variant="hero">
                <Link to="/clinic/dashboard">Open clinic dashboard <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/clinic#pricing">See pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* VALUE */}
        <section className="container py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Pre-qualified patients",
                text: "Each lead has completed our matching questionnaire. Age, diagnosis, budget and treatment fit are pre-scored.",
              },
              {
                icon: Target,
                title: "Data-driven matching",
                text: "Patients are matched to your clinic by treatment specialization, geography and price band — not by ad bidding.",
              },
              {
                icon: BarChart3,
                title: "Transparent pricing",
                text: "Patients see your real price up front. No mismatched expectations, no wasted consultations.",
              },
            ].map((c) => (
              <Card key={c.title} className="p-7 shadow-card hover:shadow-elegant transition-smooth">
                <div className="size-10 rounded-xl bg-primary-soft grid place-items-center mb-4">
                  <c.icon className="size-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.text}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="bg-muted/40 border-y">
          <div className="container py-16 max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl md:text-4xl font-bold">Two ways to work with us</h2>
              <p className="text-muted-foreground mt-3">
                Pick what fits your growth stage. Switch any time.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-8 shadow-elegant bg-gradient-card border-2 border-primary/30 relative">
                <div className="absolute -top-3 left-6 bg-gradient-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Most popular
                </div>
                <div className="size-12 rounded-xl bg-primary-soft grid place-items-center mb-4">
                  <Crown className="size-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Featured subscription</h3>
                <div className="flex items-baseline gap-2 mt-2 mb-4">
                  <span className="text-4xl font-extrabold">€499</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  {[
                    "Featured placement on matched results",
                    "Unlimited qualified leads",
                    "Pricing intelligence dashboard",
                    "Profile customization & differentiation",
                  ].map((b) => (
                    <li key={b} className="flex gap-2">
                      <CheckCircle2 className="size-4 text-accent shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="hero" className="w-full">
                  <Link to="/clinic/dashboard">Start subscription</Link>
                </Button>
              </Card>

              <Card className="p-8 shadow-elegant bg-gradient-card border-2 border-accent/30">
                <div className="size-12 rounded-xl bg-accent-soft grid place-items-center mb-4">
                  <HandCoins className="size-6 text-accent" />
                </div>
                <h3 className="text-2xl font-bold">Pay per referral</h3>
                <div className="flex items-baseline gap-2 mt-2 mb-4">
                  <span className="text-4xl font-extrabold text-accent">€120</span>
                  <span className="text-sm text-muted-foreground">/ qualified lead</span>
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  {[
                    "No monthly fee",
                    "Pay only for referred patients",
                    "Standard placement in results",
                    "Lead scoring & match rationale included",
                  ].map((b) => (
                    <li key={b} className="flex gap-2">
                      <CheckCircle2 className="size-4 text-accent shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-accent/40 text-accent hover:bg-accent-soft"
                >
                  <Link to="/clinic/dashboard">Start with referral fee</Link>
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* STORYTELLING */}
        <section className="container py-16 max-w-3xl text-center">
          <Sparkles className="size-8 text-primary mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold">
            Built as a marketplace, powered by a data engine.
          </h2>
          <p className="text-muted-foreground mt-3">
            We sit between informed patients and serious clinics — a decision platform plus a real-time
            pricing intelligence layer. Clinic dashboard, lead management and structured pricing input
            are coming online next.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button asChild variant="outline">
              <Link to="/clinic/dashboard">Preview clinic dashboard</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/admin/pricing-dashboard">Admin / demo view</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default ClinicLanding;
