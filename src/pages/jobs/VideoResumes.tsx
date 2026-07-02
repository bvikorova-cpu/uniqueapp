import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Video, Upload, Loader2, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useResolvedStorageUrl } from "@/lib/storageSigned";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_VIDEORESUMES = [
  { title: "Record or upload", desc: "Use the in-browser recorder or upload a MP4 up to 60s." },
  { title: "Add captions & tags", desc: "Auto-captions can be edited. Tag with role/skills for discovery." },
  { title: "Attach to applications", desc: "Employers see your video directly on the application card." },
];

interface VR { id: string; user_id: string; video_url: string; thumbnail_url: string | null; title: string | null; duration_seconds: number | null; is_public: boolean; created_at: string; }

function VideoResumeCard({ v, onToggle, onRemove }: { v: VR; onToggle: (v: VR) => void; onRemove: (v: VR) => void }) {
  const src = useResolvedStorageUrl(v.video_url);
  return (
    <Card><CardContent className="p-3 space-y-2">
      {src ? <video src={src} controls className="w-full rounded-md aspect-video bg-black" /> : <div className="w-full aspect-video rounded-md bg-muted animate-pulse" />}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold truncate">{v.title}</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted">{v.is_public ? "Public" : "Private"}</span>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => onToggle(v)}>
          {v.is_public ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
          {v.is_public ? "Unpublish" : "Publish"}
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onRemove(v)}><Trash2 className="h-3 w-3" /></Button>
      </div>
    </CardContent></Card>
  );
}

export default function VideoResumes() {
  const [items, setItems] = useState<VR[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data } = await (supabase as any).from("video_resumes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setItems((data as VR[]) || []);
  };

  useEffect(() => { load(); }, []);

  const upload = async (file: File) => {
    if (!userId) return toast.error("Sign in first");
    if (file.size > 100 * 1024 * 1024) return toast.error("Max 100MB");
    setUploading(true);
    try {
      const path = `${userId}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from("video-resumes").upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("video-resumes").getPublicUrl(path);
      const { error: insErr } = await (supabase as any).from("video_resumes").insert({
        user_id: userId, video_url: pub.publicUrl, title: title || file.name, is_public: isPublic,
      });
      if (insErr) throw insErr;
      toast.success("Video resume uploaded");
      setTitle("");
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally { setUploading(false); }
  };

  const togglePublic = async (item: VR) => {
    await (supabase as any).from("video_resumes").update({ is_public: !item.is_public }).eq("id", item.id);
    load();
  };

  const remove = async (item: VR) => {
    if (!confirm("Delete this video resume?")) return;
    await (supabase as any).from("video_resumes").delete().eq("id", item.id);
    load();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-4">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-rose-500/15 via-primary/10 to-orange-500/5 border border-rose-500/20 p-6 flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-xl"><Video className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-black">Video Resumes</h1>
          <p className="text-xs text-muted-foreground">Stand out with a 30–90s pitch video.</p>
        </div>
      </motion.div>

      <Card><CardContent className="p-4 space-y-2">
        <Input placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} />
        <label className="flex items-center justify-between text-sm">Make public for recruiters <Switch checked={isPublic} onCheckedChange={setIsPublic} /></label>
        <input ref={fileRef} type="file" accept="video/*" hidden onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
        <Button className="w-full" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
          Upload video resume
        </Button>
      </CardContent></Card>

      <div className="grid sm:grid-cols-2 gap-3">
        {items.map(v => (
          <VideoResumeCard key={v.id} v={v} onToggle={togglePublic} onRemove={remove} />
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No videos yet. Upload your first pitch above.</p>}
      </div>
    </div>
  );
}
