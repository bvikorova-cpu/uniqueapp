import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Code2, Key, BookOpen, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const FUNCTIONS_BASE = "https://jufrdzeonywluwutvyxz.supabase.co/functions/v1";

export const SettingsApiView = () => {
  const [watermark, setWatermark] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setUserId(data.user.id);
      const { data: row } = await supabase
        .from("ai_public_profiles")
        .select("watermark_enabled")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (row) setWatermark(row.watermark_enabled !== false);
    })();
  }, []);

  const toggle = async (v: boolean) => {
    if (!userId) { toast.error("Please sign in first"); return; }
    const prev = watermark;
    setWatermark(v);
    setSaving(true);
    const { error } = await supabase
      .from("ai_public_profiles")
      .upsert({ user_id: userId, watermark_enabled: v, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      setWatermark(prev);
      toast.error("Could not save setting");
      return;
    }
    toast.success(v ? "Watermark enabled" : "Watermark disabled");
  };

  const exampleCurl = `curl -X POST ${FUNCTIONS_BASE}/ai-image-tools \\
  -H "Authorization: Bearer YOUR_USER_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{"action":"generate","prompt":"a sunset over mountains","aspectRatio":"16:9"}'`;

  const copy = async (s: string) => {
    try {
      await navigator.clipboard.writeText(s);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed — select the text manually");
    }
  };


  return (
    <>
      <FloatingHowItWorks title={"Settings Api View - How it works"} steps={[{ title: 'Open', desc: 'Access the Settings Api View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Settings Api View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-1">⚙️ Settings & API Access</h2>
        <p className="text-muted-foreground text-sm">Watermark preference, EXIF metadata, and developer API access.</p>
      </div>

      <div className="rounded-xl border border-border bg-card/80 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> Watermark on downloads</p>
            <p className="text-xs text-muted-foreground">Free users get watermarked exports. Pro users can disable.</p>
          </div>
          <Switch checked={watermark} onCheckedChange={toggle} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card/80 p-4 space-y-3">
        <p className="font-bold flex items-center gap-2"><Code2 className="w-4 h-4 text-primary" /> Developer API</p>
        <p className="text-xs text-muted-foreground">All AI Image actions are exposed as a single edge function. Authenticate with your user JWT.</p>
        <div className="relative">
          <pre className="bg-background border rounded-lg p-3 text-[11px] overflow-x-auto">{exampleCurl}</pre>
          <Button size="icon" variant="outline" className="absolute top-2 right-2 h-7 w-7" onClick={() => copy(exampleCurl)}><Copy className="w-3 h-3" /></Button>
        </div>
        <p className="text-xs text-muted-foreground">Available actions: <code className="text-[10px]">generate, edit, style_transfer, upscale, variations, inpainting, outpainting, bg_remove, bg_replace, reference_image, logo_text, sketch_to_image, character_consistency, face_swap, pose_control, tile_pattern, avatar_pack, animate_image, prompt_enhance, image_to_prompt, prompt_gallery</code></p>
      </div>

      <div className="rounded-xl border border-border bg-card/80 p-4 space-y-2">
        <p className="font-bold flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> EXIF Metadata</p>
        <p className="text-xs text-muted-foreground">All generated images include EXIF tags with the prompt, model, seed, and creation timestamp for full provenance.</p>
      </div>
    </div>
    </>
  );
};
