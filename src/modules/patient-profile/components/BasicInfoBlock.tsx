import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfileStore } from "@/modules/profile/store";

const TREATMENTS = [
  { v: "ivf", l: "IVF" },
  { v: "icsi", l: "ICSI" },
  { v: "donor", l: "Egg donation" },
  { v: "freezing", l: "Egg freezing" },
  { v: "iui", l: "IUI" },
  { v: "study", l: "Initial study" },
  { v: "unsure", l: "Not sure yet" },
] as const;

export function BasicInfoBlock() {
  const p = useProfileStore();
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <Label className="text-xs">Age</Label>
        <Input type="number" min={18} max={55} value={p.age} onChange={(e) => p.patch({ age: Number(e.target.value) })} />
      </div>
      <div>
        <Label className="text-xs">Country</Label>
        <Input value={p.country} onChange={(e) => p.patch({ country: e.target.value })} />
      </div>
      <div>
        <Label className="text-xs">Treatment of interest</Label>
        <select
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          value={p.treatment}
          onChange={(e) => p.patch({ treatment: e.target.value as typeof p.treatment })}
        >
          <option value="">Select...</option>
          {TREATMENTS.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
        </select>
      </div>
      <div>
        <Label className="text-xs">Indicative budget (€)</Label>
        <Input type="number" min={0} step={500} value={p.budget} onChange={(e) => p.patch({ budget: Number(e.target.value) })} />
      </div>
      <div>
        <Label className="text-xs">Trying duration</Label>
        <select
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          value={p.trying}
          onChange={(e) => p.patch({ trying: e.target.value as typeof p.trying })}
        >
          <option value="">Select...</option>
          <option value="<6m">Less than 6 months</option>
          <option value="6-12m">6–12 months</option>
          <option value="1-2y">1–2 years</option>
          <option value=">2y">More than 2 years</option>
        </select>
      </div>
    </div>
  );
}
