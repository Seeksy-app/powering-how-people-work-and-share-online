import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Headphones, Inbox, Zap, FileText, Users, Settings, Link2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions, Permission } from "@/hooks/usePermissions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const navItems: { id: string; label: string; icon: any; path: string; permission: Permission }[] = [
  { id: "tickets", label: "Tickets", icon: Inbox, path: "/helpdesk", permission: "supportdesk.view" },
  { id: "automations", label: "Automations", icon: Zap, path: "/helpdesk/automations", permission: "supportdesk.manage" },
  { id: "templates", label: "Templates", icon: FileText, path: "/helpdesk/templates", permission: "supportdesk.manage" },
  { id: "users", label: "Users", icon: Users, path: "/helpdesk/users", permission: "supportdesk.view" },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "/helpdesk/analytics", permission: "supportdesk.manage" },
  { id: "integrations", label: "Integrations", icon: Link2, path: "/helpdesk/integrations", permission: "supportdesk.settings" },
  { id: "settings", label: "Settings", icon: Settings, path: "/helpdesk/settings", permission: "supportdesk.settings" },
];

export default function HelpDeskLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, hasAnyPermission, isLoading } = usePermissions();

  const getActiveTab = () => {
    if (location.pathname === "/helpdesk" || location.pathname.startsWith("/helpdesk/ticket/")) {
      return "tickets";
    }
    const match = navItems.find(item => location.pathname.startsWith(item.path) && item.path !== "/helpdesk");
    return match?.id || "tickets";
  };

  // Check if user has any support desk permission
  const hasSupportAccess = hasAnyPermission(['supportdesk.view', 'supportdesk.reply', 'supportdesk.manage', 'supportdesk.settings']);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasSupportAccess) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center p-8">
          <Headphones className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to access the Help Desk.</p>
        </div>
      </div>
    );
  }

  const visibleNavItems = navItems.filter(item => hasPermission(item.permission));

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header with tabs */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Headphones className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold">Help Desk</h1>
        </div>
        <Tabs value={getActiveTab()} onValueChange={(v) => {
          const item = navItems.find(i => i.id === v);
          if (item) navigate(item.path);
        }}>
          <TabsList>
            {visibleNavItems.map((item) => (
              <TabsTrigger key={item.id} value={item.id} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
