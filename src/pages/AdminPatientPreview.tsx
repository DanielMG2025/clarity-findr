import { Eye } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ReviewedClinicPricing } from "@/modules/pricing-configurator/components/ReviewedClinicPricing";

const AdminPatientPreview = () => {
  return (
    <AdminShell
      title="Patient preview"
      subtitle="Vista exacta de cómo el paciente verá el precio normalizado tras publicación."
    >
      <div className="rounded-lg border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-200 text-amber-900 p-3 text-sm flex items-start gap-2">
        <Eye className="size-4 mt-0.5 shrink-0" />
        <div>
          <b>This is an admin preview.</b> The patient will only see this after publication from the normalization workbench.
        </div>
      </div>

      <div className="rounded-2xl border bg-background p-4 md:p-6">
        <ReviewedClinicPricing />
      </div>
    </AdminShell>
  );
};

export default AdminPatientPreview;
