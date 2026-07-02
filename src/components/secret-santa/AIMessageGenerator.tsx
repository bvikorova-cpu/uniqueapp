import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Wand2, Copy, RefreshCw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const MESSAGE_STYLES = [
  { id: "romantic", label: "Romantic", emoji: "💕", description: "Sweet and loving" },
  { id: "funny", label: "Funny", emoji: "😂", description: "Humorous and playful" },
  { id: "heartfelt", label: "Heartfelt", emoji: "💖", description: "Deep and sincere" },
  { id: "friendly", label: "Friendly", emoji: "🤝", description: "Warm and casual" },
  { id: "poetic", label: "Poetic", emoji: "📜", description: "Artistic and beautiful" },
  { id: "motivational", label: "Motivational", emoji: "💪", description: "Inspiring and uplifting" },
];

interface AIMessageGeneratorProps {
  onSelectMessage: (message: string) => void;
  giftType?: string;
  recipientName?: string;
}

export const AIMessageGenerator = ({ onSelectMessage, giftType, recipientName }: AIMessageGeneratorProps) => {
  const { toast } = useToast();
  const [selectedStyle, setSelectedStyle] = useState<string>("heartfelt");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const generateMessage = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          style: selectedStyle,
          customPrompt,
          giftType,
          recipientName,
        },
      });

      if (error) throw error;

      setGeneratedMessage(data.message);

      // Save to history
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("social_gifts_ai_messages").insert({
          user_id: user.id,
          message_type: selectedStyle,
          prompt: customPrompt || null,
          generated_message: data.message,
        });
      }
    } catch (error) {
      toast({
        title: "Failed to generate message",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast({ title: "Copied to clipboard!" });
  };

  const useMessage = () => {
    onSelectMessage(generatedMessage);
    setIsExpanded(false);
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Message Generator - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Message Generator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Message Generator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-3">
      {/* Toggle button */}
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between border-purple-200 text-purple-700 hover:bg-purple-50"
      >
        <span className="flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          AI Message Generator — 💎 3 credits
        </span>
        <Sparkles className="h-4 w-4" />
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200 space-y-4">
              {/* Style selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Message Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MESSAGE_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        selectedStyle === style.id
                          ? "bg-purple-500 text-white shadow-md"
                          : "bg-white hover:bg-purple-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      <span className="text-xl block">{style.emoji}</span>
                      <span className="text-xs font-medium">{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom prompt */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Additional context (optional)
                </label>
                <Textarea
                  placeholder="e.g., Thank them for their help last week..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="bg-white border-purple-200 min-h-[60px] text-sm"
                  maxLength={200}
                />
              </div>

              {/* Generate button */}
              <Button
                onClick={generateMessage}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Message
                  </>
                )}
              </Button>

              {/* Generated message */}
              {generatedMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg p-4 border border-purple-200"
                >
                  <p className="text-gray-700 italic">"{generatedMessage}"</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyToClipboard}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={generateMessage}
                      disabled={isGenerating}
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      onClick={useMessage}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      Use This
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};
