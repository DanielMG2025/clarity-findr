import { Link } from "react-router-dom";
import { User, Calculator, Building2, Briefcase, Users, LayoutDashboard, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProfileStore } from "@/modules/profile/store";
import { usePatientProfileStore } from "@/modules/patient-profile/store";
import { overallCompletion } from "@/modules/patient-profile/blocks";

const ACTIONS = [
  { to: "/profile",     icon: User,            title: "Mi perfil",   desc: "Centraliza tus datos. Mejora cada estimación.", tone: "primary" },
  { to: "/pricing-lab", icon: Calculator,      title: "Configurador",desc: "Estima coste real: básico, premium o garantía.", tone: "accent" },
  { to: "/navigator",   icon: Building2,       title: "Clínicas",    desc: "Compara clínicas con precios normalizados.",      tone: "primary" },
  { to: "/partners",    icon: Briefcase,       title: "Servicios",   desc: "Genética, financiación, logística y más.",       tone: "accent" },
  { to: "/community",   icon: Users,           title: "Comunidad",   desc: "Experiencias y presupuestos reales de pacientes.", tone: "primary" },
  { to: "/account",     icon: LayoutDashboard, title: "Mi espacio",  desc: "Historial, guardados y leads enviados.",          tone: "accent" },
] as const;

export default function Home() {
  const profile = useProfileStore();
  const pp = usePatientProfileStore();
  const completion = overallCompletion(profile, pp);

  return (
    <div className="container max-w-6xl py-10 space-y-10">
      <header className="space-y-3 max-w-2xl">
        <Badge variant="secondary" className="text-[11px]">Bienvenida a Fertility Compass</Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">¿Qué quieres hacer hoy?</h1>
        <p className="text-muted-foreground">
          Sin recorridos forzados. Elige por dónde empezar — el sistema se adapta a tus datos en segundo plano.
        </p>
      </header>

      <Card className="p-5 bg-gradient-card border-2">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tu perfil</div>
            <div className="text-lg font-bold">{completion}% completo</div>
          </div>
          <Link to="/profile" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:underline">
            Completar <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <Progress value={completion} className="h-2" />
      </Card>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACTIONS.map((a) => (
          <Link key={a.to} to={a.to} className="group">
            <Card className="p-6 h-full transition-smooth hover:shadow-elegant hover:-translate-y-0.5">
              <div className={`size-11 rounded-2xl grid place-items-center mb-4 ${a.tone === "primary" ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent"}`}>
                <a.icon className="size-5" />
              </div>
              <h3 className="font-bold text-lg">{a.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{a.desc}</p>
              <div className="mt-4 text-sm font-semibold inline-flex items-center gap-1 text-primary">
                Abrir <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
