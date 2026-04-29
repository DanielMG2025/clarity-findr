import SiteHeader from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KpiCard } from "@/components/admin/AdminShared";
import { PARTNERS } from "@/lib/adminMocks";
import { Handshake, Send, TrendingUp, Wallet, Download } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const ME = PARTNERS.find((p) => p.name === "Hertility")!;

const referralsTrend = [
  { month: "Nov", referrals: 28, conversions: 10 },
  { month: "Dec", referrals: 34, conversions: 13 },
  { month: "Jan", referrals: 39, conversions: 15 },
  { month: "Feb", referrals: 44, conversions: 18 },
  { month: "Mar", referrals: 49, conversions: 19 },
  { month: "Apr", referrals: 54, conversions: 22 },
];

const recentReferrals = [
  { id: "R-8841", patient: "P-2041", product: "Hormone panel kit", date: "1d ago", status: "Converted", commission: 18 },
  { id: "R-8840", patient: "P-2039", product: "AMH test",          date: "2d ago", status: "Converted", commission: 12 },
  { id: "R-8838", patient: "P-2037", product: "Hormone panel kit", date: "3d ago", status: "Sample shipped", commission: 0 },
  { id: "R-8836", patient: "P-2032", product: "AMH test",          date: "4d ago", status: "Converted", commission: 12 },
  { id: "R-8833", patient: "P-2024", product: "Full panel",        date: "6d ago", status: "Pending",   commission: 0 },
  { id: "R-8829", patient: "P-1998", product: "Hormone panel kit", date: "9d ago", status: "Converted", commission: 18 },
];

const payouts = [
  { id: "PO-014", period: "April 2026",  amount: 810, status: "Scheduled", date: "May 5" },
  { id: "PO-013", period: "March 2026",  amount: 735, status: "Paid",      date: "Apr 5" },
  { id: "PO-012", period: "February 2026", amount: 690, status: "Paid",    date: "Mar 5" },
];

const AccountPartner = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Badge variant="outline" className="mb-2">Partner space</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <Handshake className="size-7 text-amber-500" /> {ME.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Category: <span className="font-semibold text-foreground">{ME.category_label}</span> · Status:{" "}
              <Badge variant={ME.status === "active" ? "default" : "outline"} className="ml-1">{ME.status}</Badge>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Update catalog</Button>
            <Button size="sm">Payout settings</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          <KpiCard label="Referrals MTD" value={ME.referrals_mtd} icon={<Send className="size-5" />} hint="Patients routed to you" />
          <KpiCard label="Conversion rate" value={`${ME.conversion_rate}%`} icon={<TrendingUp className="size-5" />} hint="Referral → purchase" accent="accent" />
          <KpiCard label="Commissions MTD" value={`€${ME.revenue_share_eur.toLocaleString()}`} icon={<Wallet className="size-5" />} hint="Net of platform fee" accent="warning" />
          <KpiCard label="Next payout" value="€810" icon={<Download className="size-5" />} hint="May 5, 2026" accent="muted" />
        </div>

        <Tabs defaultValue="referrals">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="commissions">Commissions & payouts</TabsTrigger>
            <TabsTrigger value="catalog">Catalog</TabsTrigger>
          </TabsList>

          {/* Referrals */}
          <TabsContent value="referrals" className="mt-4">
            <Card className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReferrals.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell className="font-mono text-xs">{r.patient}</TableCell>
                      <TableCell>{r.product}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === "Converted" ? "default" : r.status === "Pending" ? "outline" : "secondary"}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{r.commission ? `€${r.commission}` : "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Referrals & conversions — last 6 months</h3>
              <ChartContainer
                config={{
                  referrals: { label: "Referrals", color: "hsl(var(--primary))" },
                  conversions: { label: "Conversions", color: "hsl(var(--accent))" },
                }}
                className="h-[280px] w-full"
              >
                <AreaChart data={referralsTrend}>
                  <defs>
                    <linearGradient id="r1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="r2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="referrals" stroke="hsl(var(--primary))" fill="url(#r1)" />
                  <Area type="monotone" dataKey="conversions" stroke="hsl(var(--accent))" fill="url(#r2)" />
                </AreaChart>
              </ChartContainer>
            </Card>
          </TabsContent>

          {/* Commissions */}
          <TabsContent value="commissions" className="mt-4">
            <Card className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payout</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id}</TableCell>
                      <TableCell>{p.period}</TableCell>
                      <TableCell className="font-semibold">€{p.amount}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.date}</TableCell>
                      <TableCell><Badge variant={p.status === "Paid" ? "secondary" : "outline"}>{p.status}</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="sm"><Download className="size-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Catalog */}
          <TabsContent value="catalog" className="mt-4 grid md:grid-cols-3 gap-3">
            {["Hormone panel kit", "AMH single test", "Full fertility panel"].map((p, i) => (
              <Card key={p} className="p-4">
                <p className="font-medium">{p}</p>
                <p className="text-xs text-muted-foreground mt-1">Active · routed by Decision Engine when biomarkers missing</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Commission</span>
                  <span className="font-semibold">€{[18, 12, 26][i]}</span>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AccountPartner;
