import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Music, Instagram, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  profileId: string;
  spotifyUrl: string | null;
  instagramUrl: string | null;
  onChange: (spotify: string | null, instagram: string | null) => void;
}

const isValidUrl = (s: string) => {
  if (!s) return true;
  try { new URL(s); return true; } catch { return false; }
};

export const SocialEmbedsCard = ({ profileId, spotifyUrl, instagramUrl, onChange }: Props) => {
  const { toast } = useToast();
  const [sp, setSp] = useState(spotifyUrl || "");
  const [ig, setIg] = useState(instagramUrl || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!isValidUrl(sp) || !isValidUrl(ig)) {
      toast({ title: "Invalid URL", variant: "destructive" });
      return;
    }
    if (sp && !sp.includes("spotify.com")) {
      toast({ title: "Use a spotify.com link", variant: "destructive" });
      return;
    }
    if (ig && !ig.includes("instagram.com")) {
      toast({ title: "Use an instagram.com link", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("dating_profiles")
      .update({ spotify_url: sp || null, instagram_url: ig || null })
      .eq("id", profileId);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      onChange(sp || null, ig || null);
      toast({ title: "Social links saved" });
    }
  };

  return (
    <Card className="p-5 space-y-3">
      <FloatingHowItWorks
        title={"Social Embeds Card"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <h3 className="font-semibold text-sm">Connect Social</h3>
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Music className="h-3.5 w-3.5 text-emerald-500" /> Spotify (artist/playlist/track)
        </label>
        <Input
          value={sp}
          onChange={(e) => setSp(e.target.value)}
          placeholder="https://open.spotify.com/..."
          className="text-sm"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Instagram className="h-3.5 w-3.5 text-pink-500" /> Instagram profile
        </label>
        <Input
          value={ig}
          onChange={(e) => setIg(e.target.value)}
          placeholder="https://instagram.com/yourhandle"
          className="text-sm"
        />
      </div>
      <Button onClick={handleSave} disabled={saving} size="sm" className="w-full">
        {saving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
        Save links
      </Button>
    </Card>
  );
};
