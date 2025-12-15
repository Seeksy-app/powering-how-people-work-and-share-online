import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  Podcast, 
  Video, 
  Calendar, 
  Mail, 
  Users, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  DollarSign, 
  GripVertical,
  Sparkles,
  ChevronDown
} from "lucide-react";

import { LucideIcon } from "lucide-react";

interface SeekieModule {
  key: string;
  label: string;
  icon: LucideIcon;
  tint: string;
  iconColor: string;
}

const modules: SeekieModule[] = [
  { key: "podcast", label: "Podcast", icon: Podcast, tint: "#FCE7DF", iconColor: "#E06B2D" },
  { key: "video", label: "Video", icon: Video, tint: "#FDE2E7", iconColor: "#D6456A" },
  { key: "meetings", label: "Meetings", icon: Calendar, tint: "#E0E7FF", iconColor: "#3B82F6" },
  { key: "email", label: "Email", icon: Mail, tint: "#E6F7EF", iconColor: "#1F9D67" },
  { key: "crm", label: "CRM", icon: Users, tint: "#FCEBD6", iconColor: "#D97706" },
  { key: "analytics", label: "Analytics", icon: BarChart3, tint: "#E6F1FA", iconColor: "#0EA5E9" },
  { key: "sms", label: "SMS", icon: MessageSquare, tint: "#EEE7FF", iconColor: "#7C3AED" },
  { key: "blog", label: "Blog", icon: FileText, tint: "#E6F7F5", iconColor: "#0F766E" },
  { key: "monetize", label: "Monetize", icon: DollarSign, tint: "#FDE2F2", iconColor: "#DB2777" },
];

const workspaceTemplates = [
  { name: "Podcaster", activeModules: ["podcast", "email", "crm", "analytics"] },
  { name: "Creator", activeModules: ["video", "blog", "monetize", "analytics"] },
  { name: "Agency", activeModules: ["crm", "email", "sms", "meetings"] },
  { name: "Solo", activeModules: ["podcast", "video", "blog", "email"] },
];

export function HeroWorkspaceBuilder() {
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [workspaceModules, setWorkspaceModules] = useState<string[]>([]);
  const [animatingModule, setAnimatingModule] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const currentTemplate = workspaceTemplates[currentTemplateIndex];

  // Auto-cycle templates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setCurrentTemplateIndex((prev) => (prev + 1) % workspaceTemplates.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Animate modules being added when template changes
  useEffect(() => {
    const newActiveModules = currentTemplate.activeModules;
    
    // Clear workspace first
    setWorkspaceModules([]);
    setIsAnimating(true);
    
    // Animate each module one by one
    const animateModules = async () => {
      for (let i = 0; i < newActiveModules.length; i++) {
        const moduleKey = newActiveModules[i];
        
        // Start flying animation
        setAnimatingModule(moduleKey);
        
        // Wait for fly animation
        await new Promise(resolve => setTimeout(resolve, 350));
        
        // Add to workspace
        setWorkspaceModules(prev => [...prev, moduleKey]);
        
        // Small delay before next module
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setAnimatingModule(null);
      }
      setIsAnimating(false);
    };
    
    animateModules();
  }, [currentTemplate]);

  const workspaceItems = workspaceModules
    .map(key => modules.find(m => m.key === key))
    .filter((m): m is SeekieModule => Boolean(m));

  return (
    <div 
      className="rounded-3xl p-5"
      style={{
        background: "#FFFFFF",
        border: "1px solid #EEF2F7",
        boxShadow: "0 20px 60px rgba(15,23,42,0.14)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTemplate.name}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-bold" style={{ color: "#0B1220" }}>
              {currentTemplate.name} Workspace
            </h3>
            <p className="text-xs" style={{ color: "#6B7280" }}>
              {workspaceModules.length} modules active
            </p>
          </motion.div>
        </AnimatePresence>
        <button 
          className="text-sm font-bold flex items-center gap-1"
          style={{ color: "#2C6BED" }}
        >
          + Add
        </button>
      </div>

      {/* Instruction Bar */}
      <div 
        className="rounded-xl px-3 py-2.5 mb-4 flex items-center justify-between"
        style={{ background: "#F8FAFC" }}
      >
        <p className="text-xs" style={{ color: "#6B7280" }}>
          Drag a Seekie into your workspace
        </p>
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" style={{ color: "#2C6BED" }} />
          <span className="text-xs font-medium" style={{ color: "#2C6BED" }}>
            AI-powered
          </span>
        </div>
      </div>

      {/* Store Grid */}
      <div className="mb-4">
        <p 
          className="text-[10px] font-bold uppercase tracking-wider mb-3"
          style={{ color: "#9CA3AF" }}
        >
          Seekies
        </p>
        <div className="grid grid-cols-3 gap-3 relative">
          {modules.map((module) => {
            const isAdded = workspaceModules.includes(module.key);
            const isFlying = animatingModule === module.key;
            const Icon = module.icon;
            
            return (
              <motion.div
                key={module.key}
                className="relative rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col items-center"
                style={{
                  background: "#FFFFFF",
                  border: isAdded ? "2px solid #2C6BED" : "1px dashed #E5E7EB",
                  opacity: isAdded ? 0.6 : 1,
                  transform: isFlying ? "scale(0.95)" : "scale(1)",
                }}
                whileHover={!isAdded ? { 
                  scale: 1.02, 
                  borderColor: "#2C6BED",
                  boxShadow: "0 8px 20px rgba(44,107,237,0.12)" 
                } : {}}
              >
                {/* Icon bubble */}
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2"
                  style={{ background: module.tint }}
                >
                  <Icon 
                    className="w-6 h-6" 
                    color={module.iconColor}
                    strokeWidth={2} 
                  />
                </div>
                <p 
                  className="text-sm font-medium text-center"
                  style={{ color: isAdded ? "#9CA3AF" : "#374151" }}
                >
                  {module.label}
                </p>
              </motion.div>
            );
          })}
          
          {/* Flying module animation */}
          <AnimatePresence>
            {animatingModule && (() => {
              const module = modules.find(m => m.key === animatingModule);
              if (!module) return null;
              const Icon = module.icon;
              const moduleIndex = modules.findIndex(m => m.key === animatingModule);
              const col = moduleIndex % 3;
              const row = Math.floor(moduleIndex / 3);
              
              return (
                <motion.div
                  key={`flying-${animatingModule}`}
                  initial={{ 
                    opacity: 1, 
                    scale: 1,
                    x: 0,
                    y: 0,
                  }}
                  animate={{ 
                    opacity: 0.9,
                    scale: 0.7,
                    x: col === 0 ? 60 : col === 1 ? 0 : -60,
                    y: 200,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 0.35, 
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="absolute z-50 pointer-events-none"
                  style={{
                    left: `${(col * 33.33) + 5}%`,
                    top: `${(row * 95) + 8}px`,
                  }}
                >
                  <div 
                    className="p-2.5 rounded-xl shadow-xl"
                    style={{ 
                      background: "#FFFFFF",
                      border: "2px solid #2C6BED",
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: module.tint }}
                    >
                      <Icon 
                        className="w-5 h-5" 
                        color={module.iconColor}
                        strokeWidth={2} 
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>

      {/* Arrow indicator */}
      <div className="flex justify-center mb-3">
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5" style={{ color: "#D1D5DB" }} />
        </motion.div>
      </div>

      {/* Workspace List */}
      <div 
        className="rounded-xl p-3"
        style={{ background: "#F8FAFC", border: "1px solid #EEF2F7" }}
      >
        <div className="flex items-center justify-between mb-2">
          <p 
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "#9CA3AF" }}
          >
            My Workspace
          </p>
          <p className="text-[10px]" style={{ color: "#9CA3AF" }}>
            ↕ Drag to reorder
          </p>
        </div>
        <div className="space-y-1.5 min-h-[100px]">
          <AnimatePresence mode="popLayout">
            {workspaceItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-6 text-center"
              >
                <p className="text-sm font-medium" style={{ color: "#9CA3AF" }}>
                  Your workspace is empty
                </p>
                <p className="text-xs" style={{ color: "#D1D5DB" }}>
                  Add Seekies from the store above
                </p>
              </motion.div>
            ) : (
              workspaceItems.map((module) => {
                const Icon = module.icon;
                return (
                  <motion.div
                    key={module.key}
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.9 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 25,
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl"
                    style={{ 
                      background: "#FFFFFF",
                      border: "1px solid #EEF2F7",
                      boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
                    }}
                  >
                    <GripVertical 
                      className="w-3.5 h-3.5 cursor-grab" 
                      style={{ color: "#D1D5DB" }} 
                    />
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: module.tint }}
                    >
                      <Icon 
                        className="w-4 h-4" 
                        color={module.iconColor}
                        strokeWidth={2.5} 
                      />
                    </div>
                    <span 
                      className="text-sm font-bold flex-1"
                      style={{ color: "#0B1220" }}
                    >
                      {module.label}
                    </span>
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ background: "#2C6BED" }}
                      title="Pinned"
                    />
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
        
        {/* Capacity bar */}
        {workspaceItems.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-[10px]">
              <span style={{ color: "#6B7280" }}>
                {workspaceItems.length} active • {modules.length - workspaceItems.length} available
              </span>
              <span className="font-medium" style={{ color: "#2C6BED" }}>
                Start with 3 free
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Template Indicator */}
      <div className="flex justify-center gap-1.5 mt-4">
        {workspaceTemplates.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentTemplateIndex(idx)}
            className="transition-all duration-300"
            style={{
              height: "6px",
              borderRadius: "999px",
              width: idx === currentTemplateIndex ? "20px" : "6px",
              background: idx === currentTemplateIndex ? "#2C6BED" : "#E5E7EB",
            }}
          />
        ))}
      </div>
    </div>
  );
}
