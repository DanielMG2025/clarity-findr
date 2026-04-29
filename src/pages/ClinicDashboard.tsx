import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  ListChecks,
  BarChart3,
  ArrowRight,
  Save,
  Sparkles,
  TrendingUp,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  Star,
  Crown,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { toast } from "@/hooks/use-toast";

// ---------------- Mock clinic identity ----------------
const CLINIC = {
  name: "Clínica Demo Madrid",
  city: "Madrid",
  country: "Spain",
  plan: "Featured subscription · €499/mo",
};

// ---------------- Mock leads ----------------
type LeadQuality = "high" | "medium" | "low";
type LeadStatus = "new" | "contacted" | "consultation" | "lost";

interface Lead {
  id: string;
  patient_ref: string; // anonymized
  age: number;
  treatment: string;
  budget: string;
  country: string;
  match_score: number;
  conversion_probability: number; // %
  quality: LeadQuality;
  status: LeadStatus;
  source: "free_referral" | "paid_unlock" | "advanced";
  received: string;
}

const MOCK_LEADS: Lead[] = [
  { id: "L-2041", patient_ref: "Patient #2041", age: 34, treatment: "IVF", budget: "€5–8k", country: "Spain", match_score: 92, conversion_probability: 78, quality: "high", status: "new", source: "free_referral", received: "2h ago" },
  { id: "L-2039", patient_ref: "Patient #2039", age: 38, treatment: "Egg Donation", budget: "€8–12k", country: "France", match_score: 88, conversion_probability: 71, quality: "high", status: "contacted", source: "advanced", received: "6h ago" },
  { id: "L-2037", patient_ref: "Patient #2037", age: 31, treatment: "Social Freezing", budget: "€3–5k", country: "Spain", match_score: 81, conversion_probability: 54, quality: "medium", status: "consultation", source: "paid_unlock", received: "1d ago" },
  { id: "L-2032", patient_ref: "Patient #2032", age: 41, treatment: "IVF", budget: "€8–12k", country: "UK", match_score: 76, conversion_probability: 48, quality: "medium", status: "new", source: "free_referral", received: "1d ago" },
  { id: "L-2028", patient_ref: "Patient #2028", age: 29, treatment: "IVF", budget: "<€5k", country: "Portugal", match_score: 64, conversion_probability: 22, quality: "low", status: "lost", source: "paid_unlock", received: "3d ago" },
  { id: "L-2024", patient_ref: "Patient #2024", age: 36, treatment: "ICSI", budget: "€5–8k", country: "Spain", match_score: 84, conversion_probability: 62, quality: "high", status: "contacted", source: "advanced", received: "4d ago" },
];

const QUALITY_STYLE: Record<LeadQuality, string> = {
  high: "bg-accent/15 text-accent border-accent/40",
  medium: "bg-warning/15 text-warning border-warning/30",
  low: "bg-muted text-muted-foreground border-border",
};

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: "bg-primary/15 text-primary border-primary/30",
  contacted: "bg-accent-soft text-accent border-accent/30",
  consultation: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  lost: "bg-muted text-muted-foreground border-border",
};

// ---------------- Page ----------------
const ClinicDashboard = () => {
  // Profile state
  const [profile, setProfile] = useState({
    description:
      "Boutique fertility center specializing in advanced ICSI and donor programs, with on-site genetics lab and bilingual coordinators.",
    success_rate: 62,
    treatments: "IVF, ICSI, Egg Donation, Social Freezing",
  });

  // Pricing state (structured input — aligned with normalization model)
  const [pricing, setPricing] = useState({
    base_ivf: 4200,
    medication_ivf: 1100,
    extras_ivf: 600,
    base_donation: 7500,
    medication_donation: 900,
    extras_donation: 700,
  });

  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);

  const totalIvf = pricing.base_ivf + pricing.medication_ivf + pricing.extras_ivf;
  const totalDonation = pricing.base_donation + pricing.medication_donation + pricing.extras_donation;

  const stats = useMemo(() => {
    const total = leads.length;
    const high = leads.filter((l) => l.quality === "high").length;
    const consultations = leads.filter((l) => l.status === "consultation").length;
    const conv = total ? Math.round((consultations / total) * 100) : 0;
    const avgProb = total ? Math.round(leads.reduce((s, l) => s + l.conversion_probability, 0) / total) : 0;
    return { total, high, conv, avgProb };
  }, [leads]);

  const qualityChart = useMemo(() => {
    const buckets = { High: 0, Medium: 0, Low: 0 };
    leads.forEach((l) => {
      if (l.quality === "high") buckets.High++;
      else if (l.quality === "medium") buckets.Medium++;
      else buckets.Low++;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const advanceStatus = (id: string) => {
    setLeads((ls) =>
      ls.map((l) => {
        if (l.id !== id) return l;
        const order: LeadStatus[] = ["new", "contacted", "consultation", "lost"];
        const next = order[(order.indexOf(l.status) + 1) % order.length];
        return { ...l, status: next };
      }),
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="container max-w-7xl py-10 space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <Link to="/clinic" className="text-sm text-muted-foreground hover:text-primary">
                ← Back to clinics
              </Link>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-extrabold">{CLINIC.name}</h1>
                <Badge variant="outline" className="bg-primary/5 border-primary/30 text-primary">
                  <Crown className="h-3 w-3 mr-1" />
                  {CLINIC.plan}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {CLINIC.city}, {CLINIC.country} · Demo workspace
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/admin/pricing-dashboard">
                Open admin view <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Active leads", value: stats.total, icon: Users, color: "text-primary" },
              { label: "High quality", value: stats.high, icon: Sparkles, color: "text-accent" },
              { label: "Consultation rate", value: `${stats.conv}%`, icon: TrendingUp, color: "text-emerald-600" },
              { label: "Avg conversion prob.", value: `${stats.avgProb}%`, icon: BarChart3, color: "text-primary" },
            ].map((k) => (
              <Card key={k.label} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className="text-2xl font-semibold mt-1 tabular-nums">{k.value}</p>
                  </div>
                  <k.icon className={`size-5 ${k.color}`} />
                </div>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="leads" className="w-full">
            <TabsList className="grid w-full md:w-fit grid-cols-3">
              <TabsTrigger value="leads">
                <Users className="size-4 mr-1.5" /> Leads
              </TabsTrigger>
              <TabsTrigger value="pricing">
                <ListChecks className="size-4 mr-1.5" /> Pricing
              </TabsTrigger>
              <TabsTrigger value="profile">
                <Building2 className="size-4 mr-1.5" /> Profile
              </TabsTrigger>
            </TabsList>

            {/* ========== LEADS ========== */}
            <TabsContent value="leads" className="space-y-6 mt-6">
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Incoming patients</h2>
                    <p className="text-sm text-muted-foreground">
                      Each lead is pre-qualified, scored, and tagged with a predicted conversion probability.
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Match</TableHead>
                        <TableHead>Conv. prob.</TableHead>
                        <TableHead>Quality</TableHead>
                        <TableHead>Treatment / Budget</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell>
                            <div className="font-medium">{l.patient_ref}</div>
                            <div className="text-xs text-muted-foreground">
                              {l.age}y · {l.country} · {l.received}
                            </div>
                          </TableCell>
                          <TableCell className="tabular-nums font-semibold">{l.match_score}%</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full bg-gradient-primary"
                                  style={{ width: `${l.conversion_probability}%` }}
                                />
                              </div>
                              <span className="text-xs tabular-nums">{l.conversion_probability}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`capitalize text-[11px] ${QUALITY_STYLE[l.quality]}`}>
                              {l.quality}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="font-medium">{l.treatment}</div>
                            <div className="text-xs text-muted-foreground">{l.budget}</div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {l.source === "free_referral" && "Free referral"}
                            {l.source === "paid_unlock" && "Paid unlock"}
                            {l.source === "advanced" && "Advanced module"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`capitalize text-[11px] ${STATUS_STYLE[l.status]}`}>
                              {l.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => advanceStatus(l.id)}>
                              Advance
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-semibold mb-4">Lead quality distribution</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={qualityChart}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {qualityChart.map((d) => (
                          <Cell
                            key={d.name}
                            fill={
                              d.name === "High"
                                ? "hsl(var(--accent))"
                                : d.name === "Medium"
                                  ? "hsl(var(--warning))"
                                  : "hsl(var(--muted-foreground))"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>

            {/* ========== PRICING ========== */}
            <TabsContent value="pricing" className="space-y-6 mt-6">
              <Card className="p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold">Structured pricing input</h2>
                  <p className="text-sm text-muted-foreground">
                    Enter your prices in the same structure we use to normalize and compare across the market:
                    <span className="font-semibold text-foreground"> base + medication + extras</span>.
                  </p>
                </div>

                {/* IVF */}
                <div className="rounded-xl border p-4 mb-4">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="font-semibold">IVF cycle</h3>
                    <div className="text-sm">
                      Total:{" "}
                      <span className="text-lg font-extrabold text-primary tabular-nums">
                        €{totalIvf.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { label: "Base price (€)", key: "base_ivf" as const },
                      { label: "Medication estimate (€)", key: "medication_ivf" as const },
                      { label: "Extras / monitoring (€)", key: "extras_ivf" as const },
                    ].map((f) => (
                      <div key={f.key}>
                        <Label className="text-xs">{f.label}</Label>
                        <Input
                          type="number"
                          value={pricing[f.key]}
                          onChange={(e) => setPricing((p) => ({ ...p, [f.key]: Number(e.target.value) || 0 }))}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Egg Donation */}
                <div className="rounded-xl border p-4 mb-4">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="font-semibold">Egg donation</h3>
                    <div className="text-sm">
                      Total:{" "}
                      <span className="text-lg font-extrabold text-primary tabular-nums">
                        €{totalDonation.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { label: "Base price (€)", key: "base_donation" as const },
                      { label: "Medication estimate (€)", key: "medication_donation" as const },
                      { label: "Extras (€)", key: "extras_donation" as const },
                    ].map((f) => (
                      <div key={f.key}>
                        <Label className="text-xs">{f.label}</Label>
                        <Input
                          type="number"
                          value={pricing[f.key]}
                          onChange={(e) => setPricing((p) => ({ ...p, [f.key]: Number(e.target.value) || 0 }))}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" />
                    Aligned with normalization model — ready for matching engine.
                  </div>
                  <Button variant="hero" onClick={() => toast({ title: "Pricing saved", description: "Mock save — published to demo matching engine." })}>
                    <Save className="size-4" /> Save pricing
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* ========== PROFILE ========== */}
            <TabsContent value="profile" className="space-y-6 mt-6">
              <Card className="p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Clinic profile</h2>
                  <p className="text-sm text-muted-foreground">
                    Patients see this on your unlocked clinic card. Differentiate yourself in plain language.
                  </p>
                </div>

                <div>
                  <Label className="text-xs">Treatments offered (comma-separated)</Label>
                  <Input
                    value={profile.treatments}
                    onChange={(e) => setProfile((p) => ({ ...p, treatments: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Reported success rate (%)</Label>
                  <Input
                    type="number"
                    value={profile.success_rate}
                    onChange={(e) => setProfile((p) => ({ ...p, success_rate: Number(e.target.value) || 0 }))}
                    className="mt-1 max-w-[160px]"
                  />
                </div>

                <div>
                  <Label className="text-xs">Differentiation / treatment description</Label>
                  <Textarea
                    rows={5}
                    value={profile.description}
                    onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end">
                  <Button variant="hero" onClick={() => toast({ title: "Profile saved", description: "Mock save — patient-facing card updated." })}>
                    <Pencil className="size-4" /> Save profile
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default ClinicDashboard;
