import { Building2, Compass, Star, FileText, Activity, AlertTriangle } from "lucide-react";
import { ModuleOverview } from "@/components/admin/ModuleOverview";

const AdminClinicOps = () => (
  <ModuleOverview
    title="Clinic Operations"
    subtitle="CRM and marketplace operations for European fertility clinics."
    kpis={[
      { label: "Discovery candidates", value: "84", hint: "across EU", icon: <Compass className="size-5" /> },
      { label: "Clinics published", value: "32", hint: "live to patients", icon: <Building2 className="size-5" /> },
      { label: "Leads this week", value: "27", icon: <Activity className="size-5" /> },
      { label: "Incomplete pricing", value: "11", hint: "missing components", icon: <AlertTriangle className="size-5" />, },
      { label: "Pending review", value: "6", hint: "awaiting QA", icon: <FileText className="size-5" /> },
      { label: "Avg rating", value: "4.6", hint: "weighted", icon: <Star className="size-5" /> },
    ]}
    shortcuts={[
      { to: "/admin/clinic-discovery", title: "Discovery", desc: "Identify and import European clinics with pricing detail.", status: "Pipeline active", tone: "ok" },
      { to: "/admin/clinics/profiles", title: "Profiles", desc: "Clinic master records and metadata." },
      { to: "/admin/clinics/treatments", title: "Treatments", desc: "Catalog of services per clinic." },
      { to: "/admin/pricing", title: "Pricing", desc: "Per-clinic pricing dashboard." },
      { to: "/admin/clinics/leads", title: "Leads", desc: "Patient leads sent to clinics." },
      { to: "/admin/clinics/reviews", title: "Reviews", desc: "Aggregated review signals." },
      { to: "/admin/clinics/performance", title: "Performance", desc: "Conversion, response time, NPS." },
      { to: "/admin/clinics/contracts", title: "Contracts", desc: "Commercial terms and revenue share." },
    ]}
  />
);

export default AdminClinicOps;
