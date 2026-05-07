import { Users, FileText, MessagesSquare, ShieldCheck, Activity, Wallet } from "lucide-react";
import { ModuleOverview } from "@/components/admin/ModuleOverview";

const AdminPatientOps = () => (
  <ModuleOverview
    title="Patient Operations"
    subtitle="Manage the patient lifecycle around the Patient Master record."
    kpis={[
      { label: "New patients", value: "47", hint: "last 7 days", icon: <Users className="size-5" /> },
      { label: "Incomplete profiles", value: "118", hint: "<60% blocks done", icon: <FileText className="size-5" /> },
      { label: "Quotes uploaded", value: "62", hint: "this month", icon: <Wallet className="size-5" /> },
      { label: "Leads generated", value: "31", hint: "to clinics/partners", icon: <Activity className="size-5" /> },
      { label: "Pending consents", value: "9", hint: "GDPR / sharing", icon: <ShieldCheck className="size-5" /> },
      { label: "Community activity", value: "214", hint: "weekly posts", icon: <MessagesSquare className="size-5" /> },
    ]}
    shortcuts={[
      { to: "/admin/patients/profiles", title: "Profiles", desc: "Search and inspect Patient Master records." },
      { to: "/admin/patients/intake", title: "Intake", desc: "New patient onboarding and triage queue." },
      { to: "/admin/patients/quotes", title: "Quotes", desc: "Patient-uploaded quotes pending validation." },
      { to: "/admin/patients/documents", title: "Documents", desc: "Medical records, reports, prescriptions." },
      { to: "/admin/patients/community", title: "Community", desc: "Moderate posts, replies and stories." },
      { to: "/admin/patients/payments", title: "Payments", desc: "Patient transactions and refunds." },
      { to: "/admin/patients/activity", title: "Activity", desc: "Timeline across all patient interactions." },
      { to: "/admin/patients/consents", title: "Consents", desc: "Sharing, marketing and data consents." },
    ]}
  />
);

export default AdminPatientOps;
