import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Sparkles, Zap } from "lucide-react";
import { useTutoringCredits, TUTORING_CREDIT_PACKAGES } from "@/hooks/useTutoringCredits";

export const TutoringCreditsPanel = () => {
  const { credits, isLoading, purchaseCredits } = useTutoringCredits();

  return (
    <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-300/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Your Credits</CardTitle>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400">
            {isLoading ? "..." : credits} credits
          </Badge>
        </div>
        <CardDescription>
          1 credit = 1 tutoring message. Purchase credits to continue learning.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TUTORING_CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative overflow-hidden transition-all hover:scale-105 cursor-pointer ${
                pkg.bestValue
                  ? "border-2 border-green-500 bg-green-500/10"
                  : pkg.popular
                  ? "border-2 border-blue-500 bg-blue-500/10"
                  : "border border-border"
              }`}
              onClick={() => purchaseCredits(pkg.id)}
            >
              {pkg.bestValue && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg font-semibold">
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  BEST VALUE
                </div>
              )}
              {pkg.popular && !pkg.bestValue && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg font-semibold">
                  <Zap className="h-3 w-3 inline mr-1" />
                  POPULAR
                </div>
              )}
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-foreground mb-1">
                  {pkg.credits}
                </div>
                <div className="text-sm text-muted-foreground mb-3">credits</div>
                <Button className="w-full" variant={pkg.bestValue ? "default" : "outline"}>
                  €{pkg.price}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
