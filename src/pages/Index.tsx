import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [stats, setStats] = useState({ avg: 0, samples: 0, clinics: 0 });

  useEffect(() => {
    (async () => {
      const [{ data: agg }, { count: clinicCount }] = await Promise.all([
        supabase.from("aggregated_pricing").select("avg_price, sample_size").eq("treatment_type", "IVF"),
        supabase.from("clinics").select("*", { count: "exact", head: true }),
      ]);
      if (agg && agg.length) {
        const totalSamples = agg.reduce((s, r) => s + r.sample_size, 0);
        const weighted =
          agg.reduce((s, r) => s + Number(r.avg_price) * r.sample_size, 0) / Math.max(totalSamples, 1);
        setStats({ avg: Math.round(weighted), samples: totalSamples, clinics: clinicCount ?? 0 });
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="bg-gradient-hero relative overflow-hidden">
        <div className="container py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" /> Powered by real
              patient data
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Make the most important decision of your life
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                with real data.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              The fertility intelligence platform — combining real patient quotes, clinical
              outcomes and AI-powered reasoning, so you choose your clinic with clarity, not
              marketing brochures.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="hero">
                <Link to="/assessment">
                  Start my assessment <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/insights">See market insights</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-accent" /> 100% anonymous
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="size-4 text-accent" /> Community-powered
              </span>
            </div>
          </div>

          {/* Teaser card */}
          <Card className="p-6 shadow-elegant bg-gradient-card border-2 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-muted-foreground">Market snapshot</div>
              <div className="text-xs px-2 py-1 rounded-full bg-accent-soft text-accent font-semibold">
                LIVE
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <div className="text-xs uppercase text-muted-foreground tracking-wider">
                  Avg. IVF cycle in Spain
                </div>
                <div className="text-4xl font-bold mt-1">
                  €{stats.avg ? stats.avg.toLocaleString() : "—"}
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="size-3" /> Based on {stats.samples} verified quotes
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-primary-soft p-4">
                  <div className="text-xs text-muted-foreground">Clinics tracked</div>
                  <div className="text-2xl font-bold text-primary">{stats.clinics}</div>
                </div>
                <div className="rounded-xl bg-accent-soft p-4">
                  <div className="text-xs text-muted-foreground">Price variability</div>
                  <div className="text-2xl font-bold text-accent">±€1.4k</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* HOW */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
          <p className="text-muted-foreground mt-3">
            Three steps. No personal data required.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              n: "01",
              title: "Tell us about you",
              text: "Quick 8-step assessment — age, diagnosis, treatment interest, budget.",
            },
            {
              n: "02",
              title: "We match clinics",
              text: "Our engine ranks clinics on price fit, success rate and treatment match.",
            },
            {
              n: "03",
              title: "See real prices",
              text: "Crowdsourced quotes reveal true costs — including hidden extras.",
            },
          ].map((step) => (
            <Card key={step.n} className="p-7 shadow-card hover:shadow-elegant transition-smooth">
              <div className="text-sm font-bold text-primary mb-3">{step.n}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Index;
