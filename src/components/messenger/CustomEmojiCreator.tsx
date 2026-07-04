import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Smile, Palette, Wand2, Copy, Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface CustomEmojiCreatorProps {
  onBack: () => void;
  userId: string;
}

const EMOJI_STYLES = [
  { id: "pixel", name: "Pixel Art", preview: "🟩" },
  { id: "kawaii", name: "Kawaii", preview: "🌸" },
  { id: "neon", name: "Neon Glow", preview: "💜" },
  { id: "sketch", name: "Hand Drawn", preview: "✏️" },
  { id: "3d", name: "3D Glossy", preview: "🔮" },
  { id: "retro", name: "Retro Pop", preview: "🕹️" },
];

const EMOJI_BASES = [
  "😀", "😎", "🤖", "👽", "🐱", "🐶", "🦊", "🐼",
  "🌟", "💎", "🔥", "❄️", "🌈", "⚡", "🎮", "🎵",
  "🍕", "🌮", "🍩", "🧁", "☕", "🍺", "🎂", "🍣",
];

const PREMIUM_COMBOS = [
  { name: "Fire Cat", emojis: ["🐱", "🔥"], result: "🐱‍🔥", credits: 2 },
  { name: "Star Dog", emojis: ["🐶", "⭐"], result: "🐕‍⭐", credits: 2 },
  { name: "Neon Heart", emojis: ["❤️", "💜"], result: "💗✨", credits: 3 },
  { name: "Galaxy Mind", emojis: ["🧠", "🌌"], result: "🧠🌌", credits: 5 },
  { name: "Rainbow Robot", emojis: ["🤖", "🌈"], result: "🤖🌈", credits: 3 },
  { name: "Thunder Bear", emojis: ["🐻", "⚡"], result: "🐻⚡", credits: 3 },
];

export const CustomEmojiCreator = ({ onBack, userId }: CustomEmojiCreatorProps) => {
  const [selectedStyle, setSelectedStyle] = useState("pixel");
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [emojiName, setEmojiName] = useState("");
  const [createdEmojis, setCreatedEmojis] = useState<{ name: string; emoji: string; style: string }[]>([]);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const createEmoji = () => {
    if (!selectedBase || !emojiName.trim()) {
      toast({ title: "Missing info", description: "Select a base emoji and give it a name.", variant: "destructive" });
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      const styleEmojis: Record<string, string> = {
        pixel: "⬛", kawaii: "🌸", neon: "✨", sketch: "〰️", "3d": "💫", retro: "🕹️",
      };
      const combo = `${selectedBase}${styleEmojis[selectedStyle] || ""}`;
      setCreatedEmojis(prev => [{ name: emojiName, emoji: combo, style: selectedStyle }, ...prev]);
      setEmojiName("");
      setSelectedBase(null);
      setGenerating(false);
      toast({ title: "Emoji Created!", description: `"${emojiName}" is ready to use in chats.` });
    }, 1500);
  };

  const copyEmoji = (emoji: string) => {
    navigator.clipboard.writeText(emoji);
    toast({ title: "Copied!", description: "Emoji copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Custom Emoji Creator</h2>
          <p className="text-sm text-muted-foreground">Design unique emojis for your chats</p>
        </div>
      </div>

      {/* Style Selection */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-black">
            <Palette className="h-5 w-5 text-primary" /> Choose Style
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {EMOJI_STYLES.map((style) => (
              <motion.div
                key={style.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3 rounded-xl text-center cursor-pointer border-2 transition-all ${
                  selectedStyle === style.id ? "border-primary bg-primary/10" : "border-transparent bg-muted/30 hover:border-primary/30"
                }`}
              >
                <p className="text-2xl mb-1">{style.preview}</p>
                <p className="text-[10px] font-bold">{style.name}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Base Emoji Selection */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-black">
            <Smile className="h-5 w-5 text-primary" /> Select Base Emoji
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-2">
            {EMOJI_BASES.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedBase(emoji)}
                className={`text-2xl p-2 rounded-lg transition-all ${
                  selectedBase === emoji ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted/50"
                }`}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Name your emoji..."
              value={emojiName}
              onChange={(e) => setEmojiName(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={createEmoji}
              disabled={generating || !selectedBase || !emojiName.trim()}
              className="bg-gradient-to-r from-primary to-accent text-white gap-2"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              Create
            </Button>
          </div>
          {selectedBase && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Preview:</span>
              <span className="text-2xl">{selectedBase}</span>
              <span>+</span>
              <span className="font-bold capitalize">{selectedStyle}</span>
              <span>style</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Premium Combos */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-background to-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-black">
              <Sparkles className="h-5 w-5 text-primary" /> AI Premium Combos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PREMIUM_COMBOS.map((combo, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="p-3 rounded-xl bg-card/60 border border-border/40 text-center"
                >
                  <p className="text-2xl mb-1">{combo.result}</p>
                  <p className="text-xs font-bold">{combo.name}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Lock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{combo.credits} credits</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Created Emojis */}
      {createdEmojis.length > 0 && (
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-black">Your Custom Emojis ({createdEmojis.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {createdEmojis.map((e, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-muted/30 text-center group cursor-pointer"
                  onClick={() => copyEmoji(e.emoji)}
                >
                  <p className="text-3xl mb-1">{e.emoji}</p>
                  <p className="text-xs font-bold">{e.name}</p>
                  <Copy className="h-3 w-3 mx-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
