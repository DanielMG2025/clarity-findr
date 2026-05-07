import { Database, Upload, FileSearch, Sliders, Eye, FileText, ShieldCheck, Globe } from "lucide-react";
import { ModuleOverview } from "@/components/admin/ModuleOverview";
import { Card } from "@/components/ui/card";

const STEPS = ["Upload", "Review", "Extract", "Normalize", "Preview", "Publish"];

const AdminDataIntelligence = () => (
  <ModuleOverview
    title="Data Intelligence"
    subtitle="Operational core: ingest, review, normalize and publish pricing intelligence."
    badge="Internal Only · Not visible to patients until approved"
    kpis={[
      { label: "Pending imports", value: "3", hint: "workbooks staged", icon: <Upload className="size-5" /> },
      { label: "Sources to review", value: "8", hint: "raw / extracted", icon: <FileSearch className="size-5" /> },
      { label: "Quotes pending", value: "12", hint: "patient-submitted", icon: <FileText className="size-5" /> },
      { label: "Published prices", value: "24", hint: "live to patients", icon: <ShieldCheck className="size-5" /> },
      { label: "Avg confidence", value: "86%", hint: "across reviewed", icon: <Sliders className="size-5" /> },
      { label: "Country coverage", value: "5", hint: "ES · PT · CZ · GR · DK", icon: <Globe className="size-5" /> },
    ]}
    shortcuts={[
      { to: "/admin/data/imports", title: "Imports", desc: "Drop Excel/CSV with multi-sheet detection.", status: "Drag & drop", tone: "muted" },
      { to: "/admin/pricing-sources", title: "Pricing Sources", desc: "Raw, extracted and reviewed pricing references.", status: "8 to review", tone: "warn" },
      { to: "/admin/normalize-prices", title: "Normalization Workbench", desc: "Source → components → patient-facing output.", status: "3 drafts", tone: "warn" },
      { to: "/admin/data/quotes", title: "Patient Quotes", desc: "Validate user-submitted quotes from real journeys.", status: "12 pending", tone: "warn" },
      { to: "/admin/data/review-signals", title: "Review Signals", desc: "Google, Trustpilot, FindBestClinic, Birdeye ratings.", status: "Aggregating", tone: "ok" },
      { to: "/admin/patient-preview", title: "Published Prices", desc: "Exact patient view after publication.", status: "24 published", tone: "ok" },
    ]}
  >
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Workflow</p>
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
              <span className="size-5 rounded-full bg-background grid place-items-center text-[11px] font-bold">{i + 1}</span>
              {s}
            </span>
            {i < STEPS.length - 1 && <span className="text-muted-foreground">→</span>}
          </li>
        ))}
      </ol>
    </Card>
  </ModuleOverview>
);

export default AdminDataIntelligence;
