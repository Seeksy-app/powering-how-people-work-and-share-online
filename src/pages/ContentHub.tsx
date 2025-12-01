import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Mic, FileText, Scissors, FolderOpen, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function ContentHub() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Video className="h-8 w-8" />
              Content & Media
            </h1>
            <p className="text-muted-foreground mt-1">
              All your creation tools, media library, and content in one place
            </p>
          </div>
          <Button asChild>
            <Link to="/studio">
              <Plus className="h-4 w-4 mr-2" />
              Create Content
            </Link>
          </Button>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/studio">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Podcast Studio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Record, edit, and publish podcast episodes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/studio/video">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Studio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create and edit video content
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/clips">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Scissors className="h-5 w-5" />
                  AI Clips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate social-ready clips with AI
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/media/library">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Media Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Browse and manage all your media files
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="recent" className="w-full">
          <TabsList>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="clips">Clips</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Content</CardTitle>
                <CardDescription>
                  Your most recently created and edited content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent content. Start creating!</p>
                  <Button className="mt-4" asChild>
                    <Link to="/studio">Go to Studio</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="podcasts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Podcast Episodes</CardTitle>
                <CardDescription>
                  Manage your podcast episodes and RSS feeds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Podcast management coming soon</p>
                  <Button className="mt-4" variant="outline" asChild>
                    <Link to="/podcasts">View Podcasts</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Video Content</CardTitle>
                <CardDescription>
                  All your video recordings and uploads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Video library coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clips" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Social Clips</CardTitle>
                <CardDescription>
                  AI-generated clips ready for social media
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Clips library coming soon</p>
                  <Button className="mt-4" variant="outline" asChild>
                    <Link to="/clips">Create Clips</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drafts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Drafts</CardTitle>
                <CardDescription>
                  Unfinished content and work in progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>No drafts</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
