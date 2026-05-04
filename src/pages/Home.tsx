import { Link } from "react-router-dom";
import { User, Calculator, Building2, Briefcase, Users, LayoutDashboard, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProfileStore } from "@/modules/profile/store";
import { usePatientProfileStore } from "@/modules/patient-profile/store";
import { overallCompletion } from "@/modules/patient-profile/blocks";

const ACTIONS = [
  { to: "/profile",     icon: User,            title: "My profile",  desc: "Centralize your data. Improves every estimate.",   tone: "primary" },
  { to: "/pricing-lab", icon: Calculator,      title: "Configurator",desc: "Estimate real cost: basic, premium or guarantee.", tone: "accent" },
  { to: "/navigator",   icon: Building2,       title: "Clinics",     desc: "Compare clinics with normalized prices.",          tone: "primary" },
  { to: "/partners",    icon: Briefcase,       title: "Services",    desc: "Genetics, financing, logistics and more.",         tone: "accent" },
  { to: "/community",   icon: Users,           title: "Community",   desc: "Real experiences and quotes from patients.",       tone: "primary" },
  { to: "/account",     icon: LayoutDashboard, title: "My space",    desc: "History, saved items and clinic leads.",           tone: "accent" },
] as const;

export default function Home() {
  const profile = useProfileStore();
  const pp = usePatientProfileStore();
  const completion = overallCompletion(profile, pp);

  return (
    <div className="container max-w-6xl py-10 space-y-10">
      <header className="space-y-3 max-w-2xl">
        <Badge variant="secondary" className="text-[11px]">Welcome to Fertility Compass</Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">What would you like to do today?</h1>
        <p className="text-muted-foreground">
          No forced journeys. Pick where to start — the system adapts to your data in the background.
        </p>
      </header>

      <Card className="p-5 bg-gradient-card border-2">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your profile</div>
            <div className="text-lg font-bold">{completion}% complete</div>
          </div>
          <Link to="/profile" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:underline">
            Complete <ArrowRight className="size-3.5" />
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
                Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
