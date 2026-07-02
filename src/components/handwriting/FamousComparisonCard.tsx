import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Crown, Loader2 } from "lucide-react";
import { useFamousComparison } from "@/hooks/useHandwritingPro";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const FamousComparisonCard = () => {
  const [imageUrl, setImageUrl] = useState(""); const [res, setRes] = useState<any>(null);
  const m = useFamousComparison();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onloadend = () => setImageUrl(r.result as string); r.readAsDataURL(f);
  };

  return (
    <>
      <FloatingHowItWorks title={"Famous Comparison Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Famous Comparison Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Famous Comparison Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-amber-900/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2"><Crown className="w-5 h-5 text-amber-600" /> Famous Comparison</span>
          <Badge variant="secondary">5 cr</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label className="text-xs">Your handwriting</Label>
        <Input type="file" accept="image/*" onChange={onFile} />
        {imageUrl && <img src={imageUrl} className="max-h-28 rounded border" alt="yours" />}
        <Button
          disabled={!imageUrl || m.isPending}
          onClick={() => m.mutate({ imageUrl }, { onSuccess: (d: any) => setRes(d.comparison) })}
          className="w-full bg-gradient-to-r from-amber-600 to-yellow-700"
        >
          {m.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching legends…</> : "Find My Famous Match"}
        </Button>
        {res && (
          <div className="text-center pt-2 p-4 rounded-xl bg-gradient-to-br from-amber-100/70 to-yellow-100/70 border border-amber-300/50">
            <div className="text-xs uppercase text-amber-800/70 tracking-widest">You write like</div>
            <div className="text-3xl font-black my-2 text-amber-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{res.matched_figure}</div>
            <Badge className="bg-amber-700 text-amber-50">{res.match_score}% match</Badge>
            {res.shared_traits?.length > 0 && (
              <div className="text-xs mt-2 italic">{res.shared_traits.join(" · ")}</div>
            )}
            {res.ai_blurb && <p className="text-xs mt-3">{res.ai_blurb}</p>}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
