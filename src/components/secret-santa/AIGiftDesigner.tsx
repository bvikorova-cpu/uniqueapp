import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSecretSanta } from "@/hooks/useSecretSanta";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Sparkles, Loader2, Copy, Send, Palette, Heart, Zap, RefreshCw } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const DESIGN_PROMPTS = [
  { id: "birthday", label: "Birthday Surprise", emoji: "🎂", prompt: "Create a unique birthday-themed digital gift" },
  { id: "love", label: "Expression of Love", emoji: "💕", prompt: "Design a romantic and heartfelt gift for a loved one" },
  { id: "thank_you", label: "Gratitude Gift", emoji: "🙏", prompt: "Create a gift that expresses deep gratitude" },
  { id: "celebration", label: "Achievement Celebration", emoji: "🏆", prompt: "Design a gift celebrating a major accomplishment" },
  { id: "comfort", label: "Comfort & Support", emoji: "🤗", prompt: "Create a comforting gift for someone going through tough times" },
  { id: "adventure", label: "Adventure Spirit", emoji: "🌍", prompt: "Design an adventure-themed gift full of excitement" },
  { id: "mystical", label: "Mystical & Magical", emoji: "🔮", prompt: "Create a mystical, enchanted digital gift" },
  { id: "custom", label: "Custom Idea", emoji: "✨", prompt: "" },
];

interface DesignedGift {
  name: string;
  description: string;
  emoji: string;
  value: number;
  theme: string;
}

export const AIGiftDesigner = () => {
  const { toast } = useToast();
  const { credits } = useSecretSanta();
  const queryClient = useQueryClient();
  const [selectedPrompt, setSelectedPrompt] = useState("birthday");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isDesigning, setIsDesigning] = useState(false);
  const [designedGift, setDesignedGift] = useState<DesignedGift | null>(null);

  const COST = 3;

  const designGift = async () => {
    if (credits < COST) {
      toast({ title: "Not enough credits!", description: `You need ${COST} credits for AI gift design.`, variant: "destructive" });
      return;
    }

    setIsDesigning(true);
    setDesignedGift(null);

    try {
      const promptData = DESIGN_PROMPTS.find(p => p.id === selectedPrompt);
      const prompt = selectedPrompt === "custom" ? customPrompt : promptData?.prompt || "";

      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: { type: "gift_designer", customPrompt: prompt },
      });

      if (error) throw error;

      // Parse JSON response
      try {
        const parsed = JSON.parse(data.message);
        setDesignedGift(parsed);
      } catch {
        // If not valid JSON, create a structured response
        setDesignedGift({
          name: "Custom AI Gift",
          description: data.message,
          emoji: "✨",
          value: 50,
          theme: selectedPrompt,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["secret-santa-credits"] });
      toast({ title: "Gift designed successfully!" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to design gift", variant: "destructive" });
    } finally {
      setIsDesigning(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Gift Designer - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Gift Designer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Gift Designer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-white/80 backdrop-blur-xl border-purple-200 text-center shadow-lg">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <Wand2 className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Gift Designer</h2>
        <p className="text-gray-500 text-sm">Let AI create a unique, personalized gift concept just for you</p>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
          <Zap className="h-3 w-3" /> Costs {COST} credits per design
        </div>
      </Card>

      {/* Design prompts */}
      <Card className="p-4 bg-white/80 border-purple-200 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-500" /> Choose a Theme
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {DESIGN_PROMPTS.map(p => (
            <motion.div key={p.id} whileTap={{ scale: 0.97 }}>
              <Card
                onClick={() => setSelectedPrompt(p.id)}
                className={`p-3 cursor-pointer transition-all text-center ${
                  selectedPrompt === p.id
                    ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white border-transparent shadow-lg"
                    : "bg-white border-gray-200 hover:border-purple-300"
                }`}
              >
                <span className="text-2xl block mb-1">{p.emoji}</span>
                <p className={`text-xs font-bold ${selectedPrompt === p.id ? "text-white" : "text-gray-700"}`}>{p.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Custom prompt */}
      {selectedPrompt === "custom" && (
        <Card className="p-4 bg-white/80 border-purple-200 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-2">Describe Your Gift Idea</h3>
          <Textarea
            placeholder="Describe what kind of unique gift you want AI to design..."
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            className="bg-white border-purple-200 min-h-[80px]"
            maxLength={300}
          />
        </Card>
      )}

      {/* Generate button */}
      <Button
        onClick={designGift}
        disabled={isDesigning || credits < COST || (selectedPrompt === "custom" && !customPrompt.trim())}
        className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-purple-500/30"
      >
        {isDesigning ? (
          <><Loader2 className="h-5 w-5 animate-spin mr-2" /> AI is designing your gift...</>
        ) : credits < COST ? (
          "Not enough credits"
        ) : (
          <><Wand2 className="h-5 w-5 mr-2" /> Design Gift — 💎 {COST}</>
        )}
      </Button>

      {/* Result */}
      <AnimatePresence>
        {designedGift && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-lg">
              <div className="text-center mb-4">
                <motion.span
                  animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl block mb-3"
                >
                  {designedGift.emoji}
                </motion.span>
                <h3 className="text-xl font-bold text-gray-800">{designedGift.name}</h3>
                <p className="text-amber-600 font-bold mt-1">Suggested value: 💎 {designedGift.value} credits</p>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{designedGift.description}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`${designedGift.emoji} ${designedGift.name}: ${designedGift.description}`);
                    toast({ title: "Copied to clipboard!" });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
                <Button onClick={designGift} variant="outline" className="flex-1" disabled={isDesigning}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Redesign
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <Card className="p-4 bg-white/80 border-purple-200 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" /> About AI Gift Designer
        </h3>
        <p className="text-sm text-gray-600">
          Our AI uses GPT-4o-mini to create unique, personalized gift concepts. Each design is one-of-a-kind — 
          you'll never get the same result twice! Use the generated concept as inspiration for your next gift.
        </p>
      </Card>
    </div>
    </>
  );
};
