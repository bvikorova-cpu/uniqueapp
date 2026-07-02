import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useForgeryDetector } from "@/hooks/useHandwritingPro";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const verdictColor = (v: string) => v?.includes("FORGERY") ? "text-rose-700 bg-rose-100/60" :
  v === "SUSPICIOUS" ? "text-amber-700 bg-amber-100/60" : "text-emerald-700 bg-emerald-100/60";

export const ForgeryDetectorCard = () => {
  const [ref, setRef] = useState(""); const [sus, setSus] = useState(""); const [res, setRes] = useState<any>(null);
  const m = useForgeryDetector();
  const onFile = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onloadend = () => set(r.result as string); r.readAsDataURL(f);
  };

  return (
    <>
      <FloatingHowItWorks title={"Forgery Detector Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Forgery Detector Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Forgery Detector Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-amber-900/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-burgundy-700" style={{ color: "hsl(345 50% 35%)" }} /> Forgery Detector</span>
          <Badge variant="secondary">15 cr</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">Reference (authentic)</Label><Input type="file" accept="image/*" onChange={onFile(setRef)} />{ref && <img src={ref} className="max-h-20 mt-1 rounded border-2 border-emerald-500/50" alt="ref" />}</div>
          <div><Label className="text-xs">Suspect sample</Label><Input type="file" accept="image/*" onChange={onFile(setSus)} />{sus && <img src={sus} className="max-h-20 mt-1 rounded border-2 border-rose-500/50" alt="sus" />}</div>
        </div>
        <Button
          disabled={!ref || !sus || m.isPending}
          onClick={() => m.mutate({ referenceUrl: ref, suspectUrl: sus }, { onSuccess: (d: any) => setRes(d.check) })}
          className="w-full bg-gradient-to-r from-amber-900 to-rose-900"
        >
          {m.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Examining…</> : "Run Forensic Check"}
        </Button>
        {res && (
          <div className="space-y-2 pt-2">
            <div className={`text-center p-3 rounded-lg font-black ${verdictColor(res.verdict)}`}>
              {res.verdict?.replace(/_/g, " ")}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-emerald-100/50"><div className="text-[10px] uppercase">Authentic</div><div className="text-lg font-bold">{res.authenticity_probability}%</div></div>
              <div className="p-2 rounded bg-rose-100/50"><div className="text-[10px] uppercase">Forgery</div><div className="text-lg font-bold">{res.forgery_probability}%</div></div>
            </div>
            {Array.isArray(res.red_flags) && res.red_flags.length > 0 && (
              <div className="text-xs"><strong className="text-rose-700">Red flags:</strong> {res.red_flags.map((f: any) => f.trait).join(", ")}</div>
            )}
            {res.detailed_report && <p className="text-xs italic">{res.detailed_report}</p>}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
