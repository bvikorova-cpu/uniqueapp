import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Target, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface LearningProgressTrackerProps {
  onBack: () => void;
}

export const LearningProgressTracker = ({ onBack }: LearningProgressTrackerProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['skill-swap-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get user's conversations grouped by skill
      const { data: conversations } = await supabase
        .from('skill_swap_conversations')
        .select('id, status, created_at, completed_at, skill_offerings(title, category)')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!conversations?.length) return [];

      // Group by category
      const categoryMap = new Map<string, { total: number; completed: number; title: string; lastDate: string }>();

      const categoryEmojis: Record<string, string> = {
        'Technology': '💻', 'Creative': '🎨', 'Teaching': '📚',
        'Music': '🎵', 'Sports': '⚽', 'Cooking': '🍳',
        'Language': '🗣️', 'Other': '✨',
      };

      conversations.forEach(c => {
        const offering = c.skill_offerings as any;
        const cat = offering?.category || 'Other';
        const entry = categoryMap.get(cat) || { total: 0, completed: 0, title: offering?.title || cat, lastDate: c.created_at || '' };
        entry.total++;
        if (c.status === 'completed') entry.completed++;
        if ((c.created_at || '') > entry.lastDate) entry.lastDate = c.created_at || '';
        categoryMap.set(cat, entry);
      });

      return Array.from(categoryMap.entries()).map(([cat, data]) => ({
        id: cat,
        skill: data.title,
        category: cat,
        emoji: categoryEmojis[cat] || '✨',
        progress: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        totalSessions: data.total,
        completedSessions: data.completed,
        lastSession: data.lastDate ? new Date(data.lastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
      }));
    },
  });

  const totalCompleted = goals.reduce((sum, g) => sum + g.completedSessions, 0);
  const avgProgress = goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0;

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Learning Progress Tracker - How it works"} steps={[{ title: 'Open', desc: 'Access the Learning Progress Tracker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Learning Progress Tracker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </>
  );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> Learning Progress
        </h2>
      </div>

      {goals.length === 0 ? (
        <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-bold text-lg mb-2">No Learning Progress Yet</h3>
          <p className="text-sm text-muted-foreground">Start exchanging skills to track your learning journey!</p>
        </Card>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Skills Learning", value: goals.length.toString(), emoji: "📚" },
              { label: "Sessions Done", value: totalCompleted.toString(), emoji: "✅" },
              { label: "Avg. Progress", value: `${avgProgress}%`, emoji: "📈" },
              { label: "Total Sessions", value: goals.reduce((s, g) => s + g.totalSessions, 0).toString(), emoji: "📊" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 text-center bg-card/60 backdrop-blur-sm border-border/50">
                  <span className="text-2xl block mb-1">{stat.emoji}</span>
                  <div className="text-xl font-black">{stat.value}</div>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Learning Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal, i) => (
              <motion.div key={goal.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                <Card
                  className={`p-5 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all cursor-pointer ${
                    selectedId === goal.id ? "ring-2 ring-primary/30 border-primary/30" : ""
                  }`}
                  onClick={() => setSelectedId(selectedId === goal.id ? null : goal.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl">
                        {goal.emoji}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{goal.category}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">{goal.skill}</Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {goal.lastSession}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-lg font-black text-primary">{goal.progress}%</span>
                  </div>

                  <div className="space-y-2">
                    <Progress value={goal.progress} className="h-2" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{goal.completedSessions} completed</span>
                      <span>{goal.totalSessions} total sessions</span>
                    </div>
                  </div>

                  {selectedId === goal.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-border/30">
                      <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-primary" /> Session Progress
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs p-1.5 rounded-lg text-emerald-600">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{goal.completedSessions} sessions completed</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs p-1.5 rounded-lg text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 text-border" />
                          <span>{goal.totalSessions - goal.completedSessions} sessions in progress</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};