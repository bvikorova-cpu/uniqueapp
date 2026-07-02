import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Crown, Zap, TrendingUp, Shield } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const CREDIT_PACKAGES = [
  { credits: 30, price: 8, label: "Starter", emoji: "⚡", icon: Zap, gradient: "from-sky-500/10 to-blue-500/5", borderColor: "border-sky-500/20", savings: null },
  { credits: 75, price: 18, label: "Creator", emoji: "🎨", icon: Sparkles, gradient: "from-violet-500/10 to-purple-500/5", borderColor: "border-violet-500/20", savings: "10% off" },
  { credits: 150, price: 32, label: "Professional", emoji: "🏆", icon: Crown, gradient: "from-primary/10 to-accent/5", borderColor: "border-primary/30", popular: true, savings: "20% off" },
  { credits: 400, price: 75, label: "Studio", emoji: "🎬", icon: Shield, gradient: "from-amber-500/10 to-yellow-500/5", borderColor: "border-amber-500/20", savings: "30% off" },
];

interface ForgeCreditPackagesProps {
  onPurchase: (credits: number) => void;
}

export function ForgeCreditPackages({ onPurchase }: ForgeCreditPackagesProps) {
  return (
    <>
      <FloatingHowItWorks title={"Forge Credit Packages - How it works"} steps={[{ title: 'Open', desc: 'Access the Forge Credit Packages section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Forge Credit Packages.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CREDIT_PACKAGES.map((pkg, i) => {
        const Icon = pkg.icon;
        return (
          <motion.div
            key={pkg.credits}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`relative rounded-2xl border p-5 text-center transition-all backdrop-blur-xl overflow-hidden group ${
              pkg.popular
                ? `${pkg.borderColor} bg-card/80 shadow-lg shadow-primary/10 ring-1 ring-primary/10`
                : `border-border/50 bg-card/60 hover:shadow-lg hover:shadow-primary/5`
            }`}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${pkg.gradient} transition-opacity`} />

            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            {pkg.popular && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground shadow-lg shadow-primary/20 z-10">
                <Crown className="h-3 w-3 mr-1" /> Most Popular
              </Badge>
            )}

            {pkg.savings && !pkg.popular && (
              <Badge variant="outline" className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-card border-green-500/30 text-green-400 text-[10px] z-10">
                <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> {pkg.savings}
              </Badge>
            )}

            <div className="relative">
              <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                pkg.popular ? 'bg-primary/20' : 'bg-muted/50'
              }`}>
                <Icon className={`h-6 w-6 ${pkg.popular ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>

              <h3 className="font-bold text-lg text-foreground">{pkg.label}</h3>
              
              <div className="flex items-center justify-center gap-1 my-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-3xl font-black text-foreground">{pkg.credits}</span>
              </div>
              <p className="text-xs text-muted-foreground">credits</p>

              <div className="mt-1 mb-4">
                <p className="text-[11px] text-muted-foreground">
                  €{(pkg.price / pkg.credits).toFixed(2)} per credit
                </p>
              </div>

              <Button
                onClick={() => onPurchase(pkg.credits)}
                className={`w-full transition-all active:scale-[0.97] ${
                  pkg.popular ? 'shadow-lg shadow-primary/20' : ''
                }`}
                variant={pkg.popular ? "default" : "outline"}
                size="lg"
              >
                €{pkg.price}
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
    </>
  );
}

export { CREDIT_PACKAGES };
