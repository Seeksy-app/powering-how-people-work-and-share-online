import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

const AdvertiserCreators = () => {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Creators & Shows</h1>
        <p className="text-muted-foreground mt-1">
          Browse and connect with podcasters and influencers
        </p>
      </div>

      <Card className="p-8 text-center">
        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Creator directory coming soon</p>
      </Card>
    </div>
  );
};

export default AdvertiserCreators;
