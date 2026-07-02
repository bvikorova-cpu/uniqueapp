import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Sparkles, LucideIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  onBack: () => void;
  title: string;
  desc: string;
  icon: LucideIcon;
  action: string;
  credits: number;
  placeholder?: string;
}

export default function GenericInfluView({ onBack, title, description, icon: Icon, action, credits, placeholder }: Props) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!input.trim()) { toast.error("Please enter some details"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("influ-king-ai", {
        body: { action, input },
      });
      if (error) throw error;
      setResult(data.result || data.text || JSON.stringify(data, null, 2));
      toast.success("Generated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title="How AI Tool works"
        steps={[
          { title: 'Describe what you need', desc: 'Give the AI clear context.' },
          { title: 'Generate', desc: 'Costs a few credits per run.' },
          { title: 'Review output', desc: 'Copy, refine, or regenerate.' },
          { title: 'Use it', desc: 'Publish, share, or iterate.' },
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="h-8 w-8 text-cyan-400" />
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <Card className="p-6 space-y-4 border-cyan-500/20">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder || "Describe what you need..."}
          rows={4}
        />
        <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-purple-600">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Generate ({credits} credits)
        </Button>
      </Card>

      {result && (
        <Card className="p-6 border-cyan-500/10">
          <h3 className="font-bold text-sm mb-3">Result</h3>
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">{result}</div>
        </Card>
      )}
    </div>
    </>
  );
}
