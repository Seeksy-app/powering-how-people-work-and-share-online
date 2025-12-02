import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Users, DollarSign, Target, Instagram, Video } from "lucide-react";

export default function CreatorHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F7FA] to-[#E0ECF9] dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Header with Spark */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3">Creator Hub</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your central command center for influencer features, brand partnerships, and content monetization
          </p>
          <Badge className="mt-4" variant="secondary">
            Coming Soon - Full Launch Thursday
          </Badge>
        </div>

        {/* Spark Welcome Message */}
        <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Hi! I'm Spark 👋</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to your Creator Hub! This is where you'll manage your influencer profile, 
                  connect social accounts, track brand partnerships, and unlock monetization opportunities. 
                  Everything is being prepared for you—stay tuned for Thursday's full launch!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950/20 w-fit mb-3">
                <Instagram className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Social Connect</CardTitle>
              <CardDescription>
                Link Instagram, TikTok, YouTube and sync your metrics automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Coming Thursday</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-950/20 w-fit mb-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Audience Insights</CardTitle>
              <CardDescription>
                Deep analytics on your followers, engagement, and demographics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Coming Thursday</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/20 w-fit mb-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Brand Campaigns</CardTitle>
              <CardDescription>
                Browse and apply to sponsored opportunities that match your niche
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Coming Thursday</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-950/20 w-fit mb-3">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Revenue Tracking</CardTitle>
              <CardDescription>
                Monitor earnings, payments, and sponsorship performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Coming Thursday</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="p-3 rounded-xl bg-pink-100 dark:bg-pink-950/20 w-fit mb-3">
                <TrendingUp className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle>Growth Tools</CardTitle>
              <CardDescription>
                AI-powered insights to grow your audience and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Coming Thursday</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/20 w-fit mb-3">
                <Video className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Content Library</CardTitle>
              <CardDescription>
                Showcase your best work and build your influencer portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Coming Thursday</Badge>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="mt-8 border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">Get Ready for Launch Day</h3>
                <p className="text-sm text-muted-foreground">
                  We're finalizing your Creator Hub features. Check back Thursday for the full experience!
                </p>
              </div>
              <Button disabled>
                <Sparkles className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}