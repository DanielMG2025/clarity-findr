import { ReactNode, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Database, Users, Building2, Layout, Briefcase, Sparkles, Settings,
  ChevronDown, ChevronRight, Search, Bell, ShieldCheck, ArrowLeft, Plus,
  Home as HomeIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type NavChild = { to: string; label: string };
type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavChild[];
};

const NAV: NavItem[] = [
  {
    to: "/admin/data", label: "Data Intelligence", icon: Database,
    children: [
      { to: "/admin/data", label: "Overview" },
      { to: "/admin/data/imports", label: "Imports" },
      { to: "/admin/pricing-sources", label: "Pricing Sources" },
      { to: "/admin/data/components", label: "Price Components" },
      { to: "/admin/normalize-prices", label: "Normalization" },
      { to: "/admin/data/quotes", label: "Patient Quotes" },
      { to: "/admin/data/review-signals", label: "Review Signals" },
      { to: "/admin/patient-preview", label: "Published Prices" },
      { to: "/admin/data/audit", label: "Audit Log" },
    ],
  },
  {
    to: "/admin/patients", label: "Patient Operations", icon: Users,
    children: [
      { to: "/admin/patients", label: "Overview" },
      { to: "/admin/patients/profiles", label: "Profiles" },
      { to: "/admin/patients/intake", label: "Intake" },
      { to: "/admin/patients/quotes", label: "Quotes" },
      { to: "/admin/patients/documents", label: "Documents" },
      { to: "/admin/patients/community", label: "Community" },
      { to: "/admin/patients/payments", label: "Payments" },
      { to: "/admin/patients/activity", label: "Activity" },
      { to: "/admin/patients/consents", label: "Consents" },
    ],
  },
  {
    to: "/admin/clinics", label: "Clinic Operations", icon: Building2,
    children: [
      { to: "/admin/clinics", label: "Overview" },
      { to: "/admin/clinic-discovery", label: "Discovery" },
      { to: "/admin/clinics/profiles", label: "Profiles" },
      { to: "/admin/clinics/treatments", label: "Treatments" },
      { to: "/admin/pricing", label: "Pricing" },
      { to: "/admin/clinics/leads", label: "Leads" },
      { to: "/admin/clinics/reviews", label: "Reviews" },
      { to: "/admin/clinics/performance", label: "Performance" },
      { to: "/admin/clinics/contracts", label: "Contracts" },
    ],
  },
  {
    to: "/admin/widget-partners", label: "Widget Partners", icon: Layout,
    children: [
      { to: "/admin/widget-partners", label: "Overview" },
      { to: "/admin/partners", label: "Partners" },
      { to: "/admin/widget-partners/widgets", label: "Widgets" },
      { to: "/admin/widget-partners/analytics", label: "Analytics" },
      { to: "/admin/widget-partners/revenue", label: "Revenue Share" },
      { to: "/admin/widget-partners/leads", label: "Leads" },
      { to: "/admin/widget-partners/cobranded", label: "Co-branded Pages" },
    ],
  },
  {
    to: "/admin/service-partners", label: "Service Partners", icon: Briefcase,
    children: [
      { to: "/admin/service-partners", label: "Providers" },
      { to: "/admin/service-partners/referrals", label: "Referrals" },
      { to: "/admin/service-partners/revenue", label: "Revenue" },
      { to: "/admin/service-partners/offers", label: "Offers" },
      { to: "/admin/service-partners/contracts", label: "Contracts" },
      { to: "/admin/service-partners/performance", label: "Performance" },
    ],
  },
  { to: "/admin/demo", label: "Demo Center", icon: Sparkles },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

// Maps any /admin path segment → friendly label for breadcrumbs
const LABELS: Record<string, string> = {
  admin: "Admin",
  data: "Data Intelligence",
  imports: "Imports",
  components: "Price Components",
  quotes: "Patient Quotes",
  "review-signals": "Review Signals",
  audit: "Audit Log",
  patients: "Patient Operations",
  profiles: "Profiles",
  intake: "Intake",
  documents: "Documents",
  community: "Community",
  payments: "Payments",
  activity: "Activity",
  consents: "Consents",
  clinics: "Clinic Operations",
  "clinic-discovery": "Discovery",
  treatments: "Treatments",
  pricing: "Pricing",
  leads: "Leads",
  reviews: "Reviews",
  performance: "Performance",
  contracts: "Contracts",
  "widget-partners": "Widget Partners",
  partners: "Partners",
  widgets: "Widgets",
  analytics: "Analytics",
  revenue: "Revenue Share",
  cobranded: "Co-branded Pages",
  "service-partners": "Service Partners",
  referrals: "Referrals",
  offers: "Offers",
  demo: "Demo Center",
  settings: "Settings",
  mvp: "Command Center",
  upload: "Upload",
  "normalize-prices": "Normalization",
  "patient-preview": "Patient Preview",
  "pricing-sources": "Pricing Sources",
  "pricing-dashboard": "Pricing Dashboard",
  "data-import": "Data Import",
  import: "Import",
};

const ENV: "Demo" | "Staging" | "Production" = "Demo";

function SidebarGroup({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;
  const isInside = pathname === item.to || pathname.startsWith(item.to + "/") ||
    item.children?.some((c) => pathname === c.to) || false;
  const [open, setOpen] = useState(isInside);

  if (!hasChildren) {
    return (
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
            isActive
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )
        }
      >
        <Icon className="size-4" />
        {item.label}
      </NavLink>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
          isInside
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className="size-4" />
        <span className="flex-1 text-left">{item.label}</span>
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
      </button>
      {open && (
        <div className="ml-4 mt-0.5 border-l pl-2 space-y-0.5">
          {item.children!.map((c) => (
            <NavLink
              key={c.to}
              to={c.to}
              end
              className={({ isActive }) =>
                cn(
                  "block px-2.5 py-1.5 text-[13px] rounded-md transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function Crumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  const items = useMemo(() => {
    const acc: { href: string; label: string }[] = [];
    let path = "";
    for (const s of segments) {
      path += "/" + s;
      acc.push({ href: path, label: LABELS[s] ?? s.replace(/-/g, " ") });
    }
    return acc;
  }, [pathname]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <span key={it.href} className="contents">
              <BreadcrumbItem>
                {last ? (
                  <BreadcrumbPage className="capitalize">{it.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={it.href} className="capitalize">{it.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!last && <BreadcrumbSeparator />}
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function AdminLayout({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar */}
      <aside className="w-[248px] shrink-0 border-r bg-background sticky top-0 h-screen flex flex-col">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <div className="size-7 rounded-md bg-primary/10 text-primary grid place-items-center">
            <ShieldCheck className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight">Admin OS</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Internal</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV.map((n) => (
            <SidebarGroup key={n.to} item={n} pathname={pathname} />
          ))}
        </nav>
        <div className="border-t p-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to patient app
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="h-14 border-b bg-background sticky top-0 z-30 flex items-center gap-3 px-4">
          <Link to="/admin/mvp" className="text-muted-foreground hover:text-foreground">
            <HomeIcon className="size-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <Crumbs />
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border bg-muted/40 w-72">
            <Search className="size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search clinics, patients, sources…"
              className="h-6 border-0 bg-transparent p-0 text-xs focus-visible:ring-0"
            />
            <kbd className="text-[10px] text-muted-foreground border rounded px-1">⌘K</kbd>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="size-3.5" /> Quick action
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Create / Open</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/admin/upload">Upload dataset</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/admin/normalize-prices">Normalize price</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/admin/clinic-discovery">Review clinic</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/admin/demo">Open demo</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="icon" variant="ghost" className="relative">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-destructive" />
          </Button>
          <Badge
            variant="outline"
            className={cn(
              "uppercase tracking-wider text-[10px]",
              ENV === "Production" && "bg-destructive/10 text-destructive border-destructive/30",
              ENV === "Staging" && "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300",
              ENV === "Demo" && "bg-primary/10 text-primary border-primary/30",
            )}
          >
            {ENV}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="size-8 rounded-full bg-muted grid place-items-center text-xs font-bold hover:bg-muted/70">
                FC
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin · Fertility Compass</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/admin/settings">Settings</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/">Exit admin</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 min-w-0">
          <div className="container max-w-7xl py-6 space-y-6">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
