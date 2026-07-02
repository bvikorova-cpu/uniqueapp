import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Palette, Sparkles, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ColorPalette {
  name: string;
  description: string;
  colors: { hex: string; name: string }[];
}

export function AIColorSuggestions() {
  const [description, setDescription] = useState("");
  const [mood, setMood] = useState("vibrant");
  const [isGenerating, setIsGenerating] = useState(false);
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("coloring-ai-tools", {
        body: { action: "color-suggestions", pageDescription: description, mood },
      });
      if (error) throw new Error(data?.error || error.message);
      if (data?.error) throw new Error(data.error);
      setPalettes(data.palettes || []);
      toast.success("Color palettes generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Color Suggestions - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Color Suggestions section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Color Suggestions.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 overflow-hidden relative">
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center">
              <Palette className="h-5 w-5 text-emerald-500" />
            </div>
            AI Color Suggestions
            <Badge variant="secondary" className="ml-2 text-[10px]">1 CR</Badge>
          </CardTitle>
          <CardDescription>AI analyzes your coloring page and suggests perfect color palettes</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          <Input
            placeholder="Describe your coloring page... (e.g., 'A forest scene with deer and mushrooms')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-12 rounded-xl"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <div className="flex gap-3">
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="rounded-xl flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vibrant">Vibrant & Bold</SelectItem>
                <SelectItem value="pastel">Soft & Pastel</SelectItem>
                <SelectItem value="warm">Warm & Cozy</SelectItem>
                <SelectItem value="cool">Cool & Calm</SelectItem>
                <SelectItem value="earthy">Earthy & Natural</SelectItem>
                <SelectItem value="neon">Neon & Electric</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerate} disabled={!description.trim() || isGenerating} className="rounded-xl px-6">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" /> Suggest</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Palettes */}
      {palettes.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          {palettes.map((palette, pi) => (
            <motion.div key={pi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.1 }}>
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{palette.name}</CardTitle>
                  <CardDescription className="text-xs">{palette.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-1 mb-3">
                    {palette.colors.map((c, ci) => (
                      <div
                        key={ci}
                        className="flex-1 h-10 rounded-lg first:rounded-l-xl last:rounded-r-xl cursor-pointer hover:scale-110 transition-transform relative group"
                        style={{ backgroundColor: c.hex }}
                        onClick={() => copyColor(c.hex)}
                        title={`${c.name} (${c.hex})`}
                      >
                        {copiedColor === c.hex && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {palette.colors.map((c, ci) => (
                      <button
                        key={ci}
                        onClick={() => copyColor(c.hex)}
                        className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-muted/50 rounded hover:bg-muted transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.hex }} />
                        {c.hex}
                        <Copy className="w-2 h-2" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
    </>
  );
}
