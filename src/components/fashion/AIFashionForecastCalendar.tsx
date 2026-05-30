import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Calendar, Sun, Cloud, Sparkles, Star } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion, AnimatePresence } from "framer-motion";

const CREDIT_COST = 12;

interface ForecastDay {
  day: string;
  date: string;
  weather_vibe: string;
  recommended_outfit: string;
  color_palette: string[];
  accessories: string[];
  style_tip: string;
  confidence_score: number;
}

interface ForecastResult {
  week_theme: string;
  trend_spotlight: string;
  days: ForecastDay[];
  wardrobe_prep: string[];
  shopping_suggestions: string[];
}

export default function AIFashionForecastCalendar() {
  const { credits, spendCredit } = useAICredits();
  const [location, setLocation] = useState("");
  const [style, setStyle] = useState("casual-chic");
  const [result, setResult] = useState<ForecastResult | null>(null);

  const forecast = useMutation({
    mutationFn: async () => {
      if ((credits?.credits_remaining || 0) < CREDIT_COST) {
        throw new Error("Not enough credits. You need " + CREDIT_COST + " credits.");
      }
      const success = await spendCredit("custom_generation", "Fashion Forecast Calendar");
      if (!success) throw new Error("Failed to use credits");

      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "forecast-calendar", location, preferred_style: style },
      });
      if (error) throw error;
      return data as ForecastResult;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Your 7-day fashion forecast is ready!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const weatherIcons: Record<string, string> = {
    sunny: "☀️", cloudy: "☁️", rainy: "🌧️", snowy: "❄️", windy: "💨", warm: "🌤️", cool: "🍂",
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Fashion Forecast Calendar</h3>
            <p className="text-sm text-muted-foreground">7-day personalized style predictions • {CREDIT_COST} Credits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Your Location</Label>
            <Input placeholder="e.g. New York, London, Tokyo" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div>
            <Label>Preferred Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="casual-chic">Casual Chic</SelectItem>
                <SelectItem value="business-professional">Business Professional</SelectItem>
                <SelectItem value="streetwear">Streetwear</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
                <SelectItem value="bohemian">Bohemian</SelectItem>
                <SelectItem value="athleisure">Athleisure</SelectItem>
                <SelectItem value="vintage">Vintage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={() => forecast.mutate()} disabled={forecast.isPending || !location} className="w-full gap-2">
          {forecast.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate 7-Day Forecast ({CREDIT_COST} Credits)
        </Button>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="p-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-primary/20">
              <h3 className="font-bold text-lg mb-1">📅 Week Theme: {result.week_theme}</h3>
              <p className="text-sm text-muted-foreground">🔥 Trend Spotlight: {result.trend_spotlight}</p>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.days.map((day, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
                  <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/40 transition-all h-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm">{day.day}</span>
                      <span className="text-xs text-muted-foreground">{day.date}</span>
                    </div>
                    <p className="text-lg mb-2">{weatherIcons[day.weather_vibe.toLowerCase()] || "🌤️"} {day.weather_vibe}</p>
                    <p className="text-sm font-medium mb-2">{day.recommended_outfit}</p>
                    <div className="flex gap-1 mb-2">
                      {day.color_palette.map((c, j) => (
                        <div key={j} className="w-5 h-5 rounded-full border border-border/50" style={{ backgroundColor: c }} title={c} />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {day.accessories.map((a, j) => (
                        <span key={j} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{a}</span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground italic">{day.style_tip}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="h-3 w-3 text-amber-500" />
                      <span className="text-[10px] font-medium">{day.confidence_score}% match</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="p-4 bg-card/80 backdrop-blur-xl border-primary/20">
              <h4 className="font-bold text-sm mb-2">🛍️ Shopping Suggestions</h4>
              <div className="flex flex-wrap gap-2">
                {result.shopping_suggestions.map((s, i) => (
                  <span key={i} className="text-xs bg-accent/10 text-accent-foreground px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
