import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAdminSession } from "./PillsTab";

/** Discreet link to /admin, rendered only when the server confirms the session has the admin role. */
export function AdminLink({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  const { isAdmin } = useAdminSession();
  if (!isAdmin) return null;
  return (
    <Link to="/admin" className={`inline-flex items-center gap-1.5 ${className}`}>
      <ShieldCheck className="size-3.5" />
      {language === "es" ? "Administración" : "Admin"}
    </Link>
  );
}
