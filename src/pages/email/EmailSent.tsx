import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";

export default function EmailSent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F7FA] to-[#E0ECF9]">
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Sent Emails
            </CardTitle>
            <CardDescription>
              View all your sent email campaigns and their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Send className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Sent Emails Yet</h3>
              <p className="text-muted-foreground max-w-md">
                Once you send campaigns, they'll appear here with delivery stats and engagement metrics.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
