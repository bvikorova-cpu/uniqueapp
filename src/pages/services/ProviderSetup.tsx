import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Trash2, Plus, Calendar, Save, ArrowRight, Coffee } from "lucide-react";
import { Helmet } from "react-helmet-async";

const CATEGORIES = ["hair", "nails", "massage", "beauty", "fitness", "tutoring", "cleaning", "repair", "photography", "other"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Rule { id?: string; weekday: number; start_time: string; end_time: string; is_active: boolean; }
interface Offering { id?: string; name: string; description: string; duration_min: number; price_cents: number; is_active: boolean; }
interface Block { id?: string; starts_at: string; ends_at: string; reason: string; }

export default function ProviderSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("hair");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [priceEur, setPriceEur] = useState("30");
  const [durationMin, setDurationMin] = useState("60");
  const [accepting, setAccepting] = useState(false);

  const [rules, setRules] = useState<Rule[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const [{ data: profile }, { data: r }, { data: o }, { data: b }] = await Promise.all([
        supabase.from("service_providers").select("*").eq("owner_id", user.id).maybeSingle(),
        supabase.from("service_availability_rules").select("*").eq("provider_id", user.id).order("weekday"),
        supabase.from("service_offerings").select("*").eq("provider_id", user.id).order("sort_order"),
        supabase.from("service_availability_blocks").select("*").eq("provider_id", user.id).gte("ends_at", new Date().toISOString()).order("starts_at"),
      ]);
      if (profile) {
        setBusinessName(profile.business_name ?? "");
        setCategory(profile.category ?? "hair");
        setDescription(profile.description ?? "");
        setCity(profile.city ?? "");
        setAvatarUrl(profile.avatar_url ?? "");
        setPriceEur(profile.price_cents ? (profile.price_cents / 100).toFixed(2) : "30");
        setDurationMin(String(profile.duration_min ?? 60));
        setAccepting(!!profile.is_accepting_bookings);
      }
      setRules((r as Rule[]) ?? []);
      setOfferings((o as Offering[]) ?? []);
      setBlocks(((b as any[]) ?? []).map((x) => ({
        id: x.id,
        starts_at: x.starts_at.slice(0, 16),
        ends_at: x.ends_at.slice(0, 16),
        reason: x.reason ?? "",
      })));
      setLoading(false);
    })();
  }, [user, navigate]);

  const saveProfile = async () => {
    if (!user) return;
    if (!businessName.trim()) { toast.error("Business name required"); return; }
    const priceCents = Math.round(parseFloat(priceEur) * 100);
    if (!priceCents || priceCents < 100) { toast.error("Default price must be ≥ €1"); return; }
    const dur = parseInt(durationMin, 10);
    if (!dur || dur < 5 || dur > 480) { toast.error("Default duration must be 5–480 min"); return; }
    setSaving(true);
    const { error } = await supabase.from("service_providers").upsert({
      owner_id: user.id,
      business_name: businessName.trim(),
      category, description: description || null, city: city || null, avatar_url: avatarUrl || null,
      price_cents: priceCents, duration_min: dur, is_accepting_bookings: accepting,
    }, { onConflict: "owner_id" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
  };

  const addRule = () => setRules((r) => [...r, { weekday: 1, start_time: "09:00", end_time: "17:00", is_active: true }]);
  const updateRule = (i: number, p: Partial<Rule>) => setRules((r) => r.map((x, j) => j === i ? { ...x, ...p } : x));
  const deleteRule = async (i: number) => {
    const rule = rules[i];
    if (rule.id) { const { error } = await supabase.from("service_availability_rules").delete().eq("id", rule.id); if (error) return toast.error(error.message); }
    setRules((r) => r.filter((_, j) => j !== i));
  };
  const saveRules = async () => {
    if (!user) return; setSaving(true);
    for (const rule of rules) {
      if (rule.id) {
        await supabase.from("service_availability_rules").update({ weekday: rule.weekday, start_time: rule.start_time, end_time: rule.end_time, is_active: rule.is_active }).eq("id", rule.id);
      } else {
        const { data } = await supabase.from("service_availability_rules").insert({ provider_id: user.id, weekday: rule.weekday, start_time: rule.start_time, end_time: rule.end_time, is_active: rule.is_active }).select("id").single();
        if (data) rule.id = data.id;
      }
    }
    setSaving(false); toast.success("Weekly hours saved");
  };

  const addOffering = () => setOfferings((o) => [...o, { name: "", description: "", duration_min: 30, price_cents: 2000, is_active: true }]);
  const updateOffering = (i: number, p: Partial<Offering>) => setOfferings((o) => o.map((x, j) => j === i ? { ...x, ...p } : x));
  const deleteOffering = async (i: number) => {
    const off = offerings[i];
    if (off.id) { const { error } = await supabase.from("service_offerings").delete().eq("id", off.id); if (error) return toast.error(error.message); }
    setOfferings((o) => o.filter((_, j) => j !== i));
  };
  const saveOfferings = async () => {
    if (!user) return; setSaving(true);
    for (const [idx, off] of offerings.entries()) {
      if (!off.name.trim() || off.price_cents < 100 || off.duration_min < 5) { toast.error("All services need name, price ≥ €1 and duration ≥ 5 min"); setSaving(false); return; }
      const payload = { name: off.name.trim(), description: off.description || null, duration_min: off.duration_min, price_cents: off.price_cents, is_active: off.is_active, sort_order: idx };
      if (off.id) await supabase.from("service_offerings").update(payload).eq("id", off.id);
      else {
        const { data } = await supabase.from("service_offerings").insert({ ...payload, provider_id: user.id }).select("id").single();
        if (data) off.id = data.id;
      }
    }
    setSaving(false); toast.success("Services saved");
  };

  const addBlock = () => {
    const now = new Date(); now.setMinutes(0, 0, 0);
    const start = new Date(now.getTime() + 24 * 3600 * 1000);
    const end = new Date(start.getTime() + 60 * 60000);
    setBlocks((b) => [...b, { starts_at: start.toISOString().slice(0, 16), ends_at: end.toISOString().slice(0, 16), reason: "Lunch break" }]);
  };
  const updateBlock = (i: number, p: Partial<Block>) => setBlocks((b) => b.map((x, j) => j === i ? { ...x, ...p } : x));
  const deleteBlock = async (i: number) => {
    const bl = blocks[i];
    if (bl.id) { const { error } = await supabase.from("service_availability_blocks").delete().eq("id", bl.id); if (error) return toast.error(error.message); }
    setBlocks((b) => b.filter((_, j) => j !== i));
  };
  const saveBlocks = async () => {
    if (!user) return; setSaving(true);
    for (const bl of blocks) {
      const starts = new Date(bl.starts_at); const ends = new Date(bl.ends_at);
      if (isNaN(+starts) || isNaN(+ends) || ends <= starts) { toast.error("Break end must be after start"); setSaving(false); return; }
      const payload = { starts_at: starts.toISOString(), ends_at: ends.toISOString(), reason: bl.reason || null };
      if (bl.id) await supabase.from("service_availability_blocks").update(payload).eq("id", bl.id);
      else {
        const { data } = await supabase.from("service_availability_blocks").insert({ ...payload, provider_id: user.id }).select("id").single();
        if (data) bl.id = data.id;
      }
    }
    setSaving(false); toast.success("Breaks & time off saved");
  };

  if (loading) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container mx-auto px-4 py-24 text-center"><Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" /></div>
    </div>
  );

  return (
    <>
      <Helmet><title>Offer Your Services · Unique</title></Helmet>
      <div className="min-h-screen bg-background"><Navbar />
        <div className="container mx-auto px-4 py-24 mt-16 max-w-3xl">
          <h1 className="text-3xl font-black mb-2">Offer your services</h1>
          <p className="text-muted-foreground mb-6">Set your business profile, service catalog, weekly hours and breaks. Customers book paid slots directly.</p>

          <Card className="mb-6">
            <CardHeader><CardTitle>Business profile</CardTitle><CardDescription>Public info shown to customers.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Business name *</Label><Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Anna's Hair Studio" /></div>
                <div><Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>City *</Label><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bratislava" /></div>
                <div><Label>Photo / logo URL</Label><Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" /></div>
                <div><Label>Default price (EUR)</Label><Input type="number" min="1" step="0.5" value={priceEur} onChange={(e) => setPriceEur(e.target.value)} /></div>
                <div><Label>Default duration (min)</Label><Input type="number" min="5" max="480" step="5" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} /></div>
              </div>
              <p className="text-xs text-muted-foreground">Defaults are used when you don't add a specific service below.</p>
              <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} /></div>
              <div className="flex items-center justify-between border-t pt-4">
                <div><p className="font-semibold">Accept bookings</p><p className="text-xs text-muted-foreground">Turn on to appear in the public list.</p></div>
                <Switch checked={accepting} onCheckedChange={setAccepting} />
              </div>
              <Button onClick={saveProfile} disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save profile
              </Button>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Service menu</CardTitle>
              <CardDescription>List every service you offer (e.g. "Cut" 30 min €15, "Highlights" 90 min €65). Clients pick one and the slot length auto-adjusts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {offerings.length === 0 && <p className="text-sm text-muted-foreground">No services yet. If empty, the default price/duration above is used.</p>}
              {offerings.map((o, i) => (
                <div key={i} className="border rounded-lg p-3 space-y-2">
                  <div className="grid md:grid-cols-4 gap-2">
                    <div className="md:col-span-2"><Label className="text-xs">Name *</Label><Input value={o.name} onChange={(e) => updateOffering(i, { name: e.target.value })} placeholder="Highlights" /></div>
                    <div><Label className="text-xs">Duration (min)</Label><Input type="number" min="5" max="480" step="5" value={o.duration_min} onChange={(e) => updateOffering(i, { duration_min: parseInt(e.target.value, 10) || 0 })} /></div>
                    <div><Label className="text-xs">Price (EUR)</Label><Input type="number" min="1" step="0.5" value={(o.price_cents / 100).toFixed(2)} onChange={(e) => updateOffering(i, { price_cents: Math.round(parseFloat(e.target.value) * 100) || 0 })} /></div>
                  </div>
                  <Input value={o.description} onChange={(e) => updateOffering(i, { description: e.target.value })} placeholder="Short description (optional)" />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm"><Switch checked={o.is_active} onCheckedChange={(v) => updateOffering(i, { is_active: v })} /> Active</label>
                    <Button variant="ghost" size="sm" onClick={() => deleteOffering(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={addOffering}><Plus className="w-4 h-4 mr-1" /> Add service</Button>
                <Button onClick={saveOfferings} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save menu</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Weekly opening hours</CardTitle>
              <CardDescription>Recurring available hours per weekday. Change them any time.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {rules.length === 0 && <p className="text-sm text-muted-foreground">No hours yet. Add your first opening block.</p>}
              {rules.map((rule, i) => (
                <div key={i} className="flex gap-2 items-center flex-wrap border rounded-lg p-3">
                  <Select value={String(rule.weekday)} onValueChange={(v) => updateRule(i, { weekday: parseInt(v, 10) })}>
                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>{WEEKDAYS.map((w, idx) => <SelectItem key={idx} value={String(idx)}>{w}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="time" value={rule.start_time.slice(0, 5)} onChange={(e) => updateRule(i, { start_time: e.target.value + ":00" })} className="w-32" />
                  <span className="text-muted-foreground">–</span>
                  <Input type="time" value={rule.end_time.slice(0, 5)} onChange={(e) => updateRule(i, { end_time: e.target.value + ":00" })} className="w-32" />
                  <Switch checked={rule.is_active} onCheckedChange={(v) => updateRule(i, { is_active: v })} />
                  <Button variant="ghost" size="icon" onClick={() => deleteRule(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={addRule}><Plus className="w-4 h-4 mr-1" /> Add block</Button>
                <Button onClick={saveRules} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save hours</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Coffee className="w-5 h-5" /> Breaks & time off</CardTitle>
              <CardDescription>One-off unavailable periods (lunch break, vacation, sick day). Slots inside these ranges will be hidden.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {blocks.length === 0 && <p className="text-sm text-muted-foreground">No breaks scheduled.</p>}
              {blocks.map((bl, i) => (
                <div key={i} className="border rounded-lg p-3 space-y-2">
                  <div className="grid md:grid-cols-2 gap-2">
                    <div><Label className="text-xs">Starts</Label><Input type="datetime-local" value={bl.starts_at} onChange={(e) => updateBlock(i, { starts_at: e.target.value })} /></div>
                    <div><Label className="text-xs">Ends</Label><Input type="datetime-local" value={bl.ends_at} onChange={(e) => updateBlock(i, { ends_at: e.target.value })} /></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input value={bl.reason} onChange={(e) => updateBlock(i, { reason: e.target.value })} placeholder="Reason (e.g. Lunch, Vacation)" />
                    <Button variant="ghost" size="icon" onClick={() => deleteBlock(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={addBlock}><Plus className="w-4 h-4 mr-1" /> Add break / time off</Button>
                <Button onClick={saveBlocks} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save breaks</Button>
              </div>
            </CardContent>
          </Card>

          {accepting && (
            <div className="mt-6 text-center">
              <Button variant="premium" onClick={() => navigate(`/services/${user?.id}`)}>
                Preview your public page <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
