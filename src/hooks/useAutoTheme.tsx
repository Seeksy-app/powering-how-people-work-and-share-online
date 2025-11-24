import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useLocation } from "react-router-dom";

export function useAutoTheme() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const location = useLocation();
  const isStudio = location.pathname.includes('/studio');

  useEffect(() => {
    // Always force dark mode in Studio
    if (isStudio && resolvedTheme !== 'dark') {
      setTheme('dark');
      return;
    }

    // Don't auto-switch if user explicitly chose light or dark
    if (theme === 'light' || theme === 'dark') {
      return;
    }

    // Skip if not in system/auto mode or if in Studio
    if (theme !== 'system' || isStudio) return;

    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // 7am (7) to 7pm (19) = light mode
      // 7pm (19) to 7am (7) = dark mode
      const shouldBeDark = hour >= 19 || hour < 7;
      const targetTheme = shouldBeDark ? 'dark' : 'light';
      
      if (resolvedTheme !== targetTheme) {
        setTheme(targetTheme);
      }
    };

    // Check immediately
    checkTime();

    // Check every minute
    const interval = setInterval(checkTime, 60000);

    return () => clearInterval(interval);
  }, [theme, resolvedTheme, setTheme, isStudio, location.pathname]);
}
