import { NavLink, useLocation } from "react-router-dom";
import { Heart, Sparkles, Compass, Wallet, Building2, Stethoscope, Users, LayoutDashboard } from "lucide-react";
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
  { title: "Mi situación",         url: "/profile",            icon: Heart,        desc: "Tu historia y datos" },
  { title: "Probabilidad orientativa", url: "/clarity-assessment", icon: Compass,  desc: "Factores que pueden influir" },
  { title: "Costes",               url: "/pricing-lab",        icon: Wallet,       desc: "Rangos de precio explicados" },
  { title: "Clínicas",             url: "/clinics",            icon: Building2,    desc: "Opciones que pueden encajar" },
  { title: "Asesoramiento experto",url: "/partners",           icon: Stethoscope,  desc: "Profesionales y servicios" },
  { title: "Comunidad",            url: "/community",          icon: Users,        desc: "Experiencias reales" },
  { title: "Mi espacio",           url: "/account",            icon: LayoutDashboard, desc: "Historial y guardados" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(path + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <NavLink to="/" className="flex items-center gap-2 px-2 py-2 font-bold">
          <span className="grid place-items-center size-8 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow shrink-0">
            <Sparkles className="size-4" />
          </span>
          {!collapsed && <span className="truncate">Fertility Compass</span>}
        </NavLink>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Tu camino</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url} className="flex items-start gap-3">
                      <item.icon className="size-4 mt-0.5 shrink-0" />
                      {!collapsed && (
                        <div className="flex flex-col leading-tight min-w-0">
                          <span className="text-sm font-medium truncate">{item.title}</span>
                          <span className="text-[11px] text-muted-foreground truncate">{item.desc}</span>
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
