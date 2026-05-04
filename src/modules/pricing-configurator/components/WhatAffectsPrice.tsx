import { Card } from "@/components/ui/card";
import { Pill, Repeat, Microscope, Dna, Snowflake, Archive, ArrowRightLeft, FileSearch } from "lucide-react";

const ITEMS = [
  { Icon: Pill,           label: "Medicación",          hint: "La dosis y marca pueden variar el coste 800–2.500€." },
  { Icon: Repeat,         label: "Número de intentos",  hint: "Cada ciclo adicional añade gran parte del coste base." },
  { Icon: Microscope,     label: "ICSI",                hint: "Microinyección espermática: +900–1.500€." },
  { Icon: Dna,            label: "PGT-A",               hint: "Test genético embrionario: +2.200–4.200€." },
  { Icon: Snowflake,      label: "Vitrificación",       hint: "Congelar embriones u óvulos: +400–800€." },
  { Icon: Archive,        label: "Mantenimiento",       hint: "Custodia anual: 250–450€/año." },
  { Icon: ArrowRightLeft, label: "Segunda transferencia", hint: "Transferir un embrión congelado: +600–1.200€." },
  { Icon: FileSearch,     label: "Diagnóstico previo",  hint: "Pruebas adicionales pueden sumar 300–900€." },
];

export function WhatAffectsPrice() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-1">¿Qué puede cambiar el precio?</h3>
      <p className="text-sm text-muted-foreground mb-4">Estos son los factores que más explican las diferencias entre presupuestos.</p>
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
