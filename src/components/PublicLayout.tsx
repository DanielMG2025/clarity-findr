import type { ReactNode } from "react";
import { MainNav } from "./nav/MainNav";
import SiteFooter from "./SiteFooter";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";

interface Props {
  children: ReactNode;
}

export function PublicLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="no-print sticky top-0 z-40 flex h-10 shrink-0 items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground">
        <MainNav className="min-w-0 overflow-x-auto" />
        <LanguageSwitch />
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
