import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, History, Zap, Settings, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface LotterySidebarProps {
  subscription: any;
  onRefreshStatus: () => void;
  onManageSubscription: () => void;
  checkingSubscription: boolean;
}

const hotNumbers = [12, 23, 34, 41, 17, 29];
const coldNumbers = [5, 18, 27, 36, 45, 8];

export const LotterySidebar = ({ subscription, onRefreshStatus, onManageSubscription, checkingSubscription }: LotterySidebarProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Hot Numbers */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
        <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-red-500" />
              Hot Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {hotNumbers.map((num) => (
                <div key={num} className="aspect-square rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center font-black text-red-500 text-lg">
                  {num}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cold Numbers */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
        <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="w-4 h-4 text-blue-500" />
              Cold Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {coldNumbers.map((num) => (
                <div key={num} className="aspect-square rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-black text-blue-500 text-lg">
                  {num}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
        <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start border-border/50" onClick={() => navigate("/lottery-history")}>
              <History className="mr-2 h-4 w-4" /> View Full History
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start border-border/50" onClick={onRefreshStatus} disabled={checkingSubscription}>
              <Zap className="mr-2 h-4 w-4" /> Refresh Status
            </Button>
            {subscription?.subscribed && (
              <Button variant="outline" size="sm" className="w-full justify-start border-border/50" onClick={onManageSubscription}>
                <Settings className="mr-2 h-4 w-4" /> Manage Subscription
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscription Status */}
      {subscription?.subscribed && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="backdrop-blur-xl bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-primary" />
                <span className="font-black text-sm">{subscription.tier === "pro" ? "Pro" : "Basic"} Plan</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {subscription.tier === "pro" 
                  ? "Unlimited generations" 
                  : `${subscription.limit - (subscription.generations_used || 0)} generations left`}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
