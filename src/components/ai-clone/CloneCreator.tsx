import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Loader2, Sparkles } from "lucide-react";

export function CloneCreator() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cloneName: "",
    personality: "",
    interests: "",
    communicationStyle: "",
    tone: "friendly"
  });

  const handleCreate = async () => {
    if (!formData.cloneName || !formData.personality) {
      toast({ title: "Missing Information", description: "Please fill in at least name and personality description", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Required", description: "Please sign in to create your AI clone", variant: "destructive" });
        return;
      }

      const personalityData = {
        personality: formData.personality,
        interests: formData.interests,
        communicationStyle: formData.communicationStyle,
        tone: formData.tone
      };

      const { error } = await supabase
        .from('personality_clones')
        .insert({
          user_id: user.id,
          clone_name: formData.cloneName,
          personality_data: personalityData,
          subscription_tier: 'basic',
          training_status: 'training'
        });

      if (error) throw error;

      toast({ title: "Clone Created! 🤖", description: "Your AI personality clone is being trained and will be ready soon" });
      setFormData({ cloneName: "", personality: "", interests: "", communicationStyle: "", tone: "friendly" });
    } catch (error) {
      console.error('Error creating clone:', error);
      toast({ title: "Error", description: "Failed to create clone. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Create Your AI Personality Clone
        </CardTitle>
        <CardDescription>Define your clone's personality and communication style</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cloneName">Clone Name</Label>
          <Input id="cloneName" placeholder="e.g., Alex AI, Sarah Clone..." value={formData.cloneName} onChange={(e) => setFormData({ ...formData, cloneName: e.target.value })} className="bg-background/50" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="personality">Personality Description</Label>
          <Textarea id="personality" placeholder="Describe your personality: funny, serious, creative, analytical? What makes you unique?" rows={4} value={formData.personality} onChange={(e) => setFormData({ ...formData, personality: e.target.value })} className="bg-background/50" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interests">Interests & Expertise</Label>
          <Textarea id="interests" placeholder="What topics do you know about? What are your hobbies?" rows={3} value={formData.interests} onChange={(e) => setFormData({ ...formData, interests: e.target.value })} className="bg-background/50" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="communicationStyle">Communication Style</Label>
          <Textarea id="communicationStyle" placeholder="How do you communicate? Formal or casual? Brief or detailed?" rows={3} value={formData.communicationStyle} onChange={(e) => setFormData({ ...formData, communicationStyle: e.target.value })} className="bg-background/50" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Overall Tone</Label>
          <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
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
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Clone...</>
          ) : (
            <><Bot className="mr-2 h-4 w-4" /> Create AI Clone</>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your clone will be created with a Basic subscription (€9.99/month)
        </p>
      </CardContent>
    </Card>
  );
}
