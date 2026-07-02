import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UtensilsCrossed, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const AIFoodExplorer = ({ onBack }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [form, setForm] = useState({ location: "", diet: "none", budget: "medium" });

  const generate = async () => {
    if (!form.location) { toast({ title: "Enter a location", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `Create a food lover's guide to ${form.location}. Dietary preferences: ${form.diet === "none" ? "no restrictions" : form.diet}. Budget: ${form.budget}. Include: top 10 must-try local dishes with descriptions, best street food spots, recommended restaurants (categorized by budget), local food markets, food-related experiences (cooking classes, food tours), drinks to try, foods to avoid, and tips for ordering. Make it mouth-watering!`
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
      <FloatingHowItWorks title={"A I Food Explorer - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Food Explorer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Food Explorer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back to Hub</Button>
      <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-background to-red-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UtensilsCrossed className="w-6 h-6 text-orange-500" />AI Food Explorer<span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full ml-2">3 Credits</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Location (e.g., Bangkok, Rome, Mexico City)" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <Select value={form.diet} onValueChange={v => setForm({...form, diet: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Restrictions</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="halal">Halal</SelectItem>
                <SelectItem value="gluten-free">Gluten Free</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.budget} onValueChange={v => setForm({...form, budget: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="fine-dining">Fine Dining</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {loading ? "Exploring..." : "Explore Local Food"}
          </Button>
          {result && <Card className="bg-card/50"><CardContent className="pt-4 whitespace-pre-wrap text-sm">{result}</CardContent></Card>}
        </CardContent>
      </Card>
    </div>
    </>
  );
};
