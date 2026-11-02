import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAdminSession } from "@/components/admin/PillsTab";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { sessionBadge, sessionDisplayName } from "./sessionIdentity";

interface Identity { email: string; name: string }

/** Header chip showing whose session this is; opens a small menu with Admin (admins only) and sign out. */
export function SessionChip({ className }: { className?: string }) {
  const { language } = useLanguage();
  const es = language === "es";
  const { userId, isAdmin } = useAdminSession();
  const [identity, setIdentity] = useState<Identity | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!userId) { setIdentity(null); return; }
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user || cancelled) return;
      const email = user.email ?? "";
      const meta = user.user_metadata as Record<string, unknown> | undefined;
      const metadataName = typeof meta?.full_name === "string" ? meta.full_name : typeof meta?.name === "string" ? meta.name : null;
      let listName: string | null = null;
      if (email) {
        // Only readable where access-list policies allow it (admins); testers fall back silently.
        const { data: row } = await supabase.from("allowed_users").select("name").ilike("email", email).maybeSingle();
        listName = (row as { name?: string | null } | null)?.name ?? null;
      }
      if (!cancelled) setIdentity({ email, name: sessionDisplayName({ email, listName, metadataName }) });
    })();
    return () => { cancelled = true; };
  }, [userId]);

  if (!userId || !identity) return null;

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.assign("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={es ? `Sesión de ${identity.name}` : `Signed in as ${identity.name}`}
        className={cn(
          "inline-flex max-w-[11rem] shrink-0 items-center gap-1.5 rounded-full border border-sidebar-border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/90 transition-colors hover:text-sidebar-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring sm:max-w-[16rem]",
          className,
        )}
      >
        <span className="truncate normal-case tracking-normal">{identity.name}</span>
        <span className={cn("rounded-sm px-1 text-[9px] leading-4", isAdmin ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-sidebar-accent text-sidebar-accent-foreground")}>
          {sessionBadge(isAdmin, es)}
        </span>
        <ChevronDown className="size-3 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="text-xs text-muted-foreground">{es ? "Sesión iniciada como" : "Signed in as"}</p>
          <p className="truncate text-sm font-semibold">{identity.name}</p>
          {identity.email && identity.email !== identity.name && <p className="truncate text-xs text-muted-foreground">{identity.email}</p>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="cursor-pointer"><ShieldCheck className="mr-2 size-4" />{es ? "Administración" : "Admin"}</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={signOut} className="cursor-pointer">
          <LogOut className="mr-2 size-4" />{es ? "Cerrar sesión" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
