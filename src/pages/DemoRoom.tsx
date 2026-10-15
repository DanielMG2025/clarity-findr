import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, RotateCcw, ArrowRight, Scale, MapPin, Users } from "lucide-react";
import {
  DEMO_PATIENTS,
  completeness,
  loadDemoPatient,
  useMasterRecord,
  type DemoPatientSeed,
} from "@/modules/master-record";
import { byCode, type FamilyStructure } from "@/modules/regulatory";

const LEVEL_TONE: Record<DemoPatientSeed["data_level"], string> = {
  high: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  low: "bg-muted text-muted-foreground border-border",
};

const LEVEL_LABEL: Record<DemoPatientSeed["data_level"], string> = {
  high: "High data",
  medium: "Medium data",
  low: "Low data",
};

const FAMILY_LABEL: Record<FamilyStructure, string> = {
  hetero_couple: "Hetero couple",
  female_couple: "Female couple",
  single_woman: "Single woman",
  male_couple: "Male couple",
  single_man: "Single man",
};

/** Countries whose framework blocks some family structures — the regulatory demo. */
const RESTRICTIVE = new Set(["IT", "DE", "CH", "PL", "CZ", "CY", "GR"]);

export default function DemoRoom() {
  const navigate = useNavigate();
  const loadedName = useMasterRecord((s) => s.identity.name);
  const reset = useMasterRecord((s) => s.reset);

  const pick = (seed: DemoPatientSeed) => {
    loadDemoPatient(seed);
    navigate("/situacion");
  };

  return (
    <div className="container max-w-6xl py-10 space-y-10">
      <header className="space-y-4 max-w-3xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">Demo room</p>
        <h1 className="font-display text-3xl md:text-4xl font-medium tracking-tight flex items-center gap-3">
          <PlayCircle className="size-7 text-primary" /> Load a demo patient
        </h1>
        <div className="h-px w-16 bg-accent/60" />
        <p className="text-muted-foreground leading-loose max-w-[65ch]">
          Pick one of the built-in patients to load their full situation into the journey and jump
          straight to the questionnaire, already filled in. Data completeness varies on purpose — use
          it to show <em className="font-editorial not-italic italic">more data → higher confidence</em>. The restrictive-country cases (Italy,
          Germany…) are the best way to show the legal engine in action.
        </p>
      </header>

      {loadedName && (
        <Card className="p-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-primary/20 bg-primary-soft/30 shadow-none">
          <div className="text-sm leading-relaxed">
            Currently loaded: <strong className="font-display font-medium">{loadedName}</strong>. The whole journey now reflects this patient.
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => reset()}>
              <RotateCcw className="size-3.5" /> Reset
            </Button>
            <Button size="sm" className="gap-1" onClick={() => navigate("/situacion")}>
              Continue <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DEMO_PATIENTS.map((p) => {
          const family = p.family_structure ?? "hetero_couple";
          const country = byCode(p.country)?.label ?? p.country;
          const restrictive = RESTRICTIVE.has(p.country);
          return (
            <button
              key={p.key}
              onClick={() => pick(p)}
              className="text-left rounded-2xl border border-border/70 bg-card p-5 flex flex-col gap-4 shadow-none hover:border-primary/40 hover:shadow-sm transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-display text-lg font-medium tracking-tight">{p.name} · {p.age}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{p.label}</div>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${LEVEL_TONE[p.data_level]}`}>
                  {LEVEL_LABEL[p.data_level]}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
                  <MapPin className="size-3" /> {country}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
                  <Users className="size-3" /> {FAMILY_LABEL[family]}
                </span>
                {restrictive && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 text-rose-600 px-2 py-0.5 font-medium">
                    <Scale className="size-3" /> Legal case
                  </span>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3">
                <span className="text-[11px] text-muted-foreground">
                  <span className="font-display tabular-nums">{completeness(p)}%</span> profile complete
                </span>
                <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                  Load <ArrowRight className="size-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="max-w-[65ch] border-t border-accent/40 pt-6 font-editorial text-base italic leading-loose text-muted-foreground">
        Loading a patient replaces any data currently in your session. Use <strong className="not-italic font-semibold">Reset</strong> to
        clear it and pick another.
      </p>
    </div>
  );
}
