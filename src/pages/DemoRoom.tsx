import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="container max-w-6xl py-10 space-y-8">
      <header className="space-y-3 max-w-3xl">
        <Badge variant="secondary" className="text-[11px]">Demo room</Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
          <PlayCircle className="size-7 text-primary" /> Load a demo patient
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Pick one of the built-in patients to load their full situation into the journey and jump
          straight to the questionnaire, already filled in. Data completeness varies on purpose — use
          it to show <em>more data → higher confidence</em>. The restrictive-country cases (Italy,
          Germany…) are the best way to show the legal engine in action.
        </p>
      </header>

      {loadedName && (
        <Card className="p-4 flex flex-wrap items-center justify-between gap-3 bg-primary-soft/30 border-primary/20">
          <div className="text-sm">
            Currently loaded: <strong>{loadedName}</strong>. The whole journey now reflects this patient.
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {DEMO_PATIENTS.map((p) => {
          const family = p.family_structure ?? "hetero_couple";
          const country = byCode(p.country)?.label ?? p.country;
          const restrictive = RESTRICTIVE.has(p.country);
          return (
            <button
              key={p.key}
              onClick={() => pick(p)}
              className="text-left rounded-xl border bg-card p-4 flex flex-col gap-3 hover:border-primary/50 hover:shadow-md transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold">{p.name} · {p.age}</div>
                  <div className="text-xs text-muted-foreground">{p.label}</div>
                </div>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${LEVEL_TONE[p.data_level]}`}>
                  {LEVEL_LABEL[p.data_level]}
                </Badge>
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

              <div className="mt-auto flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{completeness(p)}% profile complete</span>
                <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                  Load <ArrowRight className="size-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Loading a patient replaces any data currently in your session. Use <strong>Reset</strong> to
        clear it and pick another.
      </p>
    </div>
  );
}
