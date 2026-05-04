import { Card } from "@/components/ui/card";
import { Pill, Repeat, Microscope, Dna, Snowflake, Archive, ArrowRightLeft, FileSearch } from "lucide-react";

const ITEMS = [
  { Icon: Pill,           label: "Medication",            hint: "Dose and brand can shift the bill by €800–€2,500." },
  { Icon: Repeat,         label: "Number of attempts",    hint: "Each extra cycle adds most of the base cost again." },
  { Icon: Microscope,     label: "ICSI",                  hint: "Sperm microinjection: +€900–€1,500." },
  { Icon: Dna,            label: "PGT-A",                 hint: "Embryo genetic testing: +€2,200–€4,200." },
  { Icon: Snowflake,      label: "Vitrification",         hint: "Freezing eggs or embryos: +€400–€800." },
  { Icon: Archive,        label: "Storage",               hint: "Yearly storage fee: €250–€450/year." },
  { Icon: ArrowRightLeft, label: "Second transfer",       hint: "Frozen embryo transfer: +€600–€1,200." },
  { Icon: FileSearch,     label: "Pre-treatment workup",  hint: "Extra tests can add €300–€900." },
];

export function WhatAffectsPrice() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-1">What can change the price?</h3>
      <p className="text-sm text-muted-foreground mb-4">These are the factors that explain most of the gap between quotes.</p>
      <ul className="grid sm:grid-cols-2 gap-3">
        {ITEMS.map(({ Icon, label, hint }) => (
          <li key={label} className="flex gap-3 p-3 rounded-lg border border-border">
            <div className="size-9 rounded-lg bg-muted grid place-items-center shrink-0">
              <Icon className="size-4 text-foreground/70" />
            </div>
            <div>
              <div className="text-sm font-semibold">{label}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{hint}</div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
