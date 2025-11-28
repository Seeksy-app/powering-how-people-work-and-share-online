import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Mic, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const UploadOrRecordVoice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<"upload" | "record" | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedMethod("upload");
      setRecordedBlob(null);
      toast({
        title: "File selected",
        description: `${file.name} ready for upload`,
      });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRecordClick = () => {
    setSelectedMethod("record");
    setSelectedFile(null);
    setIsRecording(true);
    
    // Simulate recording for demo purposes
    setTimeout(() => {
      setIsRecording(false);
      const mockBlob = new Blob(["mock audio data"], { type: "audio/wav" });
      setRecordedBlob(mockBlob);
      toast({
        title: "Recording captured",
        description: "Voice sample recorded successfully",
      });
    }, 3000);
  };

  const handleContinue = () => {
    if (selectedFile || recordedBlob) {
      // Pass the file/blob to the next screen via state
      navigate("/voice-certification/fingerprint", {
        state: { audioData: selectedFile || recordedBlob }
      });
    }
  };

  const hasAudio = selectedFile !== null || recordedBlob !== null;

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-white">
            <span className="font-bold text-xl">Seeksy</span>
            <span className="text-white/60 text-sm">Voice Certification</span>
          </div>
          <div className="text-white/60 text-sm font-medium">LOVABLE</div>
        </div>

        <Card className="bg-card p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Upload an existing voice sample</h2>
            <p className="text-muted-foreground">
              Upload an existing voice recording or record a new sample.
            </p>
          </div>

          {/* File Upload Area */}
          <div 
            className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={handleUploadClick}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
            <p className="text-foreground font-medium mb-2">
              {selectedFile ? selectedFile.name : "Choose a file or drag it here"}
            </p>
            {!selectedFile && (
              <p className="text-sm text-muted-foreground">
                WAV, MP3, M4A supported
              </p>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".wav,.mp3,.m4a,audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Record Voice Section */}
          <div className="pt-4">
            <h3 className="text-sm font-semibold text-foreground uppercase mb-4">
              RECORD VOICE
            </h3>
            <Button
              size="lg"
              variant="default"
              onClick={handleRecordClick}
              disabled={isRecording}
              className="w-full bg-brand-navy text-white hover:bg-brand-navy/90 py-6 text-lg"
            >
              <Mic className="mr-2 h-5 w-5" />
              {isRecording ? "Recording..." : recordedBlob ? "Re-record New Sample" : "Record New Sample"}
            </Button>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/voice-certification")}
              className="text-foreground hover:text-foreground/80"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!hasAudio}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              Continue
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UploadOrRecordVoice;
