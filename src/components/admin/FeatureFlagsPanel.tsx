import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Flag } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Flag {
  id: string;
  key: string;
  enabled: boolean;
  description: string | null;
  rollout_percent: number;
  target_roles: string[];
}

export const FeatureFlagsPanel = () => {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("feature_flags")
      .select("*")
      .order("created_at", { ascending: false });
    setFlags((data ?? []) as Flag[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateFlag = async (id: string, patch: Partial<Flag>) => {
    const { error } = await supabase.from("feature_flags").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else { setFlags(f => f.map(x => x.id === id ? { ...x, ...patch } : x)); toast.success("Updated"); }
  };

  const create = async () => {
    if (!newKey.trim()) return;
    const { error } = await supabase.from("feature_flags").insert({
      key: newKey.trim(), description: newDesc.trim() || null, enabled: false,
    });
    if (error) toast.error(error.message);
    else { setNewKey(""); setNewDesc(""); load(); toast.success("Flag created"); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this flag?")) return;
    const { error } = await supabase.from("feature_flags").delete().eq("id", id);
    if (error) toast.error(error.message);
    else setFlags(f => f.filter(x => x.id !== id));
  };

  return (
    <>
      <FloatingHowItWorks title={"Feature Flags Panel - How it works"} steps={[{ title: 'Open', desc: 'Access the Feature Flags Panel section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Feature Flags Panel.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="p-4 sm:p-6 border-primary/20 bg-card/60 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-4 w-4" />
          <h3 className="font-semibold">Create new flag</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
          <Input placeholder="flag_key" value={newKey} onChange={e => setNewKey(e.target.value)} />
          <Input placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
          <Button onClick={create}>Create</Button>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="h-20 rounded bg-muted/40 animate-pulse" />)}</div>
      ) : flags.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No flags yet.</p>
      ) : (
        <div className="space-y-3">
          {flags.map(flag => (
            <Card key={flag.id} className="p-4 border-primary/20 bg-card/60 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-primary" />
                    <code className="text-sm font-mono font-semibold">{flag.key}</code>
                    <Badge variant={flag.enabled ? "default" : "secondary"}>
                      {flag.enabled ? "ON" : "OFF"}
                    </Badge>
                  </div>
                  {flag.description && (
                    <p className="text-xs text-muted-foreground mt-1">{flag.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Rollout %</Label>
                    <Input
                      type="number" min={0} max={100}
                      className="w-20 h-8"
                      value={flag.rollout_percent}
                      onChange={e => updateFlag(flag.id, { rollout_percent: Number(e.target.value) })}
                    />
                  </div>
                  <Switch
                    checked={flag.enabled}
                    onCheckedChange={(v) => updateFlag(flag.id, { enabled: v })}
                  />
                  <Button size="sm" variant="ghost" onClick={() => remove(flag.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
  );
};
