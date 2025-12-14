import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface ModuleData {
  key: string;
  title: string;
  description: string;
  imageUrl: string;
  ribbonLabel: string;
  ribbonBg: string;
}

const modules: ModuleData[] = [
  {
    key: "podcast_studio",
    title: "Podcast Studio",
    description: "Record, edit, and publish professional podcasts with our browser-based studio. Invite guests remotely, auto-generate transcripts, and distribute to all major platforms.",
    imageUrl: "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800&h=800&fit=crop",
    ribbonLabel: "Podcast Studio",
    ribbonBg: "#1A1A1A",
  },
  {
    key: "virtual_meetings",
    title: "Virtual Meetings",
    description: "Host 1:1s, group meetings, and events with booking links, reminders, and guest management built in.",
    imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=800&fit=crop",
    ribbonLabel: "Virtual Meetings",
    ribbonBg: "#C4CFC0",
  },
  {
    key: "ai_post",
    title: "AI Post Production",
    description: "Turn raw recordings into clips, highlights, captions, and polished edits automatically.",
    imageUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&h=800&fit=crop",
    ribbonLabel: "AI Post Production",
    ribbonBg: "#B8C9DC",
  },
  {
    key: "live_streaming",
    title: "Live Streaming",
    description: "Go live with a branded placecard, guests, chat, and instant replay-ready recordings.",
    imageUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&h=800&fit=crop",
    ribbonLabel: "Live Streaming",
    ribbonBg: "#DDD8CC",
  },
];

export function ModuleHeroShowcase() {
  const [activeKey, setActiveKey] = useState("podcast_studio");
  const activeModule = modules.find((m) => m.key === activeKey) || modules[0];
  const activeIndex = modules.findIndex((m) => m.key === activeKey);

  return (
    <section className="w-full px-4 py-24 md:py-32">
      {/* Single dominant container - 32px radius */}
      <div
        className="mx-auto max-w-[1120px] rounded-[32px] overflow-hidden"
        style={{
          background: "#E8D5CB",
          boxShadow: "0 16px 48px rgba(0,0,0,0.08)",
        }}
      >
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-[1fr_auto] items-stretch">
          {/* Left: Text + Image */}
          <div className="p-12 pr-0 grid grid-cols-[320px_1fr] gap-12 items-center">
            {/* Text Block - Narrow width cap */}
            <div className="flex flex-col gap-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule.key + "-text"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex flex-col gap-6"
                >
                  <h2
                    className="font-black tracking-[-0.02em]"
                    style={{
                      fontSize: "clamp(36px, 4vw, 48px)",
                      lineHeight: 1.08,
                      color: "rgba(11, 15, 26, 0.95)",
                    }}
                  >
                    {activeModule.title}
                  </h2>
                  <p
                    style={{
                      fontSize: "15px",
                      lineHeight: 1.6,
                      color: "rgba(11, 15, 26, 0.75)",
                      maxWidth: "380px",
                    }}
                  >
                    {activeModule.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* CTA - Restrained, secondary, pill shape */}
              <button
                className="group w-fit flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-[140ms] ease-out"
                style={{
                  background: "rgba(11, 15, 26, 0.9)",
                  color: "#FFFFFF",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#FFFFFF";
                  e.currentTarget.style.color = "rgba(11, 15, 26, 0.95)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(11, 15, 26, 0.9)";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
              >
                Learn More
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-[140ms] ease-out group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Image - Embedded, matching radius, soft shadow */}
            <div className="relative py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule.key + "-image"}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="relative aspect-square rounded-[24px] overflow-hidden"
                  style={{
                    boxShadow: "0 14px 36px rgba(0,0,0,0.08)",
                    maxWidth: "380px",
                  }}
                >
                  {/* Warm tint overlay */}
                  <div 
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{ background: "rgba(255, 248, 240, 0.03)" }}
                  />
                  <img
                    src={activeModule.imageUrl}
                    alt={activeModule.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Layered Vertical Tabs */}
          <div 
            className="flex items-stretch py-8 pr-8"
            style={{ marginLeft: "-16px" }}
          >
            {modules.map((module, index) => {
              const isActive = module.key === activeKey;
              const distanceFromActive = Math.abs(index - activeIndex);
              
              // Progressive widths - active widest, others thinner
              const width = isActive ? 72 : (64 - distanceFromActive * 4);
              
              // Overlapping z-index - active highest
              const zIndex = isActive ? 10 : (8 - distanceFromActive);
              
              return (
                <motion.button
                  key={module.key}
                  onClick={() => setActiveKey(module.key)}
                  className="relative cursor-pointer transition-all duration-200"
                  style={{
                    width: `${width}px`,
                    minWidth: `${width}px`,
                    height: "100%",
                    minHeight: "340px",
                    borderRadius: "20px",
                    background: isActive ? "#0A0A0A" : module.ribbonBg,
                    zIndex,
                    marginLeft: index === 0 ? 0 : "-4px",
                    boxShadow: isActive 
                      ? "0 4px 24px rgba(0,0,0,0.15)" 
                      : "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.15 }}
                >
                  <span
                    className="absolute top-1/2 left-1/2 whitespace-nowrap font-semibold"
                    style={{
                      fontSize: "13px",
                      letterSpacing: "0.04em",
                      color: isActive ? "#FFFFFF" : "rgba(11, 15, 26, 0.8)",
                      opacity: isActive ? 1 : 0.85,
                      transform: "translate(-50%, -50%) rotate(-90deg)",
                    }}
                  >
                    {module.ribbonLabel}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden p-6 flex flex-col gap-6">
          {/* Text Block */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule.key + "-mobile-text"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex flex-col gap-4"
            >
              <h2
                className="font-black tracking-[-0.02em]"
                style={{
                  fontSize: "32px",
                  lineHeight: 1.08,
                  color: "rgba(11, 15, 26, 0.95)",
                }}
              >
                {activeModule.title}
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: "rgba(11, 15, 26, 0.75)",
                }}
              >
                {activeModule.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule.key + "-mobile-image"}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative aspect-square rounded-[20px] overflow-hidden"
              style={{
                boxShadow: "0 14px 36px rgba(0,0,0,0.08)",
              }}
            >
              <div 
                className="absolute inset-0 z-10 pointer-events-none"
                style={{ background: "rgba(255, 248, 240, 0.03)" }}
              />
              <img
                src={activeModule.imageUrl}
                alt={activeModule.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Horizontal Layered Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {modules.map((module) => {
              const isActive = module.key === activeKey;
              return (
                <button
                  key={module.key}
                  onClick={() => setActiveKey(module.key)}
                  className="flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all duration-[140ms]"
                  style={{
                    background: isActive ? "#0A0A0A" : module.ribbonBg,
                    color: isActive ? "#FFFFFF" : "rgba(11, 15, 26, 0.8)",
                    opacity: isActive ? 1 : 0.9,
                  }}
                >
                  {module.ribbonLabel}
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <button
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-[140ms]"
            style={{
              background: "rgba(11, 15, 26, 0.9)",
              color: "#FFFFFF",
            }}
          >
            Learn More
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
