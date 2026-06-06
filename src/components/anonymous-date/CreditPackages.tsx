import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, Crown, Zap, Check } from "lucide-react";
import { motion } from "framer-motion";

interface CreditPackagesProps {
  onPurchase: (packageType: string) => void;
  currentCredits: number;
}

const PACKAGES = [
  {
    id: "basic",
    name: "Basic",
    credits: 10,
    priceEur: 5,
    icon: Sparkles,
    gradient: "from-blue-500 to-cyan-500",
    features: ["1-2 matches", "Text messages", "Perfect to start"],
  },
  {
    id: "standard",
    name: "Standard",
    credits: 30,
    priceEur: 12,
    icon: Star,
    gradient: "from-pink-500 to-rose-500",
    popular: true,
    features: ["5-6 matches", "Voice messages", "Profile hints", "Best value"],
  },
  {
    id: "premium",
    name: "Premium",
    credits: 100,
    priceEur: 25,
    icon: Crown,
    gradient: "from-amber-500 to-orange-500",
    features: ["20+ matches", "All features", "Early reveal", "Priority matching"],
  },
  {
    id: "ultimate",
    name: "Ultimate",
    credits: 300,
    priceEur: 60,
    icon: Zap,
    gradient: "from-primary to-accent",
    features: ["Unlimited matches", "Premium features", "VIP support", "Max freedom"],
  },
];

const BASE_RATE = PACKAGES[0].priceEur / PACKAGES[0].credits; // €/credit baseline (Basic)

export function CreditPackages({ onPurchase, currentCredits }: CreditPackagesProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-pink-500 to-accent bg-clip-text text-transparent">
          Credit Store
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          You have <span className="font-bold text-pink-500">{currentCredits} credits</span> remaining
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PACKAGES.map((pkg, i) => {
          const Icon = pkg.icon;
          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={`relative overflow-hidden bg-card/80 backdrop-blur-xl ${
                  pkg.popular ? "border-pink-500 border-2 shadow-lg shadow-pink-500/10" : "border-border/50"
                }`}
              >
                <div className={`h-1 bg-gradient-to-r ${pkg.gradient}`} />

                {pkg.popular && (
                  <Badge className="absolute top-3 right-3 bg-pink-500/10 text-pink-500 border-pink-500/20 text-[10px]">
                    POPULAR
                  </Badge>
                )}

                <div className="p-5 text-center space-y-3">
                  <div className="p-3 rounded-xl bg-pink-500/10 inline-flex">
                    <Icon className="h-6 w-6 text-pink-500" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold">{pkg.name}</h3>
                    <div className="text-3xl font-black text-pink-500 mt-1">{pkg.price}</div>
                    <p className="text-xs text-muted-foreground">{pkg.credits} credits</p>
                  </div>

                  <ul className="space-y-1.5 text-left">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-pink-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => onPurchase(pkg.id)}
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                    size="sm"
                  >
                    Purchase
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
