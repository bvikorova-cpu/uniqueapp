import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Moon, Smile, TrendingUp, Thermometer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const moodData = [
  { day: "Mon", mood: 8, energy: 7, stress: 2 },
  { day: "Tue", mood: 7, energy: 6, stress: 3 },
  { day: "Wed", mood: 9, energy: 8, stress: 1 },
  { day: "Thu", mood: 6, energy: 5, stress: 4 },
  { day: "Fri", mood: 8, energy: 9, stress: 2 },
  { day: "Sat", mood: 9, energy: 8, stress: 1 },
  { day: "Sun", mood: 10, energy: 9, stress: 1 },
];

const healthMetrics = [
  { subject: "Mood", A: 85 },
  { subject: "Energy", A: 78 },
  { subject: "Appetite", A: 90 },
  { subject: "Sleep", A: 72 },
  { subject: "Activity", A: 88 },
  { subject: "Social", A: 65 },
];

const stats = [
  { label: "Overall Health", value: "92%", icon: Heart, color: "text-green-400", bg: "from-green-500/20 to-emerald-500/10" },
  { label: "Activity Level", value: "High", icon: Activity, color: "text-blue-400", bg: "from-blue-500/20 to-cyan-500/10" },
  { label: "Sleep Quality", value: "Good", icon: Moon, color: "text-indigo-400", bg: "from-indigo-500/20 to-violet-500/10" },
  { label: "Happiness", value: "9/10", icon: Smile, color: "text-yellow-400", bg: "from-yellow-500/20 to-amber-500/10" },
];

export default function PetHealthDashboard() {
  return (
    <>
      <FloatingHowItWorks title="How Pet Health Dashboard works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-black">📊 Pet Health Dashboard</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`bg-gradient-to-br ${stat.bg} border-border/30 text-center p-3`}>
              <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-1`} />
              <p className="text-lg font-black">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card/80 border-purple-500/20">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-400" /> Weekly Mood & Energy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="energy" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              <Badge variant="outline" className="text-[9px]"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block mr-1" />Mood</Badge>
              <Badge variant="outline" className="text-[9px]"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block mr-1" />Energy</Badge>
              <Badge variant="outline" className="text-[9px]"><span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-1" />Stress</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-purple-500/20">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-purple-400" /> Health Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={healthMetrics}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                <Radar name="Health" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
    );
}
