import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2 } from "lucide-react";

const professions = [
  "CEO / Entrepreneur",
  "Rockstar / Musician",
  "Digital Nomad",
  "Artist / Creative",
  "Scientist / Researcher",
  "Athlete / Fitness Coach",
  "Writer / Journalist",
  "Influencer / Content Creator",
  "Chef / Food Expert",
  "Fashion Designer",
  "Tech Innovator",
  "Travel Blogger"
];

const lifestyles = [
  "Luxury / High-End",
  "Minimalist / Simple",
  "Adventurous / Explorer",
  "Wellness / Mindful",
  "Party / Social",
  "Academic / Intellectual",
  "Artistic / Bohemian",
  "Sporty / Active",
  "Family-Oriented",
  "Workaholic / Ambitious"
];

export function CreateLife() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    lifeName: "",
    persona: "",
    bio: "",
    profession: "",
    lifestyle: ""
  });

  const handleCreate = async () => {
    if (!formData.lifeName || !formData.persona || !formData.profession) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least name, persona, and profession",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to create a parallel life",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('parallel_lives')
        .insert({
          user_id: user.id,
          life_name: formData.lifeName,
          persona: formData.persona,
          bio: formData.bio,
          profession: formData.profession,
          lifestyle: formData.lifestyle,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Parallel Life Created!",
        description: "Your new reality is now live"
      });

      setFormData({
        lifeName: "",
        persona: "",
        bio: "",
        profession: "",
        lifestyle: ""
      });
    } catch (error) {
      console.error('Error creating life:', error);
      toast({
        title: "Error",
        description: "Failed to create parallel life. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Create a New Parallel Life
        </CardTitle>
        <CardDescription>
          Design an alternative version of yourself in a different reality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lifeName">Life Name</Label>
          <Input
            id="lifeName"
            placeholder="e.g., Alex the CEO, Sarah the Rockstar..."
            value={formData.lifeName}
            onChange={(e) => setFormData({ ...formData, lifeName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="persona">Persona / Character</Label>
          <Textarea
            id="persona"
            placeholder="Describe this version of you: What's their personality? What drives them? What makes them unique?"
            rows={3}
            value={formData.persona}
            onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profession">Profession</Label>
          <Select value={formData.profession} onValueChange={(value) => setFormData({ ...formData, profession: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select profession..." />
            </SelectTrigger>
            <SelectContent>
              {professions.map((prof) => (
                <SelectItem key={prof} value={prof}>{prof}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lifestyle">Lifestyle</Label>
          <Select value={formData.lifestyle} onValueChange={(value) => setFormData({ ...formData, lifestyle: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select lifestyle..." />
            </SelectTrigger>
            <SelectContent>
              {lifestyles.map((style) => (
                <SelectItem key={style} value={style}>{style}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Write a short bio for this parallel life..."
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>

        <Button 
          onClick={handleCreate} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Parallel Life...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Create Parallel Life
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Free accounts can create up to 3 parallel lives
        </p>
      </CardContent>
    </Card>
  );
}