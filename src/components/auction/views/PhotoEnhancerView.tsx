import { useState } from "react";
import { ArrowLeft, Loader2, Sparkles, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const PhotoEnhancerView = ({ onBack }: { onBack: () => void }) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) { toast.error("Please describe the item"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("auction-ai", {
        body: { action: "photo_enhancer", item_description: input },
      });
      if (error) throw error;
      setResult(data.result);
    } catch (err: any) { toast.error(err.message || "Enhancement failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Photo Enhancer View - How it works"} steps={[{ title: 'Open', desc: 'Access the Photo Enhancer View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Photo Enhancer View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-gradient-to-r from-purple-600 to-amber-600 p-6 rounded-2xl text-white mb-6">
            <div className="flex items-center gap-3 mb-2"><Camera className="w-7 h-7" /><h1 className="text-2xl sm:text-3xl font-black">AI Photo Enhancer</h1></div>
            <p className="text-white/80 text-sm">Get pro photography tips to make your listings shine</p>
            <Badge className="mt-2 bg-white/20 text-white border-0">3 Credits per guide</Badge>
          </div>
        </motion.div>
        <Card className="p-6 border-amber-500/20 bg-card/80 backdrop-blur-sm">
          <Textarea placeholder="Describe the item you want to photograph: type, size, material, color, special features. Also mention your equipment (phone/camera) and available lighting..." value={input} onChange={(e) => setInput(e.target.value)} rows={6} className="resize-none mb-4 border-amber-500/20 focus:border-amber-400/40" />
          <Button onClick={handleSubmit} disabled={loading || !input.trim()} className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating tips...</> : <><Sparkles className="w-4 h-4 mr-2" /> Get Photo Guide (3 Credits)</>}
          </Button>
        </Card>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-purple-950/20 to-background">
              <h2 className="text-xl font-bold mb-4 text-purple-400">Photography Guide</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
    </>
  );
};
