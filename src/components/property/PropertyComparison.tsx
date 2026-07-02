import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, Trophy, TrendingUp, TrendingDown, Minus, Building2 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const SAMPLE_PROPERTIES = [
  {
    name: "Skyline Apartment", price: 285000, area: 85, rooms: 3, floor: 8,
    location: "Downtown", yearBuilt: 2020, parking: true, balcony: true,
    monthlyFees: 180, energyClass: "A", score: 92,
  },
  {
    name: "Garden Villa", price: 420000, area: 145, rooms: 5, floor: 0,
    location: "Suburbs", yearBuilt: 2018, parking: true, balcony: false,
    monthlyFees: 120, energyClass: "B", score: 87,
  },
  {
    name: "City Loft", price: 195000, area: 62, rooms: 2, floor: 4,
    location: "City Center", yearBuilt: 2022, parking: false, balcony: true,
    monthlyFees: 210, energyClass: "A+", score: 78,
  },
];

const METRICS = [
  { key: "price", label: "Price", format: (v: number) => `€${v.toLocaleString()}`, better: "lower" },
  { key: "area", label: "Area (m²)", format: (v: number) => `${v} m²`, better: "higher" },
  { key: "rooms", label: "Rooms", format: (v: number) => `${v}`, better: "higher" },
  { key: "floor", label: "Floor", format: (v: number) => v === 0 ? "Ground" : `${v}th`, better: "neutral" },
  { key: "yearBuilt", label: "Year Built", format: (v: number) => `${v}`, better: "higher" },
  { key: "monthlyFees", label: "Monthly Fees", format: (v: number) => `€${v}`, better: "lower" },
  { key: "energyClass", label: "Energy Class", format: (v: string) => v, better: "neutral" },
  { key: "parking", label: "Parking", format: (v: boolean) => v ? "✅ Yes" : "❌ No", better: "neutral" },
  { key: "balcony", label: "Balcony", format: (v: boolean) => v ? "✅ Yes" : "❌ No", better: "neutral" },
] as const;

export function PropertyComparison({ onBack }: Props) {
  const [selected, setSelected] = useState([0, 1]);

  const addProperty = () => {
    if (selected.length < 3) {
      const next = SAMPLE_PROPERTIES.findIndex((_, i) => !selected.includes(i));
      if (next >= 0) setSelected([...selected, next]);
    }
  };

  const getBestValue = (key: string, better: string) => {
    const values = selected.map(i => (SAMPLE_PROPERTIES[i] as any)[key]);
    if (better === "higher") return Math.max(...values.filter(v => typeof v === "number"));
    if (better === "lower") return Math.min(...values.filter(v => typeof v === "number"));
    return null;
  };

  return (
    <>
      <FloatingHowItWorks title={"Property Comparison - How it works"} steps={[{ title: 'Open', desc: 'Access the Property Comparison section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property Comparison.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">🔄 Property Comparison</h2>
          <p className="text-sm text-muted-foreground">Compare properties side by side to make the best decision</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground min-w-[140px]">Feature</th>
              {selected.map((idx, i) => (
                <th key={idx} className="p-3 min-w-[180px]">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className="bg-card/60 backdrop-blur-xl border-border/30">
                      <CardContent className="p-4 text-center relative">
                        {selected.length > 2 && (
                          <button onClick={() => setSelected(selected.filter(s => s !== idx))}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <div className="text-3xl mb-2">🏠</div>
                        <p className="font-bold text-sm">{SAMPLE_PROPERTIES[idx].name}</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Trophy className="h-3 w-3 text-amber-500" />
                          <span className="text-xs font-bold text-amber-500">{SAMPLE_PROPERTIES[idx].score}/100</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </th>
              ))}
              {selected.length < 3 && (
                <th className="p-3 min-w-[180px]">
                  <Card className="bg-card/30 border-dashed border-2 border-border/30 cursor-pointer hover:border-primary/30 transition-colors" onClick={addProperty}>
                    <CardContent className="p-4 text-center">
                      <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Add Property</p>
                    </CardContent>
                  </Card>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric, mi) => {
              const bestVal = getBestValue(metric.key, metric.better);
              return (
                <motion.tr key={metric.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + mi * 0.03 }}
                  className="border-t border-border/20">
                  <td className="p-3 text-sm font-medium">{metric.label}</td>
                  {selected.map((idx) => {
                    const val = (SAMPLE_PROPERTIES[idx] as any)[metric.key];
                    const isBest = bestVal !== null && val === bestVal;
                    return (
                      <td key={idx} className="p-3 text-center">
                        <span className={`text-sm font-medium ${isBest ? "text-emerald-500 font-bold" : ""}`}>
                          {(metric.format as any)(val)}
                        </span>
                        {isBest && metric.better !== "neutral" && (
                          <Badge className="ml-2 bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-[10px]">Best</Badge>
                        )}
                      </td>
                    );
                  })}
                  {selected.length < 3 && <td />}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
        <CardContent className="p-6">
          <h3 className="font-bold mb-3 flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" />AI Recommendation</h3>
          <p className="text-sm text-muted-foreground">
            Based on overall value analysis, <strong className="text-foreground">{SAMPLE_PROPERTIES[selected[0]].name}</strong> offers 
            the best price-to-quality ratio with a score of {SAMPLE_PROPERTIES[selected[0]].score}/100. 
            It features newer construction, excellent energy efficiency, and competitive monthly fees.
          </p>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
