import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Loader2, Download, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onCreditsUsed: () => void; }

export const BatchGenerationView = ({ onCreditsUsed }: Props) => {
  const [prompts, setPrompts] = useState<string[]>([""]);
  const [results, setResults] = useState<{ prompt: string; imageUrl: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const addPrompt = () => { if (prompts.length < 10) setPrompts([...prompts, ""]); };
  const removePrompt = (i: number) => setPrompts(prompts.filter((_, idx) => idx !== i));
  const updatePrompt = (i: number, val: string) => { const p = [...prompts]; p[i] = val; setPrompts(p); };

  const validPrompts = prompts.filter(p => p.trim());
  const totalCost = validPrompts.length * 5;

  const generate = async () => {
    if (validPrompts.length === 0) return toast.error("Add at least one prompt");
    setLoading(true);
    setResults([]);
    setProgress(0);

    const newResults: { prompt: string; imageUrl: string }[] = [];
    for (let i = 0; i < validPrompts.length; i++) {
      try {
        const { data, error } = await supabase.functions.invoke("ai-image-tools", {
          body: { action: "generate", prompt: validPrompts[i] },
        });
        if (error) throw error;
        if (data?.imageUrl) newResults.push({ prompt: validPrompts[i], imageUrl: data.imageUrl });
      } catch (e: any) {
        toast.error(`Failed: "${validPrompts[i].substring(0, 30)}..."`);
      }
      setProgress(i + 1);
      setResults([...newResults]);
    }
    onCreditsUsed();
    toast.success(`Generated ${newResults.length}/${validPrompts.length} images!`);
    setLoading(false);
  };

  return (
    <>
      <FloatingHowItWorks title={"Batch Generation View - How it works"} steps={[{ title: 'Open', desc: 'Access the Batch Generation View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Batch Generation View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-2">📦 Batch Generation</h2>
        <p className="text-muted-foreground text-sm">Generate up to 10 images at once. Cost: 5 CR per image</p>
      </div>

      <div className="space-y-2">
        {prompts.map((p, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-xs text-muted-foreground w-6 pt-2.5 text-right">{i + 1}.</span>
            <Input value={p} onChange={(e) => updatePrompt(i, e.target.value)} placeholder={`Prompt ${i + 1}...`} className="flex-1" />
            {prompts.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removePrompt(i)} className="shrink-0"><X className="w-4 h-4" /></Button>
            )}
          </div>
        ))}
        {prompts.length < 10 && (
          <Button variant="outline" size="sm" onClick={addPrompt} className="gap-1 ml-8"><Plus className="w-3 h-3" /> Add Prompt</Button>
        )}
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-card/80 border">
        <div>
          <p className="text-sm font-bold">{validPrompts.length} images queued</p>
          <p className="text-xs text-muted-foreground">Total cost: {totalCost} CR</p>
        </div>
        <Button onClick={generate} disabled={loading || validPrompts.length === 0} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
          {loading ? `${progress}/${validPrompts.length}` : `Generate All (${totalCost} CR)`}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {results.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border overflow-hidden group relative">
              <img src={r.imageUrl} alt={r.prompt} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                <p className="text-white text-[10px] text-center mb-2 line-clamp-2">{r.prompt}</p>
                <a href={r.imageUrl} download={`batch-${i + 1}.webp`}>
                  <Button size="sm" variant="secondary" className="gap-1"><Download className="w-3 h-3" /> Save</Button>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};
