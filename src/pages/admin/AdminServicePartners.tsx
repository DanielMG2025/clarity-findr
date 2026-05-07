import { Briefcase, DollarSign, Users, TrendingUp, FileText, Tag } from "lucide-react";
import { ModuleOverview } from "@/components/admin/ModuleOverview";

const AdminServicePartners = () => (
  <ModuleOverview
    title="Service Partners"
    subtitle="Premium service providers: financing, genetics, travel, home testing, insurance, advisors, wellness."
    kpis={[
      { label: "Referral revenue", value: "€12.4k", hint: "MTD", icon: <DollarSign className="size-5" /> },
      { label: "Active providers", value: "14", icon: <Briefcase className="size-5" /> },
      { label: "Pending referrals", value: "23", icon: <Users className="size-5" /> },
      { label: "Conversion rate", value: "11.2%", icon: <TrendingUp className="size-5" /> },
    ]}
    shortcuts={[
      { to: "/admin/service-partners", title: "Providers", desc: "Manage all premium service providers." },
      { to: "/admin/service-partners/referrals", title: "Referrals", desc: "Inbound and outbound referrals." },
      { to: "/admin/service-partners/revenue", title: "Revenue", desc: "Commissions and payouts." },
      { to: "/admin/service-partners/offers", title: "Offers", desc: "Active deals and bundles.", status: "9 live", tone: "ok" },
      { to: "/admin/service-partners/contracts", title: "Contracts", desc: "Commercial agreements and SLAs.", status: "2 expiring", tone: "warn" },
      { to: "/admin/service-partners/performance", title: "Performance", desc: "Per-provider KPIs.", status: "Live", tone: "ok" },
    ]}
  >
    <div className="flex flex-wrap gap-2 text-xs">
      {["Financing", "Genetics", "Travel", "Home testing", "Insurance", "Advisors", "Wellness"].map((c) => (
        <span key={c} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-background">
          <Tag className="size-3 text-muted-foreground" /> {c}
        </span>
      ))}
    </div>
    <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
      <FileText className="size-3.5" /> Service Partners are distinct from Widget Partners and Clinics.
    </div>
  </ModuleOverview>
);

export default AdminServicePartners;
