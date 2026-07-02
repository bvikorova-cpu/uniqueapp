import { Crown, Zap, Lock, TrendingUp, Eye, Star, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

// Strict monetization rules
export const MONETIZATION_RULES = {
  // AI Features - PAID CREDITS ONLY (no XP purchase)
  aiFeatures: {
    resumeOptimizer: { credits: 5, xpRequired: 0, premiumFree: true },
    jobMatcher: { credits: 3, xpRequired: 0, premiumFree: true },
    interviewCoach: { credits: 10, xpRequired: 0, premiumFree: true },
  },
  
  // Premium Store - Level unlocks "right to buy" (still requires credits)
  levelUnlocks: {
    5: ["basic_badge", "basic_theme"],
    10: ["employer_branding_package", "pro_badge"],
    15: ["visibility_boost_7d", "animated_avatar"],
    20: ["featured_listing_package", "legendary_badge"],
    25: ["premium_analytics", "custom_theme"],
    30: ["unlimited_visibility", "founder_exclusive"],
  },
  
  // Visibility boosters (main revenue drivers)
  visibilityBoosters: [
    { id: "boost_24h", name: "24h Visibility Boost", credits: 10, levelRequired: 5, multiplier: "2x", priceEur: null },
    { id: "boost_7d", name: "7-Day Featured", credits: 50, levelRequired: 15, multiplier: "5x", priceEur: null },
    { id: "boost_30d", name: "30-Day Premium Spotlight", credits: 150, levelRequired: 20, multiplier: "10x", priceEur: null },
    { id: "featured_employer", name: "Featured Employer Badge", credits: 100, levelRequired: 25, multiplier: null, priceEur: 79 },
  ],
} as const;

export const MonetizationPolicy = () => {
  const navigate = useNavigate();

  return (
    <>
      <FloatingHowItWorks title={"Monetization Policy - How it works"} steps={[{ title: 'Open', desc: 'Access the Monetization Policy section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Monetization Policy.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Revenue & Monetization Policy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Features - Strict Paid */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold">AI Features (Paid Only)</h3>
            <Badge variant="destructive" className="text-xs">No XP Purchase</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-powered features require <strong>Paid Credits</strong> (via Stripe) or <strong>Premium Subscription</strong>. 
            XP points cannot be used to access AI services.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium">Resume Optimizer</p>
              <p className="text-xs text-muted-foreground">5 Credits / scan</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium">Job Matcher</p>
              <p className="text-xs text-muted-foreground">3 Credits / match</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium">Interview Coach</p>
              <p className="text-xs text-muted-foreground">10 Credits / session</p>
            </div>
          </div>
        </div>

        {/* XP as Unlock Mechanism */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-purple-500" />
            <h3 className="font-semibold">XP = Right to Buy</h3>
            <Badge variant="outline" className="text-xs">Level Gating</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            XP and Levels unlock the <strong>ability to purchase</strong> exclusive items, but do not replace payment.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Level 10 Required</span>
              </div>
              <span className="text-sm font-medium">Employer Branding Package (€79)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Level 20 Required</span>
              </div>
              <span className="text-sm font-medium">Featured Listing Package (€149)</span>
            </div>
          </div>
        </div>

        {/* Visibility Boosters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-green-500" />
            <h3 className="font-semibold">Visibility Boosters</h3>
            <Badge className="bg-green-500/20 text-green-600 text-xs">Primary Revenue</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Visibility boosters increase listing exposure, driving more user investment in listings and ads.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {MONETIZATION_RULES.visibilityBoosters.map((boost) => (
              <div key={boost.id} className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{boost.name}</span>
                  {boost.multiplier && (
                    <Badge className="bg-green-500 text-white text-xs">{boost.multiplier} Views</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Level {boost.levelRequired}+</span>
                  <span className="font-medium text-primary">
                    {boost.priceEur ? `€${boost.priceEur}` : `${boost.credits} Credits`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={() => navigate('/ai-credits')} className="flex-1 gap-2">
            <Zap className="h-4 w-4" />
            Buy Credits
          </Button>
          <Button onClick={() => navigate('/subscription')} variant="outline" className="flex-1 gap-2">
            <Crown className="h-4 w-4" />
            Go Premium
          </Button>
        </div>
      </CardContent>
    </Card>
    </>
  );
};
