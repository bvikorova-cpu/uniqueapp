import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Heart, Loader2 } from "lucide-react";
import { useCompatibility } from "@/hooks/useHandwritingPro";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const CompatibilityCard = () => {
  const [a, setA] = useState(""); const [b, setB] = useState(""); const [ctx, setCtx] = useState("romantic");
  const [res, setRes] = useState<any>(null);
  const m = useCompatibility();

  const onFile = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onloadend = () => set(r.result as string); r.readAsDataURL(f);
  };

  return (
    <>
      <FloatingHowItWorks title={"Compatibility Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Compatibility Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Compatibility Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-amber-900/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2"><Heart className="w-5 h-5 text-rose-700" /> Compatibility Match</span>
          <Badge variant="secondary">12 cr</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">Person A</Label><Input type="file" accept="image/*" onChange={onFile(setA)} />{a && <img src={a} className="max-h-20 mt-1 rounded border" alt="A" />}</div>
          <div><Label className="text-xs">Person B</Label><Input type="file" accept="image/*" onChange={onFile(setB)} />{b && <img src={b} className="max-h-20 mt-1 rounded border" alt="B" />}</div>
        </div>
        <div className="flex gap-2">
          {["romantic", "business", "friendship"].map(c => (
            <Button key={c} size="sm" variant={ctx === c ? "default" : "outline"} onClick={() => setCtx(c)} className="capitalize">{c}</Button>
          ))}
        </div>
        <Button
          disabled={!a || !b || m.isPending}
          onClick={() => m.mutate({ imageAUrl: a, imageBUrl: b, context: ctx }, { onSuccess: (d: any) => setRes(d.result) })}
          className="w-full bg-gradient-to-r from-rose-700 to-amber-800"
        >
          {m.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Comparing…</> : "Run Compatibility Match"}
        </Button>
        {res && (
          <div className="space-y-2 pt-2">
            <div className="text-center p-3 rounded-lg bg-gradient-to-r from-rose-100/60 to-amber-100/60 border border-amber-300/40">
              <div className="text-xs uppercase text-amber-900/70">Compatibility</div>
              <div className="text-4xl font-black text-rose-800">{res.compatibility_score}%</div>
            </div>
            {res.strengths?.length > 0 && <div className="text-xs"><strong>Strengths:</strong> {res.strengths.join(", ")}</div>}
            {res.challenges?.length > 0 && <div className="text-xs text-rose-700"><strong>Challenges:</strong> {res.challenges.join(", ")}</div>}
            {res.full_report && <p className="text-xs italic">{res.full_report}</p>}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
