import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const ApproveAndMint = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fingerprintData = location.state?.fingerprintData || {
    matchConfidence: 98,
    voiceName: "Christy Louis"
  };

  const handleMintNFT = () => {
    navigate("/voice-certification/minting-progress", {
      state: { ...location.state }
    });
  };

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Approve & mint
        </h1>

        <p className="text-white/80 text-lg">
          Your voice will be certified on the Polygon network and minted as an NFT.
        </p>

        <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Voice:</span>
            <span className="font-bold text-xl">{fingerprintData.voiceName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Match Confidence:</span>
            <span className="font-bold text-xl text-primary">{fingerprintData.matchConfidence}%</span>
          </div>
        </Card>

        <div className="flex justify-center pt-6">
          <Button
            size="lg"
            onClick={handleMintNFT}
            className="bg-primary hover:bg-primary/90 text-xl px-16 py-7"
          >
            Mint Voice NFT
          </Button>
        </div>

        <div className="text-center pt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/voice-certification/confidence")}
            className="text-white hover:text-white/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="text-center pt-12">
          <p className="text-white font-bold text-2xl">seeksy</p>
          <p className="text-white/60 text-xs mt-2">Include Seeksy logo in mite</p>
        </div>
      </div>
    </div>
  );
};

export default ApproveAndMint;
