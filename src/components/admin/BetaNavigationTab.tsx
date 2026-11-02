import { useEffect, useMemo, useState } from "react";
import { Activity, MousePointerClick, LogOut, Eye, Info, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { KpiCard, SectionHeader } from "./AdminShared";
import { dropOffs, recentEvents, sessionCount, topLabels, topPages, type BetaEventRow, type CountRow } from "@/modules/beta-analytics/aggregate";

const FETCH_LIMIT = 5000;

function CountList({ title, icon, rows, empty }: { title: string; icon: React.ReactNode; rows: CountRow[]; empty: string }) {
  const max = rows[0]?.count ?? 0;
  return (
    <Card className="p-5">
      <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">{icon} {title}</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.key} className="text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-mono">{r.key}</span>
                <span className="tabular-nums font-semibold">{r.count}</span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${max ? (r.count / max) * 100 : 0}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function BetaNavigationTab() {
  const { language } = useLanguage();
  const es = language === "es";
  const L = (esText: string, enText: string) => (es ? esText : enText);
  const [events, setEvents] = useState<BetaEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("beta_events")
      .select("id, created_at, session_id, user_email, event_type, path, label")
      .order("created_at", { ascending: false })
      .limit(FETCH_LIMIT);
    if (error) setError(error.message);
    setEvents((data ?? []) as BetaEventRow[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const stats = useMemo(() => ({
    sessions: sessionCount(events),
    pages: topPages(events),
    labels: topLabels(events),
    drops: dropOffs(events),
    recent: recentEvents(events, 50),
  }), [events]);

  const empty = L("Todavía no hay datos.", "No data yet.");
  const fmt = (iso: string) => new Date(iso).toLocaleString(es ? "es-ES" : "en-GB", { dateStyle: "short", timeStyle: "short" });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <SectionHeader
          title={L("Beta · Navegación", "Beta · Navigation")}
          description={L(
            "Por dónde se mueven las testers, qué tocan y dónde se quedan. Solo lectura.",
            "Where testers go, what they click and where they stop. Read-only.",
          )}
        />
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-accent/15 text-accent border-accent/30">{L("Primera versión", "First version")}</Badge>
          <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="size-3.5" /> {L("Actualizar", "Refresh")}
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <Info className="size-4 shrink-0 mt-0.5" aria-hidden />
        <p>{L(
          `Solo guardamos metadatos de navegación (ruta sin parámetros, nombre del elemento, tipo, sesión y hora). Nunca lo que la persona escribe. Se analizan los últimos ${FETCH_LIMIT} eventos.`,
          `We only store navigation metadata (path without parameters, element name, type, session and time). Never what people type. Based on the latest ${FETCH_LIMIT} events.`,
        )}</p>
      </div>

      {error && <p className="text-sm text-destructive">{L("No se pudieron cargar los eventos: ", "Couldn't load events: ")}{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label={L("Sesiones", "Sessions")} value={loading ? "…" : stats.sessions} icon={<Activity className="size-5" />} />
        <KpiCard label={L("Eventos", "Events")} value={loading ? "…" : events.length} icon={<Eye className="size-5" />} />
        <KpiCard label={L("Clics registrados", "Tracked clicks")} value={loading ? "…" : events.filter((e) => e.event_type === "click").length} icon={<MousePointerClick className="size-5" />} accent="accent" />
        <KpiCard label={L("Rutas de salida", "Exit paths")} value={loading ? "…" : stats.drops.length} icon={<LogOut className="size-5" />} accent="warning" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <CountList title={L("Páginas más vistas", "Most viewed pages")} icon={<Eye className="size-4 text-primary" />} rows={stats.pages} empty={empty} />
        <CountList title={L("Elementos más clicados", "Most clicked elements")} icon={<MousePointerClick className="size-4 text-accent" />} rows={stats.labels} empty={empty} />
        <CountList title={L("Dónde abandona la gente", "Where people stop")} icon={<LogOut className="size-4 text-warning" />} rows={stats.drops} empty={empty} />
      </div>
      <p className="-mt-2 text-[11px] text-muted-foreground">
        {L("«Dónde abandona» = la última ruta registrada de cada sesión.", "\"Where people stop\" = the last recorded path of each session.")}
      </p>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">{L("Actividad reciente", "Recent activity")}</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{L("Fecha", "Date")}</TableHead>
                <TableHead>{L("Email / sesión", "Email / session")}</TableHead>
                <TableHead>{L("Tipo", "Type")}</TableHead>
                <TableHead>{L("Ruta", "Path")}</TableHead>
                <TableHead>{L("Elemento", "Label")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recent.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-xs text-muted-foreground">{loading ? "…" : empty}</TableCell></TableRow>
              ) : stats.recent.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs tabular-nums whitespace-nowrap">{fmt(e.created_at)}</TableCell>
                  <TableCell className="text-xs">{e.user_email ?? <span className="font-mono text-muted-foreground">{e.session_id.slice(0, 8)}</span>}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{e.event_type}</Badge></TableCell>
                  <TableCell className="text-xs font-mono">{e.path}</TableCell>
                  <TableCell className="text-xs font-mono">{e.label ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
