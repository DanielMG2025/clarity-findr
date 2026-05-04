import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WhatIsThis } from "@/components/shared/WhatIsThis";

interface Row {
  clinic: string;
  country: string;
  published: number;
  patient_quotes_avg: number | null;
  basic_norm: number;
  premium_norm: number;
  includes: string[];
  excludes: string[];
  why: string;
}

const SAMPLE: Row[] = [
  { clinic: "IVI Madrid",        country: "Spain",          published: 5800, patient_quotes_avg: 6900, basic_norm: 7200,  premium_norm: 11500, includes: ["Base IVF", "Lab"], excludes: ["Medication", "ICSI"], why: "Low headline price, but medication and extras are billed separately." },
  { clinic: "Reprofit",          country: "Czech Republic", published: 3200, patient_quotes_avg: 4100, basic_norm: 4900,  premium_norm: 7800,  includes: ["Base IVF", "Lab", "Vitrification"], excludes: ["Travel"], why: "Cheaper market overall; remember to add travel and accommodation." },
  { clinic: "Ginefiv Barcelona", country: "Spain",          published: 6300, patient_quotes_avg: 7400, basic_norm: 7800,  premium_norm: 12200, includes: ["Base IVF", "Lab", "ICSI"], excludes: ["PGT-A"], why: "Includes ICSI by default; PGT-A is billed separately." },
];

const fmt = (n: number | null) => (n == null ? "—" : `€${n.toLocaleString()}`);

export function ClinicComparison() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-1">Side-by-side clinics</h3>
      <p className="text-sm text-muted-foreground mb-4">
        We compare the published price, what other patients have actually paid and our normalized prices.{" "}
        <WhatIsThis title="What is a normalized price?">
          The price adjusted so every clinic includes the same items (base + medication + common extras). That way you can compare apples to apples.
        </WhatIsThis>
      </p>
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm border-separate border-spacing-y-2">
          <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left">Clinic</th>
              <th className="text-right">Published</th>
              <th className="text-right">Patients</th>
              <th className="text-right">Basic</th>
              <th className="text-right">Premium</th>
              <th className="text-left pl-3">Why it changes</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE.map((r) => (
              <tr key={r.clinic} className="bg-muted/30">
                <td className="p-3 rounded-l-lg">
                  <div className="font-semibold">{r.clinic}</div>
                  <div className="text-[11px] text-muted-foreground">{r.country}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {r.includes.map(i => <Badge key={i} variant="outline" className="text-[10px] bg-accent-soft text-accent border-accent/30">+ {i}</Badge>)}
                    {r.excludes.map(i => <Badge key={i} variant="outline" className="text-[10px] bg-warning/10 text-warning-foreground border-warning/30">– {i}</Badge>)}
                  </div>
                </td>
                <td className="p-3 text-right tabular-nums font-medium">{fmt(r.published)}</td>
                <td className="p-3 text-right tabular-nums font-medium">{fmt(r.patient_quotes_avg)}</td>
                <td className="p-3 text-right tabular-nums font-bold text-accent">{fmt(r.basic_norm)}</td>
                <td className="p-3 text-right tabular-nums font-bold text-primary">{fmt(r.premium_norm)}</td>
                <td className="p-3 pl-3 rounded-r-lg text-xs text-muted-foreground max-w-[240px]">{r.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
