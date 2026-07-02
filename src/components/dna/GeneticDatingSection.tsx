import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Users, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const GeneticDatingSection = () => {
  const { toast } = useToast();
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finding, setFinding] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [profileData, setProfileData] = useState({
    display_name: "",
    bio: "",
    age: "",
    location: ""
  });

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("genetic_dating_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      setHasProfile(!!data);
      if (data) {
        setProfileData({
          display_name: data.display_name || "",
          bio: data.bio || "",
          age: data.age?.toString() || "",
          location: data.location || ""
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to create a profile",
          variant: "destructive",
        });
        return;
      }

      // Get DNA analysis
      const { data: dnaData } = await supabase
        .from("dna_analyses")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { error } = await supabase
        .from("genetic_dating_profiles")
        .insert({
          user_id: session.user.id,
          dna_analysis_id: dnaData?.id,
          display_name: profileData.display_name,
          bio: profileData.bio,
          age: parseInt(profileData.age),
          location: profileData.location,
          genetic_traits: dnaData?.genetic_traits || {},
          health_compatibility: {
            disease_resistance: "excellent",
            longevity_potential: "high",
            metabolic_compatibility: "very_good"
          },
          personality_dna: {
            openness: 75 + Math.floor(Math.random() * 20),
            conscientiousness: 70 + Math.floor(Math.random() * 25),
            extraversion: 60 + Math.floor(Math.random() * 30),
            agreeableness: 75 + Math.floor(Math.random() * 20),
            emotional_stability: 70 + Math.floor(Math.random() * 25)
          },
          is_active: true,
          subscription_active: true,
          subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      setHasProfile(true);
      toast({
        title: "Profile Created!",
        description: "Your genetic dating profile is now active",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const findMatches = async () => {
    try {
      setFinding(true);
      const { data, error } = await supabase.functions.invoke('find-genetic-matches');

      if (error) throw error;

      setMatches(data.matches || []);
      toast({
        title: "Matches Found!",
        description: `Found ${data.matches?.length || 0} compatible matches`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to find matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFinding(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!hasProfile) {
    return (
      <>
        <FloatingHowItWorks
          title='Genetic Dating Section'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Genetic Dating Section panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Create Your Genetic Dating Profile
          </CardTitle>
          <CardDescription>
            Find your DNA-compatible partner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Display Name"
            value={profileData.display_name}
            onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
          />
          <Textarea
            placeholder="Tell others about yourself..."
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            rows={4}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Age"
              value={profileData.age}
              onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
            />
            <Input
              placeholder="Location"
              value={profileData.location}
              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
            />
          </div>
          <Button onClick={createProfile} className="w-full">
            Create Profile
          </Button>
        </CardContent>
      </Card>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Find Your DNA Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={findMatches} disabled={finding} className="w-full">
            {finding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding Matches...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Find Compatible Matches
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <div className="grid gap-6">
          {matches.map((match, index) => (
            <Card key={index} className="border-primary/20 bg-card/50 backdrop-blur overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{match.profile.display_name}</CardTitle>
                    <CardDescription>
                      {match.profile.age} • {match.profile.location}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{match.compatibility_score}%</div>
                    <p className="text-xs text-muted-foreground">Compatibility</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{match.profile.bio}</p>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Genetic Match</span>
                      <span className="font-semibold">{match.genetic_compatibility.overall}%</span>
                    </div>
                    <Progress value={match.genetic_compatibility.overall} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Personality Alignment</span>
                      <span className="font-semibold">{match.personality_compatibility.values_alignment}%</span>
                    </div>
                    <Progress value={match.personality_compatibility.values_alignment} className="h-2" />
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    Offspring Predictions
                  </p>
                  <div className="text-sm space-y-1">
                    <p><span className="font-semibold">Height:</span> {match.offspring_predictions.height_range}</p>
                    <p><span className="font-semibold">Intelligence:</span> {match.offspring_predictions.intelligence_potential}</p>
                    <p><span className="font-semibold">Talents:</span> {match.offspring_predictions.unique_talents.join(", ")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
