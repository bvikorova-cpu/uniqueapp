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
      title: "Nastavenia uložené",
      description: "Vaše preferencie cookies boli aktualizované.",
    });
  };

  const exportData = async () => {
    if (!user) return;
    setExporting(true);
    
    try {
      const [profileRes, postsRes, messagesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
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
        title: "Export dokončený",
        description: "Vaše dáta boli stiahnuté.",
      });
    } catch (error) {
      toast({
        title: "Chyba exportu",
        description: "Nepodarilo sa exportovať dáta.",
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
      // Delete user data from various tables
      await Promise.all([
        supabase.from("posts").delete().eq("user_id", user.id),
        supabase.from("post_comments").delete().eq("user_id", user.id),
        supabase.from("post_likes").delete().eq("user_id", user.id),
        supabase.from("messages").delete().or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
        supabase.from("profiles").delete().eq("id", user.id),
      ]);

      // Sign out
      await supabase.auth.signOut();
      
      localStorage.clear();
      
      toast({
        title: "Účet vymazaný",
        description: "Váš účet a všetky dáta boli vymazané.",
      });

      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa vymazať účet. Kontaktujte podporu.",
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
            GDPR a Ochrana súkromia
          </CardTitle>
          <CardDescription>
            Spravujte vaše osobné údaje a preferencie súkromia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cookie Preferences */}
          <div>
            <h3 className="font-medium flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4" />
              Nastavenia cookies
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Nevyhnutné cookies</Label>
                  <p className="text-xs text-muted-foreground">
                    Potrebné pre základnú funkčnosť
                  </p>
                </div>
                <Switch checked disabled />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Analytické cookies</Label>
                  <p className="text-xs text-muted-foreground">
                    Pomáhajú zlepšovať služby
                  </p>
                </div>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => updatePreferences("analytics", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Marketingové cookies</Label>
                  <p className="text-xs text-muted-foreground">
                    Personalizovaná reklama
                  </p>
                </div>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => updatePreferences("marketing", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Personalizačné cookies</Label>
                  <p className="text-xs text-muted-foreground">
                    Prispôsobenie obsahu
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
              Export dát
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Stiahnite všetky vaše osobné údaje vo formáte JSON.
            </p>
            <Button onClick={exportData} disabled={exporting || !user} variant="outline">
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exportujem...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportovať moje dáta
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Privacy Policy */}
          <div>
            <h3 className="font-medium flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4" />
              Právne dokumenty
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="link" className="p-0 h-auto" asChild>
                <a href="/terms" target="_blank">Podmienky používania</a>
              </Button>
              <span className="text-muted-foreground">•</span>
              <Button variant="link" className="p-0 h-auto" asChild>
                <a href="/terms#privacy" target="_blank">Zásady ochrany súkromia</a>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Delete Account */}
          <div>
            <h3 className="font-medium flex items-center gap-2 mb-4 text-destructive">
              <Trash2 className="h-4 w-4" />
              Vymazanie účtu
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Táto akcia je nevratná. Všetky vaše dáta budú permanentne vymazané.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={!user}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Vymazať môj účet
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ste si istí?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Táto akcia je nevratná. Všetky vaše príspevky, správy, nasledovatelia
                    a ďalšie dáta budú permanentne vymazané z našich serverov.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Zrušiť</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={deleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Mazanie...
                      </>
                    ) : (
                      "Áno, vymazať účet"
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
