import { Link } from "react-router-dom";
import {
  Mic, Video, Scissors, Headphones, Calendar, Users, 
  Mail, CalendarDays, Trophy, DollarSign, Sparkles, ArrowRight,
  LayoutGrid, BookOpen, HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureItem {
  icon: any;
  label: string;
  description: string;
  href: string;
}

const CORE_TOOLS: FeatureItem[] = [
  { icon: Video, label: "Media AI Studio", description: "Record & stream with AI enhancements", href: "/studio" },
  { icon: Scissors, label: "AI Clips Generator", description: "Turn videos into viral clips", href: "/studio/clips" },
  { icon: Headphones, label: "Podcast Hosting", description: "Host & distribute your podcast", href: "/podcasts" },
  { icon: Calendar, label: "Meetings & Scheduling", description: "Book calls with ease", href: "/meetings" },
  { icon: Users, label: "CRM + Messaging", description: "Manage contacts & campaigns", href: "/contacts" },
  { icon: CalendarDays, label: "Events & Ticketing", description: "Host & sell tickets", href: "/events" },
  { icon: Trophy, label: "Awards & Programs", description: "Run award ceremonies", href: "/awards" },
  { icon: DollarSign, label: "Monetization Tools", description: "Earn from your content", href: "/revenue" },
];

const USE_CASES = [
  { label: "For Podcasters", href: "/use-cases/podcasters" },
  { label: "For Creators", href: "/use-cases/creators" },
  { label: "For Event Hosts", href: "/use-cases/events" },
  { label: "For Agencies", href: "/use-cases/agencies" },
  { label: "For Businesses", href: "/use-cases/business" },
];

interface FeaturesMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeaturesMegaMenu({ isOpen, onClose }: FeaturesMegaMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute top-full left-0 right-0 z-50 mt-2 mx-auto max-w-5xl">
        <div className="bg-popover/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-12 divide-x divide-border">
            {/* Core Tools - 6 cols */}
            <div className="col-span-6 p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Core Tools
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {CORE_TOOLS.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg transition-colors",
                      "hover:bg-accent group"
                    )}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Use Cases - 3 cols */}
            <div className="col-span-3 p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Use Cases
              </h3>
              <div className="space-y-1">
                {USE_CASES.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <ArrowRight className="h-3 w-3" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* CTAs - 3 cols */}
            <div className="col-span-3 p-5 bg-muted/30">
              <div className="space-y-3">
                <Link
                  to="/apps-and-tools"
                  onClick={onClose}
                  className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Explore All Apps</p>
                    <p className="text-xs text-muted-foreground">Browse the full directory</p>
                  </div>
                </Link>

                <Link
                  to="/studio"
                  onClick={onClose}
                  className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-violet-500 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Try Playground</p>
                    <p className="text-xs text-muted-foreground">Start creating instantly</p>
                  </div>
                </Link>

                <div className="pt-3 border-t border-border space-y-2">
                  <Link
                    to="/docs"
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    Documentation
                  </Link>
                  <Link
                    to="/help"
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Help Center
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
