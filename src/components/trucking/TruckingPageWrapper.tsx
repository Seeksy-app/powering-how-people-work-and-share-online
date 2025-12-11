import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TruckingPageWrapperProps {
  children: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function TruckingPageWrapper({ 
  children, 
  title, 
  description, 
  action,
  className 
}: TruckingPageWrapperProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Page Header - Inside the content area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {description && (
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      
      {/* Main Content */}
      {children}
    </div>
  );
}

interface TruckingContentCardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function TruckingContentCard({ children, className, noPadding }: TruckingContentCardProps) {
  return (
    <div 
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-slate-200",
        !noPadding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

interface TruckingEmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function TruckingEmptyState({ icon, title, description, action }: TruckingEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-slate-900">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface TruckingStatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
}

export function TruckingStatCardLight({ label, value, icon, subtext, trend }: TruckingStatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {subtext && (
            <p className={cn(
              "text-xs mt-1",
              trend === "up" ? "text-green-600" : 
              trend === "down" ? "text-red-600" : 
              "text-slate-400"
            )}>
              {subtext}
            </p>
          )}
        </div>
        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
