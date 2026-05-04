import { Globe, Users, MessagesSquare, Calculator, UserCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const SOURCES = [
  { Icon: Globe,          title: "Precios públicos de clínicas",  desc: "Listas de precios oficiales y secciones de tarifas en webs de clínicas europeas." },
  { Icon: Users,          title: "Cotizaciones de pacientes",      desc: "Presupuestos reales que pacientes han compartido tras su primera consulta." },
  { Icon: MessagesSquare, title: "Datos de comunidad y foros",    desc: "Conversaciones públicas y experiencias compartidas sobre tratamientos similares." },
  { Icon: Calculator,     title: "Estimaciones estadísticas",      desc: "Modelos que ajustan medicación, laboratorio y extras según patrones del mercado." },
  { Icon: UserCircle2,    title: "Ajustes según tu perfil",        desc: "Edad, país y opciones que has marcado modulan los rangos para hacerlos más realistas para ti." },
];

export function DataSourcesPanel() {
  return (
    <Card className="p-6 bg-primary-soft/30 border-primary/15">
      <h3 className="text-lg font-bold mb-1">¿Cómo calculamos esto?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Combinamos varias fuentes de datos para ofrecer un rango realista, no un precio único e irreal.
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
