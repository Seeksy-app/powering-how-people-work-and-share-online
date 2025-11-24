import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user ID and load their theme preference
    const loadThemePreference = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("theme_preference")
        .eq("user_id", user.id)
        .single();

      if (prefs?.theme_preference && prefs.theme_preference !== theme) {
        setTheme(prefs.theme_preference);
      }
    };

    loadThemePreference();
  }, []);

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);

    if (!userId) return;

    // Save to database
    const { error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: userId,
        theme_preference: newTheme,
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error("Theme save error:", error);
      toast({
        title: "Error saving theme",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Theme updated",
        description: `Theme changed to ${newTheme}`,
      });
    }
  };

  const getThemeIcon = () => {
    if (theme === "light") return <Sun className="h-[1.2rem] w-[1.2rem]" />;
    if (theme === "dark") return <Moon className="h-[1.2rem] w-[1.2rem]" />;
    return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-background">
          {getThemeIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover z-50">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>Auto (Time-based)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}