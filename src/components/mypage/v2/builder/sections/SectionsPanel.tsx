import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MyPageTheme } from "@/config/myPageThemes";
import { Video, Mic, Radio, Share2, Link2, Store, Shield, Calendar } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface SectionsPanelProps {
  theme: MyPageTheme;
  onUpdate: (theme: MyPageTheme) => void;
}

const sectionIcons = {
  "featured-video": Video,
  "featured-podcast": Mic,
  "stream": Radio,
  "social": Share2,
  "custom-links": Link2,
  "shop": Store,
  "voice-badge": Shield,
  "meetings": Calendar,
};

const sectionLabels = {
  "featured-video": "Featured Video",
  "featured-podcast": "Featured Podcast",
  "stream": "Stream Channel",
  "social": "Social Links",
  "custom-links": "Custom Links",
  "shop": "Shop (Shopify)",
  "voice-badge": "Voice Certified Badge",
  "meetings": "Book a Meeting",
};

export function SectionsPanel({ theme, onUpdate }: SectionsPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const toggleSection = (id: string) => {
    const newSections = theme.sections.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    onUpdate({ ...theme, sections: newSections });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Sections</h2>
        <p className="text-sm text-muted-foreground">Add and organize your page sections</p>
      </div>

      <div className="space-y-3">
        {theme.sections.map((section) => {
          const Icon = sectionIcons[section.type];
          const label = sectionLabels[section.type];

          return (
            <div
              key={section.id}
              className="flex items-center justify-between p-4 border rounded-xl hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{label}</p>
                  {!section.enabled && (
                    <p className="text-xs text-muted-foreground">Disabled</p>
                  )}
                </div>
              </div>
              <Switch
                checked={section.enabled}
                onCheckedChange={() => toggleSection(section.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
