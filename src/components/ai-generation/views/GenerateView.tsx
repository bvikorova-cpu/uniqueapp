import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Wand2, Download, Loader2, Wand } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface GenerateViewProps { onCreditsUsed: () => void; }

const ASPECT_RATIOS = [
  { v: "1:1", label: "Square 1:1" },
  { v: "16:9", label: "Wide 16:9" },
  { v: "9:16", label: "Portrait 9:16" },
  { v: "4:5", label: "Social 4:5" },
  { v: "3:2", label: "Photo 3:2" },
  { v: "21:9", label: "Cinema 21:9" },
];

const examplePrompts = [
  "A majestic lion with a galaxy mane, cosmic background, digital art, vibrant colors",
  "Cozy coffee shop interior, rainy day outside, warm lighting, watercolor painting style",
  "Futuristic city skyline at night, neon lights, cyberpunk aesthetic, 4K detailed",
  "Enchanted forest with glowing mushrooms, fairy tale atmosphere, magical lighting",
];

export const GenerateView = ({ onCreditsUsed }: GenerateViewProps) => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [seed, setSeed] = useState("");
  const [model, setModel] = useState("gpt-image-1");
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleEnhance = async () => {
    if (!prompt.trim()) { toast.error("Enter a prompt first"); return; }
    setEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-image-tools", {
        body: { action: "prompt_enhance", prompt },
      });
      if (error) throw error;
      if (data?.enhanced) {
        setPrompt(data.enhanced);
        toast.success("Prompt enhanced! (1 CR)");
        onCreditsUsed();
      }
    } catch (e: any) { toast.error(e.message || "Enhance failed"); }
    finally { setEnhancing(false); }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Please enter a description"); return; }
    setLoading(true); setGeneratedImage(null);
    try {
      const seedNum = seed ? Number(seed) : undefined;
      const { data, error } = await supabase.functions.invoke('ai-image-tools', {
        body: { action: 'generate', prompt, negativePrompt, aspectRatio, seed: seedNum, model },
      });
      if (error) throw error;
      if (data.error) { toast.error(data.error); return; }
      setGeneratedImage(data.imageUrl);
      toast.success("Image generated!");
      onCreditsUsed();
    } catch (e: any) { toast.error(e.message || "Generation failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Generate View - How it works"} steps={[{ title: 'Open', desc: 'Access the Generate View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Generate View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />Custom AI Generation</CardTitle>
          <CardDescription>5 credits per image. Use Magic Enhance (1 CR) for richer prompts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the image you want to create in detail..." className="w-full min-h-[110px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary" disabled={loading} />

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleEnhance} disabled={enhancing || !prompt.trim()} className="gap-1">
              {enhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand className="w-3 h-3" />}
              Magic Enhance (1 CR)
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold mb-1 block text-muted-foreground">Aspect Ratio</label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{ASPECT_RATIOS.map(r => <SelectItem key={r.v} value={r.v}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block text-muted-foreground">Model</label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-image-1">GPT-Image 1 (Default)</SelectItem>
                  <SelectItem value="gpt-image-1-hd">GPT-Image HD</SelectItem>
                  <SelectItem value="flux-style">Flux Style</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block text-muted-foreground">Seed (optional)</label>
              <Input type="number" placeholder="random" value={seed} onChange={(e) => setSeed(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-bold mb-1 block text-muted-foreground">Negative</label>
              <Input placeholder="blurry, deformed..." value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} className="h-9 text-xs" />
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading || !prompt.trim()} size="lg" className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Wand2 className="w-4 h-4 mr-2" />Generate Image (5 credits)</>}
          </Button>

          {generatedImage && (
            <div className="mt-6 border rounded-lg p-4 bg-background">
              <div className="relative group">
                <img src={generatedImage} alt="Generated" className="w-full rounded-lg" />
                <Button onClick={() => {
                  const link = document.createElement('a'); link.href = generatedImage;
                  link.download = `ai-generated-${Date.now()}.webp`;
                  document.body.appendChild(link); link.click(); document.body.removeChild(link);
                  toast.success("Downloading!");
                }} className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" size="sm">
                  <Download className="w-4 h-4 mr-2" />Download
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Example Prompts</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {examplePrompts.map((p, i) => (
              <button key={i} onClick={() => setPrompt(p)} className="text-left p-3 rounded-lg border bg-background hover:bg-primary/5 hover:border-primary/30 transition-colors text-sm text-muted-foreground">
                "{p}"
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};
