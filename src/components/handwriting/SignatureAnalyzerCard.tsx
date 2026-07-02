import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Signature, Upload } from "lucide-react";
import { useSignatureAnalyzer } from "@/hooks/useHandwritingPro";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const SignatureAnalyzerCard = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const sig = useSignatureAnalyzer();

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onloadend = () => setImageUrl(r.result as string);
    r.readAsDataURL(f);
  };

  return (
    <>
      <FloatingHowItWorks title={"Signature Analyzer Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Signature Analyzer Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Signature Analyzer Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-amber-900/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2"><Signature className="w-5 h-5 text-amber-700" /> Signature Analyzer</span>
          <Badge variant="secondary">5 cr</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label className="text-xs">Signature image</Label>
        <Input type="file" accept="image/*" onChange={onFile} />
        <Input placeholder="…or paste image URL" value={imageUrl.startsWith("data:") ? "" : imageUrl} onChange={e => setImageUrl(e.target.value)} />
        {imageUrl && <img src={imageUrl} className="max-h-32 rounded border" alt="signature preview" />}
        <Button
          disabled={!imageUrl || sig.isPending}
          onClick={() => sig.mutate({ imageUrl }, { onSuccess: (d: any) => setResult(d.analysis) })}
          className="w-full bg-gradient-to-r from-amber-700 to-amber-900 hover:opacity-90"
        >
          {sig.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…</> : <><Upload className="w-4 h-4 mr-2" /> Analyze Signature</>}
        </Button>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-2 pt-2">
            {[
              { l: "Ego", v: result.ego_score },
              { l: "Confidence", v: result.confidence_score },
              { l: "Authenticity", v: result.authenticity_score },
            ].map(m => (
              <div key={m.l} className="rounded-lg p-2 bg-amber-100/40 border border-amber-300/40">
                <div className="text-[10px] text-amber-900/70 uppercase">{m.l}</div>
                <div className="text-lg font-black text-amber-900">{m.v}/100</div>
              </div>
            ))}
            <div className="col-span-2 text-xs text-muted-foreground italic">
              Public persona: <strong className="text-foreground not-italic">{result.public_persona}</strong>
            </div>
            {result.analysis?.summary && (
              <p className="col-span-2 text-xs">{result.analysis.summary}</p>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
