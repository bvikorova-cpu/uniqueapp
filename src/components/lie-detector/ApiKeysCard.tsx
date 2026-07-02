import { useState } from "react";
import { Key, Loader2, Plus, Trash2, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@/hooks/useLieDetectorPro";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function ApiKeysCard() {
  const [label, setLabel] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);
  const { data: keys = [] } = useApiKeys();
  const create = useCreateApiKey();
  const revoke = useRevokeApiKey();

  const handleCreate = async () => {
    if (!label.trim()) return;
    const res = await create.mutateAsync(label);
    setRevealed(res.api_key);
    setLabel("");
  };

  return (
    <>
      <FloatingHowItWorks title={"Api Keys Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Api Keys Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Api Keys Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-emerald-500/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-emerald-400">
          <Key className="w-5 h-5" /> API Access
          <Badge variant="outline" className="ml-auto text-[10px] border-emerald-500/40 text-emerald-300">For Investigators</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Key label (e.g. 'My App')" className="bg-background/40 text-xs" />
          <Button onClick={handleCreate} disabled={create.isPending || !label.trim()} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            {create.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          </Button>
        </div>
        {revealed && (
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div className="text-[10px] text-emerald-400 font-bold uppercase">⚠ Save this — shown only once</div>
            <div className="flex items-center gap-2">
              <code className="text-[10px] flex-1 font-mono break-all">{revealed}</code>
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(revealed); toast.success("Copied"); }}><Copy className="w-3 h-3" /></Button>
            </div>
            <Button size="sm" variant="ghost" className="text-[10px] h-6" onClick={() => setRevealed(null)}>I saved it</Button>
          </div>
        )}
        <div className="space-y-1 max-h-40 overflow-auto">
          {keys.map((k: any) => (
            <div key={k.id} className="flex items-center justify-between p-2 rounded bg-black/20 text-xs">
              <div>
                <div className="font-semibold">{k.label}</div>
                <code className="text-[10px] text-muted-foreground">{k.key_prefix}…</code>
                {!k.is_active && <Badge variant="destructive" className="ml-2 text-[9px]">revoked</Badge>}
              </div>
              {k.is_active && <Button size="sm" variant="ghost" onClick={() => revoke.mutate(k.id)}><Trash2 className="w-3 h-3 text-red-400" /></Button>}
            </div>
          ))}
          {keys.length === 0 && <div className="text-[11px] text-muted-foreground italic text-center py-2">No keys yet.</div>}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
