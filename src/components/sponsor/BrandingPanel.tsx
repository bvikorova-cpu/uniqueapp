import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Palette, Save } from "lucide-react";
import { toast } from "sonner";

interface Props {
  sponsorId: string;
  tier: string;
}

type Branding = {
  primary_color?: string | null;
  accent_color?: string | null;
  background_color?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  custom_css?: string | null;
  custom_domain?: string | null;
  tagline?: string | null;
};

export function BrandingPanel({ sponsorId, tier }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Branding>({});
  const canEdit = tier === "platinum" || tier === "enterprise";

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("brand_sponsor_branding")
        .select("*")
        .eq("sponsor_id", sponsorId)
        .maybeSingle();
      if (data) setForm(data);
      setLoading(false);
    })();
  }, [sponsorId]);

  const save = async () => {
    setSaving(true);
    const payload = { sponsor_id: sponsorId, ...form };
    const { error } = await supabase
      .from("brand_sponsor_branding")
      .upsert(payload, { onConflict: "sponsor_id" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Branding saved");
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-purple-400" />;

  return (
    <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Palette className="h-5 w-5" /> White-label Branding
        </CardTitle>
        <CardDescription>
          {canEdit
            ? "Customize how your brand appears across the Arena."
            : "Available on Platinum and Enterprise tiers."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Logo URL</Label>
            <Input value={form.logo_url ?? ""} disabled={!canEdit}
              onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
          </div>
          <div>
            <Label className="text-white">Banner URL</Label>
            <Input value={form.banner_url ?? ""} disabled={!canEdit}
              onChange={(e) => setForm({ ...form, banner_url: e.target.value })} />
          </div>
          <div>
            <Label className="text-white">Primary color</Label>
            <Input type="text" placeholder="#7c3aed" value={form.primary_color ?? ""} disabled={!canEdit}
              onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
          </div>
          <div>
            <Label className="text-white">Accent color</Label>
            <Input type="text" placeholder="#ec4899" value={form.accent_color ?? ""} disabled={!canEdit}
              onChange={(e) => setForm({ ...form, accent_color: e.target.value })} />
          </div>
          <div>
            <Label className="text-white">Background color</Label>
            <Input type="text" placeholder="#0b0b1a" value={form.background_color ?? ""} disabled={!canEdit}
              onChange={(e) => setForm({ ...form, background_color: e.target.value })} />
          </div>
          <div>
            <Label className="text-white">Custom domain</Label>
            <Input placeholder="brand.example.com" value={form.custom_domain ?? ""} disabled={!canEdit}
              onChange={(e) => setForm({ ...form, custom_domain: e.target.value })} />
          </div>
        </div>
        <div>
          <Label className="text-white">Tagline</Label>
          <Input value={form.tagline ?? ""} disabled={!canEdit}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        </div>
        <div>
          <Label className="text-white">Custom CSS (advanced)</Label>
          <Textarea rows={6} value={form.custom_css ?? ""} disabled={!canEdit}
            onChange={(e) => setForm({ ...form, custom_css: e.target.value })} />
        </div>
        <Button onClick={save} disabled={!canEdit || saving}
          className="bg-gradient-to-r from-purple-600 to-pink-600">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save branding
        </Button>
      </CardContent>
    </Card>
  );
}
