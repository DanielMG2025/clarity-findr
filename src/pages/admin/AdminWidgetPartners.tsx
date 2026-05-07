import { Layout, TrendingUp, Users, DollarSign, Activity, Globe } from "lucide-react";
import { ModuleOverview } from "@/components/admin/ModuleOverview";

const AdminWidgetPartners = () => (
  <ModuleOverview
    title="Widget Partners"
    subtitle="Communities and media partners distributing Fertility Compass widgets."
    kpis={[
      { label: "Active widgets", value: "5", icon: <Layout className="size-5" /> },
      { label: "Partner traffic", value: "7.4k", hint: "30d sessions", icon: <Users className="size-5" /> },
      { label: "Conversion rate", value: "5.8%", hint: "visit → lead", icon: <TrendingUp className="size-5" /> },
      { label: "Revenue share", value: "€6.9k", hint: "MTD", icon: <DollarSign className="size-5" /> },
      { label: "Top community", value: "RA.org", hint: "5.2k visits", icon: <Globe className="size-5" /> },
      { label: "Events captured", value: "21k", hint: "widget_*", icon: <Activity className="size-5" /> },
    ]}
    shortcuts={[
      { to: "/admin/partners", title: "Partners", desc: "Per-partner metrics and embed generator.", status: "4 partners", tone: "ok" },
      { to: "/admin/widget-partners/widgets", title: "Widgets", desc: "Widget catalog (FIV Madrid, Endometriosis, Freezing…)." },
      { to: "/admin/widget-partners/analytics", title: "Analytics", desc: "Funnel: starts → completes → leads." },
      { to: "/admin/widget-partners/revenue", title: "Revenue Share", desc: "Per-partner accruals and payouts." },
      { to: "/admin/widget-partners/leads", title: "Leads", desc: "Leads attributed to widget partners." },
      { to: "/admin/widget-partners/cobranded", title: "Co-branded Pages", desc: "Hosted, branded landing pages." },
    ]}
  />
);

export default AdminWidgetPartners;
