import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Phone, AlertTriangle, Heart, Brain, Shield, Sparkles, TrendingUp
} from "lucide-react";
import { WellnessParityPack } from "./WellnessParityPack";

interface EmergencyContact {
  name: string;
  phone: string;
  type: "crisis" | "emergency" | "support";
  available: string;
}

const emergencyContacts: EmergencyContact[] = [
  { name: "Crisis Helpline", phone: "116 123", type: "crisis", available: "24/7" },
  { name: "Emergency Services", phone: "112", type: "emergency", available: "24/7" },
  { name: "Mental Health Support", phone: "0800 500 333", type: "support", available: "Mon-Sun" },
];

const weeklyMoods = [
  { date: "Mon", score: 5 },
  { date: "Tue", score: 6 },
  { date: "Wed", score: 4 },
  { date: "Thu", score: 7 },
  { date: "Fri", score: 6 },
  { date: "Sat", score: 8 },
  { date: "Sun", score: 7 },
];

export const WellnessDashboard = () => {
  const [showEmergency, setShowEmergency] = useState(false);
  const averageMood = (weeklyMoods.reduce((s, m) => s + m.score, 0) / weeklyMoods.length).toFixed(1);
  const moodTrend = weeklyMoods[weeklyMoods.length - 1].score > weeklyMoods[0].score ? "up" : "down";

  return (
    <div className="space-y-6">
      {/* Emergency Button */}
      <Card className="relative overflow-hidden border-red-500/30 backdrop-blur-xl bg-card/80">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
        <CardContent className="relative pt-6">
          <Button
            variant="destructive"
            size="lg"
            className="w-full h-16 text-lg active:scale-[0.97] transition-transform"
            onClick={() => setShowEmergency(!showEmergency)}
          >
            <AlertTriangle className="h-6 w-6 mr-2" />
            Emergency Resources
          </Button>

          {showEmergency && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3">
              {emergencyContacts.map((contact) => (
                <a
                  key={contact.phone}
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      contact.type === "crisis" ? "bg-red-500/20" :
                      contact.type === "emergency" ? "bg-orange-500/20" : "bg-blue-500/20"
                    }`}>
                      <Phone className={`h-5 w-5 ${
                        contact.type === "crisis" ? "text-red-400" :
                        contact.type === "emergency" ? "text-orange-400" : "text-blue-400"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.available}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-base font-mono">{contact.phone}</Badge>
                </a>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Mood Graph */}
      <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Mood Trend
            </span>
            <Badge variant="outline" className={moodTrend === "up" ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}>
              {moodTrend === "up" ? "↑ Improving" : "↓ Declining"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex items-end justify-between h-40 gap-2 mb-4">
            {weeklyMoods.map((mood, index) => (
              <motion.div
                key={mood.date}
                initial={{ height: 0 }}
                animate={{ height: `${(mood.score / 10) * 100}%` }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className="flex-1 flex flex-col items-center"
              >
                <div
                  className={`w-full rounded-t-lg ${
                    mood.score >= 7 ? "bg-green-500/70" : mood.score >= 5 ? "bg-yellow-500/70" : "bg-red-500/70"
                  }`}
                  style={{ height: "100%" }}
                />
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {weeklyMoods.map((mood) => (<span key={mood.date}>{mood.date}</span>))}
          </div>
          <div className="mt-4 p-3 bg-card/60 backdrop-blur-sm rounded-xl border border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average mood this week</span>
              <span className="text-2xl font-black">{averageMood}/10</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Brain, label: "Meditation", desc: "5-min session", color: "text-purple-400", bg: "from-purple-500/10 to-violet-500/5" },
          { icon: Heart, label: "Breathing", desc: "Calm down", color: "text-red-400", bg: "from-red-500/10 to-rose-500/5" },
          { icon: Sparkles, label: "Gratitude Journal", desc: "Write 3 things", color: "text-yellow-400", bg: "from-yellow-500/10 to-amber-500/5" },
          { icon: Shield, label: "Counseling", desc: "Chat with coach", color: "text-blue-400", bg: "from-blue-500/10 to-cyan-500/5" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Card className={`cursor-pointer border-border/50 hover:border-primary/30 transition-all bg-gradient-to-br ${item.bg} backdrop-blur-xl`}>
                <CardContent className="pt-6 text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${item.color}`} />
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly Goals */}
      <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <CardHeader className="relative">
          <CardTitle>Weekly Goals</CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {[
            { label: "Meditation", current: 5, goal: 7, unit: "days" },
            { label: "Exercise", current: 3, goal: 4, unit: "sessions" },
            { label: "8h+ Sleep", current: 4, goal: 7, unit: "nights" },
          ].map((goal) => (
            <div key={goal.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{goal.label}</span>
                <span className="text-muted-foreground">{goal.current}/{goal.goal} {goal.unit}</span>
              </div>
              <Progress value={(goal.current / goal.goal) * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default WellnessDashboard;
