import { useEffect, useState } from "react";
import { Share2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const STORAGE_KEY = "ai_image_public_profile";

export const PublicProfileView = () => {
  const [enabled, setEnabled] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const profileUrl = user ? `${window.location.origin}/u/${user.id}/ai-gallery` : "";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ? { id: data.user.id, email: data.user.email } : null));
    setEnabled(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const toggle = (v: boolean) => { setEnabled(v); localStorage.setItem(STORAGE_KEY, String(v)); toast.success(v ? "Public profile enabled" : "Public profile disabled"); };
  const copy = () => { navigator.clipboard.writeText(profileUrl); toast.success("Link copied!"); };

  return (
    <>
      <FloatingHowItWorks title={"Public Profile View - How it works"} steps={[{ title: 'Open', desc: 'Access the Public Profile View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Public Profile View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-1">🌐 Public Profile</h2>
        <p className="text-muted-foreground text-sm">Share your AI gallery with the world. Toggle on to enable a public showcase.</p>
      </div>

      <div className="rounded-xl border border-border bg-card/80 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold">Enable public AI gallery</p>
            <p className="text-xs text-muted-foreground">Visitors can browse your shared generations.</p>
          </div>
          <Switch checked={enabled} onCheckedChange={toggle} />
        </div>

        {enabled && user && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground">Your shareable link</p>
            <div className="flex gap-2">
              <input readOnly value={profileUrl} className="flex-1 px-3 py-2 rounded-lg border bg-background text-xs font-mono" />
              <Button size="icon" variant="outline" onClick={copy}><Copy className="w-4 h-4" /></Button>
              <Button size="icon" variant="outline" onClick={() => window.open(profileUrl, "_blank")}><ExternalLink className="w-4 h-4" /></Button>
            </div>
            <Button className="w-full gap-2" onClick={async () => {
              if (navigator.share) { try { await navigator.share({ url: profileUrl, title: "My AI Gallery" }); } catch { /* dismissed */ } }
              else { copy(); }
            }}><Share2 className="w-4 h-4" /> Share</Button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};
