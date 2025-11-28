import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const MatchConfidence = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fingerprintData = location.state?.fingerprintData || {
    matchConfidence: 98,
    voiceName: "Christy Louis"
  };

  const handleApproveAndMint = () => {
    navigate("/voice-certification/approve-mint", {
      state: { ...location.state }
    });
  };

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
          AI Voice Fingerprinting: {fingerprintData.matchConfidence}%
        </h1>

        <p className="text-white/80 text-lg text-center">
          The voice sample is a strong match for your identity.
        </p>

        <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/30 p-6">
          <h3 className="text-xl font-semibold mb-4">Voice Details</h3>
          <div className="flex justify-between items-center py-3 border-b border-border/50">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{fingerprintData.voiceName}</span>
          </div>
        </Card>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleApproveAndMint}
            className="bg-primary hover:bg-primary/90 text-lg px-12 py-6"
          >
            Approve & Mint (Gasless)
          </Button>
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/voice-certification/fingerprint")}
            className="text-white hover:text-white/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MatchConfidence;
