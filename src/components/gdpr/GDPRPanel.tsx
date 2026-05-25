import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Download, Trash2, Shield, Eye, Settings, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export function GDPRPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(() => {
    const saved = localStorage.getItem("gdpr_cookie_preferences");
    if (saved) return JSON.parse(saved);
    return {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    };
  });

  const updatePreferences = (key: keyof CookiePreferences, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    localStorage.setItem("gdpr_cookie_preferences", JSON.stringify(newPrefs));
    localStorage.setItem("gdpr_cookie_consent", new Date().toISOString());
    toast({
      title: "Settings saved",
      description: "Your cookie preferences have been updated.",
    });
  };

  const exportData = async () => {
    if (!user) return;
    setExporting(true);
    
    try {
      const [profileRes, postsRes, messagesRes] = await Promise.all([
        (supabase as any).from("profiles_public").select("*").eq("id", user.id).single(),
        supabase.from("posts").select("*").eq("user_id", user.id),
        supabase.from("messages").select("*").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        profile: profileRes.data,
        posts: postsRes.data,
        messages: messagesRes.data,
        cookiePreferences: preferences,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `unique-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export complete",
        description: "Your data has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export error",
        description: "Failed to export data.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    setDeleting(true);

    try {
      // Server-side deletion: edge function uses service role + auth.admin.deleteUser
      // which cascades FK deletes across the whole schema (true GDPR erasure).
      const { data, error } = await supabase.functions.invoke(
        "delete-user-account",
        { body: { confirm: "DELETE" } },
      );

      if (error || (data as any)?.error) {
        throw new Error((data as any)?.error || error?.message || "Delete failed");
      }

      await supabase.auth.signOut();
      localStorage.clear();

      toast({
        title: "Account deleted",
        description: "Your account and all data have been permanently deleted.",
      });

      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.message ||
          "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            GDPR & Privacy Protection
          </CardTitle>
          <CardDescription>
            Manage your personal data and privacy preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cookie Preferences */}
          <div>
            <h3 className="font-medium flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4" />
              Cookie settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Necessary cookies</Label>
                  <p className="text-xs text-muted-foreground">
                    Required for basic functionality
                  </p>
                </div>
                <Switch checked disabled />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Analytics cookies</Label>
                  <p className="text-xs text-muted-foreground">
                    Help improve our services
                  </p>
                </div>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => updatePreferences("analytics", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Marketing cookies</Label>
                  <p className="text-xs text-muted-foreground">
                    Personalized advertising
                  </p>
                </div>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => updatePreferences("marketing", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Personalization cookies</Label>
                  <p className="text-xs text-muted-foreground">
                    Content customization
                  </p>
                </div>
                <Switch
                  checked={preferences.personalization}
                  onCheckedChange={(checked) => updatePreferences("personalization", checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Data Export */}
          <div>
            <h3 className="font-medium flex items-center gap-2 mb-4">
              <Download className="h-4 w-4" />
              Data export
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Download all your personal data in JSON format.
            </p>
            <Button onClick={exportData} disabled={exporting || !user} variant="outline">
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export my data
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Privacy Policy */}
          <div>
            <h3 className="font-medium flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4" />
              Legal documents
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="link" className="p-0 h-auto" asChild>
                <a href="/terms" target="_blank">Terms of Service</a>
              </Button>
              <span className="text-muted-foreground">•</span>
              <Button variant="link" className="p-0 h-auto" asChild>
                <a href="/legal/privacy" target="_blank">Privacy Policy</a>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Delete Account */}
          <div>
            <h3 className="font-medium flex items-center gap-2 mb-4 text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete account
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This action is irreversible. All your data will be permanently deleted.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={!user}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete my account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action is irreversible. All your posts, messages, followers,
                    and other data will be permanently deleted from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={deleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Yes, delete account"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
