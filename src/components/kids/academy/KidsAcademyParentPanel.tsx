import { motion } from "framer-motion";
import { useState } from "react";
import { Bell, BarChart3, Clock, Mail, Shield, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export const KidsAcademyParentPanel = () => {
  const [emailReports, setEmailReports] = useState(false);
  const [milestoneAlerts, setMilestoneAlerts] = useState(true);

  return (
    <div className="space-y-4">
      <Card className="border-2 border-blue-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-blue-500" />
            Parent Dashboard
            <Badge variant="outline" className="ml-auto text-xs">
              <Bell className="w-3 h-3 mr-1" />
              Parental Controls
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activity summary */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Activity Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Time", value: "0h 0m", emoji: "⏰" },
                { label: "Modules Visited", value: "0", emoji: "🗺️" },
                { label: "XP Earned", value: "0", emoji: "⭐" },
                { label: "Badges Won", value: "0", emoji: "🏅" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="text-center p-3 rounded-xl bg-muted/50 border border-border/50"
                >
                  <span className="text-2xl">{stat.emoji}</span>
                  <div className="text-lg font-black text-foreground mt-1">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Module usage */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Time Spent per Module
            </h4>
            <div className="space-y-2">
              {[
                { name: "Story Creator", emoji: "📖", time: "0m", pct: 0 },
                { name: "Science Lab", emoji: "🧪", time: "0m", pct: 0 },
                { name: "Drawing Buddy", emoji: "🎨", time: "0m", pct: 0 },
                { name: "Reading Companion", emoji: "📚", time: "0m", pct: 0 },
                { name: "Homework Helper", emoji: "🏠", time: "0m", pct: 0 },
                { name: "Career Counselor", emoji: "🧭", time: "0m", pct: 0 },
              ].map((mod, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/50">
                  <span className="text-xl">{mod.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-foreground">{mod.name}</span>
                      <span className="text-muted-foreground">{mod.time}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full transition-all"
                        style={{ width: `${mod.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notification settings */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Notification Settings
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border/50">
                <div>
                  <span className="text-sm font-medium text-foreground">Weekly Email Reports</span>
                  <p className="text-[11px] text-muted-foreground">Receive progress summary every Sunday</p>
                </div>
                <Switch checked={emailReports} onCheckedChange={setEmailReports} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border/50">
                <div>
                  <span className="text-sm font-medium text-foreground">Milestone Alerts</span>
                  <p className="text-[11px] text-muted-foreground">Get notified when your child achieves a badge or level</p>
                </div>
                <Switch checked={milestoneAlerts} onCheckedChange={setMilestoneAlerts} />
              </div>
            </div>
          </div>

          {/* Recent milestones */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Recent Milestones
            </h4>
            <div className="text-center py-6 text-muted-foreground text-sm">
              <span className="text-3xl block mb-2">🎯</span>
              No milestones yet — start exploring to earn achievements!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
