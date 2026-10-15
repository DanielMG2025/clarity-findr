import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./AppSidebar";

interface Props {
  children: ReactNode;
}

export function AppLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border/70 bg-background/85 backdrop-blur sticky top-0 z-30">
            <SidebarTrigger className="ml-3" />
            <span className="ml-4 truncate font-editorial italic text-base text-muted-foreground md:text-lg">Your fertility companion</span>
            <Button asChild size="sm" variant="outline" className="ml-auto mr-4 h-8 gap-1.5 rounded-full border-accent/50 bg-accent-soft/50 text-primary hover:bg-accent-soft hover:text-primary">
              <Link to="/demo"><Play className="size-3.5" /> Demo mode</Link>
            </Button>
          </header>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
