import { Link } from "react-router-dom";
import { ArrowRight, User, Calculator, Building2, Sliders, Layout, Briefcase, TrendingUp } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoPatientPicker } from "@/components/admin/DemoPatientPicker";

const DEMOS = [
  { icon: User, title: "Patient profile demo", route: "/profile",
    desc: "Patient profile blocks: basic data, medical, preferences and documents." },
  { icon: Calculator, title: "Pricing configurator demo", route: "/pricing-lab",
    desc: "Estimates by treatment, age and country with basic/premium/guarantee scenarios." },
  { icon: Building2, title: "Clinic comparison demo", route: "/clinics",
    desc: "Clinic comparator with normalized prices and quality signals." },
  { icon: Sliders, title: "Pricing normalization demo", route: "/admin/normalize-prices",
    desc: "Normalization workbench: source → components → output." },
  { icon: Layout, title: "Widget demo", route: "/widgets/fiv-madrid?partner=demo&color=10b981",
    desc: "Embeddable FIV Madrid widget with per-partner co-branding." },
  { icon: Briefcase, title: "Partner demo", route: "/admin/partners",
    desc: "Partner panel with metrics and an embed generator." },
  { icon: TrendingUp, title: "Investor demo", route: "/insights",
    desc: "Market insights and aggregate metrics for investors." },
];

const AdminDemo = () => {
  return (
    <AdminShell
      title="Demo Center"
      subtitle="Shortcuts to the product's key views for presentations, testing and investors."
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
