import Navbar from "@/components/Navbar";
import SubscriptionPlans from "@/components/nutrition/SubscriptionPlans";
import { Card, CardContent } from "@/components/ui/card";
import { useNutritionSubscription } from "@/hooks/useNutritionSubscription";
import { Apple, Loader2 } from "lucide-react";
import { ModuleSubscriptionHero } from "@/components/subscription/ModuleSubscriptionHero";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function NutritionSubscriptions() {
  const { subscription, loading } = useNutritionSubscription();

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingHowItWorks title="NutritionSubscriptions — How it works" steps={[{title:"Open the tool",desc:"Launch NutritionSubscriptions from the menu to access its features."},{title:"Explore options",desc:"Browse available cards, filters and personalized recommendations."},{title:"Interact & track",desc:"Log entries, start sessions or run AI scans. Some AI actions cost 3–5 credits."},{title:"Review progress",desc:"Check your dashboard for streaks, achievements and history."}]} />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-6xl mx-auto space-y-8">
          <ModuleSubscriptionHero
            module="Nutrition Hub"
            icon={Apple}
            badge="Most popular"
            title="Upgrade your nutrition journey"
            subtitle="Personalized AI meal plans, macro tracking, expert guidance — fuel your best self."
          />

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : subscription && (
            <Card className="bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <p className="text-2xl font-bold capitalize">{subscription.subscription_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-lg font-semibold capitalize">{subscription.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <SubscriptionPlans />
        </div>
      </main>

    </div>
  );
}
