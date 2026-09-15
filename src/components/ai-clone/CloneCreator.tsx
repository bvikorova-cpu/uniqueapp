import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Loader2, Sparkles, Coins } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const CLONE_COST = 5;

export function CloneCreator() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ cloneName: "", personality: "", interests: "", communicationStyle: "", tone: "friendly" });

  const handleCreate = async () => {
    if (!formData.cloneName || !formData.personality) {
      toast({ title: "Missing Information", description: "Fill in at least name and personality", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Sign in required", variant: "destructive" }); return; }

      const { data: deductData, error: deductError } = await supabase.rpc("deduct_ai_credits_atomic", {
        _user_id: user.id,
        _amount: CLONE_COST,
      });
      if (deductError) throw deductError;
      if (deductData && (deductData as any).ok === false) {
        toast({
          title: "Not enough credits",
          description: `Creating a clone costs ${CLONE_COST} credits. Top up your balance and try again.`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("personality_clones").insert({ user_id: user.id,
        clone_name: formData.cloneName,
        personality_data: {
          personality: formData.personality,
          interests: formData.interests,
          communicationStyle: formData.communicationStyle,
          tone: formData.tone },
        subscription_tier: "credits",
        training_status: "active" });
      if (error) throw error;
      toast({ title: "Clone Created! 🤖", description: "Your AI clone is live." });
      window.dispatchEvent(new Event("ai-credits-updated"));
      setFormData({ cloneName: "", personality: "", interests: "", communicationStyle: "", tone: "friendly" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to create clone", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Clone Creator - How it works"} steps={[{ title: 'Open', desc: 'Access the Clone Creator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Clone Creator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Create Your AI Personality Clone
          </CardTitle>
          <CardDescription className="flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-amber-500" /> Costs {CLONE_COST} credits per clone
          </CardDescription>
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
          <Button onClick={handleCreate} className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : <><Bot className="mr-2 h-4 w-4" /> Create AI Clone · {CLONE_COST} credits</>}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
