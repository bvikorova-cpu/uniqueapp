import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, ChefHat, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const AICoffeeRecipeCreator = ({ onBack }: { onBack: () => void }) => {
  const [style, setStyle] = useState("");
  const [season, setSeason] = useState("");
  const [dietary, setDietary] = useState("");
  const [inspiration, setInspiration] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!style) { toast.error("Please select a drink style"); return; }
    setLoading(true); setResult("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("ai-coffee-advisor", {
        body: { type: "recipe_creator", style, season, dietary, inspiration }
      });
      if (error) throw error;
      setResult(data?.result || "No recipe generated");
    } catch (e: any) {
      toast.error(e.message?.includes("credits") ? "Insufficient credits" : "Error creating recipe");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      <Card className="border-amber-500/20 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-orange-400" />
            AI Coffee Recipe Creator
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">3 Credits</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">Generate unique, custom coffee drink recipes tailored to your preferences</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger><SelectValue placeholder="Drink style" /></SelectTrigger>
            <SelectContent>
              {["Hot Latte", "Iced Coffee", "Frappuccino-style", "Espresso Cocktail", "Cold Brew Infusion", "Coffee Smoothie", "Affogato", "Turkish Style", "Coffee Mocktail", "Specialty Pour Over"].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger><SelectValue placeholder="Season/mood (optional)" /></SelectTrigger>
            <SelectContent>
              {["Spring Fresh", "Summer Cool", "Autumn Cozy", "Winter Warm", "Party Vibes", "Morning Energy", "Afternoon Pick-me-up", "Evening Relaxation"].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dietary} onValueChange={setDietary}>
            <SelectTrigger><SelectValue placeholder="Dietary preference (optional)" /></SelectTrigger>
            <SelectContent>
              {["No Restriction", "Vegan", "Dairy-Free", "Sugar-Free", "Keto", "Low-Calorie", "Gluten-Free"].map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            value={inspiration}
            onChange={e => setInspiration(e.target.value)}
            placeholder="Any inspiration? e.g. 'Salted caramel with oat milk' or 'Something tropical with coconut' or 'Inspired by tiramisu'"
            rows={3}
          />

          <Button className="w-full bg-gradient-to-r from-orange-600 to-red-800" onClick={handleCreate} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : <><Sparkles className="mr-2 h-4 w-4" />Create Unique Recipe</>}
          </Button>

          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 whitespace-pre-wrap text-sm">
              {result}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
