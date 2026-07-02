import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, BookOpen, Loader2, Sparkles, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const POPULAR = ["Dragon", "Phoenix", "Rose", "Skull", "Koi Fish", "Mandala", "Compass", "Anchor", "Wolf", "Lotus", "Snake", "Lion"];

export const TattooMeaningEncyclopedia = ({ onBack }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ meaning: string } | null>(null);

  const lookup = async (symbol?: string) => {
    const term = symbol || query;
    if (!term) { toast.error("Enter a tattoo symbol or motif"); return; }
    if (credits.credits_remaining < 5) {
      toast.error("You need 5 credits. Redirecting...");
      setTimeout(() => navigate("/ai-credits"), 1500);
      return;
    }

    setLoading(true);
    setQuery(term);
    try {
      const { data, error } = await supabase.functions.invoke("tattoo-ai-tools", {
        body: { type: "meaning_lookup", symbol: term },
      });
      if (error) throw error;
      setResult(data);
      await refresh();
      toast.success("Meaning research complete!");
    } catch (e: any) {
      toast.error(e.message || "Error looking up meaning");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Tattoo Meaning Encyclopedia - How it works"} steps={[{ title: 'Open', desc: 'Access the Tattoo Meaning Encyclopedia section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tattoo Meaning Encyclopedia.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-amber-400 hover:text-amber-300">
        <ArrowLeft className="h-4 w-4" /> Back to Atelier
      </Button>

      <Card className="p-6 max-w-3xl mx-auto bg-card/80 backdrop-blur-xl border-amber-500/20 shadow-[0_0_30px_rgba(212,175,55,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Meaning Encyclopedia</h2>
            <p className="text-muted-foreground text-sm">Discover the history & symbolism behind any motif</p>
          </div>
          <span className="ml-auto text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">5 Credits</span>
        </motion.div>

        <div className="space-y-4">
          <div>
            <Label className="text-amber-400/80 font-semibold">Search Symbol or Motif</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/50" />
              <Input
                placeholder="e.g., Phoenix, Ouroboros, Cherry Blossom..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookup()}
                className="pl-10 border-amber-500/20 focus:border-amber-500/50 bg-background/50"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Popular Symbols</Label>
            <div className="flex flex-wrap gap-2">
              {POPULAR.map((s) => (
                <Button
                  key={s} size="sm" variant="outline"
                  onClick={() => lookup(s)}
                  className={`text-xs border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5 ${query === s ? "bg-amber-500/10 border-amber-500/40" : ""}`}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={() => lookup()} disabled={loading} className="w-full gap-2 h-12 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold text-base shadow-lg shadow-amber-500/20">
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Researching...</> : <><Sparkles className="h-5 w-5" /> Discover Meaning — 5 Credits</>}
          </Button>

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5 mt-2 bg-gradient-to-br from-amber-500/5 to-yellow-600/5 border-amber-500/20">
                <h3 className="font-black text-lg mb-3 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">"{query}" — Full Research</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">{result.meaning}</div>
              </Card>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
    </>
  );
};
