import { ReactNode } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard, Upload, Database, Sliders, Compass, Eye, Sparkles, Settings, ArrowLeft, ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin/mvp", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/upload", label: "Upload", icon: Upload },
  { to: "/admin/pricing-sources", label: "Pricing sources", icon: Database },
  { to: "/admin/normalize-prices", label: "Normalize prices", icon: Sliders },
  { to: "/admin/clinic-discovery", label: "Clinic discovery", icon: Compass },
  { to: "/admin/patient-preview", label: "Patient preview", icon: Eye },
  { to: "/admin/demo", label: "Demo center", icon: Sparkles },
  { to: "/admin", label: "Legacy admin", icon: Settings },
];

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function AdminShell({ title, subtitle, children, actions }: Props) {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b bg-background">
        <div className="container max-w-7xl flex items-center justify-between py-3 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
              <ArrowLeft className="size-4" /> Back to app
            </Link>
            <span className="text-muted-foreground">·</span>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 gap-1">
              <ShieldCheck className="size-3" /> Internal · Admin Mode
            </Badge>
          </div>
          {actions}
        </div>
      </div>

      <div className="container max-w-7xl grid md:grid-cols-[220px_1fr] gap-6 py-6">
        <aside className="md:sticky md:top-4 self-start">
          <nav className="rounded-xl border bg-background p-2 space-y-0.5">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/admin"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <n.icon className="size-4" />
                {n.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 space-y-6">
          <header>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
