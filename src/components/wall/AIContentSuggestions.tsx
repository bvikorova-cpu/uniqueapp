import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Suggestion {
  text: string;
  tone: string;
}

export const AIContentSuggestions = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const { toast } = useToast();

  const topics = [
    "business tip for entrepreneurs",
    "motivational insight about success",
    "productivity hack for busy founders",
    "leadership lesson from experience",
    "industry trend observation",
  ];

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const { data, error } = await supabase.functions.invoke("wall-ai-assistant", {
        body: { type: "caption", content: topic, language: "sk" },
      });

      if (error) throw error;
      if (data?.result?.captions) {
        setSuggestions(data.result.captions);
      }
    } catch (err) {
      console.error("AI suggestions error:", err);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa načítať AI návrhy",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    toast({ title: "Skopírované!", description: "Text bol skopírovaný do schránky" });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">AI návrhy príspevkov</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSuggestions}
          disabled={loading}
          className="h-7 text-xs"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <RefreshCw className="w-3 h-3 mr-1" />
          )}
          {suggestions.length ? "Nové" : "Generovať"}
        </Button>
      </div>

      {suggestions.length === 0 && !loading && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Klikni na "Generovať" pre AI návrhy obsahu
        </p>
      )}

      <AnimatePresence mode="wait">
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <motion.div
              key={`${s.tone}-${i}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <span className="inline-block text-[10px] font-medium text-primary/80 uppercase tracking-wider mb-1">
                    {s.tone === "casual" ? "💬 Casual" : s.tone === "professional" ? "💼 Profesionálny" : "🎉 Zábavný"}
                  </span>
                  <p className="text-xs leading-relaxed">{s.text}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(s.text, i)}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  {copied === i ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </Card>
  );
};
