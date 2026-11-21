import type { ReactNode } from "react";
import { MainNav } from "./nav/MainNav";
import SiteFooter from "./SiteFooter";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";
import { SessionChip } from "./nav/SessionChip";
import { BetaBanner } from "./beta/BetaBanner";

interface Props {
  children: ReactNode;
}

export function PublicLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BetaBanner />
      {/* Phones: two rows (session + language on top, the full menu below) so nothing is cut off; sm+: one 40px row. */}
      <header className="no-print sticky top-0 z-40 flex h-[4.75rem] shrink-0 flex-col-reverse border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground sm:h-10 sm:flex-row sm:items-center sm:justify-between sm:gap-3" data-testid="public-header">
        <MainNav className="h-9 min-w-0 justify-between overflow-x-auto sm:h-auto sm:justify-start" />
        <div className="flex h-10 shrink-0 items-center justify-end gap-2 border-b border-sidebar-border/60 sm:h-auto sm:border-0 sm:gap-3">
          <SessionChip />
          <LanguageSwitch />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
