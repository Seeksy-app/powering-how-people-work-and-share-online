import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Building2,
  Target,
  TrendingUp,
  Video,
  FileText,
  LogOut,
  BarChart3,
  DollarSign,
  Calendar,
  Medal,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBoardViewMode } from '@/hooks/useBoardViewMode';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mainNavItems = [
  {
    id: 'dashboard',
    label: 'Board Dashboard',
    icon: LayoutDashboard,
    path: '/board',
  },
  {
    id: 'videos',
    label: 'Investor Videos',
    icon: Video,
    path: '/board/videos',
  },
];

const businessNavItems = [
  {
    id: 'business-model',
    label: 'Business Model',
    icon: Building2,
    path: '/board/business-model',
  },
  {
    id: 'gtm',
    label: 'GTM Strategy',
    icon: Target,
    path: '/board/gtm',
  },
  {
    id: 'forecasts',
    label: '3-Year AI Forecasts',
    icon: TrendingUp,
    path: '/board/forecasts',
  },
  {
    id: 'docs',
    label: 'Documents',
    icon: FileText,
    path: '/board/docs',
  },
];

const futureNavItems = [
  {
    id: 'financial-tools',
    label: 'Financial Tools',
    icon: DollarSign,
    path: '#',
    disabled: true,
  },
  {
    id: 'creator-analytics',
    label: 'Creator Analytics',
    icon: BarChart3,
    path: '#',
    disabled: true,
  },
  {
    id: 'revenue-streams',
    label: 'Revenue Streams',
    icon: TrendingUp,
    path: '#',
    disabled: true,
  },
  {
    id: 'events-awards',
    label: 'Events & Awards',
    icon: Medal,
    path: '#',
    disabled: true,
  },
  {
    id: 'veteran-programs',
    label: 'Veteran Programs',
    icon: Calendar,
    path: '#',
    disabled: true,
  },
];

export function BoardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { canToggleBoardView, toggleBoardView, isViewingAsBoard } = useBoardViewMode();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleExitBoardView = () => {
    toggleBoardView();
    navigate('/admin');
  };

  const renderNavItem = (item: typeof mainNavItems[0] & { disabled?: boolean }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    const isDisabled = item.disabled;

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          onClick={() => !isDisabled && navigate(item.path)}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
            isDisabled 
              ? 'text-slate-400 cursor-not-allowed opacity-50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
            isActive && !isDisabled && 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
          )}
        >
          <Icon className="w-5 h-5" />
          <span className="font-medium">{item.label}</span>
          {isDisabled && (
            <span className="ml-auto text-xs text-slate-400">Soon</span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="border-r border-slate-200 bg-white">
      <SidebarHeader className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Seeksy</h2>
            <p className="text-xs text-slate-500">Board Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">
            Overview
          </SidebarGroupLabel>
          <SidebarMenu>
            {mainNavItems.map(renderNavItem)}
          </SidebarMenu>
        </SidebarGroup>

        {/* Business Navigation */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">
            Business
          </SidebarGroupLabel>
          <SidebarMenu>
            {businessNavItems.map(renderNavItem)}
          </SidebarMenu>
        </SidebarGroup>

        {/* Future Items */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">
            Coming Soon
          </SidebarGroupLabel>
          <SidebarMenu>
            {futureNavItems.map(renderNavItem)}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-100 space-y-2">
        {canToggleBoardView && isViewingAsBoard && (
          <Button
            variant="outline"
            className="w-full justify-start gap-3 text-slate-600 border-slate-200 hover:bg-slate-50"
            onClick={handleExitBoardView}
          >
            <LayoutDashboard className="w-4 h-4" />
            Exit Board View
          </Button>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
