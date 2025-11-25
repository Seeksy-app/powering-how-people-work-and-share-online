import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Check, AlertCircle, Video, FileAudio } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoUploaderProps {
  onUploadComplete?: () => void;
  acceptVideo?: boolean;
  acceptAudio?: boolean;
}

export default function VideoUploader({ 
  onUploadComplete,
  acceptVideo = true,
  acceptAudio = true 
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadStartTime = useRef<number>(0);
  const { toast } = useToast();

  const acceptedTypes = [
    ...(acceptVideo ? ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'] : []),
    ...(acceptAudio ? ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-m4a'] : [])
  ].join(',');

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatBytes(bytesPerSecond)}/s`;
  };

  const validateFile = (file: File): boolean => {
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    
    if (!isVideo && !isAudio) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video or audio file",
        variant: "destructive",
      });
      return false;
    }

    if (!acceptVideo && isVideo) {
      toast({
        title: "Video not accepted",
        description: "Only audio files are accepted",
        variant: "destructive",
      });
      return false;
    }

    if (!acceptAudio && isAudio) {
      toast({
        title: "Audio not accepted",
        description: "Only video files are accepted",
        variant: "destructive",
      });
      return false;
    }

    // 5GB limit
    const maxSizeBytes = 5 * 1024 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({
        title: "File too large",
        description: `Maximum file size is 5GB. Your file is ${formatBytes(file.size)}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setCurrentFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSpeed(0);
    setUploadStatus('uploading');
    uploadStartTime.current = Date.now();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      console.log(`Starting R2 upload: ${file.name} (${formatBytes(file.size)})`);

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', session.user.id);
      formData.append('fileName', file.name);

      console.log('Uploading via r2-upload function...');
      
      // Upload using XMLHttpRequest to track progress
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentage = (e.loaded / e.total) * 100;
            const elapsed = (Date.now() - uploadStartTime.current) / 1000;
            const speed = e.loaded / elapsed;
            
            setUploadProgress(percentage);
            setUploadSpeed(speed);
            console.log(`Upload progress: ${Math.round(percentage)}%`);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                resolve(response);
              } else {
                reject(new Error(response.error || 'Upload failed'));
              }
            } catch (e) {
              reject(new Error('Invalid response from server'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

        // Get the function URL
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const functionUrl = `${supabaseUrl}/functions/v1/r2-upload`;
        
        xhr.open('POST', functionUrl);
        xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
        xhr.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
        xhr.send(formData);
      });

      await uploadPromise;
      console.log('Upload complete!');
      setUploadProgress(100);

      setUploadStatus('success');
      toast({
        title: "Upload complete!",
        description: `${file.name} uploaded successfully`,
      });

      setTimeout(() => {
        setCurrentFile(null);
        setUploadStatus('idle');
        setUploadProgress(0);
        setIsUploading(false);
        onUploadComplete?.();
      }, 2000);

    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus('error');
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleCancel = () => {
    setCurrentFile(null);
    setIsUploading(false);
    setUploadStatus('idle');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
            isDragging && "border-primary bg-primary/5 scale-[1.02]",
            !isDragging && !isUploading && "border-border/50 hover:border-primary hover:bg-card",
            isUploading && "border-primary/50 cursor-not-allowed bg-card"
          )}
        >
          {uploadStatus === 'idle' && (
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold mb-1">
                  Drop your {acceptVideo && acceptAudio ? 'video or audio' : acceptVideo ? 'video' : 'audio'} file here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse (up to 5GB)
                </p>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                {acceptVideo && <Badge variant="outline"><Video className="h-3 w-3 mr-1" />Video</Badge>}
                {acceptAudio && <Badge variant="outline"><FileAudio className="h-3 w-3 mr-1" />Audio</Badge>}
              </div>
            </div>
          )}

          {(uploadStatus === 'uploading' || uploadStatus === 'success' || uploadStatus === 'error') && currentFile && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentFile.type.startsWith('video') ? (
                    <Video className="h-8 w-8 text-primary" />
                  ) : (
                    <FileAudio className="h-8 w-8 text-primary" />
                  )}
                  <div className="text-left">
                    <p className="font-medium truncate max-w-xs">{currentFile.name}</p>
                    <p className="text-sm text-muted-foreground">{formatBytes(currentFile.size)}</p>
                  </div>
                </div>
                
                {uploadStatus === 'success' && (
                  <Check className="h-6 w-6 text-green-500" />
                )}
                {uploadStatus === 'error' && (
                  <AlertCircle className="h-6 w-6 text-destructive" />
                )}
                {uploadStatus === 'uploading' && (
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {uploadStatus === 'uploading' && (
                <>
                  <Progress value={uploadProgress} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{Math.round(uploadProgress)}%</span>
                    <span>{formatSpeed(uploadSpeed)}</span>
                  </div>
                </>
              )}

              {uploadStatus === 'success' && (
                <p className="text-sm text-green-600">Upload completed successfully!</p>
              )}

              {uploadStatus === 'error' && (
                <p className="text-sm text-destructive">Upload failed. Please try again.</p>
              )}
            </div>
          )}
        </div>

        {uploadStatus === 'idle' && (
          <p className="text-xs text-center text-muted-foreground mt-4">
            Powered by Cloudflare Stream. Supports files up to 30GB with guaranteed reliable delivery.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
