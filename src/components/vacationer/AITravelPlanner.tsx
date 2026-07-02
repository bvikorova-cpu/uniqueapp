import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const AITravelPlanner = ({ onBack }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [form, setForm] = useState({ destination: "", duration: "7", budget: "medium", interests: "", travelers: "2" });

  const generate = async () => {
    if (!form.destination) { toast({ title: "Enter a destination", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");

      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `Create a detailed ${form.duration}-day travel itinerary for ${form.destination}. Budget level: ${form.budget}. Number of travelers: ${form.travelers}. Interests: ${form.interests || "general sightseeing"}. Include: day-by-day schedule with morning/afternoon/evening activities, estimated costs, restaurant recommendations, transportation tips, must-see attractions, hidden gems, and practical travel tips. Format with clear headings and bullet points.`
        }
      });
      if (error) throw error;
      setResult(data.message || data.text);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Travel Planner - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Travel Planner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Travel Planner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back to Hub</Button>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Brain className="w-6 h-6 text-primary" />AI Travel Planner<span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">3 Credits</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Destination (e.g., Bali, Tokyo, Paris)" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Duration (days)</label>
              <Select value={form.duration} onValueChange={v => setForm({...form, duration: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["3","5","7","10","14","21","30"].map(d => <SelectItem key={d} value={d}>{d} days</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Budget</label>
              <Select value={form.budget} onValueChange={v => setForm({...form, budget: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="ultra-luxury">Ultra Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Input placeholder="Number of travelers" value={form.travelers} onChange={e => setForm({...form, travelers: e.target.value})} type="number" min="1" />
          <Textarea placeholder="Your interests (food, adventure, culture, nature, nightlife...)" value={form.interests} onChange={e => setForm({...form, interests: e.target.value})} />
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {loading ? "Generating Plan..." : "Generate Travel Plan"}
          </Button>
          {result && (
            <Card className="bg-card/50">
              <CardContent className="pt-4 whitespace-pre-wrap text-sm">{result}</CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
};
