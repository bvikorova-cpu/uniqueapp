import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { Loader2, Map, Calendar, Utensils, Camera, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const TravelPlanner = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { credits, refresh } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState("medium");
  const [interests, setInterests] = useState<string[]>([]);
  const [plan, setPlan] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);

  const interestOptions = ["Culture", "Food", "Nature", "Adventure", "Shopping", "Nightlife", "History", "Art", "Photography", "Relaxation"];

  const toggleInterest = (interest: string) => {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const handleGenerate = async () => {
    if (!destination.trim()) {
      toast({ title: "Enter a destination", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const currentCredits = typeof credits === "number" ? credits : credits.credits_remaining;
      if (currentCredits < 10) {
        toast({ title: "Insufficient Credits", description: "You need 10 credits.", variant: "destructive" });
        setTimeout(() => navigate("/ai-credits-store"), 2000);
        return;
      }
      const { data, error } = await supabase.functions.invoke("experience-ai", {
        body: { action: "travel-planner", destination, days, budget, interests },
      });
      if (error) throw error;
      setPlan(data.plan);
      toast({ title: "✈️ Travel Plan Created!", description: `Your ${days}-day ${destination} itinerary is ready` });
      await refresh();
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message || "Failed to generate plan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Travel Planner - How it works"} steps={[{ title: 'Open', desc: 'Access the Travel Planner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Travel Planner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Map className="h-5 w-5 text-primary" />AI Travel Planner</CardTitle>
          <CardDescription>Get a personalized multi-day itinerary with attractions, food & culture tips</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Destination</label>
            <Input placeholder="e.g. Tokyo, Paris, Bali..." value={destination} onChange={e => setDestination(e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Duration (days)</label>
              <Input type="number" min={1} max={14} value={days} onChange={e => setDays(Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Budget Level</label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget</SelectItem>
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
                <Badge key={i} variant={interests.includes(i) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleInterest(i)}>
                  {i}
                </Badge>
              ))}
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={loading || !destination.trim()} className="w-full">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating Plan...</> : <>Generate Travel Plan (10 credits)</>}
          </Button>
        </CardContent>
      </Card>

      {plan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />{plan.title || `${days}-Day ${destination} Itinerary`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {plan.overview && <p className="text-muted-foreground">{plan.overview}</p>}
              {plan.days?.map((day: any, idx: number) => (
                <div key={idx} className="border-l-2 border-primary/30 pl-4 space-y-3">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-black text-primary">{idx + 1}</span>
                    Day {idx + 1}: {day.theme || ""}
                  </h3>
                  {day.morning && <div className="space-y-1"><Badge variant="outline" className="text-xs">Morning</Badge><p className="text-sm text-muted-foreground">{day.morning}</p></div>}
                  {day.afternoon && <div className="space-y-1"><Badge variant="outline" className="text-xs">Afternoon</Badge><p className="text-sm text-muted-foreground">{day.afternoon}</p></div>}
                  {day.evening && <div className="space-y-1"><Badge variant="outline" className="text-xs">Evening</Badge><p className="text-sm text-muted-foreground">{day.evening}</p></div>}
                  {day.food_tip && <div className="flex items-start gap-2 bg-amber-500/10 rounded-lg p-3"><Utensils className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /><p className="text-sm">{day.food_tip}</p></div>}
                  {day.culture_tip && <div className="flex items-start gap-2 bg-purple-500/10 rounded-lg p-3"><Star className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" /><p className="text-sm">{day.culture_tip}</p></div>}
                </div>
              ))}
              {plan.tips && (
                <div className="bg-card/50 rounded-xl p-4 border">
                  <h4 className="font-semibold mb-2">💡 Pro Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc ml-4">
                    {plan.tips.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
