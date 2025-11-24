import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessVideoRequest {
  mediaFileId: string;
  jobType: 'ai_edit' | 'ad_insertion' | 'full_process';
  config?: {
    removeFillers?: boolean;
    removePauses?: boolean;
    adSlots?: Array<{
      slotType: 'pre_roll' | 'mid_roll' | 'post_roll';
      positionSeconds?: number;
      adFileUrl: string;
      adDuration: number;
    }>;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Not authenticated");

    const { mediaFileId, jobType, config = {} }: ProcessVideoRequest = await req.json();

    console.log("Processing video:", { mediaFileId, jobType });

    // Get media file details
    const { data: mediaFile, error: mediaError } = await supabase
      .from("media_files")
      .select("*")
      .eq("id", mediaFileId)
      .single();

    if (mediaError || !mediaFile) {
      throw new Error("Media file not found");
    }

    // Verify ownership
    if (mediaFile.user_id !== user.id) {
      throw new Error("Unauthorized");
    }

    // Create processing job
    const { data: job, error: jobError } = await supabase
      .from("media_processing_jobs")
      .insert({
        media_file_id: mediaFileId,
        job_type: jobType,
        status: "processing",
        processing_started_at: new Date().toISOString(),
        config: config,
      })
      .select()
      .single();

    if (jobError) throw jobError;

    console.log("Created processing job:", job.id);

    // Start background processing (fire and forget)
    processVideoBackground(supabase, job.id, mediaFile, jobType, config).catch(err => {
      console.error("Background processing error:", err);
    });

    return new Response(
      JSON.stringify({
        success: true,
        jobId: job.id,
        message: "Video processing started",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error starting video processing:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function processVideoBackground(
  supabase: any,
  jobId: string,
  mediaFile: any,
  jobType: string,
  config: any
) {
  const startTime = Date.now();
  
  try {
    console.log("Background processing started for job:", jobId);

    let processedFileUrl = mediaFile.file_url;
    let editsApplied: any[] = [];
    let timeSaved = 0;

    // STEP 1: AI Editing (if requested)
    if (jobType === 'ai_edit' || jobType === 'full_process') {
      console.log("Performing AI editing...");
      
      // Get edit instructions from existing edit_transcript
      const editInstructions = mediaFile.edit_transcript?.edits || [];
      
      if (editInstructions.length > 0) {
        // In production, this would use FFmpeg to actually cut the video
        // For now, we'll simulate the process
        console.log(`Found ${editInstructions.length} edit instructions`);
        
        editsApplied = editInstructions.map((edit: any) => ({
          type: edit.type,
          timestamp: edit.timestamp,
          duration: edit.duration,
        }));
        
        timeSaved = editInstructions.reduce((sum: number, edit: any) => sum + edit.duration, 0);
        
        // TODO: Actual FFmpeg processing would happen here
        // processedFileUrl = await applyFFmpegEdits(mediaFile.file_url, editInstructions);
      }
    }

    // STEP 2: Ad Insertion (if requested)
    let adsInserted = 0;
    if (jobType === 'ad_insertion' || jobType === 'full_process') {
      console.log("Inserting ads...");
      
      const adSlots = config.adSlots || [];
      
      if (adSlots.length > 0) {
        // Save ad slot configurations
        for (const slot of adSlots) {
          await supabase.from("media_ad_slots").insert({
            media_file_id: mediaFile.id,
            processing_job_id: jobId,
            slot_type: slot.slotType,
            position_seconds: slot.positionSeconds,
            ad_file_url: slot.adFileUrl,
            ad_duration_seconds: slot.adDuration,
          });
          
          adsInserted++;
        }
        
        // TODO: Actual FFmpeg ad splicing would happen here
        // processedFileUrl = await spliceAdsWithFFmpeg(processedFileUrl, adSlots);
      }
    }

    // STEP 3: Create version record
    const versionType = 
      jobType === 'ai_edit' ? 'ai_edited' :
      jobType === 'ad_insertion' ? 'with_ads' :
      'full_processed';

    const { error: versionError } = await supabase
      .from("media_versions")
      .insert({
        original_media_id: mediaFile.id,
        processing_job_id: jobId,
        version_type: versionType,
        file_url: processedFileUrl,
        file_size_bytes: mediaFile.file_size_bytes,
        duration_seconds: mediaFile.duration_seconds,
        edits_applied: editsApplied,
        ads_inserted: adsInserted,
        time_saved_seconds: timeSaved,
        is_primary: false,
      });

    if (versionError) throw versionError;

    // STEP 4: Update job status
    const processingTime = (Date.now() - startTime) / 1000;
    
    await supabase
      .from("media_processing_jobs")
      .update({
        status: "completed",
        processing_completed_at: new Date().toISOString(),
        output_file_url: processedFileUrl,
        output_file_size_bytes: mediaFile.file_size_bytes,
        output_duration_seconds: mediaFile.duration_seconds - timeSaved,
        processing_time_seconds: processingTime,
      })
      .eq("id", jobId);

    console.log(`Job ${jobId} completed in ${processingTime}s`);

  } catch (error) {
    console.error("Background processing error:", error);
    
    // Update job with error
    await supabase
      .from("media_processing_jobs")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
        processing_completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  }
}

/* 
PRODUCTION FFMPEG IMPLEMENTATION NOTES:

To enable actual video processing, you would need to:

1. Use a Docker-based edge function with FFmpeg installed
2. Implement these helper functions:

async function applyFFmpegEdits(inputUrl: string, edits: EditInstruction[]): Promise<string> {
  // Download input video
  const inputPath = await downloadFile(inputUrl);
  const outputPath = "/tmp/edited_" + Date.now() + ".mp4";
  
  // Build FFmpeg filter for cutting segments
  let filterComplex = "";
  let concatInputs = "";
  
  // For each edit, create a segment
  // Then concatenate all segments
  
  // Execute FFmpeg
  await execFFmpeg([
    "-i", inputPath,
    "-filter_complex", filterComplex,
    "-c:v", "libx264",
    "-c:a", "aac",
    outputPath
  ]);
  
  // Upload to storage
  return await uploadToStorage(outputPath);
}

async function spliceAdsWithFFmpeg(videoUrl: string, adSlots: AdSlot[]): Promise<string> {
  // Download video and all ad files
  const videoPath = await downloadFile(videoUrl);
  const adPaths = await Promise.all(adSlots.map(slot => downloadFile(slot.adFileUrl)));
  
  const outputPath = "/tmp/with_ads_" + Date.now() + ".mp4";
  
  // Build concat filter for splicing ads at specific positions
  let inputs = [];
  let filterComplex = "";
  
  // Sort ad slots by position
  const sortedSlots = [...adSlots].sort((a, b) => 
    (a.positionSeconds || 0) - (b.positionSeconds || 0)
  );
  
  // Build FFmpeg command to splice video segments with ads
  
  await execFFmpeg([...inputs, "-filter_complex", filterComplex, outputPath]);
  
  return await uploadToStorage(outputPath);
}

3. Set up Cloudflare R2 or Supabase Storage for processed files
4. Implement proper error handling and retry logic
5. Add progress tracking via database updates
*/