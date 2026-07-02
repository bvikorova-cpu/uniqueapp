import { useState } from "react";
import { ArrowLeft, Loader2, Sparkles, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAnalyzerCredits } from "@/hooks/useAnalyzerCredits";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const ComparisonView = ({ onBack }: { onBack: () => void }) => {
  const [item1, setItem1] = useState("");
  const [item2, setItem2] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { credits, isLoading } = useAnalyzerCredits();

  const handleCompare = async () => {
    if (!item1.trim() || !item2.trim()) {
      toast.error("Please describe both items to compare");
      return;
    }
    if (!credits || credits.credits_remaining < 4) {
      toast.error("Insufficient credits. You need 4 credits.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyzer-ai", {
        body: { action: "comparison", item1, item2 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const remaining = Math.max(0, (credits?.credits_remaining ?? 0) - 4);
        await supabase.from("analyzer_credits").update({ credits_remaining: remaining }).eq("user_id", user.id);
      }
    } catch (err: any) {
      toast.error(err.message || "Comparison failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Comparison View - How it works"} steps={[{ title: 'Open', desc: 'Access the Comparison View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Comparison View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
            {isLoading ? "..." : credits?.credits_remaining || 0} Credits
          </Badge>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-6 rounded-2xl text-white mb-6">
            <div className="flex items-center gap-3 mb-2">
              <GitCompare className="w-7 h-7" />
              <h1 className="text-2xl sm:text-3xl font-black">AI Comparison Mode</h1>
            </div>
            <p className="text-white/80 text-sm">Compare two items side-by-side with detailed AI analysis</p>
            <Badge className="mt-2 bg-white/20 text-white border-0">4 Credits per comparison</Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border-cyan-500/20">
            <h3 className="font-bold mb-2 text-cyan-400">Item 1</h3>
            <Textarea
              placeholder="Describe the first item (e.g., iPhone 15 Pro, 256GB, Space Black, mint condition)"
              value={item1}
              onChange={(e) => setItem1(e.target.value)}
              rows={5}
              className="resize-none border-cyan-500/20"
            />
          </Card>
          <Card className="p-4 border-cyan-500/20">
            <h3 className="font-bold mb-2 text-blue-400">Item 2</h3>
            <Textarea
              placeholder="Describe the second item (e.g., Samsung Galaxy S24 Ultra, 256GB, Titanium Gray, new)"
              value={item2}
              onChange={(e) => setItem2(e.target.value)}
              rows={5}
              className="resize-none border-blue-500/20"
            />
          </Card>
        </div>

        <Button
          onClick={handleCompare}
          disabled={loading || !item1.trim() || !item2.trim()}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
        >
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Comparing...</> : <><Sparkles className="w-4 h-4 mr-2" /> Compare Items (4 Credits)</>}
        </Button>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-background">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Comparison Result</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
    </>
  );
};
