import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Star, Crown, Zap } from "lucide-react";

interface CreditPackagesProps {
  onPurchase: (packageType: string) => void;
  currentCredits: number;
}

const PACKAGES = [
  {
    id: "basic",
    name: "Basic",
    credits: 10,
    price: "€5",
    icon: Sparkles,
    color: "from-blue-500 to-cyan-500",
    features: ["1-2 matches", "Text messages", "Perfect to start"],
  },
  {
    id: "standard",
    name: "Standard",
    credits: 30,
    price: "€12",
    icon: Star,
    color: "from-purple-500 to-pink-500",
    popular: true,
    features: ["5-6 matches", "Voice messages", "Profile hints", "Best value"],
  },
  {
    id: "premium",
    name: "Premium",
    credits: 100,
    price: "€25",
    icon: Crown,
    color: "from-amber-500 to-orange-500",
    features: ["20+ matches", "All features", "Early reveal option", "Priority matching"],
  },
  {
    id: "ultimate",
    name: "Ultimate",
    credits: 300,
    price: "€60",
    icon: Zap,
    color: "from-red-500 to-pink-600",
    features: ["Unlimited matches", "Premium features", "VIP support", "Maximum freedom"],
  },
];

export function CreditPackages({ onPurchase, currentCredits }: CreditPackagesProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Package</h2>
        <p className="text-muted-foreground">
          You have <span className="font-bold text-pink-500">{currentCredits} credits</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PACKAGES.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <Card
              key={pkg.id}
              className={`relative p-6 ${
                pkg.popular ? "border-2 border-pink-500 shadow-lg" : ""
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center space-y-4">
                <div
                  className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${pkg.color} flex items-center justify-center`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>

                <div>
                  <h3 className="text-xl font-bold">{pkg.name}</h3>
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    {pkg.price}
                  </div>
                  <p className="text-sm text-muted-foreground">{pkg.credits} credits</p>
                </div>

                <ul className="space-y-2 text-sm text-left">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-pink-500">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => onPurchase(pkg.id)}
                  className={`w-full bg-gradient-to-r ${pkg.color} hover:opacity-90 text-white`}
                >
                  Purchase
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}