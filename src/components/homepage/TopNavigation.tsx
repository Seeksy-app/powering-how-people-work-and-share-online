import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, ChevronDown, Video, Scissors, Podcast, Calendar, 
  Users, MessageSquare, Ticket, DollarSign, ShieldCheck, Link2, Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

const featureItems = [
  { label: "Media AI Studio", href: "/studio", icon: Video, description: "Professional AI-powered recording" },
  { label: "AI Clips Generator", href: "/studio/clips", icon: Scissors, description: "Auto-extract viral clips" },
  { label: "Podcast Hosting", href: "/podcasts", icon: Podcast, description: "Host & distribute your show" },
  { label: "Meetings & Scheduling", href: "/meetings", icon: Calendar, description: "Book guests & consultations" },
  { label: "CRM + Messaging", href: "/contacts", icon: Users, description: "Manage contacts & outreach" },
  { label: "Events & Ticketing", href: "/events", icon: Ticket, description: "Host events & sell tickets" },
  { label: "Awards & Programs", href: "/awards", icon: MessageSquare, description: "Run recognition programs" },
  { label: "Monetization Tools", href: "/monetization", icon: DollarSign, description: "Ads, sponsors & revenue" },
  { label: "Identity Verification", href: "/identity", icon: ShieldCheck, description: "Blockchain-backed proof" },
  { label: "My Page (Link-in-bio)", href: "/my-page", icon: Link2, description: "Your creator profile" },
];

const simpleLinks = [
  { label: "Pricing", href: "/pricing" },
  { label: "Apps & Tools", href: "/apps-and-tools" },
  { label: "About", href: "/about" },
];

export function TopNavigation() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  const handleNavigation = (href: string) => {
    navigate(href);
    setMobileMenuOpen(false);
    setFeaturesOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0F1A]/95 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-amber-400" />
            <span className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Seeksy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Features Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setFeaturesOpen(true)}
              onMouseLeave={() => setFeaturesOpen(false)}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                Features
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", featuresOpen && "rotate-180")} />
              </button>
              
              {featuresOpen && (
                <div className="absolute top-full left-0 pt-2 w-[320px] z-[100]">
                  <div className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 p-2">
                    {featureItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleNavigation(item.href)}
                        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group text-left"
                      >
                        <item.icon className="h-4 w-4 mt-0.5 text-amber-400/70 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                        <div>
                          <span className="text-sm text-white/90 group-hover:text-white transition-colors block">
                            {item.label}
                          </span>
                          <span className="text-xs text-white/40 block">
                            {item.description}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Simple Links */}
            {simpleLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavigation(link.href)}
                className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/auth?mode=login")}
              className="text-white/80 hover:text-white hover:bg-white/5"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/auth?mode=signup")}
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold hover:opacity-90 shadow-lg shadow-amber-500/20"
            >
              Start Free
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <div className={cn(
          "lg:hidden overflow-hidden transition-all duration-300",
          mobileMenuOpen ? "max-h-[600px] pb-6" : "max-h-0"
        )}>
          <div className="flex flex-col gap-1 pt-4 border-t border-white/10">
            {/* Mobile Features Section */}
            <div className="px-4 py-2">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Features</span>
            </div>
            {featureItems.slice(0, 5).map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.href)}
                className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {item.label}
              </button>
            ))}
            
            {/* Mobile Simple Links */}
            <div className="px-4 py-2 mt-2">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">More</span>
            </div>
            {simpleLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavigation(link.href)}
                className="w-full text-left px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
            
            <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={() => {
                  navigate("/auth?mode=login");
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-center text-white/80 hover:text-white"
              >
                Login
              </Button>
              <Button
                onClick={() => {
                  navigate("/auth?mode=signup");
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold"
              >
                Start Free
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
