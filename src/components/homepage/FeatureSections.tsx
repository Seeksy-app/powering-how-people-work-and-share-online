import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Mic, Calendar, BarChart3, FileText, Shield } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    id: "studio",
    icon: Mic,
    title: "Studio",
    headline: "Professional Studio in Your Browser",
    benefits: [
      "HD browser-based recording",
      "AI filler-word removal",
      "Automatic transcription",
      "One-click clip generation",
    ],
    gradient: "from-red-500 to-orange-500",
    reverse: false,
  },
  {
    id: "booking",
    icon: Calendar,
    title: "Booking & Scheduling",
    headline: "Never Miss a Guest or Opportunity",
    benefits: [
      "Custom booking pages",
      "Calendar integrations",
      "Automatic reminders",
      "Guest management tools",
    ],
    gradient: "from-blue-500 to-cyan-500",
    reverse: true,
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Social Analytics",
    headline: "Understand Your Audience Like Never Before",
    benefits: [
      "Real-time follower & engagement tracking",
      "Cross-platform comparison",
      "Audience demographics",
      "Growth trends & recommendations",
    ],
    gradient: "from-purple-500 to-pink-500",
    reverse: false,
  },
  {
    id: "mediakit",
    icon: FileText,
    title: "Media Kit + Creator Valuation",
    headline: "Know Your Worth. Show Your Value.",
    benefits: [
      "Auto-generated media kit",
      "Creator valuation calculator",
      "Shareable PDF export",
      "Brand-ready presentation",
    ],
    gradient: "from-amber-500 to-yellow-500",
    reverse: true,
  },
  {
    id: "identity",
    icon: Shield,
    title: "Identity Verification",
    headline: "Protect Your Voice. Verify Your Identity.",
    benefits: [
      "Voice fingerprinting",
      "Face verification badge",
      "On-chain authenticity",
      "Creator identity protection",
    ],
    gradient: "from-emerald-500 to-teal-500",
    reverse: false,
  },
];

export function FeatureSections() {
  const navigate = useNavigate();

  return (
    <section id="creator-modules" className="py-16">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div
            key={feature.id}
            className={`py-20 ${index % 2 === 0 ? "bg-muted/30" : "bg-background"}`}
          >
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col ${feature.reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 max-w-6xl mx-auto`}
              >
                {/* Content Side */}
                <div className="flex-1 text-center lg:text-left">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${feature.gradient} text-white text-sm font-semibold mb-6`}>
                    <Icon className="h-4 w-4" />
                    {feature.title}
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-black mb-6">
                    {feature.headline}
                  </h3>
                  
                  <ul className="space-y-4 mb-8 max-w-md mx-auto lg:mx-0">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r ${feature.gradient} text-white flex-shrink-0`}>
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-foreground text-lg">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => navigate("/auth?mode=signup")}
                    size="lg"
                    className={`bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-white font-bold px-8 py-6 h-auto`}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                {/* Visual Side - Device Frame */}
                <div className="flex-1 w-full max-w-lg">
                  <div className={`relative p-1 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-2xl`}>
                    {/* Browser/Device Frame */}
                    <div className="bg-slate-900 rounded-xl overflow-hidden">
                      {/* Browser Bar */}
                      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 text-center">
                            seeksy.io/{feature.id}
                          </div>
                        </div>
                      </div>
                      {/* Screen Content */}
                      <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-8">
                        <div className="text-center">
                          <div className={`inline-flex p-6 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-4 shadow-xl`}>
                            <Icon className="h-12 w-12 text-white" />
                          </div>
                          <p className="text-white/60 text-sm font-medium">
                            {feature.title} Dashboard
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
