import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const CATEGORIES = ["construction", "repairs", "cleaning", "gardening", "technology", "teaching", "creative", "other"] as const;

const Schema = z.object({
  title: z.string().trim().min(5, "At least 5 characters").max(120),
  description: z.string().trim().min(20, "At least 20 characters").max(2000),
  category: z.enum(CATEGORIES),
  price_per_hour: z.coerce.number().min(1, "Min 1 €").max(10000),
  location: z.string().trim().max(120).optional().or(z.literal("")),
});

export default function SkillsMarketplaceCreate() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", category: "other" as typeof CATEGORIES[number], price_per_hour: "", location: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    navigate("/auth");
    return null;
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
      let image_url: string | null = null;
      if (imageFile) {
        const path = `${user.id}/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("marketplace-images").upload(path, imageFile, { upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("marketplace-images").getPublicUrl(path);
        image_url = data.publicUrl;
      }

      const { data, error } = await supabase
        .from("skill_offerings")
        .insert({
          user_id: user.id,
          title: parsed.data.title,
          description: parsed.data.description,
          category: parsed.data.category,
          price_per_hour: parsed.data.price_per_hour,
          location: parsed.data.location || null,
          image_url,
          is_active: true,
        })
        .select("id")
        .single();
      if (error) throw error;
      toast({ title: "Offering published" });
      navigate(`/skills-marketplace/${data.id}`);
    } catch (err: any) {
      toast({ title: "Could not publish", description: err?.message ?? "Try again", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Skills Marketplace Create works" steps={[
          { title: 'Browse listings', desc: 'Explore items, services or offers.' },
          { title: 'Open a detail', desc: 'Review price, seller and terms.' },
          { title: 'Buy / order / bid', desc: 'Complete secure Stripe checkout in EUR. Fees follow platform splits.' },
          { title: 'Track & review', desc: 'Manage orders, leave reviews, get notifications.' },
        ]} />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" onClick={() => navigate("/skills-marketplace")} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to marketplace
      </Button>
      <Card>
        <CardHeader><CardTitle>Post a new offering</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. I'll assemble your IKEA furniture" maxLength={120} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What you offer, experience, what's included…" rows={6} maxLength={2000} />
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
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City or region" maxLength={120} />
            </div>
            <div>
              <Label>Cover image (optional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Publishing…" : "Publish offering"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </>
    );
}
