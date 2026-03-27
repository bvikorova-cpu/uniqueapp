import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, MapPin, GraduationCap, ShoppingBag, Bus, TreePine, Shield, Heart, Star, Search, Loader2 } from "lucide-react";

interface Props { onBack: () => void; }

const SAMPLE_DATA = {
  neighborhood: "Downtown West",
  overallScore: 87,
  categories: [
    { icon: GraduationCap, label: "Schools & Education", score: 92, details: "3 top-rated schools within 1km", color: "text-blue-500", bg: "bg-blue-500" },
    { icon: ShoppingBag, label: "Shopping & Dining", score: 95, details: "50+ restaurants, 2 malls nearby", color: "text-pink-500", bg: "bg-pink-500" },
    { icon: Bus, label: "Public Transport", score: 88, details: "Metro station 200m, 5 bus lines", color: "text-amber-500", bg: "bg-amber-500" },
    { icon: TreePine, label: "Parks & Green Areas", score: 76, details: "2 parks within walking distance", color: "text-emerald-500", bg: "bg-emerald-500" },
    { icon: Shield, label: "Safety & Security", score: 91, details: "Low crime rate, 24/7 patrol area", color: "text-violet-500", bg: "bg-violet-500" },
    { icon: Heart, label: "Healthcare", score: 84, details: "Hospital 1.5km, 4 clinics nearby", color: "text-rose-500", bg: "bg-rose-500" },
  ],
  highlights: ["Walk Score: 92/100", "Bike Score: 85/100", "Transit Score: 88/100", "Avg. commute: 18 min"],
};

export function PropertyNeighborhood({ onBack }: Props) {
  const [address, setAddress] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    if (!address) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setAnalyzed(true); }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">🏘️ Neighborhood Insights</h2>
          <p className="text-sm text-muted-foreground">AI-powered area analysis with walkability, safety & amenity scores</p>
        </div>
      </div>

      <Card className="bg-card/60 backdrop-blur-xl border-border/30">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Enter address or neighborhood..." value={address} onChange={(e) => setAddress(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={handleAnalyze} disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4 mr-2" />Analyze</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analyzed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-1 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
              <CardContent className="p-6 text-center">
                <div className="text-6xl font-black text-emerald-500 mb-2">{SAMPLE_DATA.overallScore}</div>
                <p className="text-sm font-bold">Overall Neighborhood Score</p>
                <p className="text-xs text-muted-foreground mt-1">{SAMPLE_DATA.neighborhood}</p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {SAMPLE_DATA.highlights.map((h, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{h}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 bg-card/60 backdrop-blur-xl border-border/30">
              <CardHeader><CardTitle className="text-lg">Category Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {SAMPLE_DATA.categories.map((cat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <cat.icon className={`h-4 w-4 ${cat.color}`} />
                        <span className="text-sm font-medium">{cat.label}</span>
                      </div>
                      <span className="text-sm font-bold">{cat.score}/100</span>
                    </div>
                    <Progress value={cat.score} className="h-2" />
                    <p className="text-xs text-muted-foreground">{cat.details}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/60 backdrop-blur-xl border-border/30">
            <CardHeader><CardTitle className="text-lg">🗺️ Nearby Points of Interest</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { emoji: "🏫", name: "Central School", dist: "350m", rating: 4.5 },
                  { emoji: "🛒", name: "SuperMart", dist: "200m", rating: 4.2 },
                  { emoji: "🏥", name: "City Hospital", dist: "1.5km", rating: 4.7 },
                  { emoji: "🌳", name: "River Park", dist: "500m", rating: 4.8 },
                  { emoji: "🚇", name: "Metro Station", dist: "180m", rating: 4.1 },
                  { emoji: "🍕", name: "Food District", dist: "400m", rating: 4.6 },
                  { emoji: "🏋️", name: "FitZone Gym", dist: "300m", rating: 4.3 },
                  { emoji: "📚", name: "City Library", dist: "700m", rating: 4.9 },
                ].map((poi, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }}
                    className="p-3 rounded-xl bg-background/50 border border-border/30 text-center">
                    <span className="text-2xl">{poi.emoji}</span>
                    <p className="text-xs font-bold mt-1">{poi.name}</p>
                    <p className="text-[10px] text-muted-foreground">{poi.dist}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-medium">{poi.rating}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
