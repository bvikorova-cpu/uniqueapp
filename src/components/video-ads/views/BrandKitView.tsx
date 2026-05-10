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

export const BrandKitView = ({ onBack }: { onBack: () => void }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kit, setKit] = useState({
    name: "My Brand", logo_url: "", primary_color: "#7c3aed", secondary_color: "#ec4899",
    accent_color: "#fbbf24", font_heading: "Inter", font_body: "Inter",
    brand_voice_summary: "", tagline: "", do_list: "", dont_list: "",
  });
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from('brand_kits').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        setExistingId(data.id);
        setKit({
          name: data.name, logo_url: data.logo_url || "", primary_color: data.primary_color,
          secondary_color: data.secondary_color, accent_color: data.accent_color,
          font_heading: data.font_heading, font_body: data.font_body,
          brand_voice_summary: data.brand_voice_summary || "", tagline: data.tagline || "",
          do_list: (data.do_list || []).join('\n'), dont_list: (data.dont_list || []).join('\n'),
        });
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Prihlás sa"); setSaving(false); return; }
    const payload = {
      user_id: user.id, ...kit,
      do_list: kit.do_list.split('\n').filter(Boolean),
      dont_list: kit.dont_list.split('\n').filter(Boolean),
      updated_at: new Date().toISOString(),
    };
    const { error } = existingId
      ? await supabase.from('brand_kits').update(payload).eq('id', existingId)
      : await supabase.from('brand_kits').insert(payload);
    if (error) { toast.error("Chyba: " + error.message); }
    else { toast.success("Brand Kit uložený"); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Späť</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><Palette className="w-6 h-6 text-white" /></div>
        <div><h2 className="text-2xl font-black">Brand Kit</h2><p className="text-sm text-muted-foreground">Tvoja brand identita pre všetky ads</p></div>
        <Badge className="ml-auto">FREE</Badge>
      </div>
      <Card className="max-w-3xl"><CardHeader><CardTitle>Brand Settings</CardTitle></CardHeader><CardContent className="space-y-4">
        <div><Label>Brand Name</Label><Input value={kit.name} onChange={e => setKit({...kit, name: e.target.value})} /></div>
        <div><Label>Logo URL</Label><Input value={kit.logo_url} onChange={e => setKit({...kit, logo_url: e.target.value})} placeholder="https://..." /></div>
        <div><Label>Tagline</Label><Input value={kit.tagline} onChange={e => setKit({...kit, tagline: e.target.value})} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Primary</Label><Input type="color" value={kit.primary_color} onChange={e => setKit({...kit, primary_color: e.target.value})} /></div>
          <div><Label>Secondary</Label><Input type="color" value={kit.secondary_color} onChange={e => setKit({...kit, secondary_color: e.target.value})} /></div>
          <div><Label>Accent</Label><Input type="color" value={kit.accent_color} onChange={e => setKit({...kit, accent_color: e.target.value})} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Heading Font</Label><Input value={kit.font_heading} onChange={e => setKit({...kit, font_heading: e.target.value})} /></div>
          <div><Label>Body Font</Label><Input value={kit.font_body} onChange={e => setKit({...kit, font_body: e.target.value})} /></div>
        </div>
        <div><Label>Brand Voice</Label><Textarea rows={3} value={kit.brand_voice_summary} onChange={e => setKit({...kit, brand_voice_summary: e.target.value})} placeholder="Tonalita, štýl komunikácie..." /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>✅ DO (jeden bod na riadok)</Label><Textarea rows={4} value={kit.do_list} onChange={e => setKit({...kit, do_list: e.target.value})} /></div>
          <div><Label>❌ DON'T</Label><Textarea rows={4} value={kit.dont_list} onChange={e => setKit({...kit, dont_list: e.target.value})} /></div>
        </div>
        <Button onClick={save} disabled={saving} className="w-full bg-gradient-to-r from-violet-500 to-purple-600">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" />Uložiť Brand Kit</>}
        </Button>
        <Card className="bg-muted/30"><CardContent className="pt-4">
          <p className="text-sm font-semibold mb-2">Preview:</p>
          <div className="p-4 rounded-lg" style={{ background: `linear-gradient(135deg, ${kit.primary_color}, ${kit.secondary_color})` }}>
            <p className="text-white font-bold text-xl" style={{ fontFamily: kit.font_heading }}>{kit.name}</p>
            <p className="text-white/90 text-sm" style={{ fontFamily: kit.font_body }}>{kit.tagline || 'Your tagline here'}</p>
          </div>
        </CardContent></Card>
      </CardContent></Card>
    </div>
  );
};
