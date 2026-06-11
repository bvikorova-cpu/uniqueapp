import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Palette, Save, Upload, Image as ImageIcon } from "lucide-react";
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

const DEFAULTS = {
  primary_color: "#7c3aed",
  accent_color: "#ec4899",
  background_color: "#0b0b1a",
};

const isHex = (v: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);

export function BrandingPanel({ sponsorId, tier }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "banner" | null>(null);
  const [form, setForm] = useState<Branding>({});
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
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

  const uploadFile = async (file: File, kind: "logo" | "banner") => {
    if (!canEdit) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB");
      return;
    }
    if (!/^image\//.test(file.type)) {
      toast.error("Only image files are allowed");
      return;
    }
    setUploading(kind);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUploading(null);
      toast.error("Sign in required");
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${user.id}/sponsor-${sponsorId}/${kind}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("user-uploads")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setUploading(null);
      toast.error(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from("user-uploads").getPublicUrl(path);
    setForm((f) => ({ ...f, [kind === "logo" ? "logo_url" : "banner_url"]: pub.publicUrl }));
    setUploading(null);
    toast.success(`${kind === "logo" ? "Logo" : "Banner"} uploaded`);
  };

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

  const primary = isHex(form.primary_color || "") ? form.primary_color! : DEFAULTS.primary_color;
  const accent = isHex(form.accent_color || "") ? form.accent_color! : DEFAULTS.accent_color;
  const background = isHex(form.background_color || "") ? form.background_color! : DEFAULTS.background_color;

  const ColorRow = ({ field, label, placeholder }: { field: "primary_color" | "accent_color" | "background_color"; label: string; placeholder: string }) => {
    const value = (form[field] as string) ?? "";
    const swatch = isHex(value) ? value : placeholder;
    return (
      <div>
        <Label className="text-white">{label}</Label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            aria-label={`${label} color picker`}
            data-testid={`branding-${field}-picker`}
            value={swatch}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="h-10 w-12 rounded border border-white/20 bg-transparent cursor-pointer disabled:cursor-not-allowed"
          />
          <Input
            type="text"
            placeholder={placeholder}
            aria-label={`${label} hex value`}
            data-testid={`branding-${field}-hex`}
            value={value}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50" data-testid="branding-panel">
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
      <CardContent className="space-y-5">
        {/* Logo + Banner uploads */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Logo</Label>
            <div className="flex gap-2 items-center">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                data-testid="branding-logo-file"
                aria-label="Upload logo"
                disabled={!canEdit}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile(f, "logo");
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canEdit || uploading === "logo"}
                onClick={() => logoInputRef.current?.click()}
                data-testid="branding-logo-upload-btn"
              >
                {uploading === "logo" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload logo
              </Button>
              <Input
                value={form.logo_url ?? ""}
                disabled={!canEdit}
                placeholder="or paste URL"
                aria-label="Logo URL"
                data-testid="branding-logo-url"
                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label className="text-white">Banner</Label>
            <div className="flex gap-2 items-center">
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                data-testid="branding-banner-file"
                aria-label="Upload banner"
                disabled={!canEdit}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile(f, "banner");
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canEdit || uploading === "banner"}
                onClick={() => bannerInputRef.current?.click()}
                data-testid="branding-banner-upload-btn"
              >
                {uploading === "banner" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload banner
              </Button>
              <Input
                value={form.banner_url ?? ""}
                disabled={!canEdit}
                placeholder="or paste URL"
                aria-label="Banner URL"
                data-testid="branding-banner-url"
                onChange={(e) => setForm({ ...form, banner_url: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="grid md:grid-cols-3 gap-4">
          <ColorRow field="primary_color" label="Primary color" placeholder={DEFAULTS.primary_color} />
          <ColorRow field="accent_color" label="Accent color" placeholder={DEFAULTS.accent_color} />
          <ColorRow field="background_color" label="Background color" placeholder={DEFAULTS.background_color} />
        </div>

        {/* Domain + tagline */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Custom domain</Label>
            <Input
              placeholder="brand.example.com"
              aria-label="Custom domain"
              value={form.custom_domain ?? ""}
              disabled={!canEdit}
              onChange={(e) => setForm({ ...form, custom_domain: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-white">Tagline</Label>
            <Input
              aria-label="Tagline"
              data-testid="branding-tagline"
              value={form.tagline ?? ""}
              disabled={!canEdit}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label className="text-white">Custom CSS (advanced)</Label>
          <Textarea
            rows={5}
            aria-label="Custom CSS"
            value={form.custom_css ?? ""}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, custom_css: e.target.value })}
          />
        </div>

        {/* Live preview */}
        <div>
          <Label className="text-white mb-2 block">Live preview</Label>
          <div
            data-testid="branding-preview"
            className="rounded-xl border border-white/15 overflow-hidden"
            style={{ background }}
          >
            {form.banner_url ? (
              <img
                src={form.banner_url}
                alt="Banner preview"
                data-testid="branding-preview-banner"
                className="w-full h-24 object-cover"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            ) : (
              <div className="w-full h-24" style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }} />
            )}
            <div className="p-4 flex items-center gap-3">
              {form.logo_url ? (
                <img
                  src={form.logo_url}
                  alt="Logo preview"
                  data-testid="branding-preview-logo"
                  className="h-12 w-12 rounded-lg object-cover border border-white/20"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
              ) : (
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center border border-white/20"
                  style={{ background: primary }}
                  data-testid="branding-preview-logo-placeholder"
                >
                  <ImageIcon className="h-6 w-6 text-white/80" />
                </div>
              )}
              <div className="flex-1">
                <div
                  className="text-base font-bold"
                  style={{ color: primary }}
                  data-testid="branding-preview-title"
                >
                  {form.tagline?.trim() || "Your brand tagline"}
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{ background: primary, color: "#fff" }}>
                    Primary
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{ background: accent, color: "#fff" }}>
                    Accent
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={save}
          disabled={!canEdit || saving}
          data-testid="branding-save-btn"
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save branding
        </Button>
      </CardContent>
    </Card>
  );
}
