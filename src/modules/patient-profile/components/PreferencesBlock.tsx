import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePatientProfileStore } from "../store";

export function PreferencesBlock() {
  const p = usePatientProfileStore((s) => s.preferences);
  const patch = usePatientProfileStore((s) => s.patchPreferences);
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <Label className="text-xs">Priority</Label>
        <select
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          value={p.priority ?? ""}
          onChange={(e) => patch({ priority: (e.target.value || undefined) as typeof p.priority })}
        >
          <option value="">—</option>
          <option value="cost">Lower cost</option>
          <option value="success">Highest success rate</option>
          <option value="speed">Speed / availability</option>
          <option value="balanced">Balanced</option>
        </select>
      </div>
      <div>
        <Label className="text-xs">Travel openness</Label>
        <select
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          value={p.travel ?? ""}
          onChange={(e) => patch({ travel: (e.target.value || undefined) as typeof p.travel })}
        >
          <option value="">—</option>
          <option value="home_only">Home country only</option>
          <option value="regional">Neighbouring countries</option>
          <option value="europe">Anywhere in Europe</option>
          <option value="global">Global</option>
        </select>
      </div>
      <div>
        <Label className="text-xs">Donor openness</Label>
        <select
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          value={p.donor_openness ?? ""}
          onChange={(e) => patch({ donor_openness: (e.target.value || undefined) as typeof p.donor_openness })}
        >
          <option value="">—</option>
          <option value="no">No</option>
          <option value="maybe">Maybe</option>
          <option value="yes">Yes</option>
        </select>
      </div>
      <label className="flex items-center justify-between p-2 rounded-md border bg-muted/20">
        <span className="text-sm">Interested in PGT-A</span>
        <Switch checked={!!p.pgt_interest} onCheckedChange={(v) => patch({ pgt_interest: v })} />
      </label>
    </div>
  );
}
