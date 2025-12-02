import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/homepage/hero-creator.jpg";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Creator recording in professional studio"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-3xl">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
          >
            <span className="text-white">Ready to Grow Your</span>
            <br />
            <span className="bg-gradient-to-r from-brand-gold via-amber-400 to-brand-orange bg-clip-text text-transparent">
              Creator Brand?
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl leading-relaxed"
          >
            Join thousands of creators who use Seeksy to host, grow, collaborate, and monetize their brand.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
            <Button
              size="lg"
              onClick={() => navigate("/auth?mode=signup")}
              className="bg-gradient-to-r from-brand-gold to-brand-orange hover:opacity-90 text-slate-900 text-lg px-8 py-7 h-auto font-bold shadow-lg shadow-brand-gold/25 hover:shadow-xl transition-all hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.open("https://calendly.com/seeksy-demo", "_blank")}
              className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white hover:text-slate-900 text-lg px-8 py-7 h-auto font-bold transition-all"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Footer line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/60 text-sm"
          >
            No credit card required • Free forever plan available
          </motion.p>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
