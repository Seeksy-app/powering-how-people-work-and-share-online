import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Star } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";

const VerifiedVoiceSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfetti, setShowConfetti] = useState(false);
  
  const fingerprintData = location.state?.fingerprintData || {
    voiceName: "Christy Louis"
  };
  const tokenId = location.state?.tokenId || "34523001";
  const blockchain = location.state?.blockchain || "Polygon";

  useEffect(() => {
    // Trigger confetti animation
    setShowConfetti(true);
    
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#2C6BED', '#00D4FF', '#FFD700', '#FF6B9D']
      });
      
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#2C6BED', '#00D4FF', '#FFD700', '#FF6B9D']
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti background effect */}
      <div className="absolute inset-0 pointer-events-none">
        {showConfetti && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-pulse"></div>
        )}
      </div>

      <Card className="max-w-xl w-full bg-card p-8 space-y-6 relative z-10">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-scale-in">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center">Success: Verified Voice</h1>

        {/* Voice Profile Card */}
        <Card className="bg-muted/50 p-6 space-y-4">
          <div className="flex items-center gap-4">
            {/* Profile Image Placeholder */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex-shrink-0"></div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">{fingerprintData.voiceName}'s Voice Profile</h3>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-brand-gold fill-brand-gold" />
                <span className="font-semibold text-sm">Verified</span>
              </div>
            </div>
          </div>

          {/* Audio Waveform Visualization */}
          <div className="h-16 flex items-center justify-center gap-1 px-4">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary/30 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Token ID: <span className="font-mono font-semibold text-foreground">{tokenId}</span> - {blockchain}
            </p>
          </div>
        </Card>

        {/* View Profile Button */}
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={() => navigate("/voice-credentials")}
            className="bg-primary hover:bg-primary/90 text-lg px-12 py-6"
          >
            View My Profile
          </Button>
        </div>

        <div className="text-center pt-6">
          <p className="text-foreground font-bold">Seeksy</p>
        </div>
      </Card>
    </div>
  );
};

export default VerifiedVoiceSuccess;
