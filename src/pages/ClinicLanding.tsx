import { Link } from "react-router-dom";
import {
  Users,
  Target,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Crown,
  HandCoins,
  Sparkles,
  TrendingUp,
  Zap,
  Star,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
              Access qualified fertility patients —
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                not generic leads.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
              Every patient arrives pre-scored, pre-matched, and ready. You only see leads that fit
              your specialty, capacity and price range — never wasted enquiries, never bidding wars.
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
                text: "Patients are matched by treatment specialization, geography and price band — not by ad bidding.",
              },
              {
                icon: BarChart3,
                title: "Predicted conversion",
                text: "Every lead carries a conversion-probability score so your team prioritizes the highest-fit cases first.",
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

        {/* PRICING — Subscription tiers */}
        <section id="pricing" className="bg-muted/40 border-y">
          <div className="container py-16 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 mb-3">
                Subscription tiers
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Pick a plan that fits your scale</h2>
              <p className="text-muted-foreground mt-3">
                Three subscription tiers from €200 to €1,000/month. All include qualified leads —
                the tier sets your visibility, lead volume and tooling depth.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {/* STARTER */}
              <Card className="p-7 shadow-card border-2 border-border flex flex-col">
                <div className="size-11 rounded-xl bg-muted grid place-items-center mb-4">
                  <Zap className="size-5 text-foreground" />
                </div>
                <h3 className="text-xl font-bold">Starter</h3>
                <div className="flex items-baseline gap-1.5 mt-2 mb-4">
                  <span className="text-3xl font-extrabold">€200</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>
                <ul className="space-y-2 text-sm mb-6 flex-1">
                  {[
                    "Standard placement in match results",
                    "Up to 15 qualified leads / month",
                    "Lead scoring & match rationale",
                    "Basic dashboard access",
                  ].map((b) => (
                    <li key={b} className="flex gap-2">
                      <CheckCircle2 className="size-4 text-accent shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/clinic/dashboard">Start with Starter</Link>
                </Button>
              </Card>

              {/* GROWTH — most popular */}
              <Card className="p-7 shadow-elegant bg-gradient-card border-2 border-primary relative flex flex-col">
                <div className="absolute -top-3 left-5 bg-gradient-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Most popular
                </div>
                <div className="size-11 rounded-xl bg-primary-soft grid place-items-center mb-4">
                  <Crown className="size-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Growth</h3>
                <div className="flex items-baseline gap-1.5 mt-2 mb-4">
                  <span className="text-3xl font-extrabold">€499</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>
                <ul className="space-y-2 text-sm mb-6 flex-1">
                  {[
                    "Featured placement in matched results",
                    "Unlimited qualified leads",
                    "Pricing intelligence dashboard",
                    "Profile customization & differentiation",
                    "Priority lead routing",
                  ].map((b) => (
                    <li key={b} className="flex gap-2">
                      <CheckCircle2 className="size-4 text-accent shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="hero" className="w-full">
                  <Link to="/clinic/dashboard">Start Growth subscription</Link>
                </Button>
              </Card>

              {/* ELITE */}
              <Card className="p-7 shadow-card border-2 border-foreground/20 flex flex-col">
                <div className="size-11 rounded-xl bg-foreground/10 grid place-items-center mb-4">
                  <Star className="size-5 text-foreground" />
                </div>
                <h3 className="text-xl font-bold">Elite</h3>
                <div className="flex items-baseline gap-1.5 mt-2 mb-4">
                  <span className="text-3xl font-extrabold">€1,000</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>
                <ul className="space-y-2 text-sm mb-6 flex-1">
                  {[
                    "Top-of-results placement",
                    "Unlimited leads + premium-referral access",
                    "Dedicated account manager",
                    "API access & CRM integration",
                    "Co-branded patient communications",
                  ].map((b) => (
                    <li key={b} className="flex gap-2">
                      <CheckCircle2 className="size-4 text-accent shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/clinic/dashboard">Talk to us about Elite</Link>
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* PER-LEAD PRICING */}
        <section className="container py-16 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 mb-3">
              Pay per qualified patient
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Or pay only when patients convert</h2>
            <p className="text-muted-foreground mt-3">
              No monthly commitment. You pay for verified, qualified leads — and more for premium
              referrals where the patient has explicitly asked clinics to review their case.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Standard lead */}
            <Card className="p-7 shadow-card border-2 border-accent/30 flex flex-col">
              <div className="size-11 rounded-xl bg-accent-soft grid place-items-center mb-4">
                <HandCoins className="size-5 text-accent" />
              </div>
              <Badge variant="outline" className="self-start mb-2 text-[10px] bg-accent/15 text-accent border-accent/30">
                Standard lead
              </Badge>
              <h3 className="text-xl font-bold">Pre-qualified patient</h3>
              <div className="flex items-baseline gap-1.5 mt-2 mb-4">
                <span className="text-3xl font-extrabold text-accent">€150–€400</span>
                <span className="text-sm text-muted-foreground">per lead</span>
              </div>
              <ul className="space-y-2 text-sm mb-6 flex-1">
                {[
                  "Patient has completed full questionnaire",
                  "Match score, budget and treatment fit verified",
                  "Predicted conversion probability included",
                  "Pay only when lead is delivered",
                ].map((b) => (
                  <li key={b} className="flex gap-2">
                    <CheckCircle2 className="size-4 text-accent shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="w-full border-accent/40 text-accent hover:bg-accent-soft">
                <Link to="/clinic/dashboard">Activate per-lead model</Link>
              </Button>
            </Card>

            {/* Premium lead */}
            <Card className="p-7 shadow-elegant border-2 border-foreground/25 bg-foreground/[0.03] flex flex-col">
              <div className="size-11 rounded-xl bg-foreground/10 grid place-items-center mb-4">
                <Crown className="size-5 text-foreground" />
              </div>
              <Badge variant="outline" className="self-start mb-2 text-[10px] bg-foreground/10 text-foreground border-foreground/30">
                Premium lead
              </Badge>
              <h3 className="text-xl font-bold">Patient-initiated review</h3>
              <div className="flex items-baseline gap-1.5 mt-2 mb-4">
                <span className="text-3xl font-extrabold">€400–€1,200+</span>
                <span className="text-sm text-muted-foreground">per lead</span>
              </div>
              <ul className="space-y-2 text-sm mb-6 flex-1">
                {[
                  "Patient explicitly asked to be reviewed",
                  "Higher intent → 3-4× consultation rate",
                  "Includes advanced questionnaire data",
                  "Priority routing — first 3 clinics only",
                ].map((b) => (
                  <li key={b} className="flex gap-2">
                    <CheckCircle2 className="size-4 text-foreground shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="hero" className="w-full">
                <Link to="/clinic/dashboard">Get premium leads</Link>
              </Button>
            </Card>
          </div>

          {/* Performance model callout */}
          <Card className="mt-8 p-6 md:p-7 bg-gradient-card border-2 border-primary/30 shadow-card">
            <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
              <div className="size-12 rounded-xl bg-primary-soft grid place-items-center shrink-0">
                <Gauge className="size-6 text-primary" />
              </div>
              <div className="flex-1">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 mb-2">
                  Performance model
                </Badge>
                <h3 className="text-xl font-bold mb-1.5">Pay per qualified patient — outcome-aligned</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Every patient is pre-qualified by our matching engine. Higher conversion rates mean
                  your cost per consultation is dramatically lower than generic ads or directories.
                  Mix subscriptions with per-lead pricing — switch any time.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { k: "Conversion rate", v: "3-4× directories" },
                    { k: "Cost per consult", v: "~60% lower" },
                    { k: "Patient intent", v: "Pre-scored & verified" },
                  ].map((s) => (
                    <div key={s.k} className="rounded-lg border bg-background p-3">
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{s.k}</div>
                      <div className="text-sm font-bold mt-0.5">{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* PARTNER INTEGRATION */}
        <section className="bg-muted/40 border-y">
          <div className="container py-14 max-w-4xl">
            <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
              <div className="size-12 rounded-xl bg-accent-soft grid place-items-center shrink-0">
                <TrendingUp className="size-6 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Partners subsidize patient costs and improve match accuracy
                </h2>
                <p className="text-muted-foreground">
                  Genetic labs, home test kits and financing partners pay us referral fees so patients
                  get accurate matching for free. The result for clinics: better-informed patients,
                  more complete clinical data on every lead, and higher conversion to consultation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STORYTELLING */}
        <section className="container py-16 max-w-3xl text-center">
          <Sparkles className="size-8 text-primary mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold">
            This is a decision platform, not a marketplace.
          </h2>
          <p className="text-muted-foreground mt-3">
            We don't sell impressions or auction clicks. We sit between informed patients and serious
            clinics — monetizing only when patients signal real intent. Subscriptions fund visibility
            and tooling. Per-lead and premium-referral fees align our revenue with your conversions.
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
