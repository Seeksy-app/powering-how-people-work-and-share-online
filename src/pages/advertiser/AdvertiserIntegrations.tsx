import { Card } from "@/components/ui/card";
import { Plug } from "lucide-react";

const AdvertiserIntegrations = () => {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect third-party tools, tracking pixels, and analytics platforms
        </p>
      </div>

      <Card className="p-8 text-center">
        <Plug className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Integrations coming soon</p>
      </Card>
    </div>
  );
};

export default AdvertiserIntegrations;
