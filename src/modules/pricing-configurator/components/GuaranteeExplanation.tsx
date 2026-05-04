import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";

export function GuaranteeExplanation() {
  const cols = [
    {
      title: "Pago por ciclo",
      tone: "border-primary/30 bg-primary-soft/30",
      pros: ["Menor coste inicial", "Flexibilidad si decides parar", "Más control sobre la clínica en cada intento"],
      cons: ["Riesgo acumulado si necesitas varios ciclos", "Sin reembolso si no hay embarazo"],
    },
    {
      title: "Programa garantía / multiciclo",
      tone: "border-expert/30 bg-expert-soft/30",
      pros: ["Coste total predecible", "Reembolso parcial o total si no hay embarazo", "Cobertura para varios intentos"],
      cons: ["Mayor coste inicial", "Criterios de elegibilidad (edad, AMH, etc.)", "Te ata a una clínica concreta"],
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-1">Otra forma de pagar tu tratamiento</h3>
      <p className="text-sm text-muted-foreground mb-5">
        Algunas clínicas ofrecen <strong>programas con garantía</strong>: pagas un precio cerrado por varios intentos y recibes un reembolso si no hay embarazo. No siempre compensa — depende de tu perfil.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {cols.map((c) => (
          <div key={c.title} className={`p-4 rounded-xl border ${c.tone}`}>
            <div className="font-semibold mb-3">{c.title}</div>
            <ul className="space-y-1.5 text-sm">
              {c.pros.map(p => (
                <li key={p} className="flex gap-2 items-start"><Check className="size-4 text-accent shrink-0 mt-0.5" /><span>{p}</span></li>
              ))}
              {c.cons.map(p => (
                <li key={p} className="flex gap-2 items-start text-muted-foreground"><X className="size-4 text-warning shrink-0 mt-0.5" /><span>{p}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
