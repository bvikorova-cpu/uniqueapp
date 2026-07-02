import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, History, Zap, Settings, Crown, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
    <>
      <FloatingHowItWorks title={"Lottery Sidebar - How it works"} steps={[{ title: 'Open', desc: 'Access the Lottery Sidebar section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Lottery Sidebar.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      {/* Hot Numbers */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-300/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-red-500" />
              Hot Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {hotNumbers.map((num) => (
                <motion.div
                  key={num}
                  whileHover={{ scale: 1.1 }}
                  className="aspect-square rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center font-black text-red-500 text-lg cursor-default"
                >
                  {num}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cold Numbers */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-300/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="w-4 h-4 text-blue-500" />
              Cold Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {coldNumbers.map((num) => (
                <motion.div
                  key={num}
                  whileHover={{ scale: 1.1 }}
                  className="aspect-square rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-500 text-lg cursor-default"
                >
                  {num}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-300/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4 text-green-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start border-green-500/20 hover:bg-green-500/10" onClick={() => navigate("/lottery-history")}>
              <History className="mr-2 h-4 w-4" /> View Full History
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start border-green-500/20 hover:bg-green-500/10" onClick={onRefreshStatus} disabled={checkingSubscription}>
              <Zap className="mr-2 h-4 w-4" /> Refresh Status
            </Button>
            {subscription?.subscribed && (
              <Button variant="outline" size="sm" className="w-full justify-start border-green-500/20 hover:bg-green-500/10" onClick={onManageSubscription}>
                <Settings className="mr-2 h-4 w-4" /> Manage Subscription
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscription Status */}
      {subscription?.subscribed && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-300/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-purple-500" />
                <span className="font-black text-sm text-purple-600 dark:text-purple-400">{subscription.tier === "pro" ? "Pro" : "Basic"} Plan</span>
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

      {/* Leaderboard placeholder */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-300/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Top Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-yellow-500/40" />
              </div>
              <p className="text-xs text-muted-foreground">No players ranked yet</p>
              <p className="text-[10px] text-muted-foreground mt-1">Generate numbers to appear here!</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
    </>
  );
};
