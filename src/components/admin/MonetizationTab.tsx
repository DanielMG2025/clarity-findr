import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CreditCard, TrendingUp, Wallet, Building2 } from "lucide-react";
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
import {
  PAYMENTS,
  PAYMENT_SOURCE_LABEL,
  CLINIC_SUBSCRIPTIONS,
  PARTNERS,
  REVENUE_TIMESERIES,
} from "@/lib/adminMocks";

export const MonetizationTab = () => {
  const patientRev = PAYMENTS.filter((p) => p.status === "captured").reduce((s, p) => s + p.amount_eur, 0);
  const subsRev = CLINIC_SUBSCRIPTIONS.reduce((s, c) => s + c.mrr_eur, 0);
  const partnerRev = PARTNERS.reduce((s, p) => s + p.revenue_share_eur, 0);

  const breakdown = useMemo(
    () => [
      { name: "Patient unlocks", value: patientRev, fill: "hsl(var(--primary))" },
      { name: "Clinic subscriptions", value: subsRev, fill: "hsl(var(--accent))" },
      { name: "Partner commissions", value: partnerRev, fill: "hsl(var(--warning))" },
    ],
    [patientRev, subsRev, partnerRev],
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Monetization"
        description="Patient payments, clinic recurring revenue and partner commissions in one ledger."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Patient revenue MTD" value={`€${patientRev.toLocaleString()}`} icon={<CreditCard className="size-5" />} />
        <KpiCard label="Clinic MRR" value={`€${subsRev.toLocaleString()}`} icon={<Building2 className="size-5" />} accent="accent" />
        <KpiCard label="Partner commissions" value={`€${partnerRev.toLocaleString()}`} icon={<Wallet className="size-5" />} accent="accent" />
        <KpiCard label="Total MTD" value={`€${(patientRev + subsRev + partnerRev).toLocaleString()}`} icon={<TrendingUp className="size-5" />} />
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-1">Revenue by source · last 6 months</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Healthy diversification across patient, clinic and partner revenue.
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={REVENUE_TIMESERIES}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="patient" stackId="a" name="Patient unlocks" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="clinic_subs" stackId="a" name="Clinic subs" fill="hsl(var(--accent))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="partner" stackId="a" name="Partner commissions" fill="hsl(var(--warning))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-3">MTD breakdown</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={breakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={160} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {breakdown.map((d) => <Cell key={d.name} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-3">Patient payments · recent</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PAYMENTS.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm font-medium">{p.id}</TableCell>
                  <TableCell className="text-sm">{p.patient_ref}</TableCell>
                  <TableCell className="text-xs">{PAYMENT_SOURCE_LABEL[p.source]}</TableCell>
                  <TableCell className="tabular-nums text-sm font-semibold">€{p.amount_eur}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-[10px]">{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.created_days_ago}d ago</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default MonetizationTab;
