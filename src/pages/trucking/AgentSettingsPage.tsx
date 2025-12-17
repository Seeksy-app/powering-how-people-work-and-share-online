import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KeyRound, Bell, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TruckingPageWrapper } from "@/components/trucking/TruckingPageWrapper";

export default function AgentSettingsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailNewLead: true,
    smsNewLead: true,
    emailFailedCalls: true,
    emailDailySummary: false,
  });

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });
      if (error) throw error;
      
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Password updated successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          notification_preferences: notifications,
        },
      });
      if (error) throw error;
      toast({ title: "Notification preferences saved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <TruckingPageWrapper 
      title="Settings" 
      description="Manage your password and notification preferences"
    >
      <div className="max-w-2xl space-y-6">
        {/* Password Reset */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-500" />
              Password Reset
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
            <Button 
              onClick={handlePasswordChange} 
              disabled={changingPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              className="bg-slate-800 hover:bg-slate-700"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              Notifications
            </CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Email: New lead alerts</p>
                <p className="text-sm text-slate-500">Get emailed when a driver wants a load</p>
              </div>
              <Switch
                checked={notifications.emailNewLead}
                onCheckedChange={(v) => setNotifications({ ...notifications, emailNewLead: v })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">SMS: New lead alerts</p>
                <p className="text-sm text-slate-500">Get a text when a driver wants a load</p>
              </div>
              <Switch
                checked={notifications.smsNewLead}
                onCheckedChange={(v) => setNotifications({ ...notifications, smsNewLead: v })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Email: Failed call alerts</p>
                <p className="text-sm text-slate-500">Get notified when a call fails or drops</p>
              </div>
              <Switch
                checked={notifications.emailFailedCalls}
                onCheckedChange={(v) => setNotifications({ ...notifications, emailFailedCalls: v })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Email: Daily summary</p>
                <p className="text-sm text-slate-500">Receive a daily summary of calls and leads</p>
              </div>
              <Switch
                checked={notifications.emailDailySummary}
                onCheckedChange={(v) => setNotifications({ ...notifications, emailDailySummary: v })}
              />
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleSaveNotifications} 
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TruckingPageWrapper>
  );
}
