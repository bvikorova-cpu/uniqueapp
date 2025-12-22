import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Phone, 
  AlertTriangle, 
  Heart, 
  Brain, 
  Shield,
  MapPin,
  Clock,
  Sparkles,
  TrendingUp
} from "lucide-react";

interface EmergencyContact {
  name: string;
  phone: string;
  type: "crisis" | "emergency" | "support";
}

interface MoodEntry {
  date: string;
  score: number;
  note?: string;
}

const emergencyContacts: EmergencyContact[] = [
  { name: "Linka pomoci", phone: "116 123", type: "crisis" },
  { name: "Tiesňová linka", phone: "112", type: "emergency" },
  { name: "Psychologická pomoc", phone: "0800 500 333", type: "support" },
];

const weeklyMoods: MoodEntry[] = [
  { date: "Po", score: 5 },
  { date: "Ut", score: 6 },
  { date: "St", score: 4 },
  { date: "Št", score: 7 },
  { date: "Pi", score: 6 },
  { date: "So", score: 8 },
  { date: "Ne", score: 7 },
];

export const WellnessDashboard = () => {
  const [showEmergency, setShowEmergency] = useState(false);
  const averageMood = (weeklyMoods.reduce((s, m) => s + m.score, 0) / weeklyMoods.length).toFixed(1);
  const moodTrend = weeklyMoods[weeklyMoods.length - 1].score > weeklyMoods[0].score ? "up" : "down";

  return (
    <div className="space-y-6">
      {/* Emergency Button */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              size="lg"
              className="w-full h-16 text-lg"
              onClick={() => setShowEmergency(!showEmergency)}
            >
              <AlertTriangle className="h-6 w-6 mr-2" />
              Núdzové zdroje
            </Button>

            {showEmergency && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 space-y-3"
              >
                {emergencyContacts.map((contact) => (
                  <a
                    key={contact.phone}
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-background hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        contact.type === "crisis" ? "bg-red-500" :
                        contact.type === "emergency" ? "bg-orange-500" : "bg-blue-500"
                      }`}>
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">24/7 dostupné</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-lg font-mono">
                      {contact.phone}
                    </Badge>
                  </a>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Mood Progress Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Vývoj nálady
            </span>
            <Badge variant="outline" className={moodTrend === "up" ? "text-green-500" : "text-red-500"}>
              {moodTrend === "up" ? "↑ Zlepšenie" : "↓ Pokles"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                    mood.score >= 7 ? "bg-green-500" :
                    mood.score >= 5 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ height: "100%" }}
                />
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            {weeklyMoods.map((mood) => (
              <span key={mood.date}>{mood.date}</span>
            ))}
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Priemerná nálada tento týždeň</span>
              <span className="text-2xl font-bold">{averageMood}/10</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="pt-6 text-center">
            <Brain className="h-10 w-10 mx-auto mb-3 text-purple-500" />
            <p className="font-medium">Meditácia</p>
            <p className="text-sm text-muted-foreground">5-min cvičenie</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="pt-6 text-center">
            <Heart className="h-10 w-10 mx-auto mb-3 text-red-500" />
            <p className="font-medium">Dychové cvičenie</p>
            <p className="text-sm text-muted-foreground">Upokojenie</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-10 w-10 mx-auto mb-3 text-yellow-500" />
            <p className="font-medium">Denník vďačnosti</p>
            <p className="text-sm text-muted-foreground">Napíšte 3 veci</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="pt-6 text-center">
            <Shield className="h-10 w-10 mx-auto mb-3 text-blue-500" />
            <p className="font-medium">Poradenstvo</p>
            <p className="text-sm text-muted-foreground">Chat s terapeutom</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Týždenné ciele</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Meditácia", current: 5, goal: 7, unit: "dní" },
            { label: "Cvičenie", current: 3, goal: 4, unit: "tréningy" },
            { label: "Spánok 8h+", current: 4, goal: 7, unit: "nocí" },
          ].map((goal) => (
            <div key={goal.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{goal.label}</span>
                <span className="text-muted-foreground">
                  {goal.current}/{goal.goal} {goal.unit}
                </span>
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
