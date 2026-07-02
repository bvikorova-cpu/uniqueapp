import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Key, Plus, Copy, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function CouponApiKeysPanel() {
  const [keys, setKeys] = useState<any[]>([]);
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("coupon_api_keys" as any).select("*").order("created_at", { ascending: false });
    setKeys(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Sign in"); return; }
    const raw = `ch_${crypto.randomUUID().replace(/-/g, "")}`;
    const hash = await sha256(raw);
    const { error } = await supabase.from("coupon_api_keys" as any).insert({
      user_id: user.id, key_hash: hash, label: label || "default", scope: "read",
    });
    if (error) { toast.error(error.message); return; }
    setNewKey(raw);
    setLabel("");
    load();
  };

  const revoke = async (id: string) => {
    await supabase.from("coupon_api_keys" as any).update({ revoked: true }).eq("id", id);
    load();
  };

  return (
    <>
      <FloatingHowItWorks title={"Coupon Api Keys Panel - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Api Keys Panel section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Api Keys Panel.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-4 space-y-3 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-yellow-500/5">
      <div className="flex items-center gap-2">
        <Key className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold">Affiliate API Keys</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Read-only access to coupon listings. Use header <code>x-api-key</code>.
      </p>
      <div className="flex gap-2">
        <Input placeholder="Label (e.g. influencer-blog)" value={label} onChange={e => setLabel(e.target.value)} />
        <Button onClick={create} size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" />New key</Button>
      </div>
      {newKey && (
        <div className="p-3 rounded-lg border bg-background/60 text-xs space-y-1">
          <div className="font-bold text-amber-500">Save this key — shown only once:</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate">{newKey}</code>
            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(newKey); toast.success("Copied"); }}>
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
      <div className="space-y-1.5">
        {keys.map(k => (
          <div key={k.id} className={`flex items-center gap-2 p-2 rounded border text-xs ${k.revoked ? "opacity-50" : ""}`}>
            <span className="flex-1 font-bold">{k.label}</span>
            <span className="text-muted-foreground">{k.last_used_at ? "used" : "never used"}</span>
            {!k.revoked && (
              <Button size="sm" variant="ghost" onClick={() => revoke(k.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
    </>
  );
}
