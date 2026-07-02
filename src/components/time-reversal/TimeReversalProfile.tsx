import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Upload, Save, Loader2, TrendingDown, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function TimeReversalProfile({ onBack }: Props) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [targetAge, setTargetAge] = useState([20]);
  const [speed, setSpeed] = useState([1]);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data } = await supabase.from("time_reversal_profiles").select("*").eq("user_id", session.user.id).maybeSingle();
      if (data) {
        setProfile(data);
        setTargetAge([data.target_age || 20]);
        setSpeed([data.aging_speed || 1]);
      } else {
        const { data: newProfile } = await supabase.from("time_reversal_profiles").insert({
          user_id: session.user.id, current_age: 80, starting_age: 80, target_age: 20, aging_speed: 1.0,
        }).select().single();
        setProfile(newProfile);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await supabase.from("time_reversal_profiles").update({
        target_age: targetAge[0], aging_speed: speed[0],
      }).eq("id", profile.id);
      toast({ title: "Profile Updated! ⏪" });
    } catch (e) { console.error(e); toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const path = `time-reversal/profile/${session.user.id}/${Date.now()}.${file.name.split(".").pop()}`;
      await supabase.storage.from("media").upload(path, file);
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
      await supabase.from("time_reversal_profiles").update({ profile_image_url: publicUrl }).eq("id", profile.id);
      setProfile({ ...profile, profile_image_url: publicUrl });
      toast({ title: "Photo Updated!" });
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-400" /></div>;

  return (
    <>
      <FloatingHowItWorks
        title='Time Reversal Profile'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Time Reversal Profile panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">My Profile</h2>
          <p className="text-sm text-muted-foreground">Manage your reverse aging journey</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-background">
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-purple-500">
                  <AvatarImage src={profile?.profile_image_url} />
                  <AvatarFallback className="text-4xl font-black">{Math.floor(profile?.current_age || 80)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Age {Math.floor(profile?.current_age || 80)}
                </div>
              </div>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="profile-photo" />
              <Button variant="outline" size="sm" onClick={() => document.getElementById("profile-photo")?.click()}>
                <Upload className="h-4 w-4 mr-1" /> Upload Photo
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-card/50 border border-border/40">
                <TrendingDown className="h-4 w-4 mx-auto text-purple-400 mb-1" />
                <div className="font-bold">{Math.floor(profile?.current_age || 80)}</div>
                <div className="text-[10px] text-muted-foreground">Current Age</div>
              </div>
              <div className="p-3 rounded-xl bg-card/50 border border-border/40">
                <Clock className="h-4 w-4 mx-auto text-blue-400 mb-1" />
                <div className="font-bold">{profile?.aging_speed || 1}x</div>
                <div className="text-[10px] text-muted-foreground">Speed</div>
              </div>
              <div className="p-3 rounded-xl bg-card/50 border border-border/40">
                <Users className="h-4 w-4 mx-auto text-emerald-400 mb-1" />
                <div className="font-bold">{profile?.follower_count || 0}</div>
                <div className="text-[10px] text-muted-foreground">Followers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/30">
          <CardHeader><CardTitle>Aging Settings</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Target Age: {targetAge[0]} years</label>
              <Slider value={targetAge} onValueChange={setTargetAge} min={1} max={40} step={1} />
              <p className="text-xs text-muted-foreground mt-1">How young do you want to get?</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Aging Speed: {speed[0]}x</label>
              <Slider value={speed} onValueChange={setSpeed} min={0.5} max={5} step={0.5} />
              <p className="text-xs text-muted-foreground mt-1">How fast do you age backwards? (1x = 1 year per day)</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm">
                <strong>Journey:</strong> Age {Math.floor(profile?.current_age || 80)} → {targetAge[0]} at {speed[0]}x speed
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ≈ {Math.ceil((Math.floor(profile?.current_age || 80) - targetAge[0]) / speed[0])} days remaining
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-purple-600 to-violet-600">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
