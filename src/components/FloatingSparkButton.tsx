import { useState, useEffect } from "react";
import { useHolidaySettings } from "@/hooks/useHolidaySettings";

export const FloatingSparkButton = () => {
  const { data: settings } = useHolidaySettings();
  const [sparkImage, setSparkImage] = useState<string>("");

  useEffect(() => {
    // Use holiday logo if holiday mode is enabled, otherwise use regular spark
    const imagePath = settings?.holidayMode 
      ? "/spark/holiday/seeksy-logo-santa.png"
      : "/spark/holiday/seeksy-logo-wreath.png";
    
    setSparkImage(imagePath);
  }, [settings?.holidayMode]);

  if (!sparkImage) return null;

  if (!sparkImage) return null;

  return (
    <div
      id="seeksy-chat-trigger"
      onClick={() => window.dispatchEvent(new Event('openSparkChat'))}
      className="fixed bottom-6 right-6 cursor-pointer transition-transform duration-200 hover:scale-110 animate-bounce"
      style={{ zIndex: 99999 }}
      aria-label="Ask Spark"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          window.dispatchEvent(new Event('openSparkChat'));
        }
      }}
    >
      <img 
        src={sparkImage} 
        alt="Spark assistant" 
        className="block drop-shadow-lg"
        style={{ 
          width: '72px',
          height: 'auto',
          display: 'block'
        }}
      />
    </div>
  );
};
