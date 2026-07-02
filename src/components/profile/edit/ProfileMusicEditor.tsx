import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Music2, Upload, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const MAX_BYTES = 6 * 1024 * 1024; // 6MB

export const ProfileMusicEditor = ({
  userId,
  url,
  title,
  onChange,
}: {
  userId: string;
  url?: string | null;
  title?: string | null;
  onChange: (url: string | null, title: string | null) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_BYTES) {
      toast({ title: "File too large", description: "Max 6 MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = f.name.split(".").pop() || "mp3";
      const path = `${userId}/music-${Date.now()}.${ext}`;
      let bucket = "profile-media";
      let upErr = (await supabase.storage.from(bucket).upload(path, f, { upsert: true })).error;
      if (upErr) {
        bucket = "avatars";
        upErr = (await supabase.storage.from(bucket).upload(path, f, { upsert: true })).error;
      }
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(publicUrl, title || f.name.replace(/\.[^.]+$/, ""));
      toast({ title: "Music uploaded" });
    } catch (err: any) {
      toast({ title: "Upload error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Profile Music Editor - How it works"} steps={[{ title: 'Open', desc: 'Access the Profile Music Editor section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Profile Music Editor.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-5 mb-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Music2 className="h-4 w-4 text-primary" />
        <Label className="font-semibold">Profile music</Label>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Add a short audio track that visitors can play on your profile (mp3/m4a, max 6 MB).
      </p>

      {url && (
        <>
          <Input
            placeholder="Track title"
            value={title || ""}
            onChange={(e) => onChange(url, e.target.value)}
            className="mb-2"
          />
          <audio src={url} controls className="w-full mb-2" preload="none" />
        </>
      )}

      <div className="flex gap-2">
        <input ref={inputRef} type="file" accept="audio/*" hidden onChange={handleFile} />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          {url ? "Replace" : "Upload"}
        </Button>
        {url && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => onChange(null, null)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>
    </Card>
    </>
  );
};
