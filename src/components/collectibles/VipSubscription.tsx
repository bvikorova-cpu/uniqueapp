import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Box, Zap } from "lucide-react";
import { useVipSubscription } from "@/hooks/useVipSubscription";
import { format } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export default function VipSubscription() {
  const { is_vip, subscription_end, loading, upgradeToVip, refreshStatus } = useVipSubscription();

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Vip Subscription - How it works"} steps={[{ title: 'Open', desc: 'Access the Vip Subscription section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Vip Subscription.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-8">
        <p className="text-center text-muted-foreground">Loading...</p>
      </Card>
    </>
  );
  }

  if (is_vip) {
    return (
      <div className="space-y-6">
        <Card className="p-8 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="h-8 w-8 text-yellow-600" />
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                VIP Member
              </h2>
              <p className="text-sm text-muted-foreground">
                Active until: {subscription_end && format(new Date(subscription_end), 'PPP')}
              </p>
            </div>
          </div>

          <div className="grid gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
              <Box className="h-5 w-5 text-primary" />
              <span className="text-sm">Free daily mystery box</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm">Exclusive collections</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm">Early access to new cards</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
              <Crown className="h-5 w-5 text-primary" />
              <span className="text-sm">Trading marketplace access</span>
            </div>
          </div>

          <Button onClick={refreshStatus} variant="outline" className="w-full">
            Refresh Status
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <div className="text-center mb-6">
          <Crown className="h-16 w-16 mx-auto mb-4 text-purple-600" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Become VIP
          </h2>
          <p className="text-lg text-muted-foreground">
            Get access to exclusive benefits
          </p>
        </div>

        <div className="grid gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
            <Box className="h-6 w-6 text-purple-600" />
            <div>
              <p className="font-medium">Daily mystery box</p>
              <p className="text-sm text-muted-foreground">Free every day</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <div>
              <p className="font-medium">Exclusive collections</p>
              <p className="text-sm text-muted-foreground">Limited editions</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
            <Zap className="h-6 w-6 text-purple-600" />
            <div>
              <p className="font-medium">Early access</p>
              <p className="text-sm text-muted-foreground">Get new cards first</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
            <Crown className="h-6 w-6 text-purple-600" />
            <div>
              <p className="font-medium">Trading marketplace</p>
              <p className="text-sm text-muted-foreground">Trade with others</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-3xl font-bold mb-2">€9.99 / month</p>
          <p className="text-sm text-muted-foreground">Cancel anytime</p>
        </div>

        <Button 
          onClick={upgradeToVip} 
          size="lg" 
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Crown className="mr-2 h-5 w-5" />
          Activate VIP
        </Button>
      </Card>
    </div>
  );
}
