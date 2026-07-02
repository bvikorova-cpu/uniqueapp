import { useState } from "react";
import { ArrowLeft, Loader2, Sparkles, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const SmartAlertsView = ({ onBack }: { onBack: () => void }) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) { toast.error("Please describe your preferences"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("auction-ai", {
        body: { action: "smart_alerts", preferences: input },
      });
      if (error) throw error;
      setResult(data.result);
    } catch (err: any) { toast.error(err.message || "Alert setup failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Smart Alerts View - How it works"} steps={[{ title: 'Open', desc: 'Access the Smart Alerts View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Smart Alerts View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 rounded-2xl text-white mb-6">
            <div className="flex items-center gap-3 mb-2"><Bell className="w-7 h-7" /><h1 className="text-2xl sm:text-3xl font-black">AI Smart Alerts</h1></div>
            <p className="text-white/80 text-sm">Never miss a great deal with intelligent notifications</p>
            <Badge className="mt-2 bg-white/20 text-white border-0">3 Credits per setup</Badge>
          </div>
        </motion.div>
        <Card className="p-6 border-amber-500/20 bg-card/80 backdrop-blur-sm">
          <Textarea placeholder="Describe what you're looking for: budget range, categories of interest, brands you follow, condition preferences, desired discount %, etc..." value={input} onChange={(e) => setInput(e.target.value)} rows={6} className="resize-none mb-4 border-amber-500/20 focus:border-amber-400/40" />
          <Button onClick={handleSubmit} disabled={loading || !input.trim()} className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Smart Alerts (3 Credits)</>}
          </Button>
        </Card>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-yellow-950/20 to-background">
              <h2 className="text-xl font-bold mb-4 text-yellow-400">Your Smart Alert Plan</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
    </>
  );
};
