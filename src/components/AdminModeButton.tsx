import { Link, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AdminModeButton() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin") || pathname.startsWith("/widgets")) return null;
  return (
    <Link
      to="/admin/mvp"
      className="fixed top-3 right-3 z-50 group"
      title="Open Admin Command Center"
    >
      <Badge
        variant="outline"
        className="bg-background/95 backdrop-blur shadow-md border-primary/40 text-primary gap-1.5 px-3 py-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        <ShieldCheck className="size-3.5" />
        <span className="text-[10px] uppercase tracking-wider opacity-70 group-hover:opacity-100">Internal</span>
        <span className="font-semibold">Admin Mode</span>
      </Badge>
    </Link>
  );
}
