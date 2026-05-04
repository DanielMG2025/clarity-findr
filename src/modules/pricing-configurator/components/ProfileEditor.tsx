import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { WhatIsThis } from "@/components/shared/WhatIsThis";
import type { PricingProfile, TreatmentKey } from "../logic/types";

const TREATMENTS: { v: TreatmentKey; l: string }[] = [
  { v: "ivf",      l: "FIV / IVF" },
  { v: "icsi",     l: "ICSI" },
  { v: "donor",    l: "Ovodonación" },
  { v: "freezing", l: "Vitrificación social" },
  { v: "iui",      l: "Inseminación artificial" },
  { v: "study",    l: "Estudio inicial" },
];

const COUNTRIES = ["Spain", "Czech Republic", "Portugal", "Greece", "UK", "Germany", "France", "Italy"];

interface Props {
  profile: PricingProfile;
  patch: (p: Partial<PricingProfile>) => void;
}

export function ProfileEditor({ profile, patch }: Props) {
  return (
    <Card className="p-5 space-y-5">
      <div>
        <Label className="text-sm font-semibold">Tratamiento</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {TREATMENTS.map(t => (
            <button
              key={t.v}
              onClick={() => patch({ treatment: t.v })}
              className={`text-xs font-medium p-2.5 rounded-lg border-2 transition-smooth text-left ${
                profile.treatment === t.v ? "border-primary bg-primary-soft" : "border-border hover:border-primary/40"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-semibold">Edad</Label>
          <Input type="number" min={18} max={55} value={profile.age} onChange={(e) => patch({ age: Number(e.target.value) })} />
        </div>
        <div>
          <Label className="text-sm font-semibold">País</Label>
          <select
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            value={profile.country}
            onChange={(e) => patch({ country: e.target.value })}
          >
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Extras opcionales</div>

        <Toggle
          label="Necesito ICSI"
          tooltip="ICSI es una técnica donde se inyecta un espermatozoide en cada óvulo. Se usa en casos de factor masculino."
          checked={!!profile.needs_icsi}
          onChange={(v) => patch({ needs_icsi: v })}
        />
        <Toggle
          label="Test genético embrionario (PGT-A)"
          tooltip="PGT-A analiza el número de cromosomas de los embriones antes de transferirlos."
          checked={!!profile.needs_pgt}
          onChange={(v) => patch({ needs_pgt: v })}
        />
        <Toggle
          label="Vitrificación de embriones / óvulos"
          tooltip="Congelación rápida para usarlos en el futuro."
          checked={!!profile.needs_vitrification}
          onChange={(v) => patch({ needs_vitrification: v })}
        />

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <Label className="text-xs">Años de mantenimiento</Label>
            <Input type="number" min={0} max={10} value={profile.storage_years ?? 1} onChange={(e) => patch({ storage_years: Number(e.target.value) })} />
          </div>
          <div>
            <Label className="text-xs">Ciclos previos sin éxito</Label>
            <Input type="number" min={0} max={10} value={profile.prior_failed_cycles ?? 0} onChange={(e) => patch({ prior_failed_cycles: Number(e.target.value) })} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function Toggle({ label, tooltip, checked, onChange }: { label: string; tooltip: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/40 cursor-pointer">
      <span className="text-sm flex items-center gap-2">
        {label}
        <WhatIsThis title={label} size="sm">{tooltip}</WhatIsThis>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
