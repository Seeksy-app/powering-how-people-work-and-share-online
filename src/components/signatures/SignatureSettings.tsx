import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Key, Copy, Check } from "lucide-react";

export function SignatureSettings() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState({
    notify_on_open: true,
    notify_on_click: true,
    notify_via_email: true,
    notify_via_browser: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch API key
    const { data: keyData } = await supabase
      .from("signature_extension_keys")
      .select("api_key")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (keyData) setApiKey(keyData.api_key);

    // Fetch notification settings
    const { data: settingsData } = await supabase
      .from("signature_notification_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (settingsData) {
      setSettings({
        notify_on_open: settingsData.notify_on_open,
        notify_on_click: settingsData.notify_on_click,
        notify_via_email: settingsData.notify_via_email,
        notify_via_browser: settingsData.notify_via_browser,
      });
    }
  };

  const generateApiKey = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newKey = `sk_${crypto.randomUUID().replace(/-/g, "")}`;

    const { error } = await supabase
      .from("signature_extension_keys")
      .upsert({
        user_id: user.id,
        api_key: newKey,
        is_active: true,
      });

    if (error) {
      toast({ title: "Error", description: "Failed to generate API key", variant: "destructive" });
    } else {
      setApiKey(newKey);
      toast({ title: "API Key Generated", description: "Use this key in the Chrome extension" });
    }
  };

  const copyApiKey = async () => {
    if (apiKey) {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Chrome Extension */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Chrome Extension
          </CardTitle>
          <CardDescription>
            Install the Seeksy Gmail extension to auto-inject signatures with tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Extension (ZIP)
          </Button>
          <p className="text-sm text-muted-foreground">
            1. Download and unzip the extension<br/>
            2. Go to chrome://extensions<br/>
            3. Enable "Developer mode"<br/>
            4. Click "Load unpacked" and select the folder
          </p>
        </CardContent>
      </Card>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Extension API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiKey ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                {apiKey.slice(0, 12)}...{apiKey.slice(-8)}
              </code>
              <Button variant="outline" size="icon" onClick={copyApiKey}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ) : (
            <Button onClick={generateApiKey}>Generate API Key</Button>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Get notified when your emails are opened or clicked</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Notify on email opens</Label>
            <Switch checked={settings.notify_on_open} onCheckedChange={(v) => setSettings(s => ({ ...s, notify_on_open: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Notify on link clicks</Label>
            <Switch checked={settings.notify_on_click} onCheckedChange={(v) => setSettings(s => ({ ...s, notify_on_click: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Send email notifications</Label>
            <Switch checked={settings.notify_via_email} onCheckedChange={(v) => setSettings(s => ({ ...s, notify_via_email: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Browser notifications</Label>
            <Switch checked={settings.notify_via_browser} onCheckedChange={(v) => setSettings(s => ({ ...s, notify_via_browser: v }))} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
