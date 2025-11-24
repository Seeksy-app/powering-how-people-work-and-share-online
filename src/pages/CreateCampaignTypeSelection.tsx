import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, MessageSquare, Upload, Monitor, Calendar, FileText, Handshake, ArrowLeft } from "lucide-react";

export default function CreateCampaignTypeSelection() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/advertiser/ad-library")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Ad Library
      </Button>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Create New Ad
        </h1>
        <p className="text-muted-foreground text-lg">
          Choose the type of ad creative you want to create
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Standard Audio Ad */}
        <Card 
          className="group cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-background to-muted/20 flex flex-col" 
          onClick={() => navigate("/advertiser/create-ad-wizard")}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 group-hover:from-blue-500/20 group-hover:to-blue-600/20 transition-colors">
                <Volume2 className="h-7 w-7 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-xl mb-2">Audio Ads</CardTitle>
            <CardDescription className="text-sm">
              Create audio ads with AI - standard or conversational
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Standard audio ads</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Conversational AI ads</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>AI voice generation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Step-by-step wizard</span>
              </li>
            </ul>
            <Button className="w-full">
              Create Audio Ad
            </Button>
          </CardContent>
        </Card>

        {/* Upload Ready Ad */}
        <Card 
          className="group cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-background to-muted/20 flex flex-col" 
          onClick={() => navigate("/advertiser/upload-ad")}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 group-hover:from-green-500/20 group-hover:to-green-600/20 transition-colors">
                <Upload className="h-7 w-7 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-xl mb-2">Upload Ready Ad</CardTitle>
            <CardDescription className="text-sm">
              Upload your pre-made audio or video advertisement
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Upload audio/video files</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Ready-to-use ads</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Multiple format support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Quick deployment</span>
              </li>
            </ul>
            <Button className="w-full">
              Upload Ad
            </Button>
          </CardContent>
        </Card>

        {/* Digital Ad Card - NOW ACTIVE */}
        <Card 
          className="group cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-background to-muted/20 flex flex-col" 
          onClick={() => navigate("/advertiser/ads/create-digital")}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 group-hover:from-orange-500/20 group-hover:to-orange-600/20 transition-colors">
                <Monitor className="h-7 w-7 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-xl mb-2">Digital Ad</CardTitle>
            <CardDescription className="text-sm">
              Create display ads for websites and social media platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Multiple ad sizes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Social media formats</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Website banners</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Canva integration</span>
              </li>
            </ul>
            <Button className="w-full">
              Create Digital Ad
            </Button>
          </CardContent>
        </Card>

        {/* Host Read Script */}
        <Card 
          className="group cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-background to-muted/20 flex flex-col" 
          onClick={() => navigate("/advertiser/create-host-script")}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 group-hover:from-purple-500/20 group-hover:to-purple-600/20 transition-colors">
                <FileText className="h-7 w-7 text-purple-600" />
              </div>
            </div>
            <CardTitle className="text-xl mb-2">Host Read Script</CardTitle>
            <CardDescription className="text-sm">
              Create scripts for hosts to read during their shows
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Custom ad scripts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Host reads live</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Authentic integration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Campaign tracking</span>
              </li>
            </ul>
            <Button className="w-full">
              Create Script
            </Button>
          </CardContent>
        </Card>

        {/* Create Sponsorship */}
        <Card 
          className="group cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-background to-muted/20 flex flex-col" 
          onClick={() => navigate("/advertiser/create-sponsorship")}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/10 to-teal-600/10 group-hover:from-teal-500/20 group-hover:to-teal-600/20 transition-colors">
                <Handshake className="h-7 w-7 text-teal-600" />
              </div>
            </div>
            <CardTitle className="text-xl mb-2">Create Sponsorship</CardTitle>
            <CardDescription className="text-sm">
              Sponsor creators, events, and content directly
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Direct partnerships</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Creator collaborations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Custom packages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Flexible terms</span>
              </li>
            </ul>
            <Button className="w-full">
              Create Sponsorship
            </Button>
          </CardContent>
        </Card>

        {/* Browse Sponsorships */}
        <Card 
          className="group cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-background to-muted/20 flex flex-col" 
          onClick={() => navigate("/sponsorship-marketplace")}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-600/10 group-hover:from-pink-500/20 group-hover:to-pink-600/20 transition-colors">
                <Calendar className="h-7 w-7 text-pink-600" />
              </div>
            </div>
            <CardTitle className="text-xl mb-2">Browse Sponsorships</CardTitle>
            <CardDescription className="text-sm">
              Sponsor creator events, awards, and experiences
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Event sponsorships</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Awards program sponsors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Brand placement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Live audience reach</span>
              </li>
            </ul>
            <Button className="w-full">
              Browse Opportunities
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button variant="ghost" size="lg" onClick={() => navigate("/advertiser/campaigns")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}