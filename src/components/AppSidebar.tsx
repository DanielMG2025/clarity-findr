import { NavLink, useLocation } from "react-router-dom";
import { User, Calculator, Building2, Briefcase, Users, LayoutDashboard, Sparkles } from "lucide-react";
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
  { title: "Mi perfil",    url: "/profile",     icon: User,            desc: "Tus datos y bloques" },
  { title: "Configurador", url: "/pricing-lab", icon: Calculator,      desc: "Estimaciones de coste" },
  { title: "Clínicas",     url: "/clinics",     icon: Building2,       desc: "Comparar y contactar" },
  { title: "Servicios",    url: "/partners",    icon: Briefcase,       desc: "Partners y servicios" },
  { title: "Comunidad",    url: "/community",   icon: Users,           desc: "Experiencias reales" },
  { title: "Mi espacio",   url: "/account",     icon: LayoutDashboard, desc: "Historial y guardados" },
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
          {!collapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
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
