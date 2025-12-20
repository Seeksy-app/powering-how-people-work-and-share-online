import { useEffect, useState, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppLoading } from "@/components/ui/AppLoading";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const STUCK_TIMEOUT_MS = 8000; // 8 seconds before showing "stuck" message

// Page transition variants - subtle fade + slight movement
const pageVariants = {
  initial: { 
    opacity: 0,
    y: 8,
  },
  animate: { 
    opacity: 1,
    y: 0,
  },
  exit: { 
    opacity: 0,
    y: -8,
  },
};

const pageTransition = {
  duration: 0.15,
  ease: "easeOut" as const,
};

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isStuck, setIsStuck] = useState(false);
  const stuckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathRef = useRef(location.pathname);
  const [isReady, setIsReady] = useState(true);

  // Create a stable key that only changes on meaningful route changes
  // This prevents unnecessary remounts within the same route
  const routeKey = useMemo(() => {
    // Use pathname for route identity, ignore search params for smoother nav
    return location.pathname;
  }, [location.pathname]);

  // Clear stuck timer helper
  const clearStuckTimer = () => {
    if (stuckTimer.current) {
      clearTimeout(stuckTimer.current);
      stuckTimer.current = null;
    }
  };

  useEffect(() => {
    const wasPathChange = prevPathRef.current !== location.pathname;
    prevPathRef.current = location.pathname;

    // Skip for board routes - they should load instantly
    const isBoardRoute = location.pathname.startsWith('/board');
    if (isBoardRoute) {
      setIsStuck(false);
      return;
    }

    // Only set up stuck timer on actual path changes
    if (wasPathChange) {
      clearStuckTimer();
      setIsStuck(false);
      setIsReady(false);
      
      // Mark as ready after a brief moment to allow content to mount
      requestAnimationFrame(() => {
        setIsReady(true);
      });

      // Fallback timeout - if still having issues after 8s, show stuck message
      stuckTimer.current = setTimeout(() => {
        console.error('[RouteTransition] Page stuck loading for', STUCK_TIMEOUT_MS, 'ms on route:', location.pathname);
        setIsStuck(true);
      }, STUCK_TIMEOUT_MS);
    }

    return () => clearStuckTimer();
  }, [location.pathname]);

  // Clear stuck timer when component content loads
  useEffect(() => {
    if (isReady && stuckTimer.current) {
      clearStuckTimer();
    }
  }, [isReady]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  // Show stuck/error state
  if (isStuck) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background animate-fade-in">
        <div className="flex flex-col items-center gap-6 max-w-md text-center px-4">
          <div className="relative h-20 w-20 flex items-center justify-center">
            <AlertCircle className="h-16 w-16 text-destructive/70" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
            <p className="text-muted-foreground">
              The page is taking longer than expected to load.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleGoBack}>
              ← Go Back
            </Button>
            <Button onClick={handleReload}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Board routes render children directly without any wrapper
  const isBoardRoute = location.pathname.startsWith('/board');
  if (isBoardRoute) {
    return <>{children}</>;
  }

  // Wrap content in AnimatePresence for smooth page transitions
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className="min-h-full bg-background"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
