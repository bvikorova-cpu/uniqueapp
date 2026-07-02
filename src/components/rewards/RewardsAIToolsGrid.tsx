import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Target, Award, BarChart3, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const tools = [
  { id: "xp_optimizer", icon: Zap, title: "AI XP Optimizer", desc: "Fastest path to level up", cost: 4, color: "from-amber-500 to-yellow-500" },
  { id: "badge_predictor", icon: Award, title: "AI Badge Predictor", desc: "Predict your next badge unlocks", cost: 4, color: "from-purple-500 to-violet-500" },
  { id: "challenge_generator", icon: Target, title: "AI Challenge Generator", desc: "Personalized daily & weekly challenges", cost: 5, color: "from-orange-500 to-red-500" },
  { id: "reward_analyst", icon: BarChart3, title: "AI Reward Analyst", desc: "Deep analysis of your rewards profile", cost: 5, color: "from-emerald-500 to-teal-500" },
];

export default function RewardsAIToolsGrid() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!activeTool) return;
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in to use AI tools");
      const { data, error } = await supabase.functions.invoke("rewards-ai", { body: { action: activeTool, ...formData } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (activeTool) {
      case "xp_optimizer":
        return (
          <div className="space-y-3">
            <Input placeholder="Current level" value={formData.current_level || ""} onChange={e => setFormData(p => ({ ...p, current_level: e.target.value }))} />
            <Input placeholder="Current XP" value={formData.current_xp || ""} onChange={e => setFormData(p => ({ ...p, current_xp: e.target.value }))} />
            <Input placeholder="Target level" value={formData.target_level || ""} onChange={e => setFormData(p => ({ ...p, target_level: e.target.value }))} />
            <Select value={formData.daily_hours || ""} onValueChange={v => setFormData(p => ({ ...p, daily_hours: v }))}>
              <SelectTrigger><SelectValue placeholder="Daily activity time" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15-30 minutes">15-30 Minutes</SelectItem>
                <SelectItem value="30-60 minutes">30-60 Minutes</SelectItem>
                <SelectItem value="1-2 hours">1-2 Hours</SelectItem>
                <SelectItem value="2+ hours">2+ Hours</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Preferred activities (posting, commenting, etc.)" value={formData.activities || ""} onChange={e => setFormData(p => ({ ...p, activities: e.target.value }))} />
          </div>
        );
      case "badge_predictor":
        return (
          <div className="space-y-3">
            <Input placeholder="Current badges count" value={formData.current_badges || ""} onChange={e => setFormData(p => ({ ...p, current_badges: e.target.value }))} />
            <Textarea placeholder="Activity summary (what you do most)" value={formData.activity_summary || ""} onChange={e => setFormData(p => ({ ...p, activity_summary: e.target.value }))} rows={3} />
            <Input placeholder="Total posts" value={formData.total_posts || ""} onChange={e => setFormData(p => ({ ...p, total_posts: e.target.value }))} />
            <Input placeholder="Total comments" value={formData.total_comments || ""} onChange={e => setFormData(p => ({ ...p, total_comments: e.target.value }))} />
            <Input placeholder="Login streak (days)" value={formData.login_streak || ""} onChange={e => setFormData(p => ({ ...p, login_streak: e.target.value }))} />
          </div>
        );
      case "challenge_generator":
        return (
          <div className="space-y-3">
            <Select value={formData.skill_level || ""} onValueChange={v => setFormData(p => ({ ...p, skill_level: v }))}>
              <SelectTrigger><SelectValue placeholder="Skill level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Preferred activities" value={formData.preferred_activities || ""} onChange={e => setFormData(p => ({ ...p, preferred_activities: e.target.value }))} />
            <Select value={formData.available_time || ""} onValueChange={v => setFormData(p => ({ ...p, available_time: v }))}>
              <SelectTrigger><SelectValue placeholder="Available time" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15 minutes">15 Minutes</SelectItem>
                <SelectItem value="30 minutes">30 Minutes</SelectItem>
                <SelectItem value="1 hour">1 Hour</SelectItem>
                <SelectItem value="2+ hours">2+ Hours</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formData.motivation_style || ""} onValueChange={v => setFormData(p => ({ ...p, motivation_style: v }))}>
              <SelectTrigger><SelectValue placeholder="Motivation style" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Achievement-driven">Achievement-Driven</SelectItem>
                <SelectItem value="Social-competitive">Social & Competitive</SelectItem>
                <SelectItem value="Explorer">Explorer</SelectItem>
                <SelectItem value="Casual">Casual & Fun</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case "reward_analyst":
        return (
          <div className="space-y-3">
            <Input placeholder="Current level" value={formData.level || ""} onChange={e => setFormData(p => ({ ...p, level: e.target.value }))} />
            <Input placeholder="Total XP earned" value={formData.total_xp || ""} onChange={e => setFormData(p => ({ ...p, total_xp: e.target.value }))} />
            <Input placeholder="XP earned this month" value={formData.monthly_xp || ""} onChange={e => setFormData(p => ({ ...p, monthly_xp: e.target.value }))} />
            <Input placeholder="Badges collected" value={formData.badges || ""} onChange={e => setFormData(p => ({ ...p, badges: e.target.value }))} />
            <Input placeholder="Best login streak (days)" value={formData.best_streak || ""} onChange={e => setFormData(p => ({ ...p, best_streak: e.target.value }))} />
            <Input placeholder="Active days per week" value={formData.active_days || ""} onChange={e => setFormData(p => ({ ...p, active_days: e.target.value }))} />
          </div>
        );
      default:
        return null;
    }
  };

  if (activeTool) {
    const tool = tools.find(t => t.id === activeTool)!;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <Button variant="ghost" onClick={() => { setActiveTool(null); setResult(null); setFormData({}); }} className="mb-2">← Back to Tools</Button>
        <Card className="p-5 bg-card/90 backdrop-blur-md border-amber-400/20">
          <div className="flex items-center gap-3 mb-4">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center`}>
              <tool.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{tool.title}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="h-3 w-3" /> {tool.cost} credits per use</p>
            </div>
          </div>
          {renderForm()}
          <Button onClick={handleSubmit} disabled={loading} className={`w-full mt-4 bg-gradient-to-r ${tool.color} text-white hover:opacity-90`}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...</> : `Generate — ${tool.cost} Credits`}
          </Button>
        </Card>
        {result && (
          <Card className="p-5 bg-card/90 backdrop-blur-md border-amber-400/20">
            <h4 className="font-bold mb-3 text-amber-500">AI Results</h4>
            <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
          </Card>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><HowItWorksButton variant="compact" title="AI Rewards Tools" intro="AI-powered helpers that analyse your stats and suggest what to do next." steps={[
        { title: "Pick a tool", desc: "Each card is a specialised AI (XP optimizer, badge predictor, strategy coach, etc.)." },
        { title: "Answer prompts", desc: "The tool may ask a few short questions to tailor its output to your playstyle." },
        { title: "Get a report", desc: "The AI returns a markdown report you can read, copy or apply immediately." },
        { title: "Costs credits", desc: "Each tool run consumes a small number of AI credits (shown on the card)." },
      ]} /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {tools.map((tool, i) => (
        <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} onClick={() => setActiveTool(tool.id)} className="cursor-pointer group">
          <Card className="p-4 bg-card/80 backdrop-blur-md border-amber-400/15 hover:border-amber-400/40 transition-all hover:shadow-lg hover:shadow-amber-500/10">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <tool.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">{tool.title}</h3>
                <p className="text-xs text-muted-foreground">{tool.desc}</p>
              </div>
              <span className="text-xs font-bold text-amber-500">{tool.cost} CR</span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
    </div>
  );
}
