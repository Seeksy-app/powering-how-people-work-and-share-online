import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useLocation } from "react-router-dom";

// ONLY these specific Studio recording routes use dark theme
const DARK_STUDIO_ROUTES = ['/studio/video', '/studio/audio', '/studio/record'];

export function useAutoTheme() {
  const { setTheme, resolvedTheme } = useTheme();
  const location = useLocation();
  
  // Only force dark mode for actual recording studio pages
  const isStudioRecording = DARK_STUDIO_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith(route + '/')
  );
  
  const wasInStudioRecording = useRef(false);

  useEffect(() => {
    if (isStudioRecording) {
      wasInStudioRecording.current = true;
      if (resolvedTheme !== 'dark') {
        setTheme('dark');
      }
      return;
    }

    // Leaving studio or on any other page: force light immediately
    wasInStudioRecording.current = false;
    if (resolvedTheme !== 'light') {
      setTheme('light');
    }
  }, [setTheme, isStudioRecording]); // removed resolvedTheme to avoid re-trigger loops
}
