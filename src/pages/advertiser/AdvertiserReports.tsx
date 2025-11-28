import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const AdvertiserReports = () => {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Performance & Reports</h1>
        <p className="text-muted-foreground mt-1">
          Track campaign performance, impressions, and ROI
        </p>
      </div>

      <Card className="p-8 text-center">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Analytics dashboard coming soon</p>
      </Card>
    </div>
  );
};

export default AdvertiserReports;
