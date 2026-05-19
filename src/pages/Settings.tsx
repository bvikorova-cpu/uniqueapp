import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  User,
  Bell,
  Lock,
  Globe,
  Palette,
  Save,
  Settings as SettingsIcon,
} from "lucide-react";
import { ProfilePageHero } from "@/components/profile/ProfilePageHero";
import { GDPRPanel } from "@/components/gdpr/GDPRPanel";
import { toast as sonnerToast } from "sonner";
import { useTheme } from "next-themes";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PointsDisplay } from "@/components/gamification/PointsDisplay";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      sonnerToast.error("No email on account");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });
    setChangingPassword(false);
    if (error) sonnerToast.error(error.message);
    else sonnerToast.success(`Password reset link sent to ${user.email}`);
  };

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    likeNotifications: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    showEmail: false,
    showPhone: false,
  });

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save settings to database or local storage
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-6 pb-8">
        <ProfilePageHero
          icon={SettingsIcon}
          title="Settings"
          subtitle="Manage your account, privacy & preferences"
          badge="Account"
          onBack={() => navigate(-1)}
        />

        {/* Settings Tabs */}
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="account" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-4">
            <PointsDisplay />
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      defaultValue={profile?.full_name || ""}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      defaultValue={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      type="tel"
                      defaultValue={profile?.phone || ""}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Password</h3>
                <Button variant="outline" onClick={handleChangePassword} disabled={changingPassword}>
                  {changingPassword ? "Sending..." : "Change Password"}
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Language</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose your preferred language for the app and email notifications. We'll send password resets, magic links and other emails in this language.
                </p>
                <div className="flex items-center gap-3">
                  <LanguageSelector />
                  <span className="text-sm text-muted-foreground">
                    Current: <span className="font-medium text-foreground">{i18n.language?.toUpperCase() || 'EN'}</span>
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications on your device
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Message Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about new messages
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.messageNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, messageNotifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Like & Comment Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone likes or comments
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.likeNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, likeNotifications: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <h3 className="text-lg font-semibold">Push Notifications</h3>
                <PushNotificationToggle />
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Per-Category Preferences</h3>
                <NotificationSettings />
              </div>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-4">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Privacy Controls</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Public Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your profile visible to everyone
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.profileVisibility}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({ ...privacySettings, profileVisibility: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your email on your profile
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.showEmail}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({ ...privacySettings, showEmail: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Phone</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your phone number on your profile
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.showPhone}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({ ...privacySettings, showPhone: checked })
                      }
                    />
                  </div>
                </div>
              </div>

            </Card>

            {/* Full GDPR controls: cookie prefs, data export, delete account */}
            <GDPRPanel />
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Theme</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose your preferred theme
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <Button variant={theme === "light" ? "default" : "outline"} className="h-20 flex-col gap-2" onClick={() => { setTheme("light"); sonnerToast.success("Light theme enabled"); }}>
                    <div className="w-8 h-8 rounded-full bg-background border-2" />
                    <span className="text-xs">Light</span>
                  </Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} className="h-20 flex-col gap-2" onClick={() => { setTheme("dark"); sonnerToast.success("Dark theme enabled"); }}>
                    <div className="w-8 h-8 rounded-full bg-foreground" />
                    <span className="text-xs">Dark</span>
                  </Button>
                  <Button variant={theme === "system" ? "default" : "outline"} className="h-20 flex-col gap-2" onClick={() => { setTheme("system"); sonnerToast.success("Following system theme"); }}>
                    <div className="w-8 h-8 rounded-full bg-background" />
                    <span className="text-xs">Auto</span>
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button onClick={handleSaveSettings} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
