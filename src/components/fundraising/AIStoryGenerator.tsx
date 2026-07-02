import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Copy, Check, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  campaignType: "medical" | "crisis" | "pet" | "student" | "dream" | "hero" | "talent";
  onGenerated?: (data: { title: string; story: string; appeal: string }) => void;
  trigger?: React.ReactNode;
}

const COST = 5;

export function AIStoryGenerator({ campaignType, onGenerated, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [tone, setTone] = useState("emotional");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; story: string; appeal: string } | null>(null);
  const [copied, setCopied] = useState<"title" | "story" | "appeal" | null>(null);

  const handleGenerate = async () => {
    if (summary.trim().length < 10) {
      toast({ title: "Add more detail", description: "Please write at least a short summary (10+ chars).", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Login required", description: "Please log in to use the AI Story Generator.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("generate-campaign-story", {
        body: {
          campaignType,
          summary: summary.trim(),
          tone,
          beneficiaryName: beneficiaryName.trim() || undefined,
          goalAmount: goalAmount ? Number(goalAmount) : undefined,
        },
      });

      if (error) throw error;
      if ((data as any)?.error === "insufficient_credits") {
        toast({
          title: "Not enough credits",
          description: (data as any).message || `You need ${COST} credits.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      setResult({ title: data.title, story: data.story, appeal: data.appeal });
      onGenerated?.({ title: data.title, story: data.story, appeal: data.appeal });
      toast({ title: "Story generated!", description: `${COST} credits used. ${data.credits_remaining} remaining.` });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Generation failed",
        description: e?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (kind: "title" | "story" | "appeal", text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Story Generator - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Story Generator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Story Generator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="gap-2 border-amber-400/40 hover:bg-amber-500/10">
            <Wand2 className="h-4 w-4 text-amber-500" />
            AI Story Writer
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 font-bold border border-amber-500/40">
              {COST} credits
            </span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            AI Campaign Story Writer
          </DialogTitle>
          <DialogDescription>
            Describe your situation in a few sentences — the AI will write a compelling, donor-ready story. Costs {COST} credits per generation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label>Brief summary <span className="text-destructive">*</span></Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="E.g.: My 8yo daughter Mia was diagnosed with leukemia last month. Treatment will cost €25,000 not covered by insurance. She needs to start chemo in 3 weeks..."
              rows={5}
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">{summary.length} chars · minimum 10</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Beneficiary name</Label>
              <Input
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                placeholder="Optional"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Goal amount (€)</Label>
              <Input
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                placeholder="Optional"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="emotional">💝 Emotional & heartfelt</SelectItem>
                <SelectItem value="hopeful">🌅 Hopeful & uplifting</SelectItem>
                <SelectItem value="urgent">🆘 Urgent (time-sensitive)</SelectItem>
                <SelectItem value="grateful">🙏 Grateful & warm</SelectItem>
                <SelectItem value="inspiring">⭐ Inspiring & motivational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || summary.trim().length < 10}
            className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:via-rose-600 hover:to-purple-700 text-white font-bold"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing your story…</>
            ) : (
              <><Wand2 className="mr-2 h-4 w-4" /> Generate Story ({COST} credits)</>
            )}
          </Button>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-3 mt-4"
            >
              <Card className="p-4 border-amber-500/30 bg-amber-500/5">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <Label className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300">Title</Label>
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleCopy("title", result.title)}>
                    {copied === "title" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <p className="font-bold text-lg leading-tight">{result.title}</p>
              </Card>

              <Card className="p-4 border-purple-500/30 bg-purple-500/5">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <Label className="text-xs uppercase tracking-wider text-purple-700 dark:text-purple-300">Story</Label>
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleCopy("story", result.story)}>
                    {copied === "story" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{result.story}</p>
              </Card>

              <Card className="p-4 border-rose-500/30 bg-rose-500/5">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <Label className="text-xs uppercase tracking-wider text-rose-700 dark:text-rose-300">Donation appeal</Label>
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleCopy("appeal", result.appeal)}>
                    {copied === "appeal" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <p className="text-sm italic">{result.appeal}</p>
              </Card>

              <p className="text-xs text-center text-muted-foreground">
                ✨ Tip: Edit the text before posting to add your personal voice and specific details.
              </p>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
