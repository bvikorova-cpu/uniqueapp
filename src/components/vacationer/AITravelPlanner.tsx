import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Loader2, Sparkles, ArrowLeft, Image as ImageIcon, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";
import { AiMarkdown } from "../common/AiMarkdown";

interface Props { onBack: () => void; }

export const AITravelPlanner = ({ onBack }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [result, setResult] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [form, setForm] = useState({ destination: "", duration: "7", budget: "medium", interests: "", travelers: "2" });

  const generate = async () => {
    if (!form.destination) { toast({ title: "Enter a destination", variant: "destructive" }); return; }
    setLoading(true);
    setImage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");

      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `You are an expert local travel advisor. Create an EXTREMELY DETAILED ${form.duration}-day travel itinerary for ${form.destination}.
Budget level: ${form.budget}. Travelers: ${form.travelers}. Interests: ${form.interests || "general sightseeing"}.

Use markdown headings and write a long, thorough plan with these sections:
1. "## Trip Overview" - vibe of the destination, best areas to stay (3 neighbourhoods with pros/cons), total estimated budget per person in EUR broken down (accommodation, food, transport, activities).
2. "## Day-by-Day Plan" - for EVERY single day from Day 1 to Day ${form.duration} a separate "### Day N - theme" section with:
   - Morning / Afternoon / Evening blocks, each with concrete named places, suggested time windows (e.g. 09:00-11:00), entrance fees in EUR, and walking/transport time between stops.
   - One breakfast, lunch and dinner recommendation with cuisine type and average price in EUR.
   - A "Tip of the day" line (booking tip, crowd avoidance, best photo spot).
3. "## Must-See Highlights" and "## Hidden Gems" - bullet lists with a sentence of context each.
4. "## Food Guide" - local dishes, markets, street food, one splurge restaurant.
5. "## Getting Around" - airport transfer, public transport passes and prices, taxi/app options.
6. "## Practical Tips" - weather, what to pack, safety, tipping, useful phrases, opening-hours warnings.
7. "## Estimated Total Cost" - a markdown table of cost items in EUR for ${form.travelers} traveler(s).
Use only EUR (€) for prices. Be specific with real place names, never generic filler.`
        }
      });
      if (error) throw error;
      setResult(data.message || data.text);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const generateImage = async () => {
    if (!form.destination) return;
    setImgLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-image-generation", {
        body: {
          prompt: `Beautiful cinematic travel poster photograph of ${form.destination}, iconic landmarks and streets, golden hour light, vibrant colors, ultra detailed, no text, no watermark`
        }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setImage(data.imageUrl);
    } catch (e: any) {
      toast({ title: "Image generation failed", description: e.message, variant: "destructive" });
    } finally { setImgLoading(false); }
  };

  const downloadImage = () => {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image;
    a.download = `${form.destination.replace(/\s+/g, "-").toLowerCase()}-travel.png`;
    a.click();
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
          <Input placeholder="Destination (e.g., City, City, City)" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} />
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
