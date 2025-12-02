import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const INTERESTS = [
  "Travel", "Movies", "Music", "Sports", "Reading", "Cooking",
  "Art", "Gaming", "Fitness", "Photography", "Dancing", "Nature"
];

const PERSONALITY_TRAITS = [
  "Funny", "Adventurous", "Calm", "Energetic", "Creative", "Logical",
  "Romantic", "Ambitious", "Easy-going", "Thoughtful", "Spontaneous", "Loyal"
];

export function ProfileSetup({ onComplete }: { onComplete: () => void }) {
  const [anonymousName, setAnonymousName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev =>
      prev.includes(trait)
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!anonymousName || !ageRange || selectedInterests.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("anonymous_dating_profiles")
        .upsert({
          user_id: user.id,
          anonymous_name: anonymousName,
          age_range: ageRange,
          interests: selectedInterests,
          personality_traits: selectedTraits,
          looking_for: lookingFor,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Profile Created!",
        description: "You can now start finding matches",
      });
      
      onComplete();
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <Label>Anonymous Name *</Label>
          <Input
            value={anonymousName}
            onChange={(e) => setAnonymousName(e.target.value)}
            placeholder="MysteryPerson123"
            required
          />
        </div>

        <div>
          <Label>Age Range *</Label>
          <Input
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            placeholder="25-30"
            required
          />
        </div>

        <div>
          <Label>Looking For</Label>
          <Textarea
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
            placeholder="What are you looking for in a connection?"
            rows={3}
          />
        </div>

        <div>
          <Label>Select Interests * (Choose at least 3)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {INTERESTS.map((interest) => (
              <Button
                key={interest}
                type="button"
                variant={selectedInterests.includes(interest) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleInterest(interest)}
                className="text-xs"
              >
                {interest}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label>Personality Traits (Choose up to 5)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {PERSONALITY_TRAITS.map((trait) => (
              <Button
                key={trait}
                type="button"
                variant={selectedTraits.includes(trait) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTrait(trait)}
                disabled={selectedTraits.length >= 5 && !selectedTraits.includes(trait)}
                className="text-xs"
              >
                {trait}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90"
        disabled={loading}
      >
        {loading ? "Creating Profile..." : "Create Profile & Start Matching"}
      </Button>
    </form>
  );
}