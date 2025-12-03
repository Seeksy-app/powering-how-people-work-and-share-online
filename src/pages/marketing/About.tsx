import { TopNavigation } from "@/components/homepage/TopNavigation";
import { FooterSection } from "@/components/homepage/FooterSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Target, Sparkles, Heart, Globe, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  const values = [
    {
      icon: Heart,
      title: "Creator-First",
      description: "Every feature we build starts with creators in mind. Your success is our success."
    },
    {
      icon: Target,
      title: "Simplicity",
      description: "Powerful tools shouldn't be complicated. We make complex workflows feel effortless."
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Professional-grade tools available to everyone, regardless of budget or technical skill."
    },
    {
      icon: Award,
      title: "Authenticity",
      description: "We champion real voices and original content through blockchain-backed verification."
    }
  ];

  const team = [
    { name: "Alex Chen", role: "Founder & CEO", image: "/placeholder.svg" },
    { name: "Sarah Kim", role: "CTO", image: "/placeholder.svg" },
    { name: "Marcus Johnson", role: "Head of Product", image: "/placeholder.svg" },
    { name: "Priya Patel", role: "Head of Creator Success", image: "/placeholder.svg" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-white">
      <TopNavigation />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
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
              <span className="text-amber-400 font-semibold">About Seeksy</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Empowering Creators to Build, Connect & Monetize
            </h1>
            
            <p className="text-xl text-white/70 mb-8">
              Seeksy is the all-in-one platform designed for modern creators, podcasters, 
              influencers, and brands. We provide the tools you need to create professional 
              content, grow your audience, and turn your passion into a sustainable business.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 md:p-12 border border-white/10">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-white/80 text-center leading-relaxed">
              We believe every creator deserves access to professional-grade tools without 
              the complexity or cost. Our mission is to democratize content creation by 
              providing an integrated suite of AI-powered tools that handle the technical 
              heavy lifting — so creators can focus on what they do best: creating.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((value) => (
              <div 
                key={value.title}
                className="bg-slate-800/30 rounded-2xl p-6 border border-white/5 hover:border-amber-400/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-white/60 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl md:text-5xl font-black text-amber-400 mb-2">50K+</div>
              <div className="text-white/60">Active Creators</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-amber-400 mb-2">1M+</div>
              <div className="text-white/60">Episodes Hosted</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-amber-400 mb-2">500K+</div>
              <div className="text-white/60">AI Clips Generated</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-amber-400 mb-2">99.9%</div>
              <div className="text-white/60">Uptime</div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Meet the Team</h2>
          <p className="text-white/60 text-center mb-12 max-w-xl mx-auto">
            A passionate group of creators, engineers, and dreamers building the future of content creation.
          </p>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center">
                  <Users className="w-10 h-10 text-amber-400/60" />
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-white/60 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Join Us?</h2>
            <p className="text-white/60 mb-8">
              Start creating with Seeksy today — free forever for basic features.
            </p>
            <Button
              onClick={() => navigate("/auth?mode=signup")}
              size="lg"
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold hover:opacity-90"
            >
              Get Started Free
            </Button>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
