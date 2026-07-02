import { useState } from "react";
import { Share2, Loader2, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCreateSocialCard } from "@/hooks/useLieDetectorPro";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function SocialCardGenerator() {
  const [quote, setQuote] = useState("");
  const [score, setScore] = useState(50);
  const m = useCreateSocialCard();

  return (
    <>
      <FloatingHowItWorks title={"Social Card Generator - How it works"} steps={[{ title: 'Open', desc: 'Access the Social Card Generator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Social Card Generator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-violet-500/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-violet-400">
          <Share2 className="w-5 h-5" /> Share Card
          <Badge variant="outline" className="ml-auto text-[10px] border-violet-500/40 text-violet-300">Free</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea value={quote} onChange={e => setQuote(e.target.value)} placeholder="Paste the quote (will be blurred)..." rows={2} className="bg-background/40 text-xs" />
        <div>
          <label className="text-[11px] text-muted-foreground">Truth score: {score}%</label>
          <input type="range" min="0" max="100" value={score} onChange={e => setScore(+e.target.value)} className="w-full accent-violet-500" />
        </div>
        <Button onClick={() => m.mutate({ quote, truth_score: score })} disabled={m.isPending || !quote.trim()} className="w-full bg-violet-600 hover:bg-violet-700 text-white">
          {m.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Share Card"}
        </Button>
        {m.data?.share_url && (
          <div className="space-y-2">
            <div className="p-3 rounded bg-gradient-to-br from-violet-900 to-red-900 border border-violet-500/30 text-center">
              <div className="text-[10px] uppercase tracking-widest text-violet-300">Truth Score</div>
              <div className="text-3xl font-bold text-white my-1">{score}%</div>
              <div className="text-xs italic text-violet-100/80 line-clamp-2">"{m.data.card.blurred_quote}"</div>
              <div className="text-[9px] text-violet-300/60 mt-2">uniqueapp.fun/lie-detector</div>
            </div>
            <div className="flex gap-2">
              <code className="flex-1 text-[10px] p-2 rounded bg-black/40 truncate">{window.location.origin}{m.data.share_url}</code>
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}${m.data.share_url}`); toast.success("Copied"); }}><Copy className="w-3 h-3" /></Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
