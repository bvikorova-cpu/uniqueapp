import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Bell, BarChart3, Clock, Mail, Shield, CheckCircle, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getXP, getModuleVisits } from "@/lib/kidsAcademyEconomy";

const BADGE_THRESHOLDS = [10, 50, 75, 100, 150, 200, 300, 1500];

const MODULES = [
  { id: "story", name: "Story Creator", emoji: "📖" },
  { id: "science", name: "Science Lab", emoji: "🧪" },
  { id: "art", name: "Drawing Buddy", emoji: "🎨" },
  { id: "reading", name: "Reading Companion", emoji: "📚" },
  { id: "homework", name: "Homework Helper", emoji: "🏠" },
  { id: "career", name: "Career Counselor", emoji: "🧭" },
];

// approximate ~3 min per recorded module visit (kids spend a few minutes per session)
const MINUTES_PER_VISIT = 3;

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export const KidsAcademyParentPanel = () => {
  const [emailReports, setEmailReports] = useState(() => localStorage.getItem("kids-academy-email-reports") === "true");
  const [milestoneAlerts, setMilestoneAlerts] = useState(() => localStorage.getItem("kids-academy-milestone-alerts") !== "false");
  const [xp, setXp] = useState(() => getXP());
  const [visits, setVisits] = useState<Record<string, number>>(() => getModuleVisits());

  useEffect(() => {
    const refresh = () => {
      setXp(getXP());
      setVisits(getModuleVisits());
    };
    window.addEventListener("storage", refresh);
    const interval = setInterval(refresh, 2000);
    return () => {
      window.removeEventListener("storage", refresh);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("kids-academy-email-reports", String(emailReports));
  }, [emailReports]);
  useEffect(() => {
    localStorage.setItem("kids-academy-milestone-alerts", String(milestoneAlerts));
  }, [milestoneAlerts]);

  const badgesWon = BADGE_THRESHOLDS.filter(t => xp >= t).length;
  const modulesVisited = Object.keys(visits).length;
  const totalVisits = Object.values(visits).reduce((a, b) => a + b, 0);
  const totalMinutes = totalVisits * MINUTES_PER_VISIT;
  const maxVisit = Math.max(1, ...Object.values(visits));

  const moduleRows = MODULES.map(m => {
    const v = visits[m.id] || 0;
    const min = v * MINUTES_PER_VISIT;
    return { ...m, visits: v, time: `${min}m`, pct: (v / maxVisit) * 100 };
  });

  const milestones: { label: string; emoji: string }[] = [];
  if (xp >= 10) milestones.push({ label: "First 10 XP earned", emoji: "🌟" });
  if (xp >= 100) milestones.push({ label: "Reached Adventurer level", emoji: "🧭" });
  if (xp >= 300) milestones.push({ label: "Reached Scholar level", emoji: "📚" });
  if (modulesVisited >= 3) milestones.push({ label: `Explored ${modulesVisited} different modules`, emoji: "🗺️" });
  if (badgesWon >= 3) milestones.push({ label: `Earned ${badgesWon} badges`, emoji: "🏅" });

  const stats = [
    { label: "Total Time", value: formatTime(totalMinutes), emoji: "⏰" },
    { label: "Modules Visited", value: String(modulesVisited), emoji: "🗺️" },
    { label: "XP Earned", value: String(xp), emoji: "⭐" },
    { label: "Badges Won", value: String(badgesWon), emoji: "🏅" },
  ];

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
              {stats.map((stat, i) => (
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
              {moduleRows.map((mod, i) => (
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
            {milestones.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <span className="text-3xl block mb-2">🎯</span>
                No milestones yet — start exploring to earn achievements!
              </div>
            ) : (
              <div className="space-y-2">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-green-500/5 border border-green-500/20">
                    <span className="text-xl">{m.emoji}</span>
                    <span className="text-sm font-medium text-foreground">{m.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
