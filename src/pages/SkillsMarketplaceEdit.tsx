import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = ["construction", "repairs", "cleaning", "gardening", "technology", "teaching", "creative", "other"] as const;

const Schema = z.object({
  title: z.string().trim().min(5, "At least 5 characters").max(120),
  description: z.string().trim().min(20, "At least 20 characters").max(2000),
  category: z.enum(CATEGORIES),
  price_per_hour: z.coerce.number().min(1).max(10000),
  location: z.string().trim().max(120).optional().or(z.literal("")),
});

export default function SkillsMarketplaceEdit() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", category: "other" as typeof CATEGORIES[number],
    price_per_hour: "", location: "", is_active: true, image_url: null as string | null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ownerMismatch, setOwnerMismatch] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("skill_offerings")
        .select("user_id,title,description,category,price_per_hour,location,is_active,image_url")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        toast({ title: "Could not load offering", variant: "destructive" });
        setLoading(false);
        return;
      }
      if (data.user_id !== user.id) {
        setOwnerMismatch(true);
        setLoading(false);
        return;
      }
      setForm({
        title: data.title,
        description: data.description,
        category: data.category as typeof CATEGORIES[number],
        price_per_hour: data.price_per_hour ? String(data.price_per_hour) : "",
        location: data.location ?? "",
        is_active: !!data.is_active,
        image_url: data.image_url,
      });
      setLoading(false);
    })();
  }, [id, user, toast]);

  if (!user) { navigate("/auth"); return null; }

  if (ownerMismatch) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <h1 className="text-2xl font-bold mb-2">Not allowed</h1>
        <p className="text-muted-foreground mb-6">You can only edit offerings you created.</p>
        <Button asChild><Link to="/skills-marketplace/mine">My Offerings</Link></Button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Check the form", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let image_url = form.image_url;
      if (imageFile) {
        const path = `${user.id}/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("marketplace-images").upload(path, imageFile, { upsert: false });
        if (upErr) throw upErr;
        image_url = supabase.storage.from("marketplace-images").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase
        .from("skill_offerings")
        .update({
          title: parsed.data.title,
          description: parsed.data.description,
          category: parsed.data.category,
          price_per_hour: parsed.data.price_per_hour,
          location: parsed.data.location || null,
          is_active: form.is_active,
          image_url,
        })
        .eq("id", id!);
      if (error) throw error;
      toast({ title: "Offering updated" });
      navigate(`/skills-marketplace/${id}`);
    } catch (err: any) {
      toast({ title: "Could not save", description: err?.message ?? "Try again", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this offering? This cannot be undone.")) return;
    const { error } = await supabase.from("skill_offerings").delete().eq("id", id!);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Offering deleted" });
    navigate("/skills-marketplace/mine");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" onClick={() => navigate("/skills-marketplace/mine")} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to my offerings
      </Button>
      <Card>
        <CardHeader><CardTitle>Edit offering</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-10 w-full" /></div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={6} maxLength={2000} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as typeof CATEGORIES[number] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price per hour (€)</Label>
                  <Input type="number" min={1} step="0.5" value={form.price_per_hour} onChange={(e) => setForm({ ...form, price_per_hour: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Location (optional)</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={120} />
              </div>
              <div>
                <Label>Cover image (replace optional)</Label>
                {form.image_url && (
                  <img src={form.image_url} alt="" className="h-24 rounded mb-2 object-cover" />
                )}
                <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label className="text-sm">Listing is active</Label>
                  <p className="text-xs text-muted-foreground">When off, it disappears from the public marketplace.</p>
                </div>
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? "Saving…" : "Save changes"}
                </Button>
                <Button type="button" variant="destructive" onClick={remove} className="gap-2">
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
