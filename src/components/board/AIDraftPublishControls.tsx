import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Check, ArrowRight, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AIDraftPublishControlsProps {
  meetingId: string;
  hasAIDraft: boolean;
  isPublished: boolean;
  onPublish: () => Promise<void>;
  draftSummary?: string | null;
  draftDecisions?: any[] | null;
  draftActionItems?: any[] | null;
}

export function AIDraftPublishControls({
  meetingId,
  hasAIDraft,
  isPublished,
  onPublish,
  draftSummary,
  draftDecisions,
  draftActionItems,
}: AIDraftPublishControlsProps) {
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish();
      toast.success("AI notes published to meeting record");
    } catch (error) {
      console.error("Failed to publish AI notes:", error);
      toast.error("Failed to publish AI notes");
    } finally {
      setIsPublishing(false);
    }
  };

  if (!hasAIDraft) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI-Generated Notes
          {isPublished ? (
            <Badge variant="default" className="ml-auto bg-green-500">
              <Check className="h-3 w-3 mr-1" />
              Published
            </Badge>
          ) : (
            <Badge variant="outline" className="ml-auto border-amber-500 text-amber-600">
              Draft
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 text-sm">
          {/* Preview of draft content */}
          <div className="text-muted-foreground">
            {draftSummary && (
              <p className="line-clamp-2">{draftSummary}</p>
            )}
            {draftDecisions && draftDecisions.length > 0 && (
              <p className="mt-1">{draftDecisions.length} decision(s) detected</p>
            )}
            {draftActionItems && draftActionItems.length > 0 && (
              <p>{draftActionItems.length} action item(s) detected</p>
            )}
          </div>

          {!isPublished && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-3">
                Review the AI-generated notes above. Click "Publish to Notes" to save them 
                to the meeting record. This will not overwrite any manual edits you've made.
              </p>
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                size="sm"
                className="w-full gap-2"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Publish to Notes
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
