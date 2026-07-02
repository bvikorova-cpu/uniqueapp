import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Calendar, TrendingUp, Sparkles, ArrowLeft, Zap, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface LotteryPushNotificationsProps {
  onBack: () => void;
}

const NOTIFICATION_TYPES = [
  {
    id: "lucky_days",
    label: "Lucky Day Alerts",
    description: "Get notified when AI detects high-probability patterns",
    icon: Sparkles,
    color: "from-violet-500 to-purple-600",
    enabled: true,
  },
  {
    id: "draw_reminder",
    label: "Draw Reminders",
    description: "Never miss a lottery draw with timely reminders",
    icon: Calendar,
    color: "from-blue-500 to-cyan-500",
    enabled: false,
  },
  {
    id: "pattern_alert",
    label: "Pattern Alerts",
    description: "Receive alerts when rare number patterns are detected",
    icon: TrendingUp,
    color: "from-emerald-500 to-green-600",
    enabled: false,
  },
  {
    id: "hot_streak",
    label: "Hot Streak Notifications",
    description: "Know when certain numbers enter a hot streak",
    icon: Zap,
    color: "from-orange-500 to-red-500",
    enabled: true,
  },
];

const LUCKY_DAYS_PREVIEW = [
  { day: "Monday", score: 85, period: "Morning", icon: Sun },
  { day: "Wednesday", score: 92, period: "Evening", icon: Moon },
  { day: "Friday", score: 78, period: "Afternoon", icon: Sun },
  { day: "Saturday", score: 96, period: "Night", icon: Moon },
];

export function LotteryPushNotifications({ onBack }: LotteryPushNotificationsProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(
    NOTIFICATION_TYPES.map(n => ({ ...n }))
  );
  const [pushEnabled, setPushEnabled] = useState(false);

  const toggleNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n)
    );
    toast({
      title: "Preference Updated",
      description: "Your notification settings have been saved.",
    });
  };

  const enablePush = () => {
    setPushEnabled(true);
    toast({
      title: "Push Notifications Enabled! 🔔",
      description: "You'll now receive AI-powered lottery alerts.",
    });
  };

  return (
    <>
      <FloatingHowItWorks
        title='Lottery Push Notifications'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Lottery Push Notifications panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
            Push Notifications
          </h2>
          <p className="text-sm text-muted-foreground">Get AI-powered alerts for lucky days & patterns</p>
        </div>
      </div>

      {/* Enable Push Banner */}
      {!pushEnabled && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-r from-violet-500/20 to-purple-600/20 border-violet-500/30">
            <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                <Bell className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-black text-lg">Enable Smart Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Let AI notify you about lucky days, hot numbers & draw reminders
                </p>
              </div>
              <Button onClick={enablePush} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white shrink-0">
                <Bell className="mr-2 h-4 w-4" /> Enable Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Lucky Days Preview */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle className="font-black flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            AI Lucky Day Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {LUCKY_DAYS_PREVIEW.map((day, i) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">{day.day}</span>
                  <day.icon className="h-4 w-4 text-violet-400" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${day.score}%` }}
                      transition={{ duration: 1, delay: i * 0.15 }}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                    />
                  </div>
                  <span className="text-xs font-black text-violet-400">{day.score}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Best: {day.period}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Toggles */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle className="font-black flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${notif.color} flex items-center justify-center shrink-0`}>
                <notif.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{notif.label}</p>
                <p className="text-xs text-muted-foreground truncate">{notif.description}</p>
              </div>
              <Switch
                checked={notif.enabled}
                onCheckedChange={() => toggleNotification(notif.id)}
              />
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
