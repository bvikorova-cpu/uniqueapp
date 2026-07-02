import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Brain, Zap, Sparkles, Crown, CreditCard, Star } from "lucide-react";
import { motion } from "framer-motion";
import { usePhobiaCredits } from "@/hooks/usePhobiaCredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const CREDIT_PACKAGES = [
  { credits: 10, price: "€5", icon: Zap, label: "Starter", desc: "Try out AI tools", features: ["2 AI detections", "5 journal entries", "Basic analytics"] },
  { credits: 25, price: "€10", icon: Sparkles, label: "Explorer", desc: "Deep dive into fears", popular: true, features: ["5 AI detections", "Unlimited journal", "Full analytics", "Exposure sessions"] },
  { credits: 50, price: "€18", icon: Crown, label: "Master", desc: "Complete fear toolkit", bestValue: true, features: ["10+ AI detections", "AI Therapist access", "All tools unlimited", "Priority processing"] },
];

export function PhobiaPricing() {
  const { status, isLoading, purchaseCredits, purchaseSubscription } = usePhobiaCredits();

  if (isLoading) return null;

  return (
    <>
      <FloatingHowItWorks title={"Phobia Pricing - How it works"} steps={[{ title: 'Open', desc: 'Access the Phobia Pricing section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Phobia Pricing.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-8">
      {/* Current Status */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Your Balance</p>
                <p className="text-2xl sm:text-3xl font-black">{status?.credits_remaining ?? 0} <span className="text-sm font-normal text-muted-foreground">credits</span></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {status?.subscribed ? (
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Star className="h-3 w-3 mr-1" /> Premium Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">No Subscription</Badge>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>• Detection: 5 cr</span>
            <span>• AI Therapist: 3 cr/session</span>
            <span>• Exposure: 2 cr</span>
            <span>• Cure Plan: 5 cr</span>
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <div>
        <h3 className="text-lg font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Credit Packages
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CREDIT_PACKAGES.map((pkg, i) => {
            const Icon = pkg.icon;
            return (
              <motion.div key={pkg.credits} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={`relative overflow-hidden bg-card/80 backdrop-blur-xl transition-all hover:shadow-lg ${
                  pkg.popular ? "border-primary border-2 shadow-lg shadow-primary/10" : pkg.bestValue ? "border-accent/50" : "border-border/50"
                }`}>
                  <div className={`h-1 ${pkg.popular ? "bg-primary" : pkg.bestValue ? "bg-accent" : "bg-muted"}`} />
                  {pkg.popular && (
                    <Badge className="absolute top-3 right-3 bg-primary/20 text-primary border-primary/30 text-[10px]">POPULAR</Badge>
                  )}
                  {pkg.bestValue && (
                    <Badge className="absolute top-3 right-3 bg-accent/20 text-accent border-accent/30 text-[10px]">BEST VALUE</Badge>
                  )}
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{pkg.label}</p>
                        <p className="text-[10px] text-muted-foreground">{pkg.desc}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-primary">{pkg.price}</p>
                      <p className="text-xs text-muted-foreground">{pkg.credits} credits</p>
                    </div>
                    <ul className="space-y-1.5">
                      {pkg.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="h-3 w-3 text-primary flex-shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => purchaseCredits(pkg.credits)} className="w-full" variant={pkg.popular ? "default" : "outline"} size="sm">
                      <CreditCard className="h-3 w-3 mr-1.5" /> Purchase
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Premium Subscription */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30">
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-black">Premium Unlimited</h3>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">SUBSCRIPTION</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Unlimited access to all 10 tools — no credit limits</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {["Unlimited AI Detections", "Unlimited Therapist", "All Exposure Levels", "Priority Processing", "Full Analytics", "Community Access"].map(f => (
                  <span key={f} className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-primary" />{f}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-center sm:text-right flex-shrink-0">
              <p className="text-3xl font-black text-primary">€9.99</p>
              <p className="text-xs text-muted-foreground mb-2">/month</p>
              {status?.subscribed ? (
                <Badge className="bg-primary/20 text-primary">Active</Badge>
              ) : (
                <Button onClick={purchaseSubscription} size="sm">
                  <Crown className="h-3 w-3 mr-1.5" /> Subscribe
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
