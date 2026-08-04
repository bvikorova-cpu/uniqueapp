import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Clock, Sparkles, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useTimeCapsuleCredits, TIME_CAPSULE_COSTS } from "@/hooks/useTimeCapsuleCredits";

const PLANS = [
  { key: "capsule_1m", name: "1 Month Capsule", cost: TIME_CAPSULE_COSTS.capsule_1m, icon: Clock, popular: false, features: ["Text, video, or letter format", "Automatic delivery in 1 month", "Email notifications", "Secure encrypted storage"] },
  { key: "capsule_3m", name: "3 Months Capsule", cost: TIME_CAPSULE_COSTS.capsule_3m, icon: Clock, popular: false, features: ["All formats supported", "Delivery in 3 months", "Standard storage", "Video support"] },
  { key: "capsule_6m", name: "6 Months Capsule", cost: TIME_CAPSULE_COSTS.capsule_6m, icon: Clock, popular: false, features: ["All formats supported", "Delivery in 6 months", "Priority storage", "HD video support"] },
  { key: "capsule_1y", name: "1 Year Capsule", cost: TIME_CAPSULE_COSTS.capsule_1y, icon: Clock, popular: false, features: ["Text, video, or letter format", "Automatic delivery in 1 year", "Email notifications", "Secure encrypted storage"] },
  { key: "capsule_5y", name: "5 Years Capsule", cost: TIME_CAPSULE_COSTS.capsule_5y, icon: Clock, popular: true, features: ["All formats supported", "Delivery in 5 years", "Priority storage", "HD video support"] },
  { key: "capsule_10y", name: "10 Years Capsule", cost: TIME_CAPSULE_COSTS.capsule_10y, icon: Clock, popular: false, features: ["All formats + attachments", "Delivery in 10 years", "Premium storage", "HD video support"] },
  { key: "capsule_20y", name: "20 Years Capsule", cost: TIME_CAPSULE_COSTS.capsule_20y, icon: Sparkles, popular: false, features: ["Unlimited formats & files", "Delivery in 20+ years", "Lifetime storage guarantee", "4K video support"] },
] as const;

export const CapsulePlans = ({ onBack }: { onBack: () => void }) => {
  const navigate = useNavigate();
  const { balance, loading } = useTimeCapsuleCredits();

  return (
    <>
      <FloatingHowItWorks
        title="Capsule Credit Costs"
        steps={[
          { title: "No subscription", desc: "Time Capsule is fully pay-per-use with AI credits." },
          { title: "Pick a delivery date", desc: "The credit cost is based on how far in the future it opens." },
          { title: "Credits are deducted on creation", desc: "Failed creations are refunded automatically." },
          { title: "Top up anytime", desc: "Buy credits once and use them across every AI tool." },
        ]}
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Hub</Button>
          <Badge variant="secondary" className="text-sm">
            <Coins className="w-3.5 h-3.5 mr-1" />
            {loading ? "…" : balance} credits
          </Badge>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Capsule Credit Costs
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            No monthly plans — every capsule is paid with AI credits. The cost depends on how far into the future your capsule is delivered.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`relative h-full ${plan.popular ? 'border-primary shadow-lg shadow-primary/20' : 'border-border/40'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-0.5 rounded-full text-xs font-bold">Most Popular</span>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <plan.icon className="h-6 w-6 text-primary" />
                    <Badge className="bg-primary/15 text-primary border border-primary/30">{plan.cost} credits</Badge>
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">Deducted once when the capsule is sealed.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold">Need more credits?</h3>
              <p className="text-sm text-muted-foreground">Top up once and use them across every AI tool on the platform.</p>
            </div>
            <Button onClick={() => navigate("/ai-credits")}>Buy credits</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
