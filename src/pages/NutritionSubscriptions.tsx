import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SubscriptionPlans from "@/components/nutrition/SubscriptionPlans";
import { Card, CardContent } from "@/components/ui/card";
import { useNutritionSubscription } from "@/hooks/useNutritionSubscription";
import { Apple, Loader2 } from "lucide-react";

export default function NutritionSubscriptions() {
  const { subscription, loading } = useNutritionSubscription();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Apple className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Nutrition Hub Subscriptions</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Upgrade Your Nutrition Journey
            </h1>
          </div>

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

      <Footer />
    </div>
  );
}
