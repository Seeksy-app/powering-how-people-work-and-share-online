import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Card theme colors
const cardTheme = {
  bg: '#0b1730',
  border: '#1a2745',
  text: {
    primary: '#F9FAFB',
    secondary: '#9CA3AF',
    muted: '#6B7280',
  },
  accent: {
    blue: '#3B82F6',
  },
};

interface TruckingCardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

export function TruckingCard({ children, className, padding = "md" }: TruckingCardProps) {
  const paddingClasses = {
    sm: "p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <div 
      className={cn(
        "rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.35)]",
        paddingClasses[padding],
        className
      )}
      style={{ 
        backgroundColor: cardTheme.bg, 
        border: `1px solid ${cardTheme.border}` 
      }}
    >
      {children}
    </div>
  );
}

interface TruckingCardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function TruckingCardHeader({ title, description, action }: TruckingCardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-medium" style={{ color: cardTheme.text.primary }}>
          {title}
        </h3>
        {description && (
          <p className="text-sm mt-0.5" style={{ color: cardTheme.text.muted }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

interface TruckingStatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  accentColor?: string;
}

export function TruckingStatCard({ label, value, icon, accentColor }: TruckingStatCardProps) {
  return (
    <TruckingCard>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: cardTheme.text.muted }}>
            {label}
          </p>
          <p className="text-3xl font-bold mt-1" style={{ color: cardTheme.text.primary }}>
            {value}
          </p>
        </div>
        <div 
          className="h-12 w-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accentColor || cardTheme.accent.blue}15` }}
        >
          {icon}
        </div>
      </div>
    </TruckingCard>
  );
}
