import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const AIVoiceFingerprinting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [currentTask, setCurrentTask] = useState("Generating unique markers...");

  useEffect(() => {
    // Simulate analysis progress
    const tasks = [
      "Generating unique markers...",
      "Training model...",
      "Computing distances...",
      "Analyzing audio quality...",
    ];

    let taskIndex = 0;
    let currentProgress = 0;

    const progressInterval = setInterval(() => {
      currentProgress += 2;
      setProgress(currentProgress);

      if (currentProgress % 25 === 0 && taskIndex < tasks.length - 1) {
        taskIndex++;
        setCurrentTask(tasks[taskIndex]);
      }

      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        setIsAnalyzing(false);
      }
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

  const handleContinue = () => {
    navigate("/voice-certification/confidence", {
      state: { 
        audioData: location.state?.audioData,
        fingerprintData: {
          matchConfidence: 98,
          voiceName: "Christy Louis",
          audioQuality: "High",
          fraudCheckPassed: true
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-white">
            <span className="font-bold text-xl">SEEKSY</span>
          </div>
          <div className="text-white/60 text-sm font-medium">
            Log progress state here
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-wide">
          AI VOICE FINGERPRINTING
        </h1>

        <p className="text-white/80 text-xl">
          Analyzing voice recording...
        </p>

        {/* Circular Progress Visualization */}
        <div className="relative w-64 h-64 mx-auto my-12">
          {/* Outer ring with dots */}
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="rgba(44,107,237,0.6)"
              strokeWidth="2"
              strokeDasharray={`${(progress / 100) * 502} 502`}
              strokeDashoffset="0"
              transform="rotate(-90 100 100)"
              className="transition-all duration-300"
            />
          </svg>

          {/* Center percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl font-bold text-white">{progress}%</p>
            </div>
          </div>

          {/* Processing indicator */}
          <div className="absolute right-0 top-1/2 transform translate-x-12 -translate-y-1/2">
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <p className="text-white text-sm font-medium">Processing</p>
            </div>
          </div>
        </div>

        {/* Status Items */}
        <div className="space-y-4 text-left max-w-md mx-auto">
          <div className="flex justify-between items-center text-white">
            <span>Match Confidence</span>
            <span className="text-white/60">...</span>
          </div>
          <div className="flex justify-between items-center text-white">
            <span>Fraud Check</span>
            <span className="text-white/60">...</span>
          </div>
          <div className="flex justify-between items-center text-white">
            <span>Audio Quality</span>
            <span className="text-white/60">...</span>
          </div>
        </div>

        {/* Current Task */}
        <div className="text-white/60 text-sm animate-pulse">
          • {currentTask}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-8 max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/voice-certification/upload")}
            disabled={isAnalyzing}
            className="text-white hover:text-white/80 disabled:opacity-30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            size="lg"
            onClick={handleContinue}
            disabled={isAnalyzing}
            className="bg-primary hover:bg-primary/90 disabled:opacity-30"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIVoiceFingerprinting;
