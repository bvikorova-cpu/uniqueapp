import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2, Lock, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BUCKET = "anonymous-date-photos";
const MAX_BYTES = 5 * 1024 * 1024;

/** Uploads a hidden photo that is only revealed to a match after 7 days (or earlier for credits). */
export const PrivatePhotoUpload = () => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasPhoto, setHasPhoto] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("anonymous_dating_profiles")
      .select("photo_path")
      .eq("user_id", user.id)
      .maybeSingle();
    setHasPhoto(!!data?.photo_path);
  };

  useEffect(() => {
    load();
  }, []);

  const onPick = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Images only", description: "Pick a JPG or PNG photo.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({ title: "Photo too large", description: "Maximum size is 5 MB.", variant: "destructive" });
      return;
    }

    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in first.");

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/reveal-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase
        .from("anonymous_dating_profiles")
        .update({ photo_path: path })
        .eq("user_id", user.id);
      if (dbErr) throw dbErr;

      setHasPhoto(true);
      toast({ title: "Hidden photo saved", description: "It stays locked until a reveal." });
    } catch (e) {
      toast({ title: "Upload failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in first.");
      const { error } = await supabase
        .from("anonymous_dating_profiles")
        .update({ photo_path: null })
        .eq("user_id", user.id);
      if (error) throw error;
      setHasPhoto(false);
      toast({ title: "Hidden photo removed" });
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-anon-date mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold">Hidden reveal photo</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Nobody sees it while swiping. A match can see it after 7 days — or earlier for 5 credits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasPhoto !== null && (
            <Badge variant={hasPhoto ? "default" : "outline"} className="text-[10px]">
              {hasPhoto ? "Photo saved" : "No photo"}
            </Badge>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
            }}
          />
          <Button size="sm" disabled={busy} onClick={() => inputRef.current?.click()} className="gap-2 bg-anon-date-gradient">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {hasPhoto ? "Replace" : "Upload"}
          </Button>
          {hasPhoto && (
            <Button size="sm" variant="outline" disabled={busy} onClick={remove} aria-label="Remove hidden photo">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
