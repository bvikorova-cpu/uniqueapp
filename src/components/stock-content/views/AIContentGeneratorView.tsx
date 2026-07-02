import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2, ImageIcon, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface AIContentGeneratorViewProps {
  onBack: () => void;
}

const styles = [
  "Photorealistic", "Digital Art", "Watercolor", "Oil Painting", "Minimalist",
  "Abstract", "3D Render", "Pixel Art", "Comic Style", "Vintage",
];

const categories = [
  "Nature", "Business", "Technology", "Food", "Travel",
  "Architecture", "People", "Animals", "Sports", "Fashion",
];

export function AIContentGeneratorView({ onBack }: AIContentGeneratorViewProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Photorealistic");
  const [category, setCategory] = useState("Nature");
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Error", description: "Please enter a description", variant: "destructive" });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-stock-content-generator', {
        body: { prompt, style, category }
      });
      if (error) throw error;
      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({ title: "Image Generated!", description: "Your AI content is ready. You can now upload it to the library." });
      }
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message || "Failed to generate content", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Content Generator View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Content Generator View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Content Generator View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="w-6 h-6 text-purple-500" /> AI Content Generator</h2>
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20">5 credits</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div>
            <Label>Description *</Label>
            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate... e.g., 'A serene mountain lake at sunset with golden reflections'"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {styles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <p className="text-xs text-muted-foreground w-full mb-1">Quick Prompts:</p>
            {["Sunset landscape", "Business meeting", "Abstract texture", "Food photography", "City skyline"].map(q => (
              <Badge key={q} variant="outline" className="cursor-pointer hover:bg-secondary" onClick={() => setPrompt(q)}>{q}</Badge>
            ))}
          </div>

          <Button onClick={handleGenerate} disabled={generating} className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700">
            {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Wand2 className="w-4 h-4 mr-2" />Generate Content (5 Credits)</>}
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Preview</h3>
          {generatedImage ? (
            <div className="space-y-4">
              <img src={generatedImage} alt="Generated" className="w-full rounded-lg shadow-lg" />
              <Button className="w-full" variant="outline" onClick={async () => {
                try {
                  const { supabase } = await import("@/integrations/supabase/client");
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) { toast({ description: "First log in" }); return; }
                  const fileName = `stock-${user.id}-${Date.now()}.png`;
                  const blob = await (await fetch(generatedImage)).blob();
                  const { error } = await supabase.storage.from("stock-content").upload(fileName, blob, { contentType: "image/png", upsert: false });
                  if (error) throw error;
                  toast({ description: "Added to library!" });
                } catch (e: any) {
                  toast({ description: e.message || "Upload zlyhal" });
                }
              }}>
                Upload to Library
              </Button>
            </div>
          ) : (
            <div className="h-64 bg-secondary/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Generated content will appear here</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
    </>
  );
}
