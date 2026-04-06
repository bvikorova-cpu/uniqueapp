import { useState } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAnalyzerCredits } from "@/hooks/useAnalyzerCredits";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

interface AnalyzerToolLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  creditCost: number;
  placeholder: string;
  gradient: string;
  onBack: () => void;
  buildBody: (input: string) => Record<string, any>;
  children?: React.ReactNode;
}

export const AnalyzerToolLayout = ({
  title, description, icon, action, creditCost, placeholder, gradient, onBack, buildBody, children
}: AnalyzerToolLayoutProps) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { credits, isLoading: creditsLoading } = useAnalyzerCredits();

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast.error("Please provide input");
      return;
    }
    if (!credits || credits.credits_remaining < creditCost) {
      toast.error(`Insufficient credits. You need ${creditCost} credits.`);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyzer-ai", {
        body: { action, ...buildBody(input) },
      });
      if (error) throw error;
      setResult(data.result);
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
            {creditsLoading ? "..." : credits?.credits_remaining || 0} Credits
          </Badge>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`bg-gradient-to-r ${gradient} p-6 rounded-2xl text-white mb-6`}>
            <div className="flex items-center gap-3 mb-2">
              {icon}
              <h1 className="text-2xl sm:text-3xl font-black">{title}</h1>
            </div>
            <p className="text-white/80 text-sm">{description}</p>
            <Badge className="mt-2 bg-white/20 text-white border-0">
              {creditCost} Credits per analysis
            </Badge>
          </div>
        </motion.div>

        {children}

        <Card className="p-6 border-cyan-500/20 bg-card/80 backdrop-blur-sm">
          <Textarea
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            className="resize-none mb-4 border-cyan-500/20 focus:border-cyan-400/40"
          />
          <Button
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Analyze ({creditCost} Credits)</>
            )}
          </Button>
        </Card>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-background">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Analysis Result</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
