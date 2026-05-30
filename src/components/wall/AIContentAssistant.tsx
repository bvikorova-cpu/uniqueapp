import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Wand2, 
  Hash, 
  Type, 
  BarChart2, 
  Loader2, 
  Sparkles, 
  Copy, 
  Check,
  Coins,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIContentAssistantProps {
  content: string;
  onInsertContent?: (text: string) => void;
  onInsertHashtags?: (tags: string[]) => void;
}

type AITool = "hashtags" | "caption" | "sentiment";

interface CaptionResult {
  text: string;
  tone: string;
}

interface SentimentResult {
  sentiment: string;
  score: number;
  emotions: string[];
  suggestion: string;
}

export function AIContentAssistant({ content, onInsertContent, onInsertHashtags }: AIContentAssistantProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<AITool | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [captions, setCaptions] = useState<CaptionResult[]>([]);
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const { credits, spendCredit } = useAICredits();
  const { toast } = useToast();

  const callAI = async (type: AITool) => {
    if (!content.trim()) {
      toast({ title: "First write content", description: "AI needs text to analyze.", variant: "destructive" });
      return;
    }

    const hasCredit = await spendCredit("custom_generation", `Wall AI: ${type}`);
    if (!hasCredit) {
      toast({ title: "Insufficient credits", description: "Buy credits for AI features.", variant: "destructive" });
      return;
    }

    setLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke("wall-ai-assistant", {
        body: { type, content, language: "sk" },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const result = data.result;

      if (type === "hashtags") setHashtags(result.hashtags || []);
      else if (type === "caption") setCaptions(result.captions || []);
      else if (type === "sentiment") setSentiment(result);
    } catch (err: any) {
      toast({ title: "AI error", description: err.message || "Try again.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const sentimentColor = (s: string) => {
    switch (s) {
      case "positive": return "text-green-500";
      case "negative": return "text-red-500";
      case "neutral": return "text-muted-foreground";
      case "mixed": return "text-yellow-500";
      default: return "";
    }
  };

  const sentimentEmoji = (s: string) => {
    switch (s) {
      case "positive": return "😊";
      case "negative": return "😔";
      case "neutral": return "😐";
      case "mixed": return "🤔";
      default: return "❓";
    }
  };

  const tools: { type: AITool; label: string; icon: typeof Hash; color: string; cost: number }[] = [
    { type: "hashtags", label: "Hashtagy", icon: Hash, color: "text-blue-500", cost: 1 },
    { type: "caption", label: "Titulky", icon: Type, color: "text-purple-500", cost: 1 },
    { type: "sentiment", label: "Sentiment", icon: BarChart2, color: "text-green-500", cost: 1 },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="flex-shrink-0 flex-col h-auto py-1 px-1 hover:bg-amber-500/10 rounded-lg transition-all group"
        >
          <div className="p-1 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-all">
            <Wand2 className="h-3.5 w-3.5 text-amber-600" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            AI Content Asistent
            <Badge variant="secondary" className="ml-auto text-xs">
              <Coins className="w-3 h-3 mr-1" />
              {credits.credits_remaining} credits
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {!content.trim() && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-sm">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>First write the post text, then use AI tools.</span>
          </div>
        )}

        {/* Tool buttons */}
        <div className="grid grid-cols-3 gap-2">
          {tools.map((tool) => (
            <Button
              key={tool.type}
              variant="outline"
              className="flex-col h-auto py-3 gap-1.5 hover:bg-accent/50"
              onClick={() => callAI(tool.type)}
              disabled={loading !== null || !content.trim()}
            >
              {loading === tool.type ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <tool.icon className={`h-5 w-5 ${tool.color}`} />
              )}
              <span className="text-xs font-medium">{tool.label}</span>
              <span className="text-[10px] text-muted-foreground">{tool.cost} credit{tool.cost === 1 ? "" : "s"}</span>
            </Button>
          ))}
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {/* Hashtags */}
          {hashtags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Suggested hashtags</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => {
                    onInsertHashtags?.(hashtags);
                    const tagString = hashtags.map(t => `#${t}`).join(" ");
                    onInsertContent?.(tagString);
                    toast({ title: "Hashtags added!" });
                  }}
                >
                  Add all
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => {
                      onInsertContent?.(`#${tag} `);
                      toast({ title: `#${tag} added!` });
                    }}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* Captions */}
          {captions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <span className="text-sm font-semibold">Suggested captions</span>
              {captions.map((cap, i) => (
                <Card key={i} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">{cap.tone}</Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => copyText(cap.text)}
                      >
                        {copied === cap.text ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => {
                          onInsertContent?.(cap.text);
                          toast({ title: "Caption inserted!" });
                          setOpen(false);
                        }}
                      >
                        Use
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm">{cap.text}</p>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Sentiment */}
          {sentiment && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{sentimentEmoji(sentiment.sentiment)}</span>
                  <div>
                    <p className={`font-bold capitalize ${sentimentColor(sentiment.sentiment)}`}>
                      {sentiment.sentiment}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Score: {(sentiment.score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sentiment.emotions.map((e) => (
                    <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground border-t pt-2">
                  💡 {sentiment.suggestion}
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
