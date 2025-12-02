import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useYouTubeConnect() {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectYouTube = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-auth');
      
      if (error) {
        console.error('YouTube auth error:', error);
        toast({
          title: 'Connection Failed',
          description: 'Failed to start YouTube connection. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      if (data?.authUrl) {
        // Redirect to YouTube OAuth
        window.location.href = data.authUrl;
      } else {
        toast({
          title: 'Connection Failed',
          description: 'No authentication URL received.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('YouTube connect error:', err);
      toast({
        title: 'Connection Failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const syncYouTube = async (profileId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-youtube-channel-data', {
        body: { profile_id: profileId },
      });

      if (error) {
        console.error('YouTube sync error:', error);
        toast({
          title: 'Sync Failed',
          description: 'Failed to sync YouTube data. Please try again.',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Sync Complete',
        description: 'Your YouTube data has been updated.',
      });
      return true;
    } catch (err) {
      console.error('YouTube sync error:', err);
      toast({
        title: 'Sync Failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    connectYouTube,
    syncYouTube,
    isConnecting,
  };
}
