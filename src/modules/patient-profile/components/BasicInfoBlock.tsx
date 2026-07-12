import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMasterRecord, type TreatmentInterest, type TryingDuration } from "@/modules/master-record";
import { COUNTRIES, type FamilyStructure } from "@/modules/regulatory";

const TREATMENTS: { v: TreatmentInterest; l: string }[] = [
  { v: "ivf", l: "IVF" },
  { v: "icsi", l: "ICSI" },
  { v: "egg_donation", l: "Egg donation" },
  { v: "social_freezing", l: "Egg freezing" },
  { v: "iui", l: "IUI" },
  { v: "unsure", l: "Not sure yet" },
];

const FAMILY: { v: FamilyStructure; l: string }[] = [
  { v: "hetero_couple", l: "Heterosexual couple" },
  { v: "female_couple", l: "Female couple" },
  { v: "single_woman", l: "Single woman" },
  { v: "male_couple", l: "Male couple" },
];

const TRYING: { v: TryingDuration; l: string }[] = [
  { v: "under_6m", l: "Less than 6 months" },
  { v: "6_12m", l: "6–12 months" },
  { v: "1_2y", l: "1–2 years" },
  { v: "over_2y", l: "More than 2 years" },
  { v: "not_trying", l: "Not trying yet" },
];

const selectClass = "w-full h-10 px-3 rounded-md border border-input bg-background text-sm";

export function BasicInfoBlock() {
  const identity = useMasterRecord((s) => s.identity);
  const intent = useMasterRecord((s) => s.intent);
  const patchIdentity = useMasterRecord((s) => s.patchIdentity);
  const patchIntent = useMasterRecord((s) => s.patchIntent);

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <Label className="text-xs">Age</Label>
        <Input type="number" min={18} max={55} value={identity.age ?? ""} onChange={(e) => patchIdentity({ age: e.target.value ? Number(e.target.value) : undefined })} />
      </div>

      {/* Situational axis — required for the regulatory gate */}
      <div>
        <Label className="text-xs">Country of residence <span className="text-primary">*</span></Label>
        <select className={selectClass} value={identity.country_of_residence ?? ""} onChange={(e) => patchIdentity({ country_of_residence: e.target.value || undefined })}>
          <option value="">Select...</option>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <Label className="text-xs">Family structure <span className="text-primary">*</span></Label>
        <select className={selectClass} value={identity.family_structure ?? ""} onChange={(e) => patchIdentity({ family_structure: (e.target.value || undefined) as FamilyStructure | undefined })}>
          <option value="">Select...</option>
          {FAMILY.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
        </select>
      </div>

      <div>
        <Label className="text-xs">Treatment of interest</Label>
        <select className={selectClass} value={intent.treatment_interest ?? ""} onChange={(e) => patchIntent({ treatment_interest: (e.target.value || undefined) as TreatmentInterest | undefined })}>
          <option value="">Select...</option>
          {TREATMENTS.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
        </select>
      </div>
      <div>
        <Label className="text-xs">Indicative budget (€)</Label>
        <Input type="number" min={0} step={500} value={intent.budget_eur ?? ""} onChange={(e) => patchIntent({ budget_eur: e.target.value ? Number(e.target.value) : undefined })} />
      </div>
      <div>
        <Label className="text-xs">Trying duration</Label>
        <select className={selectClass} value={intent.trying_duration ?? ""} onChange={(e) => patchIntent({ trying_duration: (e.target.value || undefined) as TryingDuration | undefined })}>
          <option value="">Select...</option>
          {TRYING.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
        </select>
      </div>
    </div>
  );
}
