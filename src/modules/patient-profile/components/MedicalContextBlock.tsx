import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePatientProfileStore } from "../store";

export function MedicalContextBlock() {
  const m = usePatientProfileStore((s) => s.medical);
  const patch = usePatientProfileStore((s) => s.patchMedical);
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <Label className="text-xs">AMH (ng/mL)</Label>
        <Input type="number" step="0.1" value={m.amh ?? ""} onChange={(e) => patch({ amh: e.target.value ? Number(e.target.value) : undefined })} />
      </div>
      <div>
        <Label className="text-xs">FSH (mIU/mL)</Label>
        <Input type="number" step="0.1" value={m.fsh ?? ""} onChange={(e) => patch({ fsh: e.target.value ? Number(e.target.value) : undefined })} />
      </div>
      <div>
        <Label className="text-xs">Antral follicle count</Label>
        <Input type="number" value={m.afc ?? ""} onChange={(e) => patch({ afc: e.target.value ? Number(e.target.value) : undefined })} />
      </div>
      <div>
        <Label className="text-xs">BMI band</Label>
        <select
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          value={m.bmi_band ?? ""}
          onChange={(e) => patch({ bmi_band: (e.target.value || undefined) as typeof m.bmi_band })}
        >
          <option value="">—</option>
          <option value="under">Under</option>
          <option value="normal">Normal</option>
          <option value="over">Over</option>
          <option value="obese">Obese</option>
        </select>
      </div>
      <div>
        <Label className="text-xs">Cycle regularity</Label>
        <select
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          value={m.cycle_regularity ?? ""}
          onChange={(e) => patch({ cycle_regularity: (e.target.value || undefined) as typeof m.cycle_regularity })}
        >
          <option value="">—</option>
          <option value="regular">Regular</option>
          <option value="irregular">Irregular</option>
          <option value="absent">Absent</option>
        </select>
      </div>
      <div>
        <Label className="text-xs">Partner sperm quality</Label>
        <select
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          value={m.partner_sperm_quality ?? ""}
          onChange={(e) => patch({ partner_sperm_quality: (e.target.value || undefined) as typeof m.partner_sperm_quality })}
        >
          <option value="">—</option>
          <option value="normal">Normal</option>
          <option value="mild">Mild factor</option>
          <option value="severe">Severe factor</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>
    </div>
  );
}
