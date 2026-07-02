import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Loader2, Sparkles, Lock } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const TIER_LIMITS: Record<string, number> = { basic: 1, advanced: 3, celebrity: 999 };

export function CloneCreator() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tier, setTier] = useState<string | null>(null);
  const [usedSlots, setUsedSlots] = useState(0);
  const [formData, setFormData] = useState({
    cloneName: "", personality: "", interests: "", communicationStyle: "", tone: "friendly",
  });

  useEffect(() => { checkSubscription(); }, []);

  const checkSubscription = async () => {
    setChecking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setChecking(false); return; }
      const { data: sub } = await supabase
        .from("clone_subscriptions")
        .select("tier, expires_at")
        .eq("user_id", user.id).eq("status", "active")
        .order("started_at", { ascending: false }).limit(1).maybeSingle();
      const isActive = sub && (!sub.expires_at || new Date(sub.expires_at) > new Date());
      setTier(isActive ? sub.tier : null);
      const { count } = await supabase
        .from("personality_clones")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      setUsedSlots(count || 0);
    } finally { setChecking(false); }
  };

  const handleCreate = async () => {
    if (!formData.cloneName || !formData.personality) {
      toast({ title: "Missing Information", description: "Fill in at least name and personality", variant: "destructive" });
      return;
    }
    if (!tier) {
      toast({ title: "Subscription Required", description: "Subscribe first in Subscriptions tab", variant: "destructive" });
      return;
    }
    const limit = TIER_LIMITS[tier] ?? 1;
    if (usedSlots >= limit) {
      toast({ title: "Tier Limit Reached", description: `Your ${tier} plan allows ${limit} clone(s). Upgrade to add more.`, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Sign in required", variant: "destructive" }); return; }
      const { error } = await supabase.from("personality_clones").insert({
        user_id: user.id,
        clone_name: formData.cloneName,
        personality_data: {
          personality: formData.personality,
          interests: formData.interests,
          communicationStyle: formData.communicationStyle,
          tone: formData.tone,
        },
        subscription_tier: tier,
        training_status: "active",
      });
      if (error) throw error;
      toast({ title: "Clone Created! 🤖", description: "Your AI clone is live." });
      setFormData({ cloneName: "", personality: "", interests: "", communicationStyle: "", tone: "friendly" });
      checkSubscription();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to create clone", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  if (checking) {
    return <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
  }

  if (!tier) {
    return (
    <>
      <FloatingHowItWorks title={"Clone Creator - How it works"} steps={[{ title: 'Open', desc: 'Access the Clone Creator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Clone Creator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Subscription Required</CardTitle>
          <CardDescription>Creating an AI clone requires an active subscription (from €9.99/month).</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Open the <strong>Subscriptions</strong> tab from the hub to choose a plan.</p>
        </CardContent>
      </Card>
    </>
  );
  }

  const limit = TIER_LIMITS[tier] ?? 1;

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Create Your AI Personality Clone
        </CardTitle>
        <CardDescription>Plan: <strong className="capitalize">{tier}</strong> · {usedSlots}/{limit === 999 ? "∞" : limit} clones used</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cloneName">Clone Name</Label>
          <Input id="cloneName" placeholder="e.g., Alex AI" value={formData.cloneName} onChange={(e) => setFormData({ ...formData, cloneName: e.target.value })} className="bg-background/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="personality">Personality Description</Label>
          <Textarea id="personality" rows={4} placeholder="Funny, serious, creative? What makes you unique?" value={formData.personality} onChange={(e) => setFormData({ ...formData, personality: e.target.value })} className="bg-background/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="interests">Interests & Expertise</Label>
          <Textarea id="interests" rows={3} placeholder="Topics, hobbies..." value={formData.interests} onChange={(e) => setFormData({ ...formData, interests: e.target.value })} className="bg-background/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="communicationStyle">Communication Style</Label>
          <Textarea id="communicationStyle" rows={3} placeholder="Formal or casual? Brief or detailed?" value={formData.communicationStyle} onChange={(e) => setFormData({ ...formData, communicationStyle: e.target.value })} className="bg-background/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tone">Overall Tone</Label>
          <Select value={formData.tone} onValueChange={(v) => setFormData({ ...formData, tone: v })}>
            <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="friendly">Friendly & Warm</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="humorous">Humorous</SelectItem>
              <SelectItem value="intellectual">Intellectual</SelectItem>
              <SelectItem value="empathetic">Empathetic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCreate} className="w-full" disabled={isLoading || usedSlots >= limit}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : <><Bot className="mr-2 h-4 w-4" /> Create AI Clone</>}
        </Button>
      </CardContent>
    </Card>
  );
}
