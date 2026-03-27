import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Crown } from "lucide-react";

const CREDIT_PACKAGES = [
  { credits: 30, price: 8, label: "Starter", emoji: "⚡" },
  { credits: 75, price: 18, label: "Creator", emoji: "🎨" },
  { credits: 150, price: 32, label: "Professional", emoji: "🏆", popular: true },
  { credits: 400, price: 75, label: "Studio", emoji: "🎬" },
];

interface ForgeCreditPackagesProps {
  onPurchase: (credits: number) => void;
}

export function ForgeCreditPackages({ onPurchase }: ForgeCreditPackagesProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CREDIT_PACKAGES.map((pkg, i) => (
        <motion.div
          key={pkg.credits}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`relative rounded-2xl border p-5 text-center transition-all hover:shadow-lg ${
            pkg.popular
              ? "border-primary bg-primary/5 hover:shadow-primary/10"
              : "border-border/50 bg-card/50 hover:shadow-primary/5"
          }`}
        >
          {pkg.popular && (
            <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
              <Crown className="h-3 w-3 mr-1" /> Most Popular
            </Badge>
          )}
          <span className="text-3xl block mb-2">{pkg.emoji}</span>
          <h3 className="font-bold text-lg text-foreground">{pkg.label}</h3>
          <div className="flex items-center justify-center gap-1 my-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-2xl font-black text-foreground">{pkg.credits}</span>
            <span className="text-sm text-muted-foreground">credits</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            €{(pkg.price / pkg.credits).toFixed(2)} per credit
          </p>
          <Button
            onClick={() => onPurchase(pkg.credits)}
            className="w-full"
            variant={pkg.popular ? "default" : "outline"}
          >
            €{pkg.price}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export { CREDIT_PACKAGES };
