import { ReactNode, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BoardSidebar } from './BoardSidebar';
import { BoardTopNav } from './BoardTopNav';
import { BoardFooter } from './BoardFooter';
import { BoardAIChat } from './BoardAIChat';
import { BoardOnboardingTour } from './BoardOnboardingTour';
import { BoardDataModeProvider } from '@/contexts/BoardDataModeContext';
import { useTheme } from 'next-themes';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface BoardLayoutProps {
  children: ReactNode;
}

export function BoardLayout({ children }: BoardLayoutProps) {
  const { setTheme, theme } = useTheme();
  const location = useLocation();

  // Force light theme for board portal main content
  useEffect(() => {
    if (theme !== 'light') {
      setTheme('light');
    }
  }, [theme, setTheme]);

  return (
    <BoardDataModeProvider>
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          {/* Dark sidebar */}
          <BoardSidebar />
          
          {/* Light content area - no left margin or gap */}
          <div className="flex-1 flex flex-col min-w-0 bg-white h-screen overflow-hidden">
            <BoardTopNav />
            <main className="flex-1 bg-slate-50 overflow-auto relative">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 0.15, 
                    ease: 'easeInOut'
                  }}
                  className="max-w-7xl mx-auto px-6 lg:px-8 py-6 pb-16 min-h-full"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
              <BoardFooter />
            </main>
          </div>
        </div>
        
        {/* Board AI Chat Widget */}
        <BoardAIChat />
        
        {/* Onboarding Tour */}
        <BoardOnboardingTour />
      </SidebarProvider>
    </BoardDataModeProvider>
  );
}