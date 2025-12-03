import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScreenCapturePreset {
  id: string;
  name: string;
  shortName: string;
  sceneNumber: number;
  targetUrl: string;
  recommendedDuration: number;
  description: string;
}

export interface CapturedRecording {
  id: string;
  presetId: string;
  fileName: string;
  publicUrl: string;
  storagePath: string;
  duration: number;
  createdAt: Date;
}

export function useScreenCapture() {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPresetId, setCurrentPresetId] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const generateFileName = (preset: ScreenCapturePreset): string => {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, 19);
    const sceneNum = String(preset.sceneNumber).padStart(2, '0');
    return `seeksy-demo_${sceneNum}_${preset.shortName}_${timestamp}.webm`;
  };

  const startCapture = useCallback(async (preset: ScreenCapturePreset): Promise<void> => {
    try {
      // Request screen capture - user will pick which tab/window
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: false, // No audio for demo clips
      });

      streamRef.current = stream;
      chunksRef.current = [];
      setCurrentPresetId(preset.id);

      // Determine best supported format
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000, // 5 Mbps for good quality
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle stream ending (user clicks "Stop sharing")
      stream.getVideoTracks()[0].onended = () => {
        if (isRecording) {
          stopCapture(preset);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Capture every 1 second
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setRecordingDuration(0);

      // Update duration every second
      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      toast({
        title: "Recording Started",
        description: `Recording "${preset.name}". Perform your demo actions, then click Stop.`,
      });
    } catch (error) {
      console.error('Screen capture error:', error);
      toast({
        variant: "destructive",
        title: "Capture Failed",
        description: error instanceof Error ? error.message : "Failed to start screen capture",
      });
    }
  }, [toast, isRecording]);

  const stopCapture = useCallback(async (preset: ScreenCapturePreset): Promise<CapturedRecording | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !streamRef.current) {
        resolve(null);
        return;
      }

      setIsProcessing(true);

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);

      mediaRecorderRef.current.onstop = async () => {
        try {
          // Stop all tracks
          streamRef.current?.getTracks().forEach(track => track.stop());

          // Create blob from chunks
          const blob = new Blob(chunksRef.current, { 
            type: mediaRecorderRef.current?.mimeType || 'video/webm' 
          });

          // Generate filename
          const fileName = generateFileName(preset);
          const storagePath = `demo-videos/${fileName}`;

          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('Not authenticated');
          }

          // Upload to Supabase storage
          const { error: uploadError } = await supabase.storage
            .from('media-vault')
            .upload(storagePath, blob, {
              contentType: 'video/webm',
              upsert: false,
            });

          if (uploadError) {
            throw uploadError;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('media-vault')
            .getPublicUrl(storagePath);

          // Save to media_files table
          const { data: mediaFile, error: dbError } = await supabase
            .from('media_files')
            .insert({
              user_id: user.id,
              file_name: fileName,
              file_type: 'video/webm',
              file_url: publicUrl,
              file_size: blob.size,
              storage_path: storagePath,
              metadata: {
                tag: 'demo-video',
                preset_id: preset.id,
                preset_name: preset.name,
                scene_number: preset.sceneNumber,
                duration_seconds: finalDuration,
                source: 'screen-capture',
              },
            })
            .select()
            .single();

          if (dbError) {
            throw dbError;
          }

          const recording: CapturedRecording = {
            id: mediaFile.id,
            presetId: preset.id,
            fileName,
            publicUrl,
            storagePath,
            duration: finalDuration,
            createdAt: new Date(),
          };

          toast({
            title: "Recording Saved",
            description: `"${preset.name}" (${finalDuration}s) saved to Media Library.`,
          });

          resolve(recording);
        } catch (error) {
          console.error('Save recording error:', error);
          toast({
            variant: "destructive",
            title: "Save Failed",
            description: error instanceof Error ? error.message : "Failed to save recording",
          });
          resolve(null);
        } finally {
          // Cleanup
          setIsRecording(false);
          setIsProcessing(false);
          setCurrentPresetId(null);
          setRecordingDuration(0);
          mediaRecorderRef.current = null;
          streamRef.current = null;
          chunksRef.current = [];
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, [toast]);

  const cancelCapture = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    setIsProcessing(false);
    setCurrentPresetId(null);
    setRecordingDuration(0);
    mediaRecorderRef.current = null;
    streamRef.current = null;
    chunksRef.current = [];
  }, []);

  return {
    isRecording,
    isProcessing,
    recordingDuration,
    currentPresetId,
    startCapture,
    stopCapture,
    cancelCapture,
  };
}
