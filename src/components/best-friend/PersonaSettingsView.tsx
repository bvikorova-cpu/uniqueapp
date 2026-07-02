import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, User, Sparkles } from "lucide-react";
import { toast as sonner } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const PersonaSettingsView = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [persona, setPersona] = useState({
    friend_name: "Bestie",
    friend_gender: "neutral",
    personality: "empathetic",
    language: "en",
    user_nickname: "",
  });
  const [checkin, setCheckin] = useState({ enabled: true, preferred_hour: 19 });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarDesc, setAvatarDesc] = useState("");
  const [genAvatar, setGenAvatar] = useState(false);

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("best_friend_persona").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("best_friend_check_ins").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    if (p) {
      setPersona({
        friend_name: p.friend_name, friend_gender: p.friend_gender,
        personality: p.personality, language: p.language, user_nickname: p.user_nickname || "",
      });
      setAvatarUrl(p.avatar_url || null);
    }
    if (c) setCheckin({ enabled: c.enabled, preferred_hour: c.preferred_hour });
    setLoading(false);
  })(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const { error: e1 } = await supabase.from("best_friend_persona")
        .upsert({ user_id: user.id, ...persona }, { onConflict: "user_id" });
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("best_friend_check_ins")
        .upsert({ user_id: user.id, ...checkin, timezone: tz }, { onConflict: "user_id" });
      if (e2) throw e2;
      toast.success("Saved! 💖");
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin"/></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Persona Settings View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-black">Customize Your Best Friend</h2>
        <p className="text-muted-foreground mt-2">Make them truly yours</p>
      </div>

      <Card><CardHeader><CardTitle>Avatar</CardTitle></CardHeader><CardContent className="space-y-3">
        {avatarUrl && <img src={avatarUrl} alt="Best friend avatar" className="w-32 h-32 rounded-2xl object-cover mx-auto border-2 border-purple-500/40"/>}
        <Input value={avatarDesc} onChange={e => setAvatarDesc(e.target.value)} placeholder="Describe how they look (e.g. cheerful brunette with kind eyes)" maxLength={200}/>
        <Button disabled={genAvatar} className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600" onClick={async () => {
          setGenAvatar(true);
          try {
            const { data, error } = await supabase.functions.invoke("best-friend-avatar", { body: { description: avatarDesc } });
            if (error) throw error;
            if (data?.avatar_url) { setAvatarUrl(data.avatar_url); sonner.success("Avatar generated!"); }
          } catch (e: any) { sonner.error(e.message || "Failed"); }
          finally { setGenAvatar(false); }
        }}>
          {genAvatar ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Sparkles className="h-4 w-4 mr-2"/>}
          {avatarUrl ? "Regenerate avatar" : "Generate AI avatar"}
        </Button>
      </CardContent></Card>

      <Card><CardHeader><CardTitle>Persona</CardTitle></CardHeader><CardContent className="space-y-4">
        <div><Label>Friend's name</Label>
          <Input value={persona.friend_name} onChange={e => setPersona(p => ({...p, friend_name: e.target.value}))} maxLength={40} /></div>
        <div><Label>Friend's gender</Label>
          <Select value={persona.friend_gender} onValueChange={v => setPersona(p => ({...p, friend_gender: v}))}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="neutral">Non-binary / Neutral</SelectItem>
            </SelectContent></Select></div>
        <div><Label>Personality</Label>
          <Select value={persona.personality} onValueChange={v => setPersona(p => ({...p, personality: v}))}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="empathetic">💖 Empathetic & warm</SelectItem>
              <SelectItem value="playful">🎉 Playful & cheerful</SelectItem>
              <SelectItem value="direct">🎯 Direct & honest</SelectItem>
              <SelectItem value="witty">😏 Witty & sarcastic</SelectItem>
              <SelectItem value="calm">🧘 Calm & grounding</SelectItem>
              <SelectItem value="motivational">🚀 Motivational coach</SelectItem>
            </SelectContent></Select></div>
        <div><Label>Language</Label>
          <Select value={persona.language} onValueChange={v => setPersona(p => ({...p, language: v}))}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem><SelectItem value="sk">Slovak</SelectItem>
              <SelectItem value="cs">Czech</SelectItem><SelectItem value="hu">Hungarian</SelectItem>
              <SelectItem value="pl">Polski</SelectItem><SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="fr">Français</SelectItem><SelectItem value="es">Español</SelectItem>
              <SelectItem value="it">Italiano</SelectItem><SelectItem value="uk">Українська</SelectItem>
              <SelectItem value="ro">Română</SelectItem><SelectItem value="hr">Hrvatski</SelectItem>
            </SelectContent></Select></div>
        <div><Label>What should they call you? (optional)</Label>
          <Input value={persona.user_nickname} onChange={e => setPersona(p => ({...p, user_nickname: e.target.value}))} maxLength={40} /></div>
      </CardContent></Card>

      <Card><CardHeader><CardTitle>Daily Check-ins</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Send me a daily check-in message</Label>
          <Switch checked={checkin.enabled} onCheckedChange={v => setCheckin(c => ({...c, enabled: v}))} />
        </div>
        {checkin.enabled && (
          <div><Label>Preferred hour (24h)</Label>
            <Input type="number" min={0} max={23} value={checkin.preferred_hour}
              onChange={e => setCheckin(c => ({...c, preferred_hour: Math.max(0, Math.min(23, Number(e.target.value)))}))} /></div>
        )}
      </CardContent></Card>

      <Button onClick={save} disabled={saving} size="lg" className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-2"/>}
        Save Changes
      </Button>
    </div>
  );
};
