import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, TrendingUp, Sparkles, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KpiCard, SectionHeader } from "./AdminShared";
import { FUNNEL, REVENUE_TIMESERIES, PLATFORM_KPIS } from "@/lib/adminMocks";

export const AnalyticsTab = () => {
  const totalRevSeries = useMemo(
    () => REVENUE_TIMESERIES.map((m) => ({ month: m.month, total: m.patient + m.clinic_subs + m.partner })),
    [],
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Analytics"
        description="Conversion funnel, ARPU, CAC and revenue trajectory."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="ARPU" value={`€${PLATFORM_KPIS.arpu_eur}`} icon={<Sparkles className="size-5" />} hint="per active patient" />
        <KpiCard label="CAC" value={`€${PLATFORM_KPIS.cac_eur}`} icon={<Activity className="size-5" />} accent="muted" hint="blended" />
        <KpiCard label="LTV : CAC" value={`${PLATFORM_KPIS.ltv_to_cac}×`} icon={<TrendingUp className="size-5" />} accent="accent" hint="healthy >3×" />
        <KpiCard label="MAU patients" value={PLATFORM_KPIS.monthly_active_patients.toLocaleString()} icon={<Users className="size-5" />} />
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-3">Conversion funnel · MTD</h3>
        <div className="space-y-2">
          {FUNNEL.map((s, i) => {
            const pct = (s.count / FUNNEL[0].count) * 100;
            const dropoff = i > 0 ? ((FUNNEL[i - 1].count - s.count) / FUNNEL[i - 1].count) * 100 : 0;
            return (
              <div key={s.stage}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{s.stage}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {s.count.toLocaleString()} <span className="opacity-60">· {pct.toFixed(1)}%</span>
                    {i > 0 && (
                      <span className="ml-2 text-warning">−{dropoff.toFixed(0)}%</span>
                    )}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary"
                    style={{ width: `${pct}%`, opacity: 1 - i * 0.08 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-3">Total revenue trajectory</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={totalRevSeries}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="Total revenue (€)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-3">Revenue source mix · trend</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={REVENUE_TIMESERIES}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="patient" stroke="hsl(var(--primary))" name="Patient" />
              <Line type="monotone" dataKey="clinic_subs" stroke="hsl(var(--accent))" name="Clinic subs" />
              <Line type="monotone" dataKey="partner" stroke="hsl(var(--warning))" name="Partner" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
