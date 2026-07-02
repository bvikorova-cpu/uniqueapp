import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stars, Loader2, Sparkles, Heart, Gem, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

export const FriendshipHoroscopeView = () => {
  const [zodiac, setZodiac] = useState("");
  const [friendSign, setFriendSign] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-ai", {
        body: { action: "friendship_horoscope", zodiacSign: zodiac || undefined, friendSign: friendSign || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success("Horoscope revealed! ✨ (2 credits used)");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Friendship Horoscope View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
            <Stars className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            AI Friendship Horoscope
          </h2>
          <p className="text-muted-foreground mt-2">Cosmic guidance for your friendships, powered by AI</p>
          <Badge variant="outline" className="mt-2">2 Credits per reading</Badge>
        </div>
      </motion.div>

      {!result ? (
        <Card className="bg-card/80 backdrop-blur-xl border-violet-500/20">
          <CardHeader><CardTitle className="text-lg">Select Your Signs (Optional)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Your Sign</label>
                <Select value={zodiac} onValueChange={setZodiac}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{SIGNS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Friend's Sign</label>
                <Select value={friendSign} onValueChange={setFriendSign}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{SIGNS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-purple-600" size="lg">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Reading stars...</>
                : <><Stars className="h-4 w-4 mr-2" /> Reveal Friendship Horoscope</>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {/* Daily Horoscope */}
          {result.daily_horoscope && (
            <Card className="bg-gradient-to-br from-violet-500/15 to-purple-500/15 border-violet-500/20">
              <CardContent className="p-6 text-center">
                <span className="text-4xl block mb-2">{result.daily_horoscope.lucky_emoji}</span>
                <h3 className="text-xl font-black">{result.daily_horoscope.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{result.daily_horoscope.message}</p>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div><span className="text-2xl font-black text-violet-400">{result.daily_horoscope.friendship_energy}/10</span><p className="text-xs text-muted-foreground">Energy</p></div>
                  <Badge variant="outline">{result.daily_horoscope.best_activity}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compatibility */}
          {result.compatibility_reading && (
            <Card className="bg-card/80 backdrop-blur-xl border-violet-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Heart className="h-5 w-5 text-pink-400" /> Compatibility</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-black text-violet-400">{result.compatibility_reading.overall_score}%</div>
                  <p className="text-xs text-muted-foreground">Overall Compatibility</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Communication", val: result.compatibility_reading.communication },
                    { label: "Fun Factor", val: result.compatibility_reading.fun_factor },
                    { label: "Emotional Bond", val: result.compatibility_reading.emotional_bond },
                    { label: "Growth", val: result.compatibility_reading.growth_potential },
                  ].map((item, i) => (
                    <div key={i} className="text-center bg-violet-500/5 rounded-lg p-2">
                      <div className="text-lg font-bold text-violet-300">{item.val}/10</div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3 text-center italic">{result.compatibility_reading.cosmic_advice}</p>
              </CardContent>
            </Card>
          )}

          {/* Forecast */}
          {result.friendship_forecast && (
            <Card className="bg-card/80 backdrop-blur-xl border-violet-500/20">
              <CardHeader><CardTitle className="text-base">🔮 Friendship Forecast</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.friendship_forecast.map((f: any, i: number) => (
                  <div key={i} className="bg-violet-500/5 rounded-lg p-3 flex items-start gap-3">
                    <span className="text-xl">{f.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2"><span className="font-bold text-sm">{f.period}</span><Badge variant="secondary" className="text-[10px]">{f.vibe}</Badge></div>
                      <p className="text-xs text-muted-foreground mt-1">{f.prediction}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Lucky Elements */}
          {result.lucky_elements && (
            <Card className="bg-card/80 backdrop-blur-xl border-violet-500/20">
              <CardContent className="p-4">
                <p className="font-bold text-sm mb-3">✨ Lucky Elements</p>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div><Gem className="h-4 w-4 mx-auto text-violet-400 mb-1" /><p className="text-xs font-medium">{result.lucky_elements.crystal}</p><p className="text-[10px] text-muted-foreground">Crystal</p></div>
                  <div><Flame className="h-4 w-4 mx-auto text-orange-400 mb-1" /><p className="text-xs font-medium">{result.lucky_elements.element}</p><p className="text-[10px] text-muted-foreground">Element</p></div>
                  <div><div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ backgroundColor: result.lucky_elements.color?.toLowerCase() }} /><p className="text-xs font-medium">{result.lucky_elements.color}</p><p className="text-[10px] text-muted-foreground">Color</p></div>
                  <div><p className="text-lg font-black text-violet-400">{result.lucky_elements.number}</p><p className="text-[10px] text-muted-foreground">Number</p></div>
                  <div><p className="text-xs font-medium mt-1">{result.lucky_elements.day}</p><p className="text-[10px] text-muted-foreground">Day</p></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Celestial Message */}
          {result.celestial_message && (
            <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-sm italic">🌟 {result.celestial_message}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button onClick={() => setResult(null)} variant="outline" className="flex-1">New Reading</Button>
            <Badge variant="outline" className="text-xs self-center">Credits: {result.credits_remaining}</Badge>
          </div>
        </motion.div>
      )}
    </div>
  );
};
