import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid, Columns3, Save, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePricingConfigurator } from "./hooks/usePricingConfigurator";
import { ProfileEditor } from "./components/ProfileEditor";
import { ScenarioCard } from "./components/ScenarioCard";
import { PriceBreakdown } from "./components/PriceBreakdown";
import { DataSourcesPanel } from "./components/DataSourcesPanel";
import { GuaranteeExplanation } from "./components/GuaranteeExplanation";
import { WhatAffectsPrice } from "./components/WhatAffectsPrice";
import { PersonalizedExplanation } from "./components/PersonalizedExplanation";
import { ClinicComparison } from "./components/ClinicComparison";
import { FinancingSimulator } from "./components/FinancingSimulator";
import { UploadQuoteCTA } from "./components/UploadQuoteCTA";
import { ConfidenceBadge } from "./components/ConfidenceBadge";
import { HiddenCosts } from "./components/HiddenCosts";
import { DataSourcesWeights } from "./components/DataSourcesWeights";
import { GuaranteeProgramDetail } from "./components/GuaranteeProgramDetail";
import { SideInfo } from "@/components/shared/SideInfo";
import { useProfileStore } from "@/modules/profile/store";
import { usePatientProfileStore } from "@/modules/patient-profile/store";
import { overallCompletion, profileConfidence } from "@/modules/patient-profile/blocks";
import { toast } from "@/hooks/use-toast";
import type { ScenarioKey } from "./logic/types";

export function PricingConfigurator() {
  const { profile, patch, bundle } = usePricingConfigurator();
  const [selected, setSelected] = useState<ScenarioKey>("premium");
  const [view, setView] = useState<"single" | "compare">("single");

  const active = bundle.scenarios.find(s => s.key === selected) ?? bundle.scenarios[1];
  const minTotal = Math.min(...bundle.scenarios.map(s => s.total_min));
  const maxTotal = Math.max(...bundle.scenarios.map(s => s.total_max));

  const saveEstimate = () => {
    try {
      localStorage.setItem("savedEstimate", JSON.stringify({ profile, scenario: active, savedAt: Date.now() }));
      toast({ title: "Estimación guardada", description: "Podrás recuperarla cuando vuelvas." });
    } catch {
      toast({ title: "No se pudo guardar", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <header className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Esto es lo que podrías esperar pagar</h1>
        <p className="text-muted-foreground">Basado en datos reales de clínicas y pacientes como tú. Te explicamos el porqué de cada cifra.</p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <ConfidenceBadge level={bundle.confidence} />
        </div>
      </header>

      {/* PROFILE + SCENARIOS */}
      <section className="grid lg:grid-cols-[320px_1fr] gap-6">
        <ProfileEditor profile={profile} patch={patch} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Escenarios para tu perfil</h2>
            <div className="inline-flex rounded-lg border border-border p-1 bg-card">
              <button
                onClick={() => setView("single")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1.5 ${view === "single" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                <LayoutGrid className="size-3.5" /> Individual
              </button>
              <button
                onClick={() => setView("compare")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1.5 ${view === "compare" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                <Columns3 className="size-3.5" /> Comparar
              </button>
            </div>
          </div>

          <div className={view === "compare" ? "grid md:grid-cols-3 gap-3" : "grid md:grid-cols-3 gap-3"}>
            {bundle.scenarios.map((s) => (
              <ScenarioCard
                key={s.key}
                scenario={s}
                selected={view === "single" && selected === s.key}
                onSelect={view === "single" ? () => setSelected(s.key) : undefined}
                compact={view === "compare"}
              />
            ))}
          </div>

          {view === "single" && <PriceBreakdown scenario={active} />}
        </div>
      </section>

      {/* HIDDEN COSTS — calls out what published prices usually omit */}
      <HiddenCosts />

      {/* PERSONALIZED + DATA SOURCES (list) */}
      <section className="grid md:grid-cols-2 gap-6">
        <PersonalizedExplanation bundle={bundle} />
        <DataSourcesPanel />
      </section>

      {/* DATA SOURCE WEIGHTS — visualizes how much each source drives the estimate */}
      <DataSourcesWeights confidence={bundle.confidence} />

      {/* GUARANTEE comparison + program detail + what affects price */}
      <section className="grid md:grid-cols-2 gap-6">
        <GuaranteeExplanation />
        <WhatAffectsPrice />
      </section>
      <GuaranteeProgramDetail guarantee={bundle.scenarios.find(s => s.key === "guarantee")!} />

      {/* CLINICS */}
      <ClinicComparison />

      {/* FINANCING + COMMUNITY */}
      <section className="grid md:grid-cols-2 gap-6">
        <FinancingSimulator amountMin={minTotal} amountMax={maxTotal} />
        <UploadQuoteCTA defaultCountry={profile.country} defaultTreatment={profile.treatment.toUpperCase()} />
      </section>

      {/* CTAs */}
      <section className="rounded-2xl border border-border bg-gradient-to-br from-primary-soft/40 to-accent-soft/30 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">¿Próximo paso?</h3>
            <p className="text-sm text-muted-foreground">Te enseñamos qué clínicas encajan con tu rango y tu caso, con la misma transparencia.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={saveEstimate} className="gap-1.5"><Save className="size-4" /> Guardar estimación</Button>
            <Button variant="outline" asChild className="gap-1.5"><Link to="/community"><Users className="size-4" /> Ver experiencias</Link></Button>
            <Button variant="outline" asChild className="gap-1.5"><Link to="/explorer"><Compass className="size-4" /> Volver a Explorer</Link></Button>
            <Button asChild className="gap-1.5"><Link to="/navigator">Ver clínicas que encajan <ArrowRight className="size-4" /></Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
