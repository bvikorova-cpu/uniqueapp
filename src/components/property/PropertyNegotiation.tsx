import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Target, TrendingDown, TrendingUp, Brain, Zap, Shield, DollarSign, BarChart3, Loader2, CheckCircle2 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const NEGOTIATION_STRATEGIES = [
  { icon: TrendingDown, label: "Market Comparison", desc: "Show similar properties sold for less", power: 85, color: "text-emerald-500" },
  { icon: Shield, label: "Inspection Issues", desc: "Leverage property condition findings", power: 72, color: "text-amber-500" },
  { icon: BarChart3, label: "Time on Market", desc: "Property listed for extended period", power: 68, color: "text-blue-500" },
  { icon: Zap, label: "Cash Offer", desc: "Fast close with no financing contingency", power: 90, color: "text-violet-500" },
];

export function PropertyNegotiation({ onBack }: Props) {
  const [listingPrice, setListingPrice] = useState("350000");
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);

  const price = parseInt(listingPrice) || 350000;
  const fairValue = Math.round(price * 0.93);
  const aggressiveOffer = Math.round(price * 0.87);
  const savings = price - fairValue;

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setAnalyzed(true); }, 1500);
  };

  return (
    <>
      <FloatingHowItWorks title={"Property Negotiation - How it works"} steps={[{ title: 'Open', desc: 'Access the Property Negotiation section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property Negotiation.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">🏷️ Price Negotiation Tool</h2>
          <p className="text-sm text-muted-foreground">AI-assisted negotiation strategy to get the best deal</p>
        </div>
      </div>

      <Card className="bg-card/60 backdrop-blur-xl border-border/30">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Enter listing price..." value={listingPrice} onChange={(e) => setListingPrice(e.target.value)} className="pl-10" type="number" />
            </div>
            <Button onClick={handleAnalyze} disabled={loading} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Brain className="h-4 w-4 mr-2" />Analyze</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analyzed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
              <CardContent className="p-6 text-center">
                <p className="text-xs text-muted-foreground mb-1">Listing Price</p>
                <p className="text-2xl font-black text-red-500">€{price.toLocaleString()}</p>
                <Badge variant="outline" className="mt-2 text-red-500">Overpriced ~7%</Badge>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
              <CardContent className="p-6 text-center">
                <p className="text-xs text-muted-foreground mb-1">Fair Market Value</p>
                <p className="text-2xl font-black text-emerald-500">€{fairValue.toLocaleString()}</p>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-emerald-500/30">Recommended Offer</Badge>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
              <CardContent className="p-6 text-center">
                <p className="text-xs text-muted-foreground mb-1">Aggressive Offer</p>
                <p className="text-2xl font-black text-violet-500">€{aggressiveOffer.toLocaleString()}</p>
                <Badge variant="outline" className="mt-2 text-violet-500">High risk, high reward</Badge>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-emerald-500/5 to-green-500/5 border-emerald-500/20">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Potential Savings with AI Negotiation</p>
              <p className="text-4xl font-black text-emerald-500 mt-2">€{savings.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Based on market analysis of 50+ comparable properties</p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-xl border-border/30">
            <CardHeader><CardTitle className="text-lg">🎯 Negotiation Strategies</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {NEGOTIATION_STRATEGIES.map((strategy, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl bg-background/50 border border-border/20">
                  <div className="flex items-center gap-3 mb-2">
                    <strategy.icon className={`h-5 w-5 ${strategy.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-bold">{strategy.label}</p>
                      <p className="text-xs text-muted-foreground">{strategy.desc}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Power: {strategy.power}%</Badge>
                  </div>
                  <Progress value={strategy.power} className="h-1.5" />
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-xl border-border/30">
            <CardHeader><CardTitle className="text-lg">📝 AI Negotiation Script</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { step: 1, text: "Start with a strong but fair opening offer at €" + aggressiveOffer.toLocaleString() },
                { step: 2, text: "Reference 3 comparable sales in the area priced 5-10% lower" },
                { step: 3, text: "Mention any inspection findings to justify the price reduction" },
                { step: 4, text: "Propose meeting at €" + fairValue.toLocaleString() + " as a win-win compromise" },
                { step: 5, text: "Set a deadline to create urgency and close the deal" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{item.step}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
}
