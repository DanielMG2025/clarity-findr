import { NavLink, useLocation } from "react-router-dom";
import { Heart, Sparkles, Compass, FileText, Library, Wallet, Building2, Stethoscope, Users, BookOpen, LayoutDashboard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "My situation",        url: "/situacion",     icon: Heart,        desc: "Your story and data" },
  { title: "My orientation",      url: "/orientacion",   icon: Compass,      desc: "Factors that may influence" },
  { title: "Behind the numbers",  url: "/sources",       icon: FileText,     desc: "Every source, explained" },
  { title: "Reference library",   url: "/library",       icon: Library,      desc: "Every source, curated" },
  { title: "Costs",               url: "/costes",        icon: Wallet,       desc: "Price ranges explained" },
  { title: "Clinics",             url: "/clinicas",      icon: Building2,    desc: "Options that may fit" },
  { title: "Guidance",            url: "/asesoramiento", icon: Stethoscope,  desc: "Professionals and services" },
  { title: "Community",           url: "/community",     icon: Users,        desc: "Real experiences" },
  { title: "Learn",               url: "/aprende",       icon: BookOpen,     desc: "Fertility, explained simply" },
  { title: "My space",            url: "/account",       icon: LayoutDashboard, desc: "History and saved items" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(path + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <NavLink to="/" className="flex items-center gap-2.5 px-2 py-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <span className="grid place-items-center size-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-glow shrink-0">
            <Sparkles className="size-4" />
          </span>
          {!collapsed && (
            <span className="flex flex-col leading-none min-w-0">
              <span className="truncate font-display text-[15px] font-medium tracking-tight text-sidebar-accent-foreground">Fertility Compass</span>
              <span aria-hidden className="mt-1.5 h-px w-12 bg-gradient-to-r from-sidebar-primary/80 to-transparent" />
            </span>
          )}
        </NavLink>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sidebar-primary">Your journey</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="text-sidebar-foreground data-[active=true]:bg-transparent data-[active=true]:text-sidebar-primary data-[active=true]:shadow-[inset_2px_0_0_0_hsl(var(--sidebar-primary))] rounded-none"
                  >
                    <NavLink to={item.url} className="flex items-start gap-3">
                      <item.icon className="size-4 mt-0.5 shrink-0" />
                      {!collapsed && (
                        <div className="flex flex-col leading-tight min-w-0">
                          <span className="text-sm font-medium tracking-tight truncate">{item.title}</span>
                          <span className="text-[11px] text-sidebar-foreground/80 truncate">{item.desc}</span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
