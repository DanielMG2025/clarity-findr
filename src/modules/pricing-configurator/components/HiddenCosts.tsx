import { AlertTriangle, Pill, FlaskConical, Archive, Repeat2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ITEMS = [
  {
    Icon: Pill,
    title: "Medicación",
    impact: "Puede duplicar el coste total",
    desc: "La mayoría de clínicas publican el precio del ciclo SIN medicación. Las hormonas suelen sumar entre 1.000 y 2.800 €.",
    severity: "high" as const,
  },
  {
    Icon: FlaskConical,
    title: "Pruebas adicionales",
    impact: "+300 a 900 €",
    desc: "Analíticas hormonales, ecografías de seguimiento, cariotipo o estudios genéticos básicos rara vez vienen incluidos.",
    severity: "medium" as const,
  },
  {
    Icon: Archive,
    title: "Almacenamiento (storage)",
    impact: "+250 a 450 € / año",
    desc: "Mantener óvulos o embriones congelados se factura por año. El primer año puede estar incluido, los siguientes casi nunca.",
    severity: "medium" as const,
  },
  {
    Icon: Repeat2,
    title: "Segundas transferencias",
    impact: "+600 a 1.200 € por intento",
    desc: "Si el primer embrión no implanta, la segunda transferencia (descongelación + procedimiento) suele facturarse aparte.",
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
        <h3 className="text-lg font-bold">Costes ocultos que conviene mirar</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Muchos precios publicados online <strong>no incluyen</strong> estos conceptos. Es la principal causa de que el presupuesto final supere lo esperado.
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
        Pista: pide siempre un <strong>presupuesto cerrado por escrito</strong> que detalle qué entra y qué no antes de empezar el ciclo.
      </p>
    </Card>
  );
}
