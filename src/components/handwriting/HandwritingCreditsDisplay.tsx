import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHandwritingCredits } from "@/hooks/useHandwritingCredits";
import { Coins, Plus, Sparkles, Crown, Zap, PenTool } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const HandwritingCreditsDisplay = () => {
  const { credits, isLoading, purchaseCredits } = useHandwritingCredits();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async (amount: number) => {
    setIsPurchasing(true);
    const url = await purchaseCredits(amount);
    if (url) window.open(url, "_blank");
    setIsPurchasing(false);
  };

  if (isLoading) return null;

  const packages = [
    { credits: 10, price: 5, label: "Starter", icon: Coins, description: "2 personal analyses" },
    { credits: 25, price: 12, label: "Explorer", icon: Zap, description: "5 analyses mix", popular: true },
    { credits: 50, price: 20, label: "Professional", icon: Sparkles, description: "10+ analyses" },
    { credits: 100, price: 35, label: "Master", icon: Crown, description: "Best value", bestValue: true },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Handwriting Credits Display - How it works"} steps={[{ title: 'Open', desc: 'Access the Handwriting Credits Display section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Handwriting Credits Display.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      {/* Balance */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PenTool className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Available Credits</p>
                <p className="text-2xl sm:text-3xl font-bold">{credits?.credits_remaining || 0}</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                <span>• Personal: 5 cr</span>
                <span>• Professional: 10 cr</span>
                <span>• Relationship: 15 cr</span>
                <span>• Business: 20 cr</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {packages.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <Card
              key={pkg.credits}
              className={`bg-card/60 backdrop-blur-sm overflow-hidden transition-all hover:border-primary/30 ${
                pkg.popular ? "border-primary/50" : pkg.bestValue ? "border-accent/50" : "border-border/50"
              }`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="h-4 w-4 text-primary" />
                      <p className="font-semibold text-sm">{pkg.label}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{pkg.description}</p>
                  </div>
                  {pkg.popular && <Badge variant="secondary" className="text-[9px]">Popular</Badge>}
                  {pkg.bestValue && <Badge className="bg-accent text-accent-foreground text-[9px]">Best</Badge>}
                </div>

                <div>
                  <p className="text-xl font-bold">€{pkg.price}</p>
                  <p className="text-xs text-muted-foreground">{pkg.credits} credits</p>
                </div>

                <Button
                  onClick={() => handlePurchase(pkg.credits)}
                  disabled={isPurchasing}
                  variant={pkg.popular ? "default" : "outline"}
                  size="sm"
                  className="w-full text-xs"
                >
                  <Plus className="mr-1.5 h-3 w-3" />
                  Purchase
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
    </>
  );
};
