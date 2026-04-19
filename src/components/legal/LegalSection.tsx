import { useState, ReactNode } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface LegalSectionProps {
  id: string;
  number: string;
  title: string;
  documentType: string;
  children: ReactNode;
  rawText: string;
}

export const LegalSection = ({ id, number, title, documentType, children, rawText }: LegalSectionProps) => {
  const { toast } = useToast();
  const [tldr, setTldr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTldr, setShowTldr] = useState(false);

  const generateTldr = async () => {
    if (tldr) { setShowTldr((v) => !v); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("legal-ai", {
        body: { mode: "tldr", documentType, documentText: rawText },
      });
      if (error) {
        toast({ title: "Couldn't summarize", description: (error as any)?.message ?? "", variant: "destructive" });
        return;
      }
      setTldr((data as any)?.answer ?? "");
      setShowTldr(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id={id} className="scroll-mt-24">
      <Card className="p-5 sm:p-7 bg-card/80 backdrop-blur-sm border-amber-400/15 hover:border-amber-400/30 transition-colors">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-amber-400/40 text-amber-400 font-bold">{number}</Badge>
            <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={generateTldr} disabled={loading} className="border-amber-400/30 text-amber-400 hover:bg-amber-500/10">
            {loading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2" />}
            {showTldr && tldr ? "Hide TL;DR" : "TL;DR (2 cr)"}
          </Button>
        </div>

        {showTldr && tldr && (
          <div className="mb-4 p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-400/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Plain English Summary</span>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{tldr}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground prose-strong:text-foreground prose-headings:text-foreground">
          {children}
        </div>
      </Card>
    </section>
  );
};
