import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Ban, CheckCircle2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface CategoryControl { id: string; label: string; emoji: string; enabled: boolean; description: string; }

export const ContentBlocking = () => {
  const [categories, setCategories] = useState<CategoryControl[]>([
    { id: "stories", label: "Stories & Fairy Tales", emoji: "📖", enabled: true, description: "AI-generated stories" },
    { id: "drawing", label: "Drawing & Painting", emoji: "🎨", enabled: true, description: "Interactive drawing" },
    { id: "science", label: "Science Experiments", emoji: "🔬", enabled: true, description: "Virtual experiments" },
    { id: "homework", label: "Homework", emoji: "📝", enabled: true, description: "Math, language, science" },
    { id: "games", label: "Educational Games", emoji: "🎮", enabled: true, description: "Quizzes and puzzles" },
    { id: "videos", label: "Videos & Animations", emoji: "🎬", enabled: false, description: "Educational videos" },
  ]);
  const [scheduledAccess, setScheduledAccess] = useState({ enabled: false, startTime: "08:00", endTime: "18:00", weekendExtend: true });
  const toggleCategory = (id: string) => { setCategories(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c)); };

  return (
    <>
      <FloatingHowItWorks title={"Content Blocking - How it works"} steps={[{ title: 'Open', desc: 'Access the Content Blocking section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Content Blocking.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-purple-500" />Allowed Activities Whitelist</CardTitle>
            <CardDescription>Select which content categories are allowed for your child</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${cat.enabled ? "bg-green-50/50 border-green-200" : "bg-red-50/30 border-red-200"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{cat.label}</p>
                      {cat.enabled ? <Badge className="bg-green-500 h-5 text-[10px]"><CheckCircle2 className="w-3 h-3 mr-0.5" /> Allowed</Badge> : <Badge variant="destructive" className="h-5 text-[10px]"><Ban className="w-3 h-3 mr-0.5" /> Blocked</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                </div>
                <Switch checked={cat.enabled} onCheckedChange={() => toggleCategory(cat.id)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-500" />Scheduled Access</CardTitle>
            <CardDescription>Set a time window when your child can use the app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-sm">Enable Schedule</p><p className="text-xs text-muted-foreground">Access only during allowed hours</p></div>
              <Switch checked={scheduledAccess.enabled} onCheckedChange={(v) => setScheduledAccess(prev => ({ ...prev, enabled: v }))} />
            </div>
            {scheduledAccess.enabled && (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">From</label>
                    <Select value={scheduledAccess.startTime} onValueChange={(v) => setScheduledAccess(prev => ({ ...prev, startTime: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["06:00", "07:00", "08:00", "09:00", "10:00"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">To</label>
                    <Select value={scheduledAccess.endTime} onValueChange={(v) => setScheduledAccess(prev => ({ ...prev, endTime: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["16:00", "17:00", "18:00", "19:00", "20:00", "21:00"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                  <div><p className="text-sm font-medium text-blue-800">Extended Weekend Access</p><p className="text-xs text-blue-600">+1 hour extra on Saturday and Sunday</p></div>
                  <Switch checked={scheduledAccess.weekendExtend} onCheckedChange={(v) => setScheduledAccess(prev => ({ ...prev, weekendExtend: v }))} />
                </div>
              </div>
            )}
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500" onClick={() => toast.success("Settings saved!")}>Save Settings</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
    </>
  );
};
