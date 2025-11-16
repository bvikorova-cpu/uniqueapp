import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Heart, MapPin, User, Sparkles, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const SoulmateMatchingSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    age: "",
    location: "",
  });

  const handleCreateProfile = async () => {
    if (!formData.displayName || !formData.age || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to create profile",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("soul_profiles").insert({
        user_id: session.user.id,
        display_name: formData.displayName,
        bio: formData.bio,
        age: parseInt(formData.age),
        location: formData.location,
        is_active: true
      });

      if (error) throw error;

      setProfileCreated(true);
      toast({
        title: "Profile Created!",
        description: "Your soul profile is now active",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFindMatches = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to find matches",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('find-soul-matches');

      if (error) throw error;

      setMatches(data.matches);
      toast({
        title: "Matches Found!",
        description: `Discovered ${data.matches.length} soul connections`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Search Failed",
        description: "Failed to find soul matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Past Lives Soulmate Matching
          </CardTitle>
          <CardDescription>
            Connect with souls you've known across lifetimes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!profileCreated ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  placeholder="Your soul name"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell others about your spiritual journey..."
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Your age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <Button 
                onClick={handleCreateProfile} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Create Soul Profile
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button 
                onClick={handleFindMatches} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching Soul Connections...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Find My Soul Matches
                  </>
                )}
              </Button>

              {matches.length > 0 && (
                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  {matches.map((match, idx) => (
                    <Card key={idx} className="border-primary/30">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{match.profile.display_name}</CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-2">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {match.profile.age} years
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {match.profile.location}
                              </span>
                            </CardDescription>
                          </div>
                          <Badge className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {match.connection_type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {match.profile.bio && (
                          <p className="text-sm text-muted-foreground">{match.profile.bio}</p>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Soul Compatibility</span>
                            <span className="text-lg font-bold text-primary">{match.compatibility_score}%</span>
                          </div>
                          <Progress value={match.compatibility_score} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <History className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-lg font-bold">{match.past_lives_together}</div>
                            <div className="text-xs text-muted-foreground">Past Lives Together</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-lg font-bold">{match.reunion_probability}%</div>
                            <div className="text-xs text-muted-foreground">Reunion Probability</div>
                          </div>
                        </div>

                        {match.soul_contract && (
                          <div className="p-3 rounded-lg bg-primary/10">
                            <h4 className="font-semibold text-sm mb-1">Soul Contract</h4>
                            <p className="text-xs text-muted-foreground">{match.soul_contract}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
