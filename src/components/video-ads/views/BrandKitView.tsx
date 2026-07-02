import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Palette, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface KitState {
  business_name: string; business_type: string; logo_url: string; tagline: string;
  brand_values: string; primary: string; secondary: string; accent: string;
  font_heading: string; font_body: string; voice: string; do_list: string; dont_list: string;
}

const empty: KitState = {
  business_name: "My Brand", business_type: "general", logo_url: "", tagline: "",
  brand_values: "", primary: "#7c3aed", secondary: "#ec4899", accent: "#fbbf24",
  font_heading: "Inter", font_body: "Inter", voice: "", do_list: "", dont_list: "",
};

export const BrandKitView = ({ onBack }: { onBack: () => void }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kit, setKit] = useState<KitState>(empty);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from('brand_kits').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        setExistingId(data.id);
        const cp = (data.color_palette || {}) as Record<string, string>;
        const vi = (data.visual_identity || {}) as Record<string, unknown>;
        setKit({
          business_name: data.business_name || "My Brand",
          business_type: data.business_type || "general",
          logo_url: data.logo_url || "",
          tagline: (vi.tagline as string) || "",
          brand_values: data.brand_values || "",
          primary: cp.primary || "#7c3aed",
          secondary: cp.secondary || "#ec4899",
          accent: cp.accent || "#fbbf24",
          font_heading: (vi.font_heading as string) || "Inter",
          font_body: (vi.font_body as string) || "Inter",
          voice: (vi.voice as string) || "",
          do_list: ((vi.do_list as string[]) || []).join('\n'),
          dont_list: ((vi.dont_list as string[]) || []).join('\n'),
        });
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Log in"); setSaving(false); return; }
    const payload = {
      user_id: user.id,
      business_name: kit.business_name,
      business_type: kit.business_type,
      logo_url: kit.logo_url,
      brand_values: kit.brand_values,
      color_palette: { primary: kit.primary, secondary: kit.secondary, accent: kit.accent },
      visual_identity: {
        tagline: kit.tagline, font_heading: kit.font_heading, font_body: kit.font_body,
        voice: kit.voice,
        do_list: kit.do_list.split('\n').filter(Boolean),
        dont_list: kit.dont_list.split('\n').filter(Boolean),
      },
    };
    const { error } = existingId
      ? await supabase.from('brand_kits').update(payload).eq('id', existingId)
      : await supabase.from('brand_kits').insert(payload);
    if (error) toast.error("Chyba: " + error.message);
    else toast.success("Brand Kit saved");
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <>
      <FloatingHowItWorks title={"Brand Kit View - How it works"} steps={[{ title: 'Open', desc: 'Access the Brand Kit View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Brand Kit View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><Palette className="w-6 h-6 text-white" /></div>
        <div><h2 className="text-2xl font-black">Brand Kit</h2><p className="text-sm text-muted-foreground">Your brand identity for all ads</p></div>
        <Badge className="ml-auto">FREE</Badge>
      </div>
      <Card className="max-w-3xl"><CardHeader><CardTitle>Brand Settings</CardTitle></CardHeader><CardContent className="space-y-4">
        <div><Label>Brand Name</Label><Input value={kit.business_name} onChange={e => setKit({...kit, business_name: e.target.value})} /></div>
        <div><Label>Logo URL</Label><Input value={kit.logo_url} onChange={e => setKit({...kit, logo_url: e.target.value})} placeholder="https://..." /></div>
        <div><Label>Tagline</Label><Input value={kit.tagline} onChange={e => setKit({...kit, tagline: e.target.value})} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Primary</Label><Input type="color" value={kit.primary} onChange={e => setKit({...kit, primary: e.target.value})} /></div>
          <div><Label>Secondary</Label><Input type="color" value={kit.secondary} onChange={e => setKit({...kit, secondary: e.target.value})} /></div>
          <div><Label>Accent</Label><Input type="color" value={kit.accent} onChange={e => setKit({...kit, accent: e.target.value})} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Heading Font</Label><Input value={kit.font_heading} onChange={e => setKit({...kit, font_heading: e.target.value})} /></div>
          <div><Label>Body Font</Label><Input value={kit.font_body} onChange={e => setKit({...kit, font_body: e.target.value})} /></div>
        </div>
        <div><Label>Brand Voice</Label><Textarea rows={3} value={kit.voice} onChange={e => setKit({...kit, voice: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>✅ DO</Label><Textarea rows={4} value={kit.do_list} onChange={e => setKit({...kit, do_list: e.target.value})} /></div>
          <div><Label>❌ DON'T</Label><Textarea rows={4} value={kit.dont_list} onChange={e => setKit({...kit, dont_list: e.target.value})} /></div>
        </div>
        <Button onClick={save} disabled={saving} className="w-full bg-gradient-to-r from-violet-500 to-purple-600">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" />Save Brand Kit</>}
        </Button>
        <Card className="bg-muted/30"><CardContent className="pt-4">
          <div className="p-4 rounded-lg" style={{ background: `linear-gradient(135deg, ${kit.primary}, ${kit.secondary})` }}>
            <p className="text-white font-bold text-xl" style={{ fontFamily: kit.font_heading }}>{kit.business_name}</p>
            <p className="text-white/90 text-sm" style={{ fontFamily: kit.font_body }}>{kit.tagline || 'Your tagline'}</p>
          </div>
        </CardContent></Card>
      </CardContent></Card>
    </div>
    </>
  );
};
