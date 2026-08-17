import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Coins } from "lucide-react";
import { SkillsAccessGate } from "@/components/skills/SkillsAccessGate";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const CATEGORIES = ["construction", "repairs", "cleaning", "gardening", "technology", "teaching", "creative", "other"] as const;

const OFFERING_CREDIT_COST = 2;

const Schema = z.object({ title: z.string().trim().min(5, "At least 5 characters").max(120),
  description: z.string().trim().min(20, "At least 20 characters").max(2000),
  category: z.enum(CATEGORIES),
  price_per_hour: z.coerce.number().min(1, "Min 1 €").max(10000),
  location: z.string().trim().max(120).optional().or(z.literal("")) });

function SkillsMarketplaceCreateForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", category: "other" as typeof CATEGORIES[number], price_per_hour: "", location: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setBalance(data?.credits_remaining ?? 0));
  }, [user]);

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

      const { data, error } = await supabase.rpc("publish_skill_offering", {
        _title: parsed.data.title,
        _description: parsed.data.description,
        _category: parsed.data.category,
        _price_per_hour: parsed.data.price_per_hour,
        _location: parsed.data.location || null,
        _image_url: image_url,
      });
      if (error) throw error;
      setBalance((current) => current === null ? current : current - OFFERING_CREDIT_COST);
      toast({ title: "Offering published", description: `${OFFERING_CREDIT_COST} credits used · 0% commission.` });
      navigate(`/skills-marketplace/${data}`);
    } catch (err: any) {
      toast({ title: "Could not publish", description: err?.message ?? "Try again", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Skills Marketplace Create works" steps={[
          { title: 'Pick a category', desc: 'Choose the category your offering belongs to.' },
          { title: 'Describe the service', desc: 'Title, description, hourly price in EUR and optional location.' },
          { title: `Pay ${OFFERING_CREDIT_COST} credits`, desc: 'Opening an offering costs 2 credits — no commission on the job.' },
          { title: 'Get orders', desc: 'Buyers contact you, order and review your work.' },
        ]} />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" onClick={() => navigate("/skills-marketplace")} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to marketplace
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Post a new offering</CardTitle>
          <div className="flex items-center justify-between gap-2 flex-wrap pt-2">
            <p className="text-sm text-muted-foreground">
              Flat fee {OFFERING_CREDIT_COST} credits · 0% commission
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{balance === null ? "—" : `${balance} credits`}</Badge>
              <Button variant="outline" size="sm" onClick={() => navigate("/ai-credits")}>Top up</Button>
            </div>
          </div>
        </CardHeader>
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
            <Button type="submit" disabled={submitting} className="w-full gap-2">
              <Coins className="h-4 w-4" />
              {submitting ? "Publishing…" : `Publish offering · ${OFFERING_CREDIT_COST} credits`}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {OFFERING_CREDIT_COST} credits are deducted once when publishing. No commission on your job.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
    </>
    );
}

export default function SkillsMarketplaceCreate() {
  return (
    <SkillsAccessGate>
      <SkillsMarketplaceCreateForm />
    </SkillsAccessGate>
  );
}
