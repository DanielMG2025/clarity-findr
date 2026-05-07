import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { KpiCard } from "@/components/admin/AdminShared";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type Kpi = { label: string; value: ReactNode; hint?: string; icon: ReactNode };
export type Shortcut = { to: string; title: string; desc: string; status?: string; tone?: "ok" | "warn" | "muted" };

interface Props {
  title: string;
  subtitle: string;
  badge?: string;
  kpis: Kpi[];
  shortcuts: Shortcut[];
  children?: ReactNode;
}

export function ModuleOverview({ title, subtitle, badge, kpis, shortcuts, children }: Props) {
  return (
    <AdminShell title={title} subtitle={subtitle}>
      {badge && (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300">
          {badge}
        </Badge>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} hint={k.hint} icon={k.icon} />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((s) => (
          <Link key={s.to} to={s.to} className="group">
            <Card className="p-4 h-full hover:border-primary/40 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{s.title}</h3>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
              {s.status && (
                <Badge
                  variant="outline"
                  className={
                    s.tone === "warn"
                      ? "mt-3 bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300"
                      : s.tone === "ok"
                        ? "mt-3 bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
                        : "mt-3"
                  }
                >
                  {s.status}
                </Badge>
              )}
            </Card>
          </Link>
        ))}
      </div>
      {children}
    </AdminShell>
  );
}
