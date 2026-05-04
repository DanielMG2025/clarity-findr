import { Globe, Users, MessagesSquare, Calculator, UserCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const SOURCES = [
  { Icon: Globe,          title: "Public clinic prices",        desc: "Official price lists and fee pages from European clinic websites." },
  { Icon: Users,          title: "Patient quotes",              desc: "Real quotes patients have shared after their first consultation." },
  { Icon: MessagesSquare, title: "Community & forum data",      desc: "Public conversations and shared experiences about similar treatments." },
  { Icon: Calculator,     title: "Statistical estimates",       desc: "Models that adjust medication, lab and extras based on market patterns." },
  { Icon: UserCircle2,    title: "Profile-based adjustments",   desc: "Age, country and the options you've selected fine-tune the ranges so they're more realistic for you." },
];

export function DataSourcesPanel() {
  return (
    <Card className="p-6 bg-primary-soft/30 border-primary/15">
      <h3 className="text-lg font-bold mb-1">How do we calculate this?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        We blend several data sources to give you a realistic range — not one single, unrealistic number.
      </p>
      <ul className="grid sm:grid-cols-2 gap-3">
        {SOURCES.map(({ Icon, title, desc }) => (
          <li key={title} className="flex gap-3 p-3 rounded-lg bg-background/70 border border-border">
            <div className="size-9 rounded-lg bg-primary-soft grid place-items-center shrink-0">
              <Icon className="size-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold">{title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed mt-0.5">{desc}</div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
