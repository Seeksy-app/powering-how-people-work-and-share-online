import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Show loading state immediately on location change
    setIsTransitioning(true);
    
    // Brief delay to allow new route to mount cleanly
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  if (isTransitioning) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use location.pathname as key to force complete remount of children
  // Wrap in page-container for fade-in animation
  return (
    <div key={location.pathname + location.search} className="page-container min-h-screen bg-background">
      {children}
    </div>
  );
}
