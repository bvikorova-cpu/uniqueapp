import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Lock, Eye, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface Props { onBack: () => void }

interface PPVPost {
  id: string;
  title: string;
  description: string | null;
  preview_url: string | null;
  content_url: string;
  content_type: string;
  price_cents: number;
  currency: string;
  is_active: boolean;
  total_unlocks: number;
  total_revenue_cents: number;
  created_at: string;
}

export default function PPVStudio({ onBack }: Props) {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<PPVPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", preview_url: "", content_url: "",
    content_type: "image", price_eur: "4.99",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("influking_ppv_posts")
      .select("*")
      .eq("creator_id", userId)
      .order("created_at", { ascending: false });
    setPosts((data ?? []) as PPVPost[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [userId]);

  const uploadFile = async (file: File, field: "preview_url" | "content_url") => {
    if (!userId) return;
    const key = `${userId}/ppv-${field}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("media").upload(key, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(key);
    setForm((f) => ({ ...f, [field]: publicUrl, content_type: file.type.startsWith("video/") ? "video" : "image" }));
  };

  const submit = async () => {
    if (!userId) return;
    const price = Math.round(parseFloat(form.price_eur || "0") * 100);
    if (!form.title.trim() || !form.content_url.trim() || price < 100) {
      toast({ title: "Invalid form", description: "Title, content URL and price ≥ €1.00 required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("influking_ppv_posts").insert({
      creator_id: userId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      preview_url: form.preview_url || null,
      content_url: form.content_url,
      content_type: form.content_type,
      price_cents: price,
      currency: "eur",
      is_active: true,
    });
    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "PPV post created", description: "It's live and buyable." });
    setOpen(false);
    setForm({ title: "", description: "", preview_url: "", content_url: "", content_type: "image", price_eur: "4.99" });
    void load();
  };

  const toggleActive = async (p: PPVPost) => {
    await supabase.from("influking_ppv_posts").update({ is_active: !p.is_active }).eq("id", p.id);
    void load();
  };

  const remove = async (p: PPVPost) => {
    if (!confirm(`Delete "${p.title}"? Unlocks are preserved.`)) return;
    await supabase.from("influking_ppv_posts").delete().eq("id", p.id);
    void load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New PPV post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Pay-Per-View post</DialogTitle>
              <DialogDescription>85% goes to you, 15% platform fee. EUR only.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div>
                <Label>Preview (public teaser)</Label>
                <Input type="file" accept="image/*,video/*" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "preview_url")} />
                {form.preview_url && <img src={form.preview_url} alt="" className="mt-2 h-24 rounded object-cover" />}
              </div>
              <div>
                <Label>Locked content *</Label>
                <Input type="file" accept="image/*,video/*" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "content_url")} />
                {form.content_url && <p className="text-xs text-muted-foreground mt-1 truncate">{form.content_url}</p>}
              </div>
              <div>
                <Label>Price (EUR) *</Label>
                <Input type="number" min="1" step="0.5" value={form.price_eur} onChange={(e) => setForm({ ...form, price_eur: e.target.value })} />
              </div>
              <Button className="w-full" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Publish PPV post"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Your PPV posts</CardTitle>
          <CardDescription>Locked content that fans pay to unlock. Split: 85% creator / 15% platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> :
            posts.length === 0 ? <p className="text-sm text-muted-foreground">No PPV posts yet. Create your first one.</p> :
            posts.map((p) => (
              <div key={p.id} className="flex flex-col sm:flex-row gap-3 border rounded-lg p-3">
                {p.preview_url && <img src={p.preview_url} alt="" className="w-full sm:w-24 h-24 rounded object-cover" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold truncate">{p.title}</span>
                    <Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Active" : "Hidden"}</Badge>
                    <Badge variant="outline">€{(p.price_cents / 100).toFixed(2)}</Badge>
                  </div>
                  {p.description && <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
                  <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {p.total_unlocks} unlocks</span>
                    <span>€{(p.total_revenue_cents / 100).toFixed(2)} revenue</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/influ-king/ppv/${p.id}`}><ExternalLink className="h-3 w-3 mr-1" /> View</Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(p)}>{p.is_active ? "Hide" : "Show"}</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(p)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
