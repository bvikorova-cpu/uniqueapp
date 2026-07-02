import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { Loader2, Target, Globe, Thermometer, Wallet, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const DestinationRecommender = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { credits, refresh } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [travelStyle, setTravelStyle] = useState("adventure");
  const [climate, setClimate] = useState("warm");
  const [budgetLevel, setBudgetLevel] = useState("medium");
  const [interests, setInterests] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const interestOptions = ["Beach", "Mountains", "Cities", "Cultural Sites", "Wildlife", "Cuisine", "Festivals", "Architecture"];

  const toggleInterest = (interest: string) => {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const handleRecommend = async () => {
    try {
      setLoading(true);
      const currentCredits = typeof credits === "number" ? credits : credits.credits_remaining;
      if (currentCredits < 5) {
        toast({ title: "Insufficient Credits", description: "You need 5 credits.", variant: "destructive" });
        setTimeout(() => navigate("/ai-credits-store"), 2000);
        return;
      }
      const { data, error } = await supabase.functions.invoke("experience-ai", {
        body: { action: "destination-recommender", travelStyle, climate, budgetLevel, interests },
      });
      if (error) throw error;
      setRecommendations(data.recommendations || []);
      toast({ title: "🌍 Recommendations Ready!", description: "Check out your personalized destinations" });
      await refresh();
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message || "Failed to get recommendations", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Destination Recommender - How it works"} steps={[{ title: 'Open', desc: 'Access the Destination Recommender section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Destination Recommender.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Destination Recommender</CardTitle>
          <CardDescription>AI analyzes your preferences and suggests your perfect next destination</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Travel Style</label>
              <Select value={travelStyle} onValueChange={setTravelStyle}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="adventure">Adventure</SelectItem>
                  <SelectItem value="relaxation">Relaxation</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="romantic">Romantic</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Preferred Climate</label>
              <Select value={climate} onValueChange={setClimate}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="warm">Warm & Sunny</SelectItem>
                  <SelectItem value="tropical">Tropical</SelectItem>
                  <SelectItem value="temperate">Temperate</SelectItem>
                  <SelectItem value="cold">Cold & Snowy</SelectItem>
                  <SelectItem value="any">Any Climate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Budget</label>
              <Select value={budgetLevel} onValueChange={setBudgetLevel}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget-Friendly</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Interests</label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map(i => (
                <Badge key={i} variant={interests.includes(i) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleInterest(i)}>{i}</Badge>
              ))}
            </div>
          </div>
          <Button onClick={handleRecommend} disabled={loading} className="w-full">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</> : <>Get Recommendations (5 credits)</>}
          </Button>
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-lg">{rec.destination}</h3>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {rec.match_score && <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{rec.match_score}% Match</Badge>}
                    {rec.best_season && <Badge variant="outline" className="text-xs">{rec.best_season}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  {rec.highlights && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Highlights</span>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                        {rec.highlights.map((h: string, j: number) => <li key={j}>{h}</li>)}
                      </ul>
                    </div>
                  )}
                  {rec.estimated_budget && (
                    <div className="flex items-center gap-2 text-sm">
                      <Wallet className="h-4 w-4 text-amber-500" />
                      <span>{rec.estimated_budget}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};
