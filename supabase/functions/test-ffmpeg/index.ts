import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * EXPLICIT FFMPEG TEST
 * 
 * This function performs a deterministic test to confirm whether FFmpeg
 * is available in the Supabase Edge Functions runtime environment.
 * 
 * Test: Download a small video, trim 3 seconds using FFmpeg, log results
 */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const testLog: string[] = [];
  let ffmpegAvailable = false;
  let testVideoProcessed = false;
  let errorDetails = "";

  try {
    testLog.push("=== FFmpeg Availability Test ===");
    testLog.push(`Timestamp: ${new Date().toISOString()}`);
    testLog.push(`Runtime: Deno ${Deno.version.deno}`);

    // TEST 1: Check if FFmpeg command exists
    testLog.push("\n--- TEST 1: FFmpeg Command Check ---");
    try {
      const versionCheck = new Deno.Command("ffmpeg", {
        args: ["-version"],
        stdout: "piped",
        stderr: "piped",
      });
      
      const versionResult = await versionCheck.output();
      
      if (versionResult.success) {
        const versionOutput = new TextDecoder().decode(versionResult.stdout);
        const firstLine = versionOutput.split('\n')[0];
        testLog.push(`✅ FFmpeg found: ${firstLine}`);
        ffmpegAvailable = true;
      } else {
        const errorOutput = new TextDecoder().decode(versionResult.stderr);
        testLog.push(`❌ FFmpeg command failed: ${errorOutput.slice(0, 200)}`);
        ffmpegAvailable = false;
      }
    } catch (cmdError) {
      testLog.push(`❌ FFmpeg command error: ${cmdError}`);
      ffmpegAvailable = false;
      errorDetails = String(cmdError);
    }

    // TEST 2: Try to process a test video (only if FFmpeg exists)
    if (ffmpegAvailable) {
      testLog.push("\n--- TEST 2: Video Processing Test ---");
      try {
        // Use a small test video URL (public domain sample)
        const testVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
        testLog.push(`Downloading test video from: ${testVideoUrl}`);
        
        const videoResponse = await fetch(testVideoUrl);
        if (!videoResponse.ok) {
          throw new Error(`Failed to download test video: ${videoResponse.status}`);
        }
        
        const videoData = new Uint8Array(await videoResponse.arrayBuffer());
        testLog.push(`Downloaded ${videoData.length} bytes`);
        
        // Write to temp file
        const inputPath = "/tmp/test_input.mp4";
        const outputPath = "/tmp/test_output.mp4";
        await Deno.writeFile(inputPath, videoData);
        testLog.push(`Saved to ${inputPath}`);
        
        // Run FFmpeg trim command: cut first 3 seconds
        testLog.push("Running FFmpeg trim command...");
        const ffmpegProcess = new Deno.Command("ffmpeg", {
          args: [
            "-i", inputPath,
            "-t", "3",
            "-c:v", "libx264",
            "-c:a", "aac",
            "-preset", "ultrafast",
            "-y",
            outputPath
          ],
          stdout: "piped",
          stderr: "piped",
        });
        
        const ffmpegResult = await ffmpegProcess.output();
        
        if (ffmpegResult.success) {
          const outputStat = await Deno.stat(outputPath);
          testLog.push(`✅ FFmpeg processing successful`);
          testLog.push(`Output file size: ${outputStat.size} bytes`);
          testVideoProcessed = true;
          
          // Cleanup
          await Deno.remove(inputPath);
          await Deno.remove(outputPath);
          testLog.push("Cleanup complete");
        } else {
          const ffmpegError = new TextDecoder().decode(ffmpegResult.stderr);
          testLog.push(`❌ FFmpeg processing failed: ${ffmpegError.slice(0, 300)}`);
        }
        
      } catch (processError) {
        testLog.push(`❌ Video processing error: ${processError}`);
        errorDetails += ` | Processing: ${processError}`;
      }
    }

    // FINAL VERDICT
    testLog.push("\n=== FINAL VERDICT ===");
    if (ffmpegAvailable && testVideoProcessed) {
      testLog.push("✅ FFmpeg is FULLY WORKING in Supabase Edge Functions");
      testLog.push("✅ Video processing capability confirmed");
    } else if (ffmpegAvailable && !testVideoProcessed) {
      testLog.push("⚠️ FFmpeg command exists but video processing failed");
      testLog.push("This may indicate missing codecs or permissions");
    } else {
      testLog.push("❌ FFmpeg is NOT AVAILABLE in Supabase Edge Functions");
      testLog.push("Recommended alternatives:");
      testLog.push("  1. Cloudflare Stream API (easiest, already configured)");
      testLog.push("  2. AWS Lambda with FFmpeg layer");
      testLog.push("  3. External worker service (Fly.io, Railway)");
    }

    return new Response(
      JSON.stringify({
        ffmpegAvailable,
        testVideoProcessed,
        verdict: ffmpegAvailable && testVideoProcessed ? "FULLY_WORKING" : 
                 ffmpegAvailable ? "COMMAND_EXISTS_BUT_PROCESSING_FAILED" : "NOT_AVAILABLE",
        log: testLog,
        errorDetails: errorDetails || null,
        recommendation: ffmpegAvailable && testVideoProcessed ? 
          "Use FFmpeg directly in edge functions" : 
          "Use Cloudflare Stream API (fastest alternative)",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    testLog.push(`\n❌ FATAL ERROR: ${error}`);
    return new Response(
      JSON.stringify({
        ffmpegAvailable: false,
        testVideoProcessed: false,
        verdict: "ERROR",
        log: testLog,
        errorDetails: String(error),
        recommendation: "Use Cloudflare Stream API as alternative",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
