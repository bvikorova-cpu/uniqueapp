import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Check, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const insurancePlans = [
  {
    name: "Basic Protection",
    credits: 10,
    level: "basic",
    color: "text-blue-500",
    features: [
      "Block up to 50 negative emotions/month",
      "5 insurance claims per month",
      "Basic protection shield",
      "Email support"
    ]
  },
  {
    name: "Standard Protection",
    credits: 20,
    level: "standard",
    color: "text-purple-500",
    popular: true,
    features: [
      "Block up to 150 negative emotions/month",
      "10 insurance claims per month",
      "Enhanced protection shield",
      "Priority support",
      "Emotion backup & restore"
    ]
  },
  {
    name: "Premium Protection",
    credits: 40,
    level: "premium",
    color: "text-yellow-500",
    features: [
      "Unlimited negative emotion blocking",
      "Unlimited insurance claims",
      "Maximum protection shield",
      "24/7 VIP support",
      "Automatic emotion backup",
      "Emotion recovery guarantee",
      "Custom protection rules"
    ]
  }
];

export function EmotionInsurance({ onBack }: { onBack?: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleGetProtected = async (level: string, planName: string) => {
    setLoading(level);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign in required", description: "Please sign in to activate protection", variant: "destructive" });
        return;
      }
      const { data, error } = await supabase.functions.invoke("verify-emotion-insurance", {
        body: { action: "insurance", level } });
      if (error || (data as any)?.error) {
        const msg = String((data as any)?.error || error?.message || "");
        toast({
          title: msg.toLowerCase().includes("credit") ? "Not enough credits" : "Activation failed",
          description: msg.toLowerCase().includes("credit") ? "Top up your AI credits to activate this plan." : (msg || "Try again"),
          variant: "destructive" });
        return;
      }
      window.dispatchEvent(new Event("ai-credits-updated"));
      toast({ title: "Insurance activated", description: `${planName} — ${data.credits_charged} credits used, valid 30 days.` });
    } catch (e: any) {
      toast({ title: "Activation failed", description: e?.message ?? "Try again", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"Emotion Insurance"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      )}
      <Card className="border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-500" />
            Emotion Insurance
          </CardTitle>
          <CardDescription>
            Protect yourself from negative emotions and toxic content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg flex gap-3">
            <AlertTriangle className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Why Emotion Insurance?</p>
              <p className="text-muted-foreground">
                The Emotion Economy can expose you to negative emotional content. 
                Our insurance automatically blocks toxic emotions and protects your emotional wallet from unwanted negativity.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insurancePlans.map((plan) => (
          <Card 
            key={plan.level}
            className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className={`h-8 w-8 ${plan.color}`} />
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.credits} credits</span>
                <span className="text-muted-foreground">/30 days</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full" 
                variant={plan.popular ? "default" : "outline"}
                disabled={loading === plan.level}
                onClick={() => handleGetProtected(plan.level, plan.name)}
              >
                {loading === plan.level ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Activating…</>
                ) : (
                  `Get Protected (${plan.credits} credits)`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How Insurance Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Automatic Protection
              </h4>
              <p className="text-sm text-muted-foreground">
                AI automatically detects and blocks negative emotions before they reach your wallet
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Insurance Claims
              </h4>
              <p className="text-sm text-muted-foreground">
                File claims to recover emotions lost to toxic interactions or negativity
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Emotion Backup
              </h4>
              <p className="text-sm text-muted-foreground">
                Automatically backup your emotions daily to prevent permanent loss
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Recovery Guarantee
              </h4>
              <p className="text-sm text-muted-foreground">
                Premium members get 100% emotion recovery guarantee for covered incidents
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}