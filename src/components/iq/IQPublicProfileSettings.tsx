import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Globe, Copy, Loader2 } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQPublicProfileSettings() {
  const qc = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["iq-my-public-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("iq_public_profiles").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setIsPublic(profile.is_public ?? true);
    }
  }, [profile]);

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const slug = profile?.share_slug ?? `${(displayName || "user").toLowerCase().replace(/[^a-z0-9]/g, "-")}-${user.id.slice(0, 6)}`;
      const { error } = await supabase.from("iq_public_profiles").upsert({
        user_id: user.id,
        share_slug: slug,
        display_name: displayName || null,
        bio: bio || null,
        is_public: isPublic,
      }, { onConflict: "user_id" });
      if (error) throw error;
      toast({ title: "Saved", description: "Public profile updated" });
      qc.invalidateQueries({ queryKey: ["iq-my-public-profile"] });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const url = profile?.share_slug ? `${window.location.origin}/iq/u/${profile.share_slug}` : "";

  return (
    <>
      <FloatingHowItWorks title="How IQPublic Profile Settings works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> Public IQ Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <div>
              <Label className="text-xs">Display name</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How you appear publicly" />
            </div>
            <div>
              <Label className="text-xs">Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio..." rows={2} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Make profile public</Label>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
            {url && (
              <div className="flex gap-2 items-center text-xs bg-muted/40 rounded p-2">
                <span className="flex-1 truncate">{url}</span>
                <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(url); toast({ title: "Copied!" }); }}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
            <Button onClick={save} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Profile"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
    </>
    );
}
