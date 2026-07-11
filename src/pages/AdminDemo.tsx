import { Link } from "react-router-dom";
import { ArrowRight, User, Calculator, Building2, Sliders, Layout, Briefcase, TrendingUp } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoPatientPicker } from "@/components/admin/DemoPatientPicker";

const DEMOS = [
  { icon: User, title: "Patient profile demo", route: "/profile",
    desc: "Bloques de perfil del paciente: datos básicos, médicos, preferencias y documentos." },
  { icon: Calculator, title: "Pricing configurator demo", route: "/pricing-lab",
    desc: "Estimaciones por tratamiento, edad y país con escenarios básico/premium/garantía." },
  { icon: Building2, title: "Clinic comparison demo", route: "/clinics",
    desc: "Comparador de clínicas con precios normalizados y señales de calidad." },
  { icon: Sliders, title: "Pricing normalization demo", route: "/admin/normalize-prices",
    desc: "Workbench de normalización: source → componentes → output." },
  { icon: Layout, title: "Widget demo", route: "/widgets/fiv-madrid?partner=demo&color=10b981",
    desc: "Widget embebible FIV Madrid con co-branding por partner." },
  { icon: Briefcase, title: "Partner demo", route: "/admin/partners",
    desc: "Panel de partners con métricas y generador de embed." },
  { icon: TrendingUp, title: "Investor demo", route: "/insights",
    desc: "Insights de mercado y métricas agregadas para inversores." },
];

const AdminDemo = () => {
  return (
    <AdminShell
      title="Demo Center"
      subtitle="Atajos a las vistas clave del producto para presentaciones, pruebas e inversores."
    >
      <DemoPatientPicker />

      <h2 className="text-lg font-bold mt-8 mb-3">Product views</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DEMOS.map((d) => (
          <Card key={d.route} className="hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="size-10 grid place-items-center rounded-lg bg-primary/10 text-primary">
                <d.icon className="size-5" />
              </div>
              <CardTitle className="text-base mt-3">{d.title}</CardTitle>
              <CardDescription>{d.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-[11px] font-mono text-muted-foreground truncate">{d.route}</p>
              <Button asChild className="w-full" variant="outline">
                <Link to={d.route} target={d.route.startsWith("/widgets") ? "_blank" : undefined}>
                  Open demo <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
};

export default AdminDemo;
