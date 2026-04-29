import { Link } from "react-router-dom";
import { ArrowRight, Heart, Building2, Database, Users, BarChart3, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="bg-gradient-hero">
        <div className="container py-20 md:py-24 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            A decision platform · not a directory
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
            Fertility, decoded.
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Real prices. Real matches. Real outcomes.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We combine data, personalization, and real-world pricing to help patients choose the right
            clinic — and help clinics reach qualified patients.
          </p>
        </div>
      </section>

      {/* SPLIT */}
      <section className="container -mt-10 md:-mt-12 pb-16 grid md:grid-cols-2 gap-6">
        <Card className="p-8 md:p-10 shadow-elegant bg-gradient-card border-2 border-primary/20 hover:border-primary/50 transition-smooth">
          <div className="size-14 rounded-2xl bg-primary-soft grid place-items-center mb-5">
            <Heart className="size-7 text-primary" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">For patients</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">I'm exploring treatment</h2>
          <p className="text-muted-foreground mb-6">
            Get a free anonymized clinic shortlist in 2 minutes. Then unlock names, advanced matching
            and direct referrals.
          </p>
          <ul className="space-y-2 text-sm mb-7">
            {[
              "Free qualification — age, budget, location",
              "Anonymized clinic preview, instantly",
              "Optional advanced matching & referrals",
            ].map((b) => (
              <li key={b} className="flex gap-2 text-foreground/90">
                <span className="text-accent mt-0.5">●</span> {b}
              </li>
            ))}
          </ul>
          <Button asChild size="lg" variant="hero" className="w-full">
            <Link to="/patient">
              Start as a patient <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Card>

        <Card className="p-8 md:p-10 shadow-elegant bg-gradient-card border-2 border-accent/20 hover:border-accent/50 transition-smooth">
          <div className="size-14 rounded-2xl bg-accent-soft grid place-items-center mb-5">
            <Building2 className="size-7 text-accent" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-accent mb-2">For clinics</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">I represent a clinic</h2>
          <p className="text-muted-foreground mb-6">
            Reach pre-qualified patients matched to your specialty, pricing and capacity.
            Pay per qualified lead, or feature your clinic.
          </p>
          <ul className="space-y-2 text-sm mb-7">
            {[
              "Qualified, scored patient leads",
              "Data-driven matching by treatment & price fit",
              "Subscription or per-referral pricing",
            ].map((b) => (
              <li key={b} className="flex gap-2 text-foreground/90">
                <span className="text-accent mt-0.5">●</span> {b}
              </li>
            ))}
          </ul>
          <Button asChild size="lg" variant="outline" className="w-full border-accent/40 text-accent hover:bg-accent-soft">
            <Link to="/clinic">
              Explore clinic plans <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Card>
      </section>

      {/* STORYTELLING */}
      <section className="container py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            A decision engine — not a questionnaire
          </h2>
          <p className="text-muted-foreground mt-3">
            This platform combines data, personalization, and real-world pricing into a single decision flow.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Database,
              title: "Real-world pricing",
              text: "Crowdsourced quotes and scraped clinic data are normalized into a comparable base + meds + extras model.",
            },
            {
              icon: Sparkles,
              title: "Personalized matching",
              text: "Weighted scoring on age, diagnosis, treatment fit, geography and budget — not stars and reviews.",
            },
            {
              icon: BarChart3,
              title: "Transparent confidence",
              text: "Every clinic shows where its price comes from and how confident the platform is in the match.",
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

      {/* TRUST */}
      <section className="border-y bg-card">
        <div className="container py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Users, label: "Patient-side", value: "Free shortlist" },
            { icon: Building2, label: "Clinic-side", value: "Qualified leads" },
            { icon: ShieldCheck, label: "Privacy", value: "100% anonymous" },
            { icon: Database, label: "Pricing", value: "Real market data" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary-soft grid place-items-center shrink-0">
                <t.icon className="size-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold leading-tight">{t.value}</div>
                <div className="text-xs text-muted-foreground leading-tight">{t.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Landing;
