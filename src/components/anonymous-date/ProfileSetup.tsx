import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev =>
      prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonymousName || !ageRange || selectedInterests.length === 0) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
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
      toast({ title: "Profile Created!", description: "You can now start finding matches" });
      onComplete();
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({ title: "Error", description: "Failed to create profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 max-w-2xl mx-auto">
        <div className="h-1.5 bg-gradient-to-r from-pink-500 to-accent" />
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="h-5 w-5 text-pink-500" />
              <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-pink-500 to-accent bg-clip-text text-transparent">
                Create Your Anonymous Profile
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">Your real identity stays completely hidden until you reveal it</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Anonymous Name *</Label>
              <Input
                value={anonymousName}
                onChange={(e) => setAnonymousName(e.target.value)}
                placeholder="MysteryPerson123"
                required
                className="mt-1.5 bg-muted/10 border-border/50"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Age Range *</Label>
              <Input
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                placeholder="25-30"
                required
                className="mt-1.5 bg-muted/10 border-border/50"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Looking For</Label>
              <Textarea
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                placeholder="What are you looking for in a connection?"
                rows={3}
                className="mt-1.5 bg-muted/10 border-border/50"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Select Interests * (Choose at least 3)</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                      selectedInterests.includes(interest)
                        ? "bg-pink-500/10 border-pink-500/30 text-pink-500 font-medium"
                        : "border-border/50 text-muted-foreground hover:border-border"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Personality Traits (Choose up to 5)</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                {PERSONALITY_TRAITS.map((trait) => (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => toggleTrait(trait)}
                    disabled={selectedTraits.length >= 5 && !selectedTraits.includes(trait)}
                    className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                      selectedTraits.includes(trait)
                        ? "bg-accent/10 border-accent/30 text-accent font-medium"
                        : "border-border/50 text-muted-foreground hover:border-border disabled:opacity-30"
                    }`}
                  >
                    {trait}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Profile...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Create Profile & Start Matching</>
            )}
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}
