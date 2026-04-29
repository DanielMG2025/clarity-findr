import { useMemo } from "react";
import { Activity, Building2, Users, Crown, Handshake, MessagesSquare, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard, SectionHeader } from "./AdminShared";
import {
  PATIENTS,
  CLINIC_SUBSCRIPTIONS,
  PARTNERS,
  PAYMENTS,
  PLATFORM_KPIS,
  FUNNEL,
} from "@/lib/adminMocks";

export const OverviewTab = () => {
  const subsMrr = useMemo(
    () => CLINIC_SUBSCRIPTIONS.reduce((s, c) => s + c.mrr_eur, 0),
    [],
  );
  const partnerRev = useMemo(
    () => PARTNERS.reduce((s, p) => s + p.revenue_share_eur, 0),
    [],
  );
  const patientRev = useMemo(
    () => PAYMENTS.filter((p) => p.status === "captured").reduce((s, p) => s + p.amount_eur, 0),
    [],
  );
  const totalRev = subsMrr + partnerRev + patientRev;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Platform overview"
        description="Live snapshot across patients, clinics, partners, monetization and the data engine."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="MRR (clinic subs)" value={`€${subsMrr.toLocaleString()}`} icon={<Building2 className="size-5" />} hint={`${CLINIC_SUBSCRIPTIONS.length} clinics`} />
        <KpiCard label="Patient revenue MTD" value={`€${patientRev.toLocaleString()}`} icon={<Users className="size-5" />} accent="accent" hint={`${PAYMENTS.length} unlocks`} />
        <KpiCard label="Partner commissions" value={`€${partnerRev.toLocaleString()}`} icon={<Handshake className="size-5" />} accent="accent" hint={`${PARTNERS.length} partners`} />
        <KpiCard label="Total revenue MTD" value={`€${totalRev.toLocaleString()}`} icon={<TrendingUp className="size-5" />} hint="patient + subs + partners" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="ARPU" value={`€${PLATFORM_KPIS.arpu_eur}`} icon={<Sparkles className="size-5" />} hint="per active patient" />
        <KpiCard label="CAC" value={`€${PLATFORM_KPIS.cac_eur}`} icon={<Activity className="size-5" />} accent="muted" hint="blended paid + organic" />
        <KpiCard label="LTV : CAC" value={`${PLATFORM_KPIS.ltv_to_cac}×`} icon={<Crown className="size-5" />} hint="healthy >3×" />
        <KpiCard label="Match accuracy" value={`${PLATFORM_KPIS.matching_accuracy_pct}%`} icon={<TrendingUp className="size-5" />} hint="vs verified outcomes" />
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-3">Funnel snapshot · this month</h3>
        <div className="space-y-2">
          {FUNNEL.map((s, i) => {
            const pct = (s.count / FUNNEL[0].count) * 100;
            return (
              <div key={s.stage}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{s.stage}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {s.count.toLocaleString()} <span className="opacity-60">· {pct.toFixed(1)}%</span>
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

      <Card className="p-5 bg-card border-2 border-dashed">
        <div className="flex items-start gap-3">
          <MessagesSquare className="size-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">This is a fully manageable, scalable, data-driven business system. </span>
            Patients, clinics, partners and the community feed a single decision engine. Every tab below
            represents a lever you can monitor, moderate or monetize from one place.
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OverviewTab;
