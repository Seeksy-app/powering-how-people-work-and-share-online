import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Shield, Check, Sparkles, Lock } from "lucide-react";
import { CertificationStepper } from "@/components/voice-certification/CertificationStepper";

const VoiceCertificationDashboard = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Shield,
      title: "Create a unique AI fingerprint of your voice",
      description: "Generate a tamper-proof digital signature"
    },
    {
      icon: Check,
      title: "Verify authenticity and protect your identity",
      description: "Prove ownership with on-chain verification"
    },
    {
      icon: Sparkles,
      title: "Build trust with listeners and followers",
      description: "Show your audience that your content is genuinely yours"
    },
    {
      icon: Lock,
      title: "Mint your certified voice profile on Polygon",
      description: "Receive a permanent, blockchain-secured credential"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <CertificationStepper 
          currentStep={1} 
          totalSteps={7} 
          stepLabel="Get Started"
        />

        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Voice Certification</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Start Your Voice Certification
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Verify your identity, protect your voice, and build trust with your audience. This process will create a unique, AI-verified voice fingerprint secured on the blockchain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="p-6 border-2 hover:border-primary/30 transition-colors">
              <benefit.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/voice-certification/upload")}
            className="text-lg px-12 py-6 h-auto"
          >
            <Shield className="mr-2 h-5 w-5" />
            Certify My Voice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCertificationDashboard;
