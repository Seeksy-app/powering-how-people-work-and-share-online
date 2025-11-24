import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdSlot {
  slotType: 'pre_roll' | 'mid_roll' | 'post_roll';
  positionSeconds?: number;
  adFileUrl: string;
  adDuration: number;
}

export const useVideoProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processVideo = async (
    mediaFileId: string,
    jobType: 'ai_edit' | 'ad_insertion' | 'full_process',
    config?: { adSlots?: AdSlot[] }
  ) => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('process-video', {
        body: {
          mediaFileId,
          jobType,
          config,
        },
      });

      if (error) throw error;

      toast.success("Video processing started", {
        description: "You'll be notified when processing is complete",
      });

      return data;
    } catch (error) {
      console.error("Video processing error:", error);
      toast.error("Failed to start video processing", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const getProcessingStatus = async (jobId: string) => {
    const { data, error } = await supabase
      .from("media_processing_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error) throw error;
    return data;
  };

  const getMediaVersions = async (mediaFileId: string) => {
    const { data, error } = await supabase
      .from("media_versions")
      .select("*")
      .eq("original_media_id", mediaFileId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  };

  return {
    processVideo,
    getProcessingStatus,
    getMediaVersions,
    isProcessing,
  };
};