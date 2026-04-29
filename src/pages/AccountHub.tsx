import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Building2, Handshake, ArrowRight, Lock } from "lucide-react";

const portals = [
  {
    to: "/account/patient",
    icon: Heart,
    title: "Patient space",
    role: "For patients",
    desc: "Your assessments, unlocked clinics, partner tests, payments and saved matches — all in one place.",
    points: ["Match history & saved clinics", "Test results & partner kits", "Payments & receipts"],
    accent: "from-rose-500/15 to-rose-500/5 text-rose-500",
  },
  {
    to: "/account/clinic",
    icon: Building2,
    title: "Clinic space",
    role: "For clinics",
    desc: "Incoming qualified leads, conversion analytics, subscription, invoices and lead-quality dashboard.",
    points: ["Lead inbox & pipeline", "Subscription & invoices", "Conversion analytics"],
    accent: "from-primary/15 to-primary/5 text-primary",
  },
  {
    to: "/account/partner",
    icon: Handshake,
    title: "Partner space",
    role: "For partners",
    desc: "Referrals sent, conversion rates, commissions earned and payout schedule across the platform.",
    points: ["Referrals & conversions", "Commissions ledger", "Next payout"],
    accent: "from-amber-500/15 to-amber-500/5 text-amber-500",
  },
];

const AccountHub = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-12">
        <div className="max-w-2xl mb-10">
          <Badge variant="outline" className="mb-3">Private spaces</Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Your private workspace</h1>
          <p className="text-muted-foreground mt-3">
            Every actor on the platform — patients, clinics and partners — has their own space to track activity,
            interactions, interests and money flow. Pick yours.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {portals.map((p) => (
            <Link key={p.to} to={p.to} className="group">
              <Card className="p-6 h-full transition-smooth hover:shadow-elegant hover:-translate-y-0.5 border-border/60">
                <div className={`size-12 rounded-xl bg-gradient-to-br ${p.accent} grid place-items-center mb-4`}>
                  <p.icon className="size-5" />
                </div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.role}</p>
                <h3 className="text-xl font-bold mt-1">{p.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{p.desc}</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center justify-between text-sm font-medium text-primary">
                  Open space <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mt-8 p-4 flex items-start gap-3 bg-muted/30 border-dashed">
          <Lock className="size-4 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Demo mode — these workspaces are read-only previews seeded with sample activity. In production each space
            sits behind authentication and shows only data tied to the signed-in account.
          </p>
        </Card>
      </main>
    </div>
  );
};

export default AccountHub;
