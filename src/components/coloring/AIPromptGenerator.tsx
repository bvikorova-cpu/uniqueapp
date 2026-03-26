import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, Loader2, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STYLE_PRESETS = [
  { value: "cartoon", label: "🎨 Cartoon", desc: "Fun, rounded outlines" },
  { value: "realistic", label: "📷 Realistic", desc: "Detailed line art" },
  { value: "mandala", label: "🔮 Mandala", desc: "Symmetrical patterns" },
  { value: "kawaii", label: "🌸 Kawaii", desc: "Cute Japanese style" },
  { value: "geometric", label: "📐 Geometric", desc: "Sharp, angular shapes" },
  { value: "stained-glass", label: "🪟 Stained Glass", desc: "Bold outlines, sections" },
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

  const useIdea = (idea: string) => {
    setPrompt(idea);
  };

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          AI Text-to-Coloring
        </CardTitle>
        <CardDescription>
          Describe anything and AI will create a coloring page from scratch!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick ideas */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Lightbulb className="h-3 w-3" /> Quick ideas — click to use:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_IDEAS.map((idea) => (
              <Badge
                key={idea}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 transition-colors text-xs"
                onClick={() => useIdea(idea)}
              >
                {idea}
              </Badge>
            ))}
          </div>
        </div>

        {/* Prompt input */}
        <div className="relative">
          <Input
            placeholder="Describe your coloring page... (e.g., 'A magical castle with dragons')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="pr-10 h-12 text-base"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>

        {/* Style & difficulty */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Art Style</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLE_PRESETS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Difficulty</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">🟢 Easy</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="hard">🔴 Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full h-12 text-base bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating your coloring page...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Generate from Description
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
