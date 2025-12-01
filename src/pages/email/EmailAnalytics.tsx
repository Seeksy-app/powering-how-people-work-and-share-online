import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function EmailAnalytics() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F7FA] to-[#E0ECF9]">
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Email Analytics Dashboard
            </CardTitle>
            <CardDescription>
              Coming soon — tracking is already live
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics Dashboard Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                We're building comprehensive analytics for your email campaigns including:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-md">
                <li>• Engagement metrics (opens, clicks, bounces)</li>
                <li>• Campaign performance leaderboards</li>
                <li>• Best performing subject lines</li>
                <li>• Engagement by time of day</li>
                <li>• Device and browser breakdown</li>
                <li>• Smart insights and recommendations</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-6">
                All email tracking is already active. View individual campaign stats in the Email Home inbox.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
