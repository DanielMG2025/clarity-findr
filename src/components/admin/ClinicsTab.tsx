import { useEffect, useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KpiCard, SectionHeader } from "./AdminShared";
import { CLINIC_SUBSCRIPTIONS, TIER_LABEL, type SubscriptionTier } from "@/lib/adminMocks";
import { supabase } from "@/integrations/supabase/client";

interface ClinicRow {
  name: string;
  city: string | null;
  country: string;
  tier: string;
  base_price_ivf: number | null;
  base_price_egg_donation: number | null;
  base_price_freezing: number | null;
  rating_score: number | null;
}

const TIER_STYLE: Record<SubscriptionTier, string> = {
  starter: "bg-muted text-muted-foreground border-border",
  growth: "bg-primary/15 text-primary border-primary/40",
  elite: "bg-foreground/10 text-foreground border-foreground/30",
  per_lead: "bg-accent/15 text-accent border-accent/30",
};

export const ClinicsTab = () => {
  const [clinics, setClinics] = useState<ClinicRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("clinics")
        .select("name, city, country, tier, base_price_ivf, base_price_egg_donation, base_price_freezing, rating_score")
        .order("rating_score", { ascending: false, nullsFirst: false })
        .limit(40);
      setClinics((data as ClinicRow[]) || []);
      setLoading(false);
    })();
  }, []);

  const totals = useMemo(() => {
    const mrr = CLINIC_SUBSCRIPTIONS.reduce((s, c) => s + c.mrr_eur, 0);
    const leads = CLINIC_SUBSCRIPTIONS.reduce((s, c) => s + c.leads_mtd, 0);
    const cons = CLINIC_SUBSCRIPTIONS.reduce((s, c) => s + c.consultations_mtd, 0);
    return {
      total: CLINIC_SUBSCRIPTIONS.length,
      mrr,
      leads,
      consultRate: leads ? Math.round((cons / leads) * 100) : 0,
    };
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Clinic management"
        description="Active subscriptions, pricing data and lead performance. Profiles read from production clinic table."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Active clinics" value={totals.total} icon={<Building2 className="size-5" />} />
        <KpiCard label="MRR" value={`€${totals.mrr.toLocaleString()}`} icon={<Building2 className="size-5" />} accent="accent" />
        <KpiCard label="Leads MTD" value={totals.leads} icon={<Building2 className="size-5" />} />
        <KpiCard label="Consult. rate" value={`${totals.consultRate}%`} icon={<Building2 className="size-5" />} accent="accent" />
      </div>

      {/* Subscriptions */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-3">Subscriptions & lead performance</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clinic</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Leads MTD</TableHead>
                <TableHead>Consults MTD</TableHead>
                <TableHead>Conv.</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CLINIC_SUBSCRIPTIONS.map((c) => {
                const conv = c.leads_mtd ? Math.round((c.consultations_mtd / c.leads_mtd) * 100) : 0;
                return (
                  <TableRow key={c.clinic_name}>
                    <TableCell>
                      <div className="font-medium">{c.clinic_name}</div>
                      <div className="text-xs text-muted-foreground">{c.city}, {c.country}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${TIER_STYLE[c.tier]}`}>
                        {TIER_LABEL[c.tier]}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums text-sm">{c.mrr_eur ? `€${c.mrr_eur}` : "—"}</TableCell>
                    <TableCell className="tabular-nums text-sm">{c.leads_mtd}</TableCell>
                    <TableCell className="tabular-nums text-sm">{c.consultations_mtd}</TableCell>
                    <TableCell className="tabular-nums text-sm font-semibold">{conv}%</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {c.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Real clinic profiles & pricing */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-1">Clinic catalog · pricing data</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Live from the platform's clinic table. Used by the matching engine.
        </p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clinic</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>IVF base</TableHead>
                <TableHead>Donation base</TableHead>
                <TableHead>Freezing base</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                    Loading clinic catalog…
                  </TableCell>
                </TableRow>
              )}
              {!loading && clinics.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                    No clinics in catalog yet.
                  </TableCell>
                </TableRow>
              )}
              {clinics.map((c) => (
                <TableRow key={c.name}>
                  <TableCell>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.city || "—"}</div>
                  </TableCell>
                  <TableCell className="text-sm">{c.country}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-[10px]">{c.tier}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {c.base_price_ivf ? `€${c.base_price_ivf.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {c.base_price_egg_donation ? `€${c.base_price_egg_donation.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {c.base_price_freezing ? `€${c.base_price_freezing.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {c.rating_score ? c.rating_score.toFixed(1) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default ClinicsTab;
