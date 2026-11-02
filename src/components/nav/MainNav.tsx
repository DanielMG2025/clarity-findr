import { NavLink } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAdminSession } from "@/components/admin/PillsTab";
import { cn } from "@/lib/utils";

/** The three main destinations, shown in every header. "Check your case" points where the landing's case door does. */
export const MAIN_NAV = [
  { to: "/", end: true, es: "Inicio", en: "Home" },
  { to: "/descubre", end: false, es: "Descubre", en: "Discover" },
  { to: "/situacion", end: false, es: "Estudia tu caso", en: "Check your case" },
] as const;

/** Fourth destination, rendered only when the server confirms the admin role. */
export const ADMIN_NAV = { to: "/admin", end: false, es: "Administración", en: "Admin" } as const;

export function MainNav({ className }: { className?: string }) {
  const { language } = useLanguage();
  const { isAdmin } = useAdminSession();
  const es = language === "es";
  const link = ({ isActive }: { isActive: boolean }) =>
    cn(
      "shrink-0 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors sm:tracking-[0.16em]",
      isActive ? "text-sidebar-primary" : "text-sidebar-foreground/80 hover:text-sidebar-primary",
    );
  const items = isAdmin ? [...MAIN_NAV, ADMIN_NAV] : MAIN_NAV;
  return (
    <nav aria-label={es ? "Navegación principal" : "Main navigation"} className={cn("flex items-center gap-3 sm:gap-5", className)}>
      {items.map((n) => (
        <NavLink key={n.to} to={n.to} end={n.end} className={link}>
          {es ? n.es : n.en}
        </NavLink>
      ))}
    </nav>
  );
}
