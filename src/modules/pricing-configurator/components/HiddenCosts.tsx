import { AlertTriangle, Pill, FlaskConical, Archive, Repeat2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ITEMS = [
  {
    Icon: Pill,
    title: "Medication",
    impact: "Can double the total cost",
    desc: "Most clinics publish the cycle price WITHOUT medication. Hormones usually add €1,000–€2,800.",
    severity: "high" as const,
  },
  {
    Icon: FlaskConical,
    title: "Additional tests",
    impact: "+€300 to €900",
    desc: "Hormonal panels, monitoring ultrasounds, karyotype or basic genetic studies are rarely included.",
    severity: "medium" as const,
  },
  {
    Icon: Archive,
    title: "Storage",
    impact: "+€250 to €450 / year",
    desc: "Keeping eggs or embryos frozen is billed yearly. The first year may be included; the rest almost never are.",
    severity: "medium" as const,
  },
  {
    Icon: Repeat2,
    title: "Second transfers",
    impact: "+€600 to €1,200 per attempt",
    desc: "If the first embryo doesn't implant, the second transfer (thaw + procedure) is usually billed separately.",
    severity: "high" as const,
  },
];

const SEV_CLS = {
  high:   "bg-warning/15 text-warning-foreground border-warning/30",
  medium: "bg-primary-soft text-primary border-primary/30",
};

export function HiddenCosts() {
  return (
    <Card className="p-6 border-warning/30 bg-warning/5">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="size-5 text-warning" />
        <h3 className="text-lg font-bold">Hidden costs worth checking</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Many published prices <strong>don't include</strong> these items. It's the main reason the final bill ends up higher than expected.
      </p>
      <ul className="grid sm:grid-cols-2 gap-3">
        {ITEMS.map(({ Icon, title, impact, desc, severity }) => (
          <li key={title} className="flex gap-3 p-3 rounded-lg bg-background border border-border">
            <div className="size-9 rounded-lg bg-warning/15 grid place-items-center shrink-0">
              <Icon className="size-4 text-warning" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <div className="text-sm font-semibold">{title}</div>
                <Badge variant="outline" className={`text-[10px] ${SEV_CLS[severity]}`}>{impact}</Badge>
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-muted-foreground mt-4 italic">
        Tip: always ask for a <strong>written, all-inclusive quote</strong> that itemizes what's in and what's out before starting a cycle.
      </p>
    </Card>
  );
}
