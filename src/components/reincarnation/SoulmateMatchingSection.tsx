import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Heart, MapPin, User, Sparkles, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const SoulmateMatchingSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [formData, setFormData] = useState({ displayName: "", bio: "", age: "", location: "" });

  useEffect(() => { checkAccess(); }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setCheckingAccess(false); return; }
      const { data } = await supabase.from("reincarnation_purchases").select("*").eq("user_id", user.id).eq("service_type", "soulmate_matching").eq("status", "active").single();
      setHasAccess(!!data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCheckingAccess(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!formData.displayName || !formData.age || !formData.location) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { error } = await supabase.from("soul_profiles").insert({ user_id: session.user.id, display_name: formData.displayName, bio: formData.bio, age: parseInt(formData.age), location: formData.location, is_active: true });
      if (error) throw error;
      setProfileCreated(true);
      toast({ title: "Profile Created!" });
    } catch (error) {
      toast({ title: "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFindMatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('find-soul-matches');
      if (error) throw error;
      setMatches(data.matches);
      toast({ title: "Matches Found!", description: `${data.matches.length} connections` });
    } catch (error) {
      toast({ title: "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAccess) return <Card><CardContent className="py-12 text-center"><Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" /></CardContent></Card>;
  if (!hasAccess) return <Card className="border-destructive/50"><CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-6 w-6" />Locked</CardTitle></CardHeader><CardContent><Alert><AlertDescription>Go to Services tab (€29/month)</AlertDescription></Alert></CardContent></Card>;

  return (
    <>
      <FloatingHowItWorks
        title='Soulmate Matching Section'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Soulmate Matching Section panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="border-primary/20">
      <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-6 w-6 text-primary" />Soulmate Matching</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {!profileCreated ? (
          <div className="space-y-4">
            <div><Label>Display Name *</Label><Input placeholder="Your name" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} /></div>
            <div><Label>Bio</Label><Textarea placeholder="Your journey..." rows={3} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4"><div><Label>Age *</Label><Input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} /></div><div><Label>Location *</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></div></div>
            <Button onClick={handleCreateProfile} disabled={loading} className="w-full" size="lg">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Profile"}</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Button onClick={handleFindMatches} disabled={loading} className="w-full" size="lg">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Finding...</> : <><Sparkles className="mr-2 h-4 w-4" />Find Matches</>}</Button>
            {matches.map((match: any, i: number) => (
              <Card key={i} className="border-primary/30"><CardHeader><CardTitle className="flex justify-between"><span>{match.profile?.display_name}</span><Badge>{match.compatibility_score}%</Badge></CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground mb-3">{match.soul_contract}</p><div className="flex gap-2">{match.karmic_lessons?.map((l: any, idx: number) => <Badge key={idx} variant="secondary">{l.lesson}</Badge>)}</div></CardContent></Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
