import { motion } from "framer-motion";
import { Heart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const AMOUNTS = [5, 10, 25, 50];

const CATEGORIES = [
  { key: "medical", label: "Medical", emoji: "💊" },
  { key: "education", label: "Education", emoji: "🎓" },
  { key: "animals", label: "Animals", emoji: "🐾" },
  { key: "emergency", label: "Emergency", emoji: "🆘" },
];

export function QuickDonateWidget() {
  const [selectedCategory, setSelectedCategory] = useState("medical");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  return (
    <>
      <FloatingHowItWorks title={"Quick Donate Widget - How it works"} steps={[{ title: 'Open', desc: 'Access the Quick Donate Widget section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Quick Donate Widget.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="py-12 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Quick Donate</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Choose a category and amount to contribute
          </p>

          {/* Category selection */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-all ${
                  selectedCategory === cat.key
                    ? "bg-primary/10 border border-primary/30 text-foreground"
                    : "bg-muted/50 border border-transparent text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="text-lg">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Amount selection */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                  selectedAmount === amount
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted/50 text-foreground hover:bg-muted border border-border/30"
                }`}
              >
                €{amount}
              </button>
            ))}
          </div>

          <Button className="w-full" size="lg" disabled={!selectedAmount}>
            <Heart className="mr-2 h-4 w-4" />
            {selectedAmount ? `Donate €${selectedAmount}` : "Select an amount"}
          </Button>
        </motion.div>
      </div>
    </section>
    </>
  );
}
