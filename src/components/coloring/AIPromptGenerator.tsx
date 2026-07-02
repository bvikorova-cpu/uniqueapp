import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, Loader2, Lightbulb, Palette, Pentagon, Flower2, Layers, Grid3X3, LayoutPanelTop } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const STYLE_PRESETS = [
  { value: "cartoon", label: "Cartoon", icon: Palette, desc: "Fun, rounded outlines" },
  { value: "realistic", label: "Realistic", icon: Layers, desc: "Detailed line art" },
  { value: "mandala", label: "Mandala", icon: Flower2, desc: "Symmetrical patterns" },
  { value: "kawaii", label: "Kawaii", icon: Sparkles, desc: "Cute Japanese style" },
  { value: "geometric", label: "Geometric", icon: Pentagon, desc: "Sharp, angular shapes" },
  { value: "stained-glass", label: "Stained Glass", icon: Grid3X3, desc: "Bold outlines, sections" },
];

const QUICK_IDEAS = [
  "A pirate ship on stormy seas",
  "A fairy garden with mushroom houses",
  "A robot playing guitar",
  "An underwater castle with mermaids",
  "A treehouse in an enchanted forest",
  "A friendly dinosaur at a tea party",
  "A steampunk hot air balloon",
  "A cat astronaut on the moon",
];

interface AIPromptGeneratorProps {
  onGenerate: (prompt: string, style: string, difficulty: string) => void;
  isGenerating: boolean;
}

export function AIPromptGenerator({ onGenerate, isGenerating }: AIPromptGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("cartoon");
  const [difficulty, setDifficulty] = useState("medium");

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    const fullPrompt = `Create a ${difficulty} difficulty coloring page in ${style} style: ${prompt}. Black and white line art only, no shading, clear outlines suitable for coloring.`;
    onGenerate(fullPrompt, style, difficulty);
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Prompt Generator - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Prompt Generator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Prompt Generator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <Wand2 className="h-5 w-5 text-primary" />
            </div>
            AI Text-to-Coloring
          </CardTitle>
          <CardDescription>Describe anything and AI will create a coloring page from scratch!</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          {/* Quick ideas */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" /> Quick ideas — click to use:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_IDEAS.map((idea, i) => (
                <motion.div key={idea} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-all text-xs"
                    onClick={() => setPrompt(idea)}
                  >
                    {idea}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Prompt input */}
          <div className="relative">
            <Input
              placeholder="Describe your coloring page... (e.g., 'A magical castle with dragons')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="pr-10 h-12 text-base rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>

          {/* Style & difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Art Style</label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STYLE_PRESETS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <span className="flex items-center gap-1.5">
                        <s.icon className="w-3.5 h-3.5" /> {s.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Difficulty</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full h-12 text-base rounded-xl"
          >
            {isGenerating ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating your coloring page...</>
            ) : (
              <><Wand2 className="mr-2 h-5 w-5" /> Generate from Description</>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
}
