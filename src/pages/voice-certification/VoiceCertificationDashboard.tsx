import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const VoiceCertificationDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-bold text-white">
          Start Voice Certification
        </h1>
        
        <Button
          size="lg"
          onClick={() => navigate("/voice-certification/upload")}
          className="text-xl px-12 py-6 h-auto bg-primary hover:bg-primary/90"
        >
          Certify Voice
        </Button>

        <div className="text-left space-y-6 mt-12">
          <p className="text-white/90 text-xl">
            Get started by uploading a sample of your voice.
          </p>
          
          <p className="text-white/90 text-xl font-semibold">
            For voice certification, includes
          </p>
          
          <ul className="space-y-4 text-white/80 text-lg">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-white rounded-full flex-shrink-0"></span>
              Create a unique voice fingerprint
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-white rounded-full flex-shrink-0"></span>
              Verify identity and prove authenticity
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-white rounded-full flex-shrink-0"></span>
              Build trust with your audience
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-white rounded-full flex-shrink-0"></span>
              Mint a Voice NFT on the blockchain
            </li>
          </ul>
        </div>

        <div className="pt-12">
          <p className="text-white font-bold text-2xl">seeksy</p>
          <p className="text-white/60 text-sm mt-2">polished design, reflects branding</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceCertificationDashboard;
