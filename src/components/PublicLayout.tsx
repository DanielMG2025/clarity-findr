import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import SiteFooter from "./SiteFooter";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";
import { useLanguage } from "@/i18n/LanguageContext";

interface Props {
  children: ReactNode;
}

export function PublicLayout({ children }: Props) {
  const { language } = useLanguage();
  const link = ({ isActive }: { isActive: boolean }) =>
    `text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground/80 hover:text-sidebar-primary"}`;
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="no-print sticky top-0 z-40 flex h-10 shrink-0 items-center justify-between gap-4 border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground">
        <nav className="flex items-center gap-5">
          <NavLink to="/" end className={link}>{language === "es" ? "Inicio" : "Home"}</NavLink>
          <NavLink to="/descubre" className={link}>{language === "es" ? "Descubre" : "Discover"}</NavLink>
        </nav>
        <LanguageSwitch />
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
