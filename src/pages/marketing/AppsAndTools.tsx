import { TopNavigation } from "@/components/homepage/TopNavigation";
import { FooterSection } from "@/components/homepage/FooterSection";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Sparkles, Video, Scissors, Podcast, Link2, Calendar, Users, 
  MessageSquare, Mail, Ticket, DollarSign, ShieldCheck, FolderOpen, 
  Play, LayoutDashboard, Megaphone, Trophy, ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const tools = [
  {
    icon: Video,
    title: "Media AI Studio",
    description: "Professional recording studio with AI-powered enhancements, noise reduction, and multi-track support.",
    href: "/studio",
    color: "from-violet-500 to-purple-600"
  },
  {
    icon: Scissors,
    title: "AI Clips Generator",
    description: "Automatically extract viral-worthy clips from your long-form content with AI scene detection.",
    href: "/studio/clips",
    color: "from-pink-500 to-rose-600"
  },
  {
    icon: Podcast,
    title: "Podcast Hosting & RSS",
    description: "Host your podcast with unlimited storage, automatic RSS distribution to all major platforms.",
    href: "/podcasts",
    color: "from-amber-500 to-orange-600"
  },
  {
    icon: Link2,
    title: "My Page (Link-in-bio)",
    description: "Create a stunning creator profile page to showcase all your content in one shareable link.",
    href: "/my-page",
    color: "from-cyan-500 to-blue-600"
  },
  {
    icon: Calendar,
    title: "Meetings & Scheduling",
    description: "Professional booking pages for podcast guests, consultations, and collaborations.",
    href: "/meetings",
    color: "from-emerald-500 to-green-600"
  },
  {
    icon: Users,
    title: "CRM Lite",
    description: "Manage your contacts, track interactions, and nurture relationships with your audience.",
    href: "/contacts",
    color: "from-blue-500 to-indigo-600"
  },
  {
    icon: MessageSquare,
    title: "SMS Messaging",
    description: "Send text message campaigns to your audience with scheduling and automation.",
    href: "/sms",
    color: "from-green-500 to-emerald-600"
  },
  {
    icon: Mail,
    title: "Email Marketing",
    description: "Create beautiful email campaigns, newsletters, and automated sequences.",
    href: "/email",
    color: "from-red-500 to-pink-600"
  },
  {
    icon: Ticket,
    title: "Events & Ticketing",
    description: "Host virtual, hybrid, or in-person events with built-in ticketing and registration.",
    href: "/events",
    color: "from-purple-500 to-violet-600"
  },
  {
    icon: DollarSign,
    title: "Monetization Tools",
    description: "Multiple revenue streams including ads, sponsorships, and premium content.",
    href: "/monetization",
    color: "from-yellow-500 to-amber-600"
  },
  {
    icon: ShieldCheck,
    title: "Identity Verification",
    description: "Blockchain-backed voice and face verification to prove content authenticity.",
    href: "/identity",
    color: "from-teal-500 to-cyan-600"
  },
  {
    icon: FolderOpen,
    title: "Media Vault",
    description: "Secure storage for all your media assets with organization and quick access.",
    href: "/media-vault",
    color: "from-slate-500 to-gray-600"
  },
  {
    icon: Play,
    title: "Studio Quick Launch",
    description: "Start recording in seconds with pre-configured templates and one-click setup.",
    href: "/studio",
    color: "from-rose-500 to-red-600"
  },
  {
    icon: LayoutDashboard,
    title: "Creator Dashboard",
    description: "Your personalized command center with analytics, tasks, and quick actions.",
    href: "/dashboard",
    color: "from-indigo-500 to-blue-600"
  },
  {
    icon: Megaphone,
    title: "Advertiser Tools",
    description: "Create and manage advertising campaigns to reach targeted audiences.",
    href: "/advertiser",
    color: "from-orange-500 to-red-600"
  },
  {
    icon: Trophy,
    title: "Awards & Events",
    description: "Run award programs, voting campaigns, and recognition events.",
    href: "/awards",
    color: "from-amber-400 to-yellow-500"
  }
];

export default function AppsAndTools() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-white">
      <TopNavigation />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 text-white/60 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Homepage
          </Button>
          
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-8 h-8 text-amber-400" />
              <span className="text-amber-400 font-semibold">Apps & Tools</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Everything You Need to Create, Grow & Monetize
            </h1>
            
            <p className="text-lg text-white/70 mb-8">
              Discover the complete suite of Seeksy tools designed to help creators 
              build their brand, engage their audience, and turn passion into profit.
            </p>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="container mx-auto px-4 py-8 pb-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {tools.map((tool) => (
              <button
                key={tool.title}
                onClick={() => navigate(tool.href)}
                className="group relative bg-slate-800/40 hover:bg-slate-800/60 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all text-left"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <tool.icon className="w-5 h-5 text-white" />
                </div>
                
                <h3 className="font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {tool.title}
                </h3>
                
                <p className="text-sm text-white/50 leading-relaxed">
                  {tool.description}
                </p>
                
                <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-xl mx-auto bg-gradient-to-br from-amber-400/10 to-orange-500/10 rounded-3xl p-8 border border-amber-400/20">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-white/60 mb-6">
              Sign up free and unlock the full power of Seeksy's creator toolkit.
            </p>
            <Button
              onClick={() => navigate("/auth?mode=signup")}
              size="lg"
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold hover:opacity-90"
            >
              Start Free Today
            </Button>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
