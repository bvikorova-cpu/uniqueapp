import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CreateInfluencerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NICHES = [
  "Fashion & Beauty",
  "Fitness & Wellness",
  "Travel & Adventure",
  "Food & Cooking",
  "Technology & Gaming",
  "Art & Design",
  "Music & Entertainment",
  "Business & Finance",
  "Lifestyle & Vlog",
  "Education & Learning",
];

const PERSONALITIES = [
  "Friendly & Approachable",
  "Professional & Expert",
  "Energetic & Fun",
  "Calm & Zen",
  "Edgy & Bold",
  "Sophisticated & Elegant",
  "Quirky & Unique",
  "Motivational & Inspiring",
];

const CreateInfluencer = ({ open, onOpenChange }: CreateInfluencerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    personality: "",
    niche: "",
    avatarUrl: "",
  });

  const handleGenerateAvatar = async () => {
    if (!formData.name || !formData.niche || !formData.personality) {
      toast({
        title: "Missing Information",
        description: "Please fill in name, niche, and personality first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAvatar(true);
    try {
      const prompt = `Create a professional, realistic virtual influencer portrait photo for ${formData.name}, specialized in ${formData.niche} with a ${formData.personality} personality. High-quality headshot, Instagram influencer style, professional lighting, 4K quality.`;

      const { data, error } = await supabase.functions.invoke("ai-image-generation", {
        body: { prompt },
      });

      if (error) throw error;

      setFormData({ ...formData, avatarUrl: data.imageUrl });
      toast({
        title: "Avatar Generated!",
        description: "Your influencer's avatar is ready",
      });
    } catch (error) {
      console.error("Error generating avatar:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.niche || !formData.personality) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("virtual_influencers").insert([{
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        personality: formData.personality,
        niche: formData.niche,
        avatar_url: formData.avatarUrl || null,
        followers: Math.floor(Math.random() * 1000) + 100, // Start with random followers
        engagement_rate: Number((Math.random() * 5 + 2).toFixed(2)), // 2-7% engagement
      }]);

      if (error) throw error;

      toast({
        title: "Influencer Created!",
        description: `${formData.name} is now ready to start earning`,
      });

      queryClient.invalidateQueries({ queryKey: ["virtual-influencers"] });
      onOpenChange(false);
      setFormData({
        name: "",
        description: "",
        personality: "",
        niche: "",
        avatarUrl: "",
      });
    } catch (error) {
      console.error("Error creating influencer:", error);
      toast({
        title: "Creation Failed",
        description: "Failed to create influencer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Create Influencer - How it works"} steps={[{ title: 'Open', desc: 'Access the Create Influencer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Create Influencer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Virtual Influencer</DialogTitle>
          <DialogDescription>
            Design your AI-powered influencer that will generate content and earn money
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Influencer Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Luna Sterling"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="niche">Niche *</Label>
            <Select
              value={formData.niche}
              onValueChange={(value) => setFormData({ ...formData, niche: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a niche" />
              </SelectTrigger>
              <SelectContent>
                {NICHES.map((niche) => (
                  <SelectItem key={niche} value={niche}>
                    {niche}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personality">Personality *</Label>
            <Select
              value={formData.personality}
              onValueChange={(value) => setFormData({ ...formData, personality: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select personality" />
              </SelectTrigger>
              <SelectContent>
                {PERSONALITIES.map((personality) => (
                  <SelectItem key={personality} value={personality}>
                    {personality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell us about your influencer's style, interests, and target audience..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Avatar Image</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Avatar URL (optional)"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              />
              <Button
                type="button"
                onClick={handleGenerateAvatar}
                disabled={isGeneratingAvatar}
                variant="outline"
              >
                {isGeneratingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
            {formData.avatarUrl && (
              <img
                src={formData.avatarUrl}
                alt="Avatar preview"
                className="mt-2 rounded-lg w-32 h-32 object-cover"
              />
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Influencer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default CreateInfluencer;
