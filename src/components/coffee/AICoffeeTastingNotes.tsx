import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Loader2, Wine, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const FLAVOR_WHEEL = [
  "Fruity", "Berry", "Citrus", "Tropical", "Stone Fruit",
  "Chocolate", "Nutty", "Caramel", "Honey", "Vanilla",
  "Floral", "Herbal", "Earthy", "Spicy", "Smoky",
  "Woody", "Grain", "Roasted", "Savory", "Fermented",
];

export const AICoffeeTastingNotes = ({ onBack }: { onBack: () => void }) => {
  const [coffeeName, setCoffeeName] = useState("");
  const [origin, setOrigin] = useState("");
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [acidity, setAcidity] = useState([5]);
  const [body, setBody] = useState([5]);
  const [sweetness, setSweetness] = useState([5]);
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleFlavor = (f: string) => {
    setSelectedFlavors(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f].slice(0, 6));
  };

  const handleAnalyze = async () => {
    if (!coffeeName.trim() || selectedFlavors.length === 0) { toast.error("Please name the coffee and select at least one flavor"); return; }
    setLoading(true); setAiAnalysis("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }

      const tastingData = { coffeeName, origin, flavors: selectedFlavors, acidity: acidity[0], body: body[0], sweetness: sweetness[0], notes, rating };

      // Save tasting note
      await supabase.from("activity_feed").insert({
        user_id: user.id,
        activity_type: "coffee_tasting",
        metadata: tastingData,
      });

      // AI Analysis (paid)
      const { data, error } = await supabase.functions.invoke("ai-coffee-advisor", {
        body: { type: "tasting_analysis", ...tastingData }
      });
      if (error) throw error;
      setAiAnalysis(data?.result || "Tasting notes saved!");
      toast.success("Tasting notes saved!");
    } catch (e: any) {
      toast.error(e.message?.includes("credits") ? "Insufficient credits" : "Notes saved, AI analysis failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      <Card className="border-amber-500/20 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wine className="h-5 w-5 text-violet-400" />
            AI Coffee Tasting Notes
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">3 Credits</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">Record structured tasting notes and get AI-powered flavor analysis</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Coffee Name & Origin */}
          <div className="grid grid-cols-2 gap-3">
            <input
              className="w-full p-2 rounded-lg bg-background border border-amber-500/20 text-sm placeholder:text-muted-foreground"
              placeholder="Coffee name"
              value={coffeeName}
              onChange={e => setCoffeeName(e.target.value)}
            />
            <Select value={origin} onValueChange={setOrigin}>
              <SelectTrigger><SelectValue placeholder="Origin" /></SelectTrigger>
              <SelectContent>
                {["Ethiopia", "Colombia", "Brazil", "Kenya", "Guatemala", "Costa Rica", "Indonesia", "Jamaica", "Yemen", "Vietnam", "Other"].map(o => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Star Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <motion.button key={s} whileTap={{ scale: 0.9 }} onClick={() => setRating(s)}>
                  <Star className={`h-6 w-6 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Flavor Wheel */}
          <div>
            <label className="text-sm font-medium mb-2 block">Flavor Notes (select up to 6)</label>
            <div className="flex flex-wrap gap-1.5">
              {FLAVOR_WHEEL.map(f => (
                <motion.button
                  key={f}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFlavor(f)}
                  className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all border ${
                    selectedFlavors.includes(f)
                      ? "border-violet-500 bg-violet-500/20 text-violet-300"
                      : "border-amber-500/10 bg-card hover:border-amber-500/30 text-muted-foreground"
                  }`}
                >
                  {f}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1"><span>Acidity</span><span>{acidity[0]}/10</span></div>
              <Slider value={acidity} onValueChange={setAcidity} min={1} max={10} step={1} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span>Body</span><span>{body[0]}/10</span></div>
              <Slider value={body} onValueChange={setBody} min={1} max={10} step={1} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span>Sweetness</span><span>{sweetness[0]}/10</span></div>
              <Slider value={sweetness} onValueChange={setSweetness} min={1} max={10} step={1} />
            </div>
          </div>

          <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional tasting notes..." rows={2} />

          <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-800" onClick={handleAnalyze} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : "Save & Get AI Analysis"}
          </Button>

          {aiAnalysis && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20 whitespace-pre-wrap text-sm">
              {aiAnalysis}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
