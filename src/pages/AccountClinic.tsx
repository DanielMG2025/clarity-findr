import SiteHeader from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KpiCard } from "@/components/admin/AdminShared";
import { CLINIC_SUBSCRIPTIONS, LEADS, TIER_LABEL } from "@/lib/adminMocks";
import { Building2, Inbox, TrendingUp, Wallet, Download, FileText } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const ME = CLINIC_SUBSCRIPTIONS.find((c) => c.clinic_name === "IVI Barcelona")!;
const myLeads = LEADS.filter((l) => l.clinic_name === ME.clinic_name);
const feesMTD = myLeads.reduce((s, l) => s + l.fee_eur, 0);
const wonRate = Math.round((myLeads.filter((l) => l.status === "consultation").length / myLeads.length) * 100) || 0;

const trend = [
  { week: "W1", leads: 7, consults: 2 },
  { week: "W2", leads: 11, consults: 4 },
  { week: "W3", leads: 9, consults: 4 },
  { week: "W4", leads: 14, consults: 7 },
];

const invoices = [
  { id: "INV-2026-04", amount: 1000, period: "April 2026", status: "Paid" },
  { id: "INV-2026-03", amount: 1000, period: "March 2026", status: "Paid" },
  { id: "INV-2026-02", amount: 1000, period: "February 2026", status: "Paid" },
];

const statusColor: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  consultation: "default",
  contacted: "secondary",
  new: "outline",
  lost: "destructive",
};

const AccountClinic = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Badge variant="outline" className="mb-2">Clinic space</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <Building2 className="size-7 text-primary" /> {ME.clinic_name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {ME.city}, {ME.country} · Plan: <span className="font-semibold text-foreground">{TIER_LABEL[ME.tier]}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Manage plan</Button>
            <Button size="sm">Configure preferences</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          <KpiCard label="Leads MTD" value={ME.leads_mtd} icon={<Inbox className="size-5" />} hint={`${myLeads.length} from premium routing`} />
          <KpiCard label="Consultations" value={ME.consultations_mtd} icon={<TrendingUp className="size-5" />} hint={`${wonRate}% lead → consult`} accent="accent" />
          <KpiCard label="Lead fees MTD" value={`€${feesMTD.toLocaleString()}`} icon={<Wallet className="size-5" />} hint="Paid only on premium" accent="warning" />
          <KpiCard label="MRR" value={`€${ME.mrr_eur.toLocaleString()}`} icon={<FileText className="size-5" />} hint={TIER_LABEL[ME.tier]} accent="muted" />
        </div>

        <Tabs defaultValue="leads">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="leads">Lead inbox</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="billing">Subscription & invoices</TabsTrigger>
            <TabsTrigger value="profile">Clinic profile</TabsTrigger>
          </TabsList>

          {/* Leads */}
          <TabsContent value="leads" className="mt-4">
            <Card className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myLeads.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-xs">{l.patient_ref}</TableCell>
                      <TableCell>{l.treatment}</TableCell>
                      <TableCell><Badge variant="secondary">{l.match_score}/100</Badge></TableCell>
                      <TableCell><Badge variant={l.quality === "high" ? "default" : "outline"}>{l.quality}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{l.source.replace("_", " ")}</TableCell>
                      <TableCell className="font-semibold">€{l.fee_eur}</TableCell>
                      <TableCell><Badge variant={statusColor[l.status]}>{l.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="mt-4 grid md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Weekly leads vs consultations</h3>
              <ChartContainer config={{ leads: { label: "Leads", color: "hsl(var(--primary))" }, consults: { label: "Consults", color: "hsl(var(--accent))" } }} className="h-[240px] w-full">
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="leads" fill="var(--color-leads)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="consults" fill="var(--color-consults)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Quality breakdown</h3>
              <div className="space-y-3 text-sm">
                {(["high", "medium", "low"] as const).map((q) => {
                  const n = myLeads.filter((l) => l.quality === q).length;
                  const pct = myLeads.length ? Math.round((n / myLeads.length) * 100) : 0;
                  return (
                    <div key={q}>
                      <div className="flex justify-between mb-1"><span className="capitalize">{q} quality</span><span className="tabular-nums">{n} · {pct}%</span></div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Higher Decision Engine confidence = higher conversion. Pre-qualification is included in your plan.
              </p>
            </Card>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing" className="mt-4 space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm text-muted-foreground">Current plan</p>
                  <p className="text-xl font-bold">{TIER_LABEL[ME.tier]}</p>
                  <p className="text-xs text-muted-foreground mt-1">Active for {ME.joined_months_ago} months · renews monthly</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Downgrade</Button>
                  <Button size="sm">Upgrade</Button>
                </div>
              </div>
            </Card>
            <Card className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-mono text-xs">{i.id}</TableCell>
                      <TableCell>{i.period}</TableCell>
                      <TableCell className="font-semibold">€{i.amount.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="secondary">{i.status}</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="sm"><Download className="size-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile" className="mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Public profile</h3>
              <p className="text-sm text-muted-foreground">
                What patients see when your clinic appears in their ranked results: pricing, success-rate estimate,
                location, available treatments. Keep this updated to improve match accuracy.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
                <div className="rounded-lg border p-3"><p className="text-muted-foreground text-xs">Treatments</p><p>IVF, ICSI, Egg Donation</p></div>
                <div className="rounded-lg border p-3"><p className="text-muted-foreground text-xs">Avg. IVF price</p><p>€6,400</p></div>
                <div className="rounded-lg border p-3"><p className="text-muted-foreground text-xs">Success rate (est.)</p><p>48%</p></div>
                <div className="rounded-lg border p-3"><p className="text-muted-foreground text-xs">Languages</p><p>ES, EN, FR</p></div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AccountClinic;
