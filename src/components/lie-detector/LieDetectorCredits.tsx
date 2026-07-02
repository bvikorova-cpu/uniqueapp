import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLieDetectorCredits } from "@/hooks/useLieDetectorCredits";
import { Coins, Plus, Sparkles, Crown, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const LieDetectorCredits = () => {
  const { credits, isLoading, purchaseCredits } = useLieDetectorCredits();

  const handlePurchase = async (amount: number) => {
    const url = await purchaseCredits(amount);
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (isLoading) return null;

  // Global Credit Packages - shared across CreativeForge and Lie Detector
  const packages = [
    { 
      credits: 30, 
      price: 8, 
      label: "Starter",
      icon: Coins,
      description: "10 analyses or 2 threads"
    },
    { 
      credits: 75, 
      price: 18, 
      label: "Creator",
      icon: Zap,
      description: "25 analyses or 5 threads"
    },
    { 
      credits: 150, 
      price: 32, 
      label: "Professional",
      icon: Sparkles,
      popular: true,
      description: "50 analyses or 10 threads"
    },
    { 
      credits: 400, 
      price: 75, 
      label: "Studio",
      icon: Crown,
      bestValue: true,
      description: "Best value - All features"
    },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Lie Detector Credits - How it works"} steps={[{ title: 'Open', desc: 'Access the Lie Detector Credits section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Lie Detector Credits.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="glassmorphism">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Available Credits</p>
              <p className="text-2xl sm:text-3xl font-bold">{credits?.credits_remaining || 0}</p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-muted-foreground w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
              <span>• Single Message: 3 credits</span>
              <span>• Thread Analysis: 15 credits</span>
              <span>• Profile: 50 credits</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {packages.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <Card 
                key={pkg.credits}
                className={`p-3 sm:p-4 hover:shadow-glow transition-all ${
                  pkg.popular ? 'border-primary' : pkg.bestValue ? 'border-accent' : ''
                }`}
              >
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        <p className="font-semibold text-sm sm:text-base">{pkg.label}</p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{pkg.description}</p>
                    </div>
                    {pkg.popular && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">Popular</Badge>
                    )}
                    {pkg.bestValue && (
                      <Badge className="bg-gold text-gold-foreground text-[10px] sm:text-xs">Best Value</Badge>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">€{pkg.price}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{pkg.credits} credits</p>
                  </div>

                  <Button
                    onClick={() => handlePurchase(pkg.credits)}
                    variant={pkg.popular ? "premium" : pkg.bestValue ? "hero" : "outline"}
                    size="sm"
                    className="w-full text-xs sm:text-sm"
                  >
                    <Plus className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                    Purchase
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Card>
    </>
  );
};