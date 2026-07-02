import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2 } from "lucide-react";
import { useTwinFinder } from "@/hooks/useHandwritingPro";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const TwinFinderCard = () => {
  const [imageUrl, setImageUrl] = useState(""); const [name, setName] = useState(""); const [pub, setPub] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const m = useTwinFinder();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onloadend = () => setImageUrl(r.result as string); r.readAsDataURL(f);
  };

  return (
    <>
      <FloatingHowItWorks title={"Twin Finder Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Twin Finder Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Twin Finder Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-amber-900/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2"><Users className="w-5 h-5 text-amber-700" /> Handwriting Twin Finder</span>
          <Badge variant="secondary">5 cr</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label className="text-xs">Your sample</Label>
        <Input type="file" accept="image/*" onChange={onFile} />
        <Input placeholder="Display name (anonymous OK)" value={name} onChange={e => setName(e.target.value)} />
        <label className="text-xs flex items-center gap-2">
          <input type="checkbox" checked={pub} onChange={e => setPub(e.target.checked)} />
          List me publicly so others can find me
        </label>
        <Button
          disabled={!imageUrl || !name || m.isPending}
          onClick={() => m.mutate({ imageUrl, displayName: name, isPublic: pub }, { onSuccess: (d: any) => setMatches(d.matches) })}
          className="w-full bg-gradient-to-r from-amber-700 to-burgundy-700" style={{ backgroundImage: "linear-gradient(to right, hsl(35 70% 35%), hsl(345 55% 30%))" }}
        >
          {m.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching twins…</> : "Find My Twin"}
        </Button>
        {matches.length > 0 && (
          <div className="pt-2 space-y-2">
            <div className="text-xs font-semibold">Top kindred hands</div>
            {matches.map((m: any) => (
              <div key={m.user_id} className="flex items-center justify-between p-2 rounded border border-amber-300/30 bg-amber-50/40">
                <div className="flex items-center gap-2">
                  {m.sample_url && <img src={m.sample_url} className="w-10 h-10 object-cover rounded" alt="sample" />}
                  <div className="text-xs font-medium">{m.display_name}</div>
                </div>
                <Badge variant="secondary">{m.similarity}% match</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
