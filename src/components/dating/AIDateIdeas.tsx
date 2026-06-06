import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { spendDatingCredits } from "@/lib/datingAiCredits";

interface Props { onBack: () => void; }

export const AIDateIdeas = ({ onBack }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [form, setForm] = useState({ city: "", budget: "medium", dateNumber: "first", interests: "", season: "any" });

  const generate = async () => {
    if (!form.city) { toast({ title: "Enter a city", variant: "destructive" }); return; }
    setLoading(true);
    try {
      await spendDatingCredits(3, "ai_date_ideas");


      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          prompt: `Generate 7 creative and unique date ideas in ${form.city}. 

Budget: ${form.budget}
Date number: ${form.dateNumber} date
Shared interests: ${form.interests || "general"}
Season: ${form.season}

For each date idea provide:
- **Name** - A catchy title
- **Description** - 2-3 sentences about the experience
- **Estimated Cost** - In EUR
- **Duration** - How long it takes
- **Why It Works** - Why this is perfect for a ${form.dateNumber} date
- **Pro Tip** - An insider suggestion

Make ideas unique and memorable, not generic "dinner and a movie". Include hidden gems, experiences, and adventures. Format with clear headings.`
        }
      });
      if (error) throw error;
      setResult(data.message || data.text);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back to Hub</Button>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            AI Date Ideas Generator
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">3 Credits</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="City (e.g., Paris, Prague, Barcelona)" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Budget</label>
              <Select value={form.budget} onValueChange={v => setForm({...form, budget: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free / Low Cost</SelectItem>
                  <SelectItem value="medium">Medium (€20-50)</SelectItem>
                  <SelectItem value="premium">Premium (€50-150)</SelectItem>
                  <SelectItem value="luxury">Luxury (€150+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Date Number</label>
              <Select value={form.dateNumber} onValueChange={v => setForm({...form, dateNumber: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">First Date</SelectItem>
                  <SelectItem value="second">Second Date</SelectItem>
                  <SelectItem value="third">Third Date</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Season</label>
              <Select value={form.season} onValueChange={v => setForm({...form, season: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Season</SelectItem>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                  <SelectItem value="autumn">Autumn</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Interests</label>
              <Input placeholder="Food, adventure, art..." value={form.interests} onChange={e => setForm({...form, interests: e.target.value})} />
            </div>
          </div>
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {loading ? "Generating..." : "Generate Date Ideas"}
          </Button>
          {result && (
            <Card className="bg-card/50">
              <CardContent className="pt-4 whitespace-pre-wrap text-sm">{result}</CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
