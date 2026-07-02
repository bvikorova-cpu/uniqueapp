import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, 
  Smile,
  Gift,
  Sparkles,
} from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface TipOption {
  amount: number;
  emoji: string;
  label: string;
}

const tipOptions: TipOption[] = [
  { amount: 1, emoji: "👏", label: "Applause" },
  { amount: 2, emoji: "😂", label: "Hilarious" },
  { amount: 5, emoji: "🔥", label: "Fire" },
  { amount: 10, emoji: "👑", label: "Comedy King" },
];

interface TipAnimationProps {
  performerName?: string;
  onTip?: (amount: number) => void;
}

export const TipAnimation = ({
  performerName = "Comedian",
  onTip,
}: TipAnimationProps) => {
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentTips, setRecentTips] = useState<{ amount: number; emoji: string }[]>([]);

  const handleTip = (amount: number, emoji: string) => {
    setSelectedTip(amount);
    onTip?.(amount);
    setRecentTips((prev) => [{ amount, emoji }, ...prev.slice(0, 4)]);
    setShowSuccess(true);
    setTimeout(() => { setShowSuccess(false); setSelectedTip(null); }, 2000);
  };

  const handleCustomTip = () => {
    const amount = parseFloat(customAmount);
    if (amount > 0) { handleTip(amount, "💰"); setCustomAmount(""); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Tip Animation - How it works"} steps={[{ title: 'Open', desc: 'Access the Tip Animation section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tip Animation.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-yellow-500" />
            Support {performerName}
          </span>
          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
            <Sparkles className="h-3 w-3 mr-1" /> Tip
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {recentTips.length > 0 && (
          <div className="flex justify-center gap-2 overflow-hidden h-10">
            {recentTips.map((tip, index) => (
              <motion.div key={index} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: index * 0.1 }} className="text-2xl">
                {tip.emoji}
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {tipOptions.map((option) => (
            <motion.button
              key={option.amount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTip(option.amount, option.emoji)}
              className={`p-4 rounded-xl border-2 transition-all ${selectedTip === option.amount ? "border-yellow-500 bg-yellow-500/20" : "border-border hover:border-yellow-500/50"}`}
            >
              <div className="text-3xl mb-2">{option.emoji}</div>
              <p className="font-bold text-lg">€{option.amount}</p>
              <p className="text-xs text-muted-foreground">{option.label}</p>
            </motion.button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="number" placeholder="Custom amount" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={handleCustomTip} disabled={!customAmount}>Send</Button>
        </div>

        {showSuccess && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
            <div className="text-center">
              <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="text-6xl mb-4">🎉</motion.div>
              <p className="text-2xl font-bold">Thank You!</p>
              <p className="text-muted-foreground">You sent €{selectedTip}</p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
    </>
  );
};

// Crowd Reaction Meter
interface CrowdReactionMeterProps {
  laughLevel?: number;
  applauseLevel?: number;
}

export const CrowdReactionMeter = ({ laughLevel = 75, applauseLevel = 60 }: CrowdReactionMeterProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Smile className="h-5 w-5" /> Crowd Reaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2"><span className="text-xl">😂</span> Laughter</span>
            <span className="font-bold">{laughLevel}%</span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${laughLevel}%` }} transition={{ duration: 0.5 }} className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2"><span className="text-xl">👏</span> Applause</span>
            <span className="font-bold">{applauseLevel}%</span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${applauseLevel}%` }} transition={{ duration: 0.5, delay: 0.2 }} className="h-full bg-gradient-to-r from-blue-500 to-purple-500" />
          </div>
        </div>
        <div className="flex justify-center gap-4 pt-4">
          {["😂", "🤣", "👏", "🔥", "❤️"].map((emoji) => (
            <motion.button key={emoji} whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.9 }} className="text-3xl">{emoji}</motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TipAnimation;
