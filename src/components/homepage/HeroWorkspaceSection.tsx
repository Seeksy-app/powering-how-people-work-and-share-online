import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HeroWorkspaceBuilder } from "./HeroWorkspaceBuilder";

export function HeroWorkspaceSection() {
  const navigate = useNavigate();

  return (
    <section 
      className="w-full px-6 pt-28 pb-16 md:pt-36 md:pb-24"
      style={{ 
        minHeight: "90vh",
        background: "linear-gradient(180deg, hsl(var(--muted)/0.3) 0%, hsl(var(--background)) 100%)",
      }}
    >
      <div className="mx-auto max-w-[1240px]">
        {/* 2-column grid with independent sizing */}
        <div 
          className="grid gap-8 lg:gap-16 items-center"
          style={{
            gridTemplateColumns: "1fr",
          }}
        >
          {/* Desktop: Side by side */}
          <div className="hidden lg:grid gap-16 items-center" style={{ gridTemplateColumns: "minmax(520px, 1fr) minmax(520px, 640px)" }}>
            {/* Left - Copy (independent sizing) */}
            <div className="text-left">
              <p 
                className="text-xs font-bold uppercase mb-6"
                style={{ 
                  letterSpacing: "0.14em",
                  color: "#2C6BED",
                }}
              >
                More than just content creation
              </p>
              <h1
                className="font-black tracking-[-2px] mb-6"
                style={{ 
                  fontSize: "64px",
                  lineHeight: 0.95,
                  color: "#0B1220",
                  maxWidth: "14ch",
                }}
              >
                Build your creator{" "}
                <span style={{ color: "#2C6BED" }}>workspace.</span>
              </h1>
              <p 
                className="text-lg mb-8"
                style={{ 
                  lineHeight: "28px",
                  color: "#4B5563",
                  maxWidth: "44ch",
                }}
              >
                Turn tools on as you need them. Pay only for what you use with credits. No lockouts—your work stays yours.
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <Button
                  size="lg"
                  className="rounded-full px-5 h-11 text-base font-semibold"
                  style={{ background: "#2C6BED" }}
                  onClick={() => navigate("/auth")}
                >
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-5 h-11 text-base font-medium border-gray-200 bg-white"
                  onClick={() => navigate("/auth")}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Schedule a Demo
                </Button>
              </div>
              <p 
                className="text-xs"
                style={{ color: "#6B7280" }}
              >
                Start free with 100 credits • No credit card required
              </p>
            </div>

            {/* Right - Workspace Builder */}
            <div className="w-full" style={{ maxWidth: "640px" }}>
              <HeroWorkspaceBuilder />
            </div>
          </div>

          {/* Mobile: Stacked */}
          <div className="lg:hidden flex flex-col gap-8">
            {/* Left - Copy */}
            <div className="text-left">
              <p 
                className="text-xs font-bold uppercase mb-4"
                style={{ 
                  letterSpacing: "0.14em",
                  color: "#2C6BED",
                }}
              >
                More than just content creation
              </p>
              <h1
                className="font-black tracking-[-1.5px] mb-5"
                style={{ 
                  fontSize: "40px",
                  lineHeight: 1.0,
                  color: "#0B1220",
                }}
              >
                Build your creator{" "}
                <span style={{ color: "#2C6BED" }}>workspace.</span>
              </h1>
              <p 
                className="text-base mb-6"
                style={{ 
                  lineHeight: "26px",
                  color: "#4B5563",
                }}
              >
                Turn tools on as you need them. Pay only for what you use with credits.
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Button
                  size="default"
                  className="rounded-full px-5 h-10 text-sm font-semibold"
                  style={{ background: "#2C6BED" }}
                  onClick={() => navigate("/auth")}
                >
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="default"
                  variant="outline"
                  className="rounded-full px-4 h-10 text-sm font-medium border-gray-200"
                  onClick={() => navigate("/auth")}
                >
                  <Play className="mr-2 h-3.5 w-3.5" />
                  Demo
                </Button>
              </div>
              <p 
                className="text-xs"
                style={{ color: "#6B7280" }}
              >
                Start free with 100 credits • No credit card
              </p>
            </div>

            {/* Right - Workspace Builder */}
            <div className="w-full">
              <HeroWorkspaceBuilder />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
