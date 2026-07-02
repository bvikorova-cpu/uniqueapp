import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mic, Brain, Heart, Stethoscope, GraduationCap, Apple, ArrowLeft, Sparkles, Camera, Volume2, Shield, Bell } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const tools = [
  { id: "translate", title: "AI Pet Translator", desc: "Decode what your pet is saying from audio recordings", icon: Mic, cost: 4, color: "from-purple-500 to-violet-600" },
  { id: "emotion", title: "AI Emotion Detector", desc: "Analyze pet photos/descriptions for mood & stress level", icon: Heart, cost: 4, color: "from-pink-500 to-rose-600" },
  { id: "health", title: "AI Health Scanner", desc: "Detect potential health issues from behavior patterns", icon: Stethoscope, cost: 5, color: "from-fuchsia-500 to-purple-600" },
  { id: "training", title: "AI Training Coach", desc: "Personalized training plans based on breed & behavior", icon: GraduationCap, cost: 4, color: "from-violet-500 to-indigo-600" },
  { id: "diet", title: "AI Diet Planner", desc: "Custom nutrition plans for optimal pet health", icon: Apple, cost: 4, color: "from-emerald-500 to-teal-600" },
  { id: "behavior", title: "AI Behavior Analyzer", desc: "Deep analysis of behavioral patterns & recommendations", icon: Brain, cost: 5, color: "from-blue-500 to-cyan-600" },
  // New tools
  { id: "photo_analysis", title: "📸 Photo Emotion Analysis", desc: "Upload a pet photo for visual emotion detection", icon: Camera, cost: 5, color: "from-amber-500 to-orange-600", special: true },
  { id: "audio_recorder", title: "🎙️ Live Audio Recording", desc: "Record your pet's sounds for real-time AI translation", icon: Volume2, cost: 5, color: "from-red-500 to-pink-600", special: true },
  { id: "health_certificate", title: "🏥 Health Certificate", desc: "Generate professional AI health reports", icon: Shield, cost: 6, color: "from-emerald-500 to-green-600", special: true },
  { id: "smart_reminders", title: "⏰ Smart Reminders", desc: "AI-powered feeding, vaccine & vet visit schedules", icon: Bell, cost: 4, color: "from-amber-500 to-yellow-600", special: true },
];

interface PetToolsGridProps {
  activeView: string | null;
  setActiveView: (v: string | null) => void;
}

export default function PetToolsGrid({ activeView, setActiveView }: PetToolsGridProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = async (toolId: string) => {
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }

      const { data, error } = await supabase.functions.invoke("pet-translator-ai", {
        body: { action: toolId, ...formData },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success("Analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Failed to process");
    } finally {
      setLoading(false);
    }
  };

  const renderForm = (toolId: string) => {
    switch (toolId) {
      case "translate":
        return (
          <>
            <FloatingHowItWorks title="How Pet Tools Grid works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
            <div className="space-y-4">
            <Textarea placeholder="Describe your pet's sound (e.g., 'My dog is making a high-pitched whining sound while looking at the door')" value={formData.description || ""} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} />
            <Select value={formData.pet_type || ""} onValueChange={v => setFormData(p => ({ ...p, pet_type: v }))}>
              <SelectTrigger><SelectValue placeholder="Pet type" /></SelectTrigger>
              <SelectContent><SelectItem value="dog">Dog</SelectItem><SelectItem value="cat">Cat</SelectItem><SelectItem value="bird">Bird</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
            </Select>
          </div>
          </>
          );
      case "emotion":
        return (
          <div className="space-y-4">
            <Textarea placeholder="Describe your pet's current behavior..." value={formData.behavior || ""} onChange={e => setFormData(p => ({ ...p, behavior: e.target.value }))} rows={3} />
            <Select value={formData.pet_type || ""} onValueChange={v => setFormData(p => ({ ...p, pet_type: v }))}>
              <SelectTrigger><SelectValue placeholder="Pet type" /></SelectTrigger>
              <SelectContent><SelectItem value="dog">Dog</SelectItem><SelectItem value="cat">Cat</SelectItem><SelectItem value="bird">Bird</SelectItem><SelectItem value="rabbit">Rabbit</SelectItem></SelectContent>
            </Select>
          </div>
        );
      case "health":
        return (
          <div className="space-y-4">
            <Textarea placeholder="Describe symptoms or behaviors..." value={formData.symptoms || ""} onChange={e => setFormData(p => ({ ...p, symptoms: e.target.value }))} rows={3} />
            <Input placeholder="Pet breed" value={formData.breed || ""} onChange={e => setFormData(p => ({ ...p, breed: e.target.value }))} />
            <Input placeholder="Pet age (e.g., 5 years)" value={formData.age || ""} onChange={e => setFormData(p => ({ ...p, age: e.target.value }))} />
          </div>
        );
      case "training":
        return (
          <div className="space-y-4">
            <Input placeholder="Pet breed" value={formData.breed || ""} onChange={e => setFormData(p => ({ ...p, breed: e.target.value }))} />
            <Input placeholder="Pet age" value={formData.age || ""} onChange={e => setFormData(p => ({ ...p, age: e.target.value }))} />
            <Textarea placeholder="What behavior do you want to train?" value={formData.training_goal || ""} onChange={e => setFormData(p => ({ ...p, training_goal: e.target.value }))} rows={3} />
            <Select value={formData.experience || ""} onValueChange={v => setFormData(p => ({ ...p, experience: v }))}>
              <SelectTrigger><SelectValue placeholder="Your training experience" /></SelectTrigger>
              <SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent>
            </Select>
          </div>
        );
      case "diet":
        return (
          <div className="space-y-4">
            <Input placeholder="Pet breed" value={formData.breed || ""} onChange={e => setFormData(p => ({ ...p, breed: e.target.value }))} />
            <Input placeholder="Weight (kg)" value={formData.weight || ""} onChange={e => setFormData(p => ({ ...p, weight: e.target.value }))} />
            <Input placeholder="Age" value={formData.age || ""} onChange={e => setFormData(p => ({ ...p, age: e.target.value }))} />
            <Select value={formData.activity_level || ""} onValueChange={v => setFormData(p => ({ ...p, activity_level: v }))}>
              <SelectTrigger><SelectValue placeholder="Activity level" /></SelectTrigger>
              <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="very_high">Very High</SelectItem></SelectContent>
            </Select>
            <Textarea placeholder="Any health conditions or dietary restrictions?" value={formData.restrictions || ""} onChange={e => setFormData(p => ({ ...p, restrictions: e.target.value }))} rows={2} />
          </div>
        );
      case "behavior":
        return (
          <div className="space-y-4">
            <Textarea placeholder="Describe the behavior pattern in detail..." value={formData.behavior_pattern || ""} onChange={e => setFormData(p => ({ ...p, behavior_pattern: e.target.value }))} rows={3} />
            <Input placeholder="Pet breed & age" value={formData.breed_age || ""} onChange={e => setFormData(p => ({ ...p, breed_age: e.target.value }))} />
            <Select value={formData.environment || ""} onValueChange={v => setFormData(p => ({ ...p, environment: v }))}>
              <SelectTrigger><SelectValue placeholder="Living environment" /></SelectTrigger>
              <SelectContent><SelectItem value="apartment">Apartment</SelectItem><SelectItem value="house_yard">House with Yard</SelectItem><SelectItem value="rural">Rural</SelectItem></SelectContent>
            </Select>
          </div>
        );
      default:
        return null;
    }
  };

  // If a non-special tool is active, show its form
  if (activeView && !tools.find(t => t.id === activeView)?.special) {
    const tool = tools.find(t => t.id === activeView);
    if (!tool) return null;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" onClick={() => { setActiveView(null); setResult(null); setFormData({}); }} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tools
        </Button>
        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border-purple-500/20">
          <CardHeader className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3`}>
              <tool.icon className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">{tool.title}</CardTitle>
            <p className="text-muted-foreground">{tool.desc}</p>
            <Badge className="w-fit mx-auto bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Sparkles className="h-3 w-3 mr-1" /> {tool.cost} Credits
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderForm(activeView)}
            <Button onClick={() => handleSubmit(activeView)} disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : "Analyze with AI"}
            </Button>
            {result && (
              <Card className="bg-card/80 border-purple-500/20 p-6">
                <h3 className="font-bold mb-3 flex items-center gap-2"><Brain className="h-5 w-5 text-purple-400" /> AI Result</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </Card>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-black mb-4">🧬 AI Pet Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, i) => (
          <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="cursor-pointer hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all group" onClick={() => setActiveView(tool.id)}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base truncate">{tool.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{tool.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20">
                        {tool.cost} CR
                      </Badge>
                      {tool.special && <Badge className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">New</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
