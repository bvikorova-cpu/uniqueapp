import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Sparkles, Loader2, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: "image" | "video";
  caption: string | null;
  expires_at: string;
  created_at: string;
  author?: { full_name: string | null; avatar_url: string | null };
}

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

const MegatalentStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [open, setOpen] = useState<Story | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("mt_stories")
      .select("*")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    const rows = (data || []) as Story[];
    if (rows.length) {
      const uids = [...new Set(rows.map((r) => r.user_id))];
      const { data: profs } = await (supabase as any).from("profiles_public").select("id, full_name, avatar_url").in("id", uids);
      const pmap: Record<string, any> = {};
      (profs || []).forEach((p: any) => (pmap[p.id] = p));
      rows.forEach((r) => (r.author = pmap[r.user_id]));
    }
    setStories(rows);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("mt-stories-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "mt_stories" }, load)
      .subscribe();
    return (
    <>
      <FloatingHowItWorks title={"Megatalent Stories - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Stories section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Stories.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => {
      supabase.removeChannel(ch);
    };
  }, []);

  const upload = async (file: File) => {
    if (!userId) {
      toast.error("Sign in to post a story");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error(`Max file size is ${MAX_SIZE / 1024 / 1024} MB`);
      return;
    }
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      toast.error("Only images and videos are allowed");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
      const bucket = isVideo ? "videos" : "media";
      const path = `${userId}/stories/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      const { error: insErr } = await (supabase as any).from("mt_stories").insert({
        user_id: userId,
        media_url: pub.publicUrl,
        media_type: isVideo ? "video" : "image",
      });
      if (insErr) throw insErr;
      toast.success("Story posted! Visible for 24h");
      load();
    } catch (e: any) {
      toast.error("Upload failed", { description: e?.message });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeOwn = async (story: Story) => {
    if (story.user_id !== userId) return;
    await (supabase as any).from("mt_stories").delete().eq("id", story.id);
    setOpen(null);
    load();
  };

  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-card/70 border-border/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Talent Stories · 24h</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || !userId}
            className="flex flex-col items-center gap-1 shrink-0 disabled:opacity-50"
            aria-label="Upload your story"
          >
            <div className="h-16 w-16 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Plus className="h-6 w-6 text-primary" />}
            </div>
            <span className="text-[11px] text-muted-foreground">Your story</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />

          {loading && <div className="text-xs text-muted-foreground self-center">Loading…</div>}
          {!loading && stories.length === 0 && (
            <div className="text-xs text-muted-foreground self-center">No stories yet — be first!</div>
          )}
          {stories.map((s) => (
            <button key={s.id} onClick={() => setOpen(s)} className="flex flex-col items-center gap-1 shrink-0">
              <div className="h-16 w-16 rounded-full p-[2px] bg-gradient-to-tr from-primary to-accent">
                <div className="h-full w-full rounded-full bg-background overflow-hidden flex items-center justify-center">
                  {s.media_type === "image" ? (
                    <img src={s.media_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <video src={s.media_url} className="h-full w-full object-cover" muted playsInline />
                  )}
                </div>
              </div>
              <span className="text-[11px] truncate max-w-[64px]">{s.author?.full_name?.split(" ")[0] || "User"}</span>
            </button>
          ))}
        </div>
      </CardContent>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-sm p-0 overflow-hidden border-0">
          {open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative aspect-[9/16] bg-black flex items-center justify-center">
              {open.media_type === "image" ? (
                <img src={open.media_url} alt="" className="w-full h-full object-contain" />
              ) : (
                <video src={open.media_url} autoPlay controls playsInline className="w-full h-full object-contain" />
              )}
              <div className="absolute top-2 left-2 right-2 flex items-center gap-2 text-white">
                <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-xs font-bold">
                  {open.author?.full_name?.[0] || "U"}
                </div>
                <div className="text-sm font-semibold drop-shadow">{open.author?.full_name || "User"}</div>
                {open.user_id === userId && (
                  <button onClick={() => removeOwn(open)} className="ml-auto text-xs bg-red-500/80 px-2 py-1 rounded">
                    Delete
                  </button>
                )}
                <button onClick={() => setOpen(null)} className="bg-white/20 backdrop-blur p-1 rounded-full">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MegatalentStories;
