import SiteHeader from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KpiCard } from "@/components/admin/AdminShared";
import { PATIENTS, PAYMENTS, LEADS, FUNNEL_LABEL, PAYMENT_SOURCE_LABEL } from "@/lib/adminMocks";
import { Heart, Activity, Wallet, Sparkles, Receipt, FileText, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// Pretend we're logged in as P-2032 (premium referral, advanced module purchased)
const ME = PATIENTS.find((p) => p.ref === "P-2032")!;
const myPayments = PAYMENTS.filter((p) => p.patient_ref === ME.ref);
const myLeads = LEADS.filter((l) => l.patient_ref === ME.ref);
const totalSpent = myPayments.reduce((s, p) => s + p.amount_eur, 0);

const interactions = [
  { when: "2 days ago", what: "Premium referral sent to IVI Barcelona", kind: "referral" },
  { when: "3 days ago", what: "Unlocked Advanced module (priority weighting)", kind: "purchase" },
  { when: "3 days ago", what: "Full results unlocked — 14 clinics ranked", kind: "purchase" },
  { when: "5 days ago", what: "Hertility home kit recommendation accepted", kind: "partner" },
  { when: "6 days ago", what: "Completed Level-1 quick assessment", kind: "assessment" },
  { when: "6 days ago", what: "Created free account", kind: "system" },
];

const savedClinics = [
  { name: "IVI Barcelona", country: "Spain", match: 92, price: "€6,400", status: "Consultation booked" },
  { name: "Reproclinic",   country: "Spain", match: 84, price: "€5,900", status: "Saved" },
  { name: "Pronatal Praha", country: "Czech Republic", match: 81, price: "€4,200", status: "Saved" },
];

const tests = [
  { name: "Hertility — Hormone panel", partner: "Hertility", status: "Results received", date: "5 days ago" },
  { name: "Igenomix — Carrier screening", partner: "Igenomix", status: "Sample shipped", date: "1 day ago" },
];

const AccountPatient = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Badge variant="outline" className="mb-2">Patient space</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <Heart className="size-7 text-rose-500" /> Welcome back, {ME.ref}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {ME.country} · {ME.treatment} · stage:{" "}
              <span className="font-semibold text-foreground">{FUNNEL_LABEL[ME.funnel_stage]}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/results">View ranked clinics</Link></Button>
            <Button asChild size="sm"><Link to="/assessment/advanced">Refine my profile</Link></Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid md:grid-cols-4 gap-3">
          <KpiCard label="Match score" value={`${ME.match_score}/100`} icon={<Sparkles className="size-5" />} hint="Based on Level-1 + Level-2" />
          <KpiCard label="Clinics matched" value={myLeads.length || 14} icon={<Activity className="size-5" />} hint="Across saved + referred" accent="accent" />
          <KpiCard label="Total invested" value={`€${totalSpent}`} icon={<Wallet className="size-5" />} hint={`${myPayments.length} transactions`} accent="muted" />
          <KpiCard label="Conversion likelihood" value={`${ME.conversion_probability}%`} icon={<Receipt className="size-5" />} hint="Estimated by engine" accent="warning" />
        </div>

        <Tabs defaultValue="activity">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="matches">My matches</TabsTrigger>
            <TabsTrigger value="tests">Tests & kits</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="profile">Profile & data</TabsTrigger>
          </TabsList>

          {/* Activity */}
          <TabsContent value="activity" className="mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Interaction history</h3>
              <ol className="relative border-l border-border ml-2 space-y-4">
                {interactions.map((it, i) => (
                  <li key={i} className="ml-4">
                    <span className="absolute -left-1.5 size-3 rounded-full bg-primary" />
                    <p className="text-sm font-medium">{it.what}</p>
                    <p className="text-xs text-muted-foreground">{it.when} · {it.kind}</p>
                  </li>
                ))}
              </ol>
            </Card>
          </TabsContent>

          {/* Matches */}
          <TabsContent value="matches" className="mt-4">
            <Card className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clinic</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead>Est. price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedClinics.map((c) => (
                    <TableRow key={c.name}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.country}</TableCell>
                      <TableCell><Badge variant="secondary">{c.match}/100</Badge></TableCell>
                      <TableCell>{c.price}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.status}</TableCell>
                      <TableCell><ChevronRight className="size-4 text-muted-foreground" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Tests */}
          <TabsContent value="tests" className="mt-4 space-y-3">
            {tests.map((t) => (
              <Card key={t.name} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">Partner: {t.partner} · {t.date}</p>
                </div>
                <Badge variant={t.status === "Results received" ? "default" : "outline"}>{t.status}</Badge>
              </Card>
            ))}
            <Card className="p-4 bg-muted/30 border-dashed">
              <p className="text-sm">
                Adding more biomarkers improves your match precision.{" "}
                <Link to="/partners" className="text-primary font-medium underline-offset-4 hover:underline">
                  Browse recommended partners →
                </Link>
              </p>
            </Card>
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments" className="mt-4">
            <Card className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id}</TableCell>
                      <TableCell>{PAYMENT_SOURCE_LABEL[p.source]}</TableCell>
                      <TableCell className="font-semibold">€{p.amount_eur}</TableCell>
                      <TableCell><Badge variant={p.status === "captured" ? "secondary" : "destructive"}>{p.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.created_days_ago}d ago</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText className="size-4" /> Profile</h3>
                <dl className="text-sm space-y-2">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Age</dt><dd>{ME.age}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Country</dt><dd>{ME.country}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Treatment</dt><dd>{ME.treatment}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Budget</dt><dd>{ME.budget_band}</dd></div>
                </dl>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold mb-3">Modules unlocked</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={ME.modules.advanced ? "default" : "outline"}>Advanced matching</Badge>
                  <Badge variant={ME.modules.genetic ? "default" : "outline"}>Genetic screening</Badge>
                  <Badge variant={ME.modules.home_kit ? "default" : "outline"}>Home fertility kit</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Privacy: your data is anonymized before being shared with clinics. Referrals only happen on your explicit consent.
                </p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AccountPatient;
