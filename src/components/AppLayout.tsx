import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./AppSidebar";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";

interface Props {
  children: ReactNode;
}

export function AppLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="no-print h-14 flex items-center gap-2 border-b border-sidebar-border bg-sidebar text-sidebar-foreground sticky top-0 z-30">
            <SidebarTrigger className="ml-3 shrink-0 text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring" />
            <span className="ml-2 min-w-0 truncate font-editorial italic text-base text-sidebar-primary md:text-lg">Your fertility companion</span>
            <div className="ml-auto"><LanguageSwitch /></div>
            <Button asChild size="sm" variant="outline" className="mr-3 h-8 shrink-0 gap-1.5 rounded-full border-sidebar-primary/60 bg-sidebar-primary/10 text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring">
              <Link to="/demo"><Play className="size-3.5" /> Example cases</Link>
            </Button>
          </header>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
