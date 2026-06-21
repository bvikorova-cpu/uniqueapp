import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function MusicUpload() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast({ title: "Login required", variant: "destructive" });
    if (!file || !title) return toast({ title: "Title and file are required", variant: "destructive" });
    setBusy(true);
    try {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("music").upload(path, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("music").getPublicUrl(path);
      const { error } = await supabase.from("music_tracks" as any).insert({
        user_id: user.id, title, description, audio_url: publicUrl, status: "published",
      });
      if (error) throw error;
      toast({ title: "Track uploaded" });
      nav("/musician-dashboard");
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <main className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><Upload className="w-7 h-7" /> Upload Track</h1>
      <Card>
        <CardHeader><CardTitle>New release</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Description / credits" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          <Input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <p className="text-xs opacity-60">Royalties are paid 80/20 per platform policy. Streams generate EUR earnings.</p>
          <Button onClick={submit} disabled={busy} className="w-full">{busy ? "Uploading…" : "Publish"}</Button>
        </CardContent>
      </Card>
    </main>
  );
}
