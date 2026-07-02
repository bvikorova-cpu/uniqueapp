import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2, Sparkles, Copy, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface PromptGalleryViewProps {
  onSelectPrompt: (prompt: string) => void;
}

interface PromptItem {
  title: string;
  prompt: string;
  category: string;
  difficulty: string;
}

const categories = ["All", "Nature", "Fantasy", "Sci-Fi", "Portrait", "Abstract", "Architecture", "Food", "Animals"];

const curatedPrompts: PromptItem[] = [
  { title: "Aurora Borealis", prompt: "Northern lights dancing over a frozen lake in Iceland, long exposure photography, vivid greens and purples reflecting on ice, 4K ultra detailed", category: "Nature", difficulty: "Easy" },
  { title: "Steampunk Airship", prompt: "Massive Victorian steampunk airship flying through golden clouds at sunset, intricate brass mechanisms, oil painting style, dramatic lighting", category: "Fantasy", difficulty: "Medium" },
  { title: "Cyberpunk Samurai", prompt: "Neon-lit cyberpunk samurai warrior standing on a rainy rooftop in Neo-Tokyo, holographic katana, cinematic wide shot, Blade Runner aesthetic", category: "Sci-Fi", difficulty: "Hard" },
  { title: "Watercolor Cafe", prompt: "Charming Parisian cafe on a rainy afternoon, watercolor painting style, soft warm tones, people with umbrellas, impressionist feel", category: "Architecture", difficulty: "Easy" },
  { title: "Crystal Dragon", prompt: "Magnificent crystal dragon emerging from a geode cave, prismatic light refractions, fantasy art, ultra detailed scales and wings", category: "Fantasy", difficulty: "Hard" },
  { title: "Macro Dewdrop", prompt: "Extreme macro shot of a morning dewdrop on a spider web, entire garden reflected inside, photorealistic, bokeh background", category: "Nature", difficulty: "Medium" },
];

export const PromptGalleryView = ({ onSelectPrompt }: PromptGalleryViewProps) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [aiPrompts, setAiPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("");

  const filteredCurated = activeCategory === "All"
    ? curatedPrompts
    : curatedPrompts.filter(p => p.category === activeCategory);

  const handleGeneratePrompts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-tools', {
        body: { action: 'prompt_gallery', prompt: theme || "Generate diverse trending AI art prompts" }
      });
      if (error) throw error;
      if (data.error) { toast.error(data.error); return; }
      const parsed = data.prompts?.suggestions || data.prompts?.prompts || data.prompts;
      if (Array.isArray(parsed)) {
        setAiPrompts(parsed);
      } else if (parsed && typeof parsed === 'object') {
        const arr = Object.values(parsed).find(v => Array.isArray(v)) as PromptItem[] | undefined;
        if (arr) setAiPrompts(arr);
      }
      toast.success("AI prompts generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate prompts");
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied!");
  };

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'Easy': return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/10 text-red-600 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Prompt Gallery View - How it works"} steps={[{ title: 'Open', desc: 'Access the Prompt Gallery View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Prompt Gallery View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-4xl mx-auto space-y-6">
      {/* AI Prompt Generator */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> AI Prompt Generator</CardTitle>
          <CardDescription>Get AI-generated creative prompts — FREE</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Optional theme: e.g. underwater worlds, space exploration..."
            className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button onClick={handleGeneratePrompts} disabled={loading} className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><TrendingUp className="w-4 h-4 mr-2" />Generate AI Prompts (Free)</>}
          </Button>

          {aiPrompts.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {aiPrompts.map((p, i) => (
                <div key={i} className="p-3 rounded-xl border bg-card hover:border-primary/30 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{p.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${difficultyColor(p.difficulty)}`}>{p.difficulty}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.prompt}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => copyPrompt(p.prompt)}>
                      <Copy className="w-3 h-3 mr-1" />Copy
                    </Button>
                    <Button size="sm" className="text-xs h-7" onClick={() => onSelectPrompt(p.prompt)}>
                      Use Prompt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Curated Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Curated Prompt Gallery</CardTitle>
          <CardDescription>Hand-picked prompts for stunning results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeCategory === c ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {filteredCurated.map((p, i) => (
              <div key={i} className="p-3 rounded-xl border bg-card hover:border-primary/30 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{p.title}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${difficultyColor(p.difficulty)}`}>{p.difficulty}</span>
                </div>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{p.category}</span>
                <p className="text-xs text-muted-foreground">{p.prompt}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => copyPrompt(p.prompt)}>
                    <Copy className="w-3 h-3 mr-1" />Copy
                  </Button>
                  <Button size="sm" className="text-xs h-7" onClick={() => onSelectPrompt(p.prompt)}>
                    Use Prompt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};
