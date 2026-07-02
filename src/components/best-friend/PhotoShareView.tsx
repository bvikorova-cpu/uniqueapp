import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Camera, Upload } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const PhotoShareView = () => {
  const [uploading, setUploading] = useState(false);
  const [reaction, setReaction] = useState<{ url: string; reaction: string } | null>(null);
  const [caption, setCaption] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in");
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("best-friend-media").upload(path, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("best-friend-media").getPublicUrl(path);

      const { data, error } = await supabase.functions.invoke("best-friend-photo-react", {
        body: { image_url: publicUrl, caption: caption.trim() || undefined },
      });
      if (error) throw error;
      setReaction({ url: publicUrl, reaction: data.reaction });
      setCaption("");
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Photo Share View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
          <Camera className="h-8 w-8 text-white"/>
        </div>
        <h2 className="text-3xl font-black">Share a Photo</h2>
        <p className="text-muted-foreground mt-2">Show your best friend something — they'll react ❤️</p>
      </div>

      <Card><CardContent className="p-6 space-y-4">
        <Input placeholder="Optional caption..." value={caption} onChange={e => setCaption(e.target.value)} maxLength={200} />
        <input ref={fileRef} type="file" accept="image/*" hidden
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
        <Button onClick={() => fileRef.current?.click()} disabled={uploading} size="lg" className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600">
          {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Upload className="h-4 w-4 mr-2"/>}
          {uploading ? "AI is looking..." : "Pick a photo"}
        </Button>
      </CardContent></Card>

      {reaction && (
        <Card><CardContent className="p-4 space-y-3">
          <img src={reaction.url} alt="" className="w-full rounded-lg max-h-96 object-contain" />
          <div className="bg-card/80 border rounded-2xl p-3"><p className="text-sm">{reaction.reaction}</p></div>
        </CardContent></Card>
      )}
    </div>
  );
};
