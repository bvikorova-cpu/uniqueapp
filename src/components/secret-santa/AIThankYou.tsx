import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useSecretSanta } from "@/hooks/useSecretSanta";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2, Copy, RefreshCw, Zap, MessageCircle, Send, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const THANK_YOU_STYLES = [
  { id: "heartfelt", label: "Heartfelt", emoji: "💕", desc: "Sincere and emotional" },
  { id: "funny", label: "Funny", emoji: "😄", desc: "Lighthearted and playful" },
  { id: "formal", label: "Formal", emoji: "🎩", desc: "Polite and professional" },
  { id: "poetic", label: "Poetic", emoji: "📝", desc: "Beautiful and artistic" },
  { id: "excited", label: "Excited", emoji: "🎉", desc: "Enthusiastic and energetic" },
  { id: "grateful", label: "Grateful", emoji: "🙏", desc: "Deep appreciation" },
];

export const AIThankYou = () => {
  const { credits, receivedGifts } = useSecretSanta();
  const queryClient = useQueryClient();
  const [selectedStyle, setSelectedStyle] = useState("heartfelt");
  const [selectedGift, setSelectedGift] = useState<string>("");
  const [customContext, setCustomContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const COST = 3;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
  }, []);

  const recentGifts = receivedGifts.slice(0, 10);

  const generateThankYou = async () => {
    if (credits < COST) {
      toast.error(`Not enough credits. You need ${COST} credits.`);
      return;
    }

    setIsGenerating(true);
    setGeneratedMessage(null);

    try {
      const gift = recentGifts.find((g: any) => g.id === selectedGift);
      const giftInfo = gift ? `Gift received: ${(gift as any).gift_emoji} ${(gift as any).gift_type}` : "";

      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "thank_you",
          style: selectedStyle,
          customPrompt: `Write a thank you message for a gift I received. ${giftInfo} ${customContext ? `Additional context: ${customContext}` : ""}`,
          giftType: gift ? (gift as any).gift_type : undefined,
        },
      });

      if (error) throw error;
      setGeneratedMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["secret-santa-credits"] });
      toast.success("Thank you message generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate message");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentUserId) {
    return (
    <>
      <FloatingHowItWorks title={"A I Thank You - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Thank You section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Thank You.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-8 bg-white/90 border-amber-200 text-center">
        <Heart className="h-12 w-12 mx-auto text-pink-400 mb-4" />
        <p className="text-gray-600">Please log in to use AI Thank You</p>
      </Card>
    </>
  );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-white/80 backdrop-blur-xl border-rose-200 text-center shadow-lg">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
          <Heart className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Thank You Generator</h2>
        <p className="text-gray-500 text-sm">Let AI craft the perfect thank you message for gifts you've received</p>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold">
          <Zap className="h-3 w-3" /> Costs {COST} credits per message
        </div>
      </Card>

      {/* Select Gift */}
      {recentGifts.length > 0 && (
        <Card className="p-4 bg-white/80 border-rose-200 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-rose-500" /> Select a Gift to Thank For
          </h3>
          <Select value={selectedGift} onValueChange={setSelectedGift}>
            <SelectTrigger className="border-rose-200">
              <SelectValue placeholder="Choose a received gift (optional)" />
            </SelectTrigger>
            <SelectContent>
              {recentGifts.map((gift: any) => (
                <SelectItem key={gift.id} value={gift.id}>
                  {gift.gift_emoji} {gift.gift_type?.replace(/_/g, " ")} — from {gift.is_anonymous ? "Secret Santa" : "a friend"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      )}

      {/* Style Selection */}
      <Card className="p-4 bg-white/80 border-rose-200 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">Choose Tone</h3>
        <div className="grid grid-cols-3 gap-2">
          {THANK_YOU_STYLES.map(s => (
            <motion.div key={s.id} whileTap={{ scale: 0.97 }}>
              <Card
                onClick={() => setSelectedStyle(s.id)}
                className={`p-3 cursor-pointer transition-all text-center ${
                  selectedStyle === s.id
                    ? "bg-gradient-to-br from-rose-500 to-pink-500 text-white border-transparent shadow-lg"
                    : "bg-white border-gray-200 hover:border-rose-300"
                }`}
              >
                <span className="text-xl block mb-1">{s.emoji}</span>
                <p className={`text-xs font-bold ${selectedStyle === s.id ? "text-white" : "text-gray-700"}`}>{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Custom context */}
      <Card className="p-4 bg-white/80 border-rose-200 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-2">Add Personal Context (Optional)</h3>
        <Textarea
          placeholder="E.g., 'We've been friends for 10 years' or 'They helped me through a tough time'..."
          value={customContext}
          onChange={e => setCustomContext(e.target.value)}
          className="bg-white border-rose-200 min-h-[60px]"
          maxLength={200}
        />
      </Card>

      {/* Generate Button */}
      <Button
        onClick={generateThankYou}
        disabled={isGenerating || credits < COST}
        className="w-full py-6 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-rose-500/30"
      >
        {isGenerating ? (
          <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Generating thank you...</>
        ) : credits < COST ? (
          "Not enough credits"
        ) : (
          <><Sparkles className="h-5 w-5 mr-2" /> Generate Thank You — 💎 {COST}</>
        )}
      </Button>

      {/* Result */}
      <AnimatePresence>
        {generatedMessage && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-300 shadow-lg">
              <div className="text-center mb-3">
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl block"
                >
                  💌
                </motion.span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed italic text-center mb-4">
                "{generatedMessage}"
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedMessage);
                    toast.success("Copied to clipboard!");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
                <Button
                  onClick={generateThankYou}
                  variant="outline"
                  className="flex-1"
                  disabled={isGenerating}
                >
                  <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <Card className="p-4 bg-rose-50 border-rose-200 shadow-sm">
        <h3 className="font-bold text-rose-800 mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> About AI Thank You
        </h3>
        <p className="text-sm text-rose-700">
          AI crafts personalized thank you messages based on the gift you received, the selected tone, and any personal context. 
          Each generation costs {COST} credits and produces a unique, heartfelt response.
        </p>
      </Card>
    </div>
  );
};
