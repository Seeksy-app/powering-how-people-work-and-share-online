import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Video, 
  Clapperboard, 
  Scissors, 
  Mic,
  Sparkles,
  Upload,
  FileAudio,
  Users,
  MessageSquare,
  Image,
  FileText,
  Mail,
  Phone
} from "lucide-react";

interface CreditCost {
  action: string;
  cost: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: string;
}

export const CREDIT_COSTS: CreditCost[] = [
  // Meetings & Scheduling
  {
    action: "Create Meeting",
    cost: 1,
    icon: Calendar,
    description: "Schedule a new meeting with attendees",
    category: "Meetings"
  },
  {
    action: "Start Studio Session",
    cost: 1,
    icon: Video,
    description: "Begin a live recording or streaming session",
    category: "Studio"
  },
  
  // Media & Video
  {
    action: "Upload Video",
    cost: 1,
    icon: Upload,
    description: "Upload video file to media library",
    category: "Media"
  },
  {
    action: "AI Video Editing",
    cost: 1,
    icon: Clapperboard,
    description: "Use AI post-production features (camera focus, filler words, etc.)",
    category: "Media"
  },
  {
    action: "Generate Clips",
    cost: 1,
    icon: Scissors,
    description: "Create clips from existing videos",
    category: "Media"
  },
  {
    action: "AI B-Roll Generation",
    cost: 1,
    icon: Image,
    description: "Generate B-roll images/video with AI",
    category: "Media"
  },
  {
    action: "AI Thumbnail Generation",
    cost: 1,
    icon: Image,
    description: "Create custom thumbnails with AI",
    category: "Media"
  },
  
  // Audio & Voice
  {
    action: "Voice Cloning",
    cost: 1,
    icon: Mic,
    description: "Create voice profile for licensing",
    category: "Voice"
  },
  {
    action: "Upload Audio",
    cost: 1,
    icon: FileAudio,
    description: "Upload audio files to media library",
    category: "Media"
  },
  {
    action: "AI Intro/Outro Generation",
    cost: 1,
    icon: Sparkles,
    description: "Generate intro/outro audio with AI",
    category: "Media"
  },
  
  // AI Content Creation
  {
    action: "AI Blog Post",
    cost: 1,
    icon: FileText,
    description: "Generate blog content with AI",
    category: "Content"
  },
  {
    action: "AI Email Campaign",
    cost: 1,
    icon: Mail,
    description: "Create email campaign with AI assistance",
    category: "Marketing"
  },
  {
    action: "AI Meeting Summary",
    cost: 1,
    icon: MessageSquare,
    description: "Generate meeting notes and takeaways",
    category: "Meetings"
  },
  
  // Team & Collaboration
  {
    action: "Invite Team Member",
    cost: 1,
    icon: Users,
    description: "Send invitation to join your team",
    category: "Team"
  },
  {
    action: "SMS Notification",
    cost: 1,
    icon: Phone,
    description: "Send SMS notification to contacts",
    category: "Communications"
  }
];

export function CreditCostList() {
  const categories = Array.from(new Set(CREDIT_COSTS.map(c => c.category)));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Credit Costs</h2>
        <p className="text-muted-foreground">
          Each platform activity costs credits. Here's a complete breakdown of how credits are used.
        </p>
      </div>

      {categories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
            <CardDescription>
              Actions in the {category.toLowerCase()} category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {CREDIT_COSTS.filter(c => c.category === category).map((item) => (
                <div 
                  key={item.action}
                  className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="font-medium">{item.action}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-4 shrink-0">
                    {item.cost} credit{item.cost !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Pro Tip</p>
              <p className="text-sm text-muted-foreground">
                Credits encourage active platform usage. Use the spin wheel feature to earn free credits after spending credits on activities!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
