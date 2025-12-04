import { ReactNode, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BoardSidebar } from './BoardSidebar';
import { BoardTopNav } from './BoardTopNav';
import { BoardFooter } from './BoardFooter';
import { useTheme } from 'next-themes';

interface BoardLayoutProps {
  children: ReactNode;
}

export function BoardLayout({ children }: BoardLayoutProps) {
  const { setTheme, theme } = useTheme();

  // Force light theme for board portal
  useEffect(() => {
    if (theme !== 'light') {
      setTheme('light');
    }
  }, [theme, setTheme]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <BoardSidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <BoardTopNav />
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {children}
            </div>
          </main>
          <BoardFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
