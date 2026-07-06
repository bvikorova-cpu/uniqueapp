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
import { Loader2, Trash2, Plus, Calendar, Save, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";

const CATEGORIES = ["hair", "nails", "massage", "beauty", "fitness", "tutoring", "cleaning", "repair", "photography", "other"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Rule {
  id?: string;
  weekday: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export default function ProviderSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // profile fields
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("hair");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [priceEur, setPriceEur] = useState("30");
  const [durationMin, setDurationMin] = useState("60");
  const [accepting, setAccepting] = useState(false);

  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data: profile } = await supabase
        .from("service_providers")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
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
      const { data: r } = await supabase
        .from("service_availability_rules")
        .select("*")
        .eq("provider_id", user.id)
        .order("weekday");
      setRules((r as Rule[]) ?? []);
      setLoading(false);
    })();
  }, [user, navigate]);

  const saveProfile = async () => {
    if (!user) return;
    if (!businessName.trim()) { toast.error("Business name required"); return; }
    const priceCents = Math.round(parseFloat(priceEur) * 100);
    if (!priceCents || priceCents < 100) { toast.error("Price must be at least €1"); return; }
    const dur = parseInt(durationMin, 10);
    if (!dur || dur < 5 || dur > 480) { toast.error("Duration must be 5–480 min"); return; }
    setSaving(true);
    const { error } = await supabase.from("service_providers").upsert({
      owner_id: user.id,
      business_name: businessName.trim(),
      category,
      description: description || null,
      city: city || null,
      avatar_url: avatarUrl || null,
      price_cents: priceCents,
      duration_min: dur,
      is_accepting_bookings: accepting,
    }, { onConflict: "owner_id" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved");
  };

  const addRule = () => setRules((r) => [...r, { weekday: 1, start_time: "09:00", end_time: "17:00", is_active: true }]);

  const updateRule = (idx: number, patch: Partial<Rule>) => {
    setRules((r) => r.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  };

  const deleteRule = async (idx: number) => {
    const rule = rules[idx];
    if (rule.id) {
      const { error } = await supabase.from("service_availability_rules").delete().eq("id", rule.id);
      if (error) { toast.error(error.message); return; }
    }
    setRules((r) => r.filter((_, i) => i !== idx));
  };

  const saveRules = async () => {
    if (!user) return;
    setSaving(true);
    // Upsert all rules
    for (const rule of rules) {
      if (rule.id) {
        await supabase
          .from("service_availability_rules")
          .update({
            weekday: rule.weekday,
            start_time: rule.start_time,
            end_time: rule.end_time,
            is_active: rule.is_active,
          })
          .eq("id", rule.id);
      } else {
        const { data, error } = await supabase
          .from("service_availability_rules")
          .insert({
            provider_id: user.id,
            weekday: rule.weekday,
            start_time: rule.start_time,
            end_time: rule.end_time,
            is_active: rule.is_active,
          })
          .select("id")
          .single();
        if (!error && data) rule.id = data.id;
      }
    }
    setSaving(false);
    toast.success("Availability saved");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="container mx-auto px-4 py-24 text-center"><Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Offer Your Services · Unique</title></Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 mt-16 max-w-3xl">
          <h1 className="text-3xl font-black mb-2">Offer your services</h1>
          <p className="text-muted-foreground mb-6">Set up your business profile and weekly opening hours. Customers can then book paid time slots.</p>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Business profile</CardTitle>
              <CardDescription>Public info shown to customers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Business name *</Label>
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Anna's Hair Studio" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bratislava" />
                </div>
                <div>
                  <Label>Photo / logo URL</Label>
                  <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
                </div>
                <div>
                  <Label>Price per booking (EUR) *</Label>
                  <Input type="number" min="1" step="0.5" value={priceEur} onChange={(e) => setPriceEur(e.target.value)} />
                </div>
                <div>
                  <Label>Duration per slot (min) *</Label>
                  <Input type="number" min="5" max="480" step="5" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What do you offer?" rows={4} />
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <p className="font-semibold">Accept bookings</p>
                  <p className="text-xs text-muted-foreground">Turn on to appear in the public list.</p>
                </div>
                <Switch checked={accepting} onCheckedChange={setAccepting} />
              </div>
              <Button onClick={saveProfile} disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Weekly availability</CardTitle>
              <CardDescription>Recurring hours when customers can book. All times are in your local time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {rules.length === 0 && <p className="text-sm text-muted-foreground">No availability yet. Add your first opening block.</p>}
              {rules.map((rule, i) => (
                <div key={i} className="flex gap-2 items-center flex-wrap border rounded-lg p-3">
                  <Select value={String(rule.weekday)} onValueChange={(v) => updateRule(i, { weekday: parseInt(v, 10) })}>
                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WEEKDAYS.map((w, idx) => <SelectItem key={idx} value={String(idx)}>{w}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="time" value={rule.start_time.slice(0,5)} onChange={(e) => updateRule(i, { start_time: e.target.value + ":00" })} className="w-32" />
                  <span className="text-muted-foreground">–</span>
                  <Input type="time" value={rule.end_time.slice(0,5)} onChange={(e) => updateRule(i, { end_time: e.target.value + ":00" })} className="w-32" />
                  <Switch checked={rule.is_active} onCheckedChange={(v) => updateRule(i, { is_active: v })} />
                  <Button variant="ghost" size="icon" onClick={() => deleteRule(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={addRule}><Plus className="w-4 h-4 mr-1" /> Add block</Button>
                <Button onClick={saveRules} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save availability
                </Button>
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
