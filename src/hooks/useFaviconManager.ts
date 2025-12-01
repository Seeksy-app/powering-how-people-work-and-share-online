import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type FaviconMode = "auto" | "default" | "holiday" | "winter";

interface FaviconSettings {
  mode: FaviconMode;
  defaultUrl: string;
  holidayUrl: string;
  winterUrl: string;
}

const DEFAULT_FAVICON_SETTINGS: FaviconSettings = {
  mode: "auto",
  defaultUrl: "/spark/base/spark-icon-32.png",
  holidayUrl: "/spark/holiday/spark-santa-icon-32.png",
  winterUrl: "/spark/base/spark-icon-32.png", // Placeholder until winter variant exists
};

export const useFaviconManager = () => {
  const [faviconUrl, setFaviconUrl] = useState<string>(DEFAULT_FAVICON_SETTINGS.defaultUrl);

  // Fetch favicon settings from database (admin-controlled)
  const { data: settings } = useQuery({
    queryKey: ["favicon-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("*")
        .eq("key", "favicon_settings")
        .single();
      
      if (!data || !data.holiday_mode) return DEFAULT_FAVICON_SETTINGS;
      // For now, use holiday mode from app_settings
      return {
        ...DEFAULT_FAVICON_SETTINGS,
        mode: data.holiday_mode ? "auto" : "default"
      } as FaviconSettings;
    },
  });

  useEffect(() => {
    const currentSettings = settings || DEFAULT_FAVICON_SETTINGS;
    
    let selectedUrl = currentSettings.defaultUrl;

    if (currentSettings.mode === "auto") {
      const now = new Date();
      const month = now.getMonth() + 1; // 1-indexed
      const day = now.getDate();

      // Nov 15 – Jan 2 → Holiday
      if ((month === 11 && day >= 15) || month === 12 || (month === 1 && day <= 2)) {
        selectedUrl = currentSettings.holidayUrl;
      }
      // Jan 3 – Jan 31 → Winter
      else if (month === 1 && day >= 3) {
        selectedUrl = currentSettings.winterUrl;
      }
    } else if (currentSettings.mode === "holiday") {
      selectedUrl = currentSettings.holidayUrl;
    } else if (currentSettings.mode === "winter") {
      selectedUrl = currentSettings.winterUrl;
    }

    setFaviconUrl(selectedUrl);

    // Update favicon link element
    const faviconLink = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (faviconLink) {
      faviconLink.href = selectedUrl;
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.type = "image/png";
      newLink.href = selectedUrl;
      document.head.appendChild(newLink);
    }
  }, [settings]);

  return { faviconUrl };
};
