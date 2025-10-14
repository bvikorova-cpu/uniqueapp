import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { Badge } from "@/components/ui/badge";

const LinkedInEnhancer = () => {
  const { toast } = useToast();
  const { credits, useCredit } = useAICredits();
  const [loading, setLoading] = useState(false);
  
  const [profileContent, setProfileContent] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [enhancedProfile, setEnhancedProfile] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  const enhanceProfile = async () => {
    if (!profileContent) {
      toast({ title: "Error", description: "Please enter your LinkedIn profile content", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await useCredit("effect");

      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("career-linkedin", {
        body: { profileContent, targetIndustry },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (response.error) throw response.error;
      
      setSuggestions(response.data.suggestions);
      setEnhancedProfile(response.data.enhancedProfile);
      setKeywords(response.data.keywords);
      
      toast({ title: "Profile Enhanced", description: "LinkedIn profile optimization complete" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveEnhancement = async () => {
    if (!enhancedProfile) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase
        .from("linkedin_enhancements")
        .insert({
          user_id: user.id,
          current_profile: profileContent,
          enhanced_profile: enhancedProfile,
          suggestions,
          target_industry: targetIndustry,
        });

      toast({ title: "Saved", description: "LinkedIn enhancement saved to history" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>LinkedIn Profile Enhancement</CardTitle>
        <CardDescription>Optimize your LinkedIn profile for better visibility</CardDescription>
        <p className="text-sm text-muted-foreground">Credits: {credits?.credits_remaining || 0}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="profileContent">Current LinkedIn Profile</Label>
          <Textarea
            id="profileContent"
            value={profileContent}
            onChange={(e) => setProfileContent(e.target.value)}
            placeholder="Paste your LinkedIn profile content (headline, about, experience)..."
            rows={10}
          />
        </div>

        <div>
          <Label htmlFor="targetIndustry">Target Industry (Optional)</Label>
          <Input
            id="targetIndustry"
            value={targetIndustry}
            onChange={(e) => setTargetIndustry(e.target.value)}
            placeholder="e.g., Technology, Finance, Healthcare"
          />
        </div>

        <Button onClick={enhanceProfile} disabled={loading} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Enhance Profile
        </Button>

        {keywords.length > 0 && (
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Recommended Keywords:</h3>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary">{keyword}</Badge>
              ))}
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Suggestions:</h3>
            <ul className="list-disc list-inside space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {enhancedProfile && (
          <>
            <div>
              <Label>Enhanced Profile</Label>
              <Textarea
                value={enhancedProfile}
                onChange={(e) => setEnhancedProfile(e.target.value)}
                rows={10}
              />
            </div>

            <Button onClick={saveEnhancement} variant="outline" className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Enhancement
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkedInEnhancer;