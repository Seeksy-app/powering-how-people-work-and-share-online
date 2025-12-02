import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Instagram, Facebook, Link as LinkIcon, CheckCircle2, Twitter, Youtube, Music, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useYouTubeConnect } from "@/hooks/useYouTubeConnect";
import { useSocialProfiles } from "@/hooks/useSocialMediaSync";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface SocialIntegration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  connected: boolean;
  gradient: string;
  available: boolean;
  profileData?: {
    username?: string;
    profile_picture?: string;
    followers_count?: number;
  };
  onConnect?: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

export default function SocialMediaHub() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { connectYouTube, syncYouTube, isConnecting } = useYouTubeConnect();
  const { data: socialProfiles, refetch: refetchProfiles } = useSocialProfiles();

  // Check connected Meta accounts
  const { data: metaIntegrations } = useQuery({
    queryKey: ['meta-integrations-status'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('meta_integrations')
        .select('platform')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
  });

  const hasInstagram = metaIntegrations?.some(i => i.platform === 'instagram');
  const hasFacebook = metaIntegrations?.some(i => i.platform === 'facebook');
  
  // Get YouTube profile from social_media_profiles
  const youtubeProfile = socialProfiles?.find(p => p.platform === 'youtube');
  const hasYouTube = !!youtubeProfile;

  // Handle YouTube connection callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const youtubeError = params.get('youtube_error');

    if (connected === 'youtube') {
      toast({
        title: 'YouTube Connected!',
        description: 'Syncing your channel data now.',
      });
      refetchProfiles();
      queryClient.invalidateQueries({ queryKey: ['social-profiles'] });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (youtubeError) {
      toast({
        title: 'YouTube Connection Failed',
        description: youtubeError,
        variant: 'destructive',
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [refetchProfiles, queryClient]);

  const handleYouTubeSync = async () => {
    if (youtubeProfile?.id) {
      await syncYouTube(youtubeProfile.id);
      refetchProfiles();
    }
  };

  const integrations: SocialIntegration[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Sync followers, engagement metrics, and post performance from your Instagram Business account',
      icon: <Instagram className="h-6 w-6 text-white" />,
      path: '/integrations/meta',
      connected: hasInstagram || false,
      gradient: 'from-purple-500 to-pink-500',
      available: true,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Connect your Facebook Page to sync insights, audience data, and post analytics',
      icon: <Facebook className="h-6 w-6 text-white" />,
      path: '/integrations/meta',
      connected: hasFacebook || false,
      gradient: 'from-blue-600 to-blue-500',
      available: true,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Sync your YouTube channel videos, views, and subscriber data',
      icon: <Youtube className="h-6 w-6 text-white" />,
      path: '#',
      connected: hasYouTube,
      gradient: 'from-red-600 to-red-500',
      available: true,
      profileData: youtubeProfile ? {
        username: youtubeProfile.username,
        profile_picture: youtubeProfile.profile_picture,
        followers_count: youtubeProfile.followers_count,
      } : undefined,
      onConnect: connectYouTube,
      onSync: handleYouTubeSync,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'Import your TikTok videos, analytics, and audience demographics',
      icon: <Music className="h-6 w-6 text-white" />,
      path: '#',
      connected: false,
      gradient: 'from-black to-gray-800',
      available: false,
    },
    {
      id: 'twitter',
      name: 'Twitter / X',
      description: 'Connect your Twitter account to track tweets, engagement, and follower growth',
      icon: <Twitter className="h-6 w-6 text-white" />,
      path: '#',
      connected: false,
      gradient: 'from-sky-500 to-sky-400',
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-[1200px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <LinkIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Social Media</h1>
          </div>
          <p className="text-muted-foreground">
            Connect your social media accounts to sync data, track performance, and expand your reach
          </p>
        </div>

        {/* Available Integrations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <Card 
              key={integration.id} 
              className={`border-2 transition-all ${integration.available ? 'hover:shadow-lg' : 'opacity-60'}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${integration.gradient}`}>
                    {integration.icon}
                  </div>
                  {integration.connected ? (
                    <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </Badge>
                  ) : integration.available ? (
                    <Badge variant="outline">Available</Badge>
                  ) : (
                    <Badge variant="secondary">Coming Soon</Badge>
                  )}
                </div>
                <CardTitle>{integration.name}</CardTitle>
                <CardDescription className="min-h-[60px]">
                  {integration.description}
                </CardDescription>

                {/* Connected profile preview for YouTube */}
                {integration.connected && integration.profileData && (
                  <div className="flex items-center gap-3 mt-3 p-3 bg-muted/50 rounded-lg">
                    {integration.profileData.profile_picture && (
                      <img 
                        src={integration.profileData.profile_picture} 
                        alt={integration.profileData.username}
                        className="h-10 w-10 rounded-full"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{integration.profileData.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {integration.profileData.followers_count?.toLocaleString()} subscribers
                      </p>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {integration.connected && integration.onSync ? (
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/social-analytics');
                      }}
                    >
                      View Analytics
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        integration.onSync?.();
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                ) : integration.onConnect ? (
                  <Button 
                    className="w-full" 
                    disabled={!integration.available || isConnecting}
                    onClick={(e) => {
                      e.stopPropagation();
                      integration.onConnect?.();
                    }}
                  >
                    {isConnecting ? 'Connecting...' : 'Connect'}
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant={integration.connected ? "outline" : "default"}
                    disabled={!integration.available}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (integration.available && integration.path !== '#') {
                        navigate(integration.path);
                      }
                    }}
                  >
                    {!integration.available ? 'Coming Soon' : integration.connected ? 'Manage' : 'Connect'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
