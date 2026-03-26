import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Zap } from "lucide-react";

const amounts = [5, 10, 25, 50];
const categories = [
  { id: "medical", label: "🏥 Medical", color: "border-red-500/50 bg-red-500/5" },
  { id: "pet", label: "🐾 Pet Rescue", color: "border-green-500/50 bg-green-500/5" },
  { id: "student", label: "🎓 Students", color: "border-yellow-500/50 bg-yellow-500/5" },
  { id: "crisis", label: "🆘 Crisis", color: "border-red-600/50 bg-red-600/5" },
];

export const QuickDonateWidget = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("medical");

  const activeAmount = customAmount ? Number(customAmount) : selectedAmount;

  return (
    <section className="py-8 px-4">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-black text-center mb-2">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">⚡ Quick Donate</span>
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-6">Support a cause in seconds</p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/50 rounded-2xl p-5 shadow-lg"
        >
          {/* Category selection */}
          <p className="text-sm font-semibold mb-2">1. Pick a category</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-sm font-medium rounded-lg px-3 py-2 border transition-all ${
                  selectedCategory === cat.id 
                    ? `${cat.color} border-primary ring-1 ring-primary` 
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Amount selection */}
          <p className="text-sm font-semibold mb-2">2. Choose amount</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {amounts.map((amount) => (
              <button
                key={amount}
                onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }}
                className={`text-sm font-bold rounded-lg py-2.5 border transition-all ${
                  selectedAmount === amount && !customAmount
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                €{amount}
              </button>
            ))}
          </div>
          <Input
            type="number"
            placeholder="Custom amount (€)"
            value={customAmount}
            onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
            className="mb-5"
          />

          {/* Donate button */}
          <Button className="w-full" size="lg" disabled={!activeAmount || activeAmount <= 0}>
            <Zap className="mr-2 h-4 w-4" />
            Donate €{activeAmount || 0} Now
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">Secure payment via Stripe • Instant receipt</p>
        </motion.div>
      </div>
    </section>
  );
};
