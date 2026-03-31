import { BarChart3, Settings, Users, Code2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

export type AdminTab = "dashboard" | "settings";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-md bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            E
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">ELLITE COWORKING</p>
              <p className="text-[11px] text-muted-foreground">Painel Administrativo</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "dashboard"} onClick={() => onTabChange("dashboard")}>
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "settings"} onClick={() => onTabChange("settings")}>
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 pb-2 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5" />
            {!collapsed && <span>Gestão de usuários</span>}
          </div>
          <div className="flex items-center gap-2">
            <Code2 className="h-3.5 w-3.5" />
            {!collapsed && <span>Rastreio de pixel</span>}
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AdminSidebar;