import { Link } from "react-router-dom";
import { Building2, Construction, ArrowRight, Users, ListChecks, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const ClinicDashboard = () => (
  <div className="min-h-screen flex flex-col">
    <SiteHeader />
    <main className="flex-1 bg-gradient-hero">
      <div className="container max-w-4xl py-16">
        <Link to="/clinic" className="text-sm text-muted-foreground hover:text-primary">
          ← Back
        </Link>
        <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent bg-accent-soft px-3 py-1.5 rounded-full">
          Clinic dashboard · Preview
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold mt-3">Clinic operations workspace</h1>
        <p className="text-muted-foreground mt-3">
          Structured pricing input, profile differentiation, and live lead management — coming next.
        </p>

        <Card className="mt-10 p-8 shadow-elegant bg-gradient-card border-2 border-dashed border-accent/40">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-accent-soft grid place-items-center shrink-0">
              <Construction className="size-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Coming in the next build</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><ListChecks className="size-4 text-primary mt-0.5" /> Structured pricing input (base + meds + extras)</li>
                <li className="flex gap-2"><Building2 className="size-4 text-primary mt-0.5" /> Free-text differentiation & treatment descriptions</li>
                <li className="flex gap-2"><Users className="size-4 text-primary mt-0.5" /> Incoming patient leads with qualification & scoring</li>
                <li className="flex gap-2"><BarChart3 className="size-4 text-primary mt-0.5" /> Conversion analytics</li>
              </ul>
              <Button asChild variant="hero" className="mt-6">
                <Link to="/admin/pricing-dashboard">See admin / demo view <ArrowRight className="size-4" /></Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
    <SiteFooter />
  </div>
);

export default ClinicDashboard;
