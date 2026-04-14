import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Calendar, BarChart3, Rocket, Loader2, CreditCard, Hash, Users, Repeat, ShieldAlert, Smile, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

const tools = [
  { id: "post_enhancer", icon: Wand2, title: "AI Post Enhancer", desc: "Optimize posts for maximum engagement", cost: 4, color: "from-orange-500 to-coral-500" },
  { id: "content_calendar", icon: Calendar, title: "AI Content Calendar", desc: "Weekly posting schedule with optimal times", cost: 5, color: "from-teal-500 to-cyan-500" },
  { id: "audience_insights", icon: BarChart3, title: "AI Audience Insights", desc: "Analyze followers & get growth tips", cost: 5, color: "from-rose-500 to-pink-500" },
  { id: "viral_predictor", icon: Rocket, title: "AI Viral Predictor", desc: "Score your post before publishing", cost: 4, color: "from-amber-500 to-yellow-500" },
  { id: "hashtag_generator", icon: Hash, title: "AI Hashtag Generator", desc: "Generate trending hashtag sets", cost: 3, color: "from-violet-500 to-purple-500" },
  { id: "collab_matchmaker", icon: Users, title: "Collab Matchmaker", desc: "Find ideal collaboration partners", cost: 5, color: "from-blue-500 to-indigo-500" },
  { id: "content_repurposer", icon: Repeat, title: "Content Repurposer", desc: "Transform posts into multiple formats", cost: 4, color: "from-emerald-500 to-green-500" },
  { id: "bot_detector", icon: ShieldAlert, title: "Bot Detector", desc: "Detect fake followers & bot activity", cost: 5, color: "from-red-500 to-rose-500" },
  { id: "mood_feed", icon: Smile, title: "Mood-Based Feed", desc: "AI content curation by mood", cost: 4, color: "from-pink-500 to-fuchsia-500" },
  { id: "voice_post", icon: Mic, title: "Voice Post Creator", desc: "AI scripts for voice-based content", cost: 4, color: "from-cyan-500 to-sky-500" },
];

export default function WallAIToolsGrid() {
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

      const { data, error } = await supabase.functions.invoke("wall-ai", {
        body: { action: activeTool, ...formData },
      });
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
      case "post_enhancer":
        return (
          <div className="space-y-3">
            <Textarea placeholder="Paste your post content here..." value={formData.original_post || ""} onChange={e => setFormData(p => ({ ...p, original_post: e.target.value }))} rows={4} />
            <Select value={formData.tone || ""} onValueChange={v => setFormData(p => ({ ...p, tone: v }))}>
              <SelectTrigger><SelectValue placeholder="Select tone" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Casual & Fun">Casual & Fun</SelectItem>
                <SelectItem value="Inspirational">Inspirational</SelectItem>
                <SelectItem value="Humorous">Humorous</SelectItem>
                <SelectItem value="Authoritative">Authoritative</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Target audience (e.g., tech professionals)" value={formData.target_audience || ""} onChange={e => setFormData(p => ({ ...p, target_audience: e.target.value }))} />
            <Select value={formData.goal || ""} onValueChange={v => setFormData(p => ({ ...p, goal: v }))}>
              <SelectTrigger><SelectValue placeholder="Goal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Maximum engagement">Maximum Engagement</SelectItem>
                <SelectItem value="Drive traffic">Drive Traffic</SelectItem>
                <SelectItem value="Build authority">Build Authority</SelectItem>
                <SelectItem value="Go viral">Go Viral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case "content_calendar":
        return (
          <div className="space-y-3">
            <Input placeholder="Your niche/topic (e.g., fitness, tech, food)" value={formData.niche || ""} onChange={e => setFormData(p => ({ ...p, niche: e.target.value }))} />
            <Select value={formData.content_style || ""} onValueChange={v => setFormData(p => ({ ...p, content_style: v }))}>
              <SelectTrigger><SelectValue placeholder="Content style" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Photos & Visuals">Photos & Visuals</SelectItem>
                <SelectItem value="Text & Stories">Text & Stories</SelectItem>
                <SelectItem value="Videos & Reels">Videos & Reels</SelectItem>
                <SelectItem value="Mixed (all types)">Mixed (All Types)</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Target audience (e.g., 18-35 entrepreneurs)" value={formData.target_audience || ""} onChange={e => setFormData(p => ({ ...p, target_audience: e.target.value }))} />
            <Input placeholder="Goals (e.g., grow engagement, build brand)" value={formData.goals || ""} onChange={e => setFormData(p => ({ ...p, goals: e.target.value }))} />
            <Select value={formData.frequency || ""} onValueChange={v => setFormData(p => ({ ...p, frequency: v }))}>
              <SelectTrigger><SelectValue placeholder="Posting frequency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Once daily">Once Daily</SelectItem>
                <SelectItem value="Twice daily">Twice Daily</SelectItem>
                <SelectItem value="3-4 times a week">3-4 Times/Week</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case "audience_insights":
        return (
          <div className="space-y-3">
            <Textarea placeholder="Describe your profile (niche, content type, style)" value={formData.profile_description || ""} onChange={e => setFormData(p => ({ ...p, profile_description: e.target.value }))} rows={3} />
            <Input placeholder="Current follower count" value={formData.followers || ""} onChange={e => setFormData(p => ({ ...p, followers: e.target.value }))} />
            <Input placeholder="Avg. engagement rate (e.g., 3.5%)" value={formData.engagement_rate || ""} onChange={e => setFormData(p => ({ ...p, engagement_rate: e.target.value }))} />
            <Textarea placeholder="Describe your top performing posts" value={formData.top_posts || ""} onChange={e => setFormData(p => ({ ...p, top_posts: e.target.value }))} rows={2} />
            <Input placeholder="Biggest challenges (e.g., low reach, slow growth)" value={formData.challenges || ""} onChange={e => setFormData(p => ({ ...p, challenges: e.target.value }))} />
          </div>
        );
      case "viral_predictor":
        return (
          <div className="space-y-3">
            <Textarea placeholder="Paste your post content to score..." value={formData.post_content || ""} onChange={e => setFormData(p => ({ ...p, post_content: e.target.value }))} rows={4} />
            <Select value={formData.post_type || ""} onValueChange={v => setFormData(p => ({ ...p, post_type: v }))}>
              <SelectTrigger><SelectValue placeholder="Post type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Text post">Text Post</SelectItem>
                <SelectItem value="Photo post">Photo Post</SelectItem>
                <SelectItem value="Video/Reel">Video/Reel</SelectItem>
                <SelectItem value="Carousel">Carousel</SelectItem>
                <SelectItem value="Poll/Quiz">Poll/Quiz</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Target audience" value={formData.target_audience || ""} onChange={e => setFormData(p => ({ ...p, target_audience: e.target.value }))} />
            <Input placeholder="Hashtags (comma-separated)" value={formData.hashtags || ""} onChange={e => setFormData(p => ({ ...p, hashtags: e.target.value }))} />
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
        <Card className="p-5 bg-card/90 backdrop-blur-md border-border/30">
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
          <Card className="p-5 bg-card/90 backdrop-blur-md border-border/30">
            <h4 className="font-bold mb-3">AI Results</h4>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </Card>
        )}
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {tools.map((tool, i) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => setActiveTool(tool.id)}
          className="cursor-pointer group"
        >
          <Card className="p-4 bg-card/80 backdrop-blur-md border-border/30 hover:border-orange-400/50 transition-all hover:shadow-lg hover:shadow-orange-500/10">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <tool.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">{tool.title}</h3>
                <p className="text-xs text-muted-foreground">{tool.desc}</p>
              </div>
              <span className="text-xs font-bold text-orange-500">{tool.cost} CR</span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
