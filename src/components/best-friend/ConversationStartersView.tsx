import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { MessageSquarePlus, Loader2, Sparkles, Lightbulb, Copy } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const ConversationStartersView = () => {
  const { toast } = useToast();
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-ai", {
        body: { action: "conversation_starters", context: context.trim() || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast({ title: "Starters Generated! 🎉" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyStarter = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Conversation starter copied to clipboard" });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Conversation Starters View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
            <MessageSquarePlus className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            AI Conversation Starters
          </h2>
          <p className="text-muted-foreground mt-2">Never run out of things to talk about — AI generates personalized icebreakers</p>
          <Badge variant="outline" className="mt-2">2 Credits per generation</Badge>
        </div>
      </motion.div>

      <Card className="bg-card/80 backdrop-blur-xl border-indigo-500/20">
        <CardHeader><CardTitle className="text-lg">Generate Starters</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input value={context} onChange={(e) => setContext(e.target.value)}
            placeholder="Optional: your interests (e.g., music, travel, gaming)..." />
          <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600" size="lg">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              : <><Sparkles className="h-4 w-4 mr-2" /> Generate Starters</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {result.theme && (
            <div className="text-center">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">Theme: {result.theme}</Badge>
            </div>
          )}

          <div className="grid gap-3">
            {result.starters?.map((s: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="bg-card/80 backdrop-blur-xl hover:border-indigo-500/40 transition-all cursor-pointer group"
                  onClick={() => copyStarter(s.text)}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <span className="text-2xl">{s.emoji}</span>
                    <div className="flex-1">
                      <Badge variant="outline" className="text-[10px] mb-1">{s.category}</Badge>
                      <p className="text-sm">{s.text}</p>
                    </div>
                    <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {result.tip && (
            <Card className="bg-indigo-500/10 border-indigo-500/20">
              <CardContent className="p-4 flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{result.tip}</p>
              </CardContent>
            </Card>
          )}

          <Badge variant="outline" className="text-xs">Credits remaining: {result.credits_remaining}</Badge>
        </motion.div>
      )}
    </div>
  );
};
