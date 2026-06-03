import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Euro } from "lucide-react";
import { toast } from "sonner";

const RATE = 1000; // 1000 XP = 1 EUR
const PRESETS = [1000, 2500, 5000, 10000];

export default function RewardsDonateXP() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [amount, setAmount] = useState<number>(1000);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data: c } = await supabase
      .from("fundraising_campaigns" as any)
      .select("id, title, vertical")
      .eq("status", "active")
      .limit(20);
    setCampaigns((c as any) || []);
    if (user) {
      const { data: h } = await supabase
        .from("xp_charity_donations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setHistory(h || []);
    }
  };

  useEffect(() => { load(); }, [user?.id]);

  const donate = async () => {
    if (!user || amount < RATE) return toast.error(`Minimum ${RATE} XP`);
    setLoading(true);
    const eur = amount / RATE;
    const camp = campaigns.find(c => c.id === selectedId);
    const { data, error } = await supabase.rpc("donate_xp" as any, {
      _amount: amount,
      _campaign_id: selectedId || null,
      _campaign_name: camp?.title || "General fund",
      _rate: RATE,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    const res = data as any;
    if (!res?.ok) return toast.error(res?.error ?? "Donation failed");
    toast.success(`Donated ${amount} XP (€${eur.toFixed(2)})!`);
    load();
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 text-white">
          <Heart className="h-8 w-8 mb-2" />
          <h2 className="text-2xl font-bold">Donate XP to charity</h2>
          <p className="text-sm opacity-90">{RATE} XP = €1 → goes directly to a fundraising campaign.</p>
        </div>
        <CardContent className="pt-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Campaign</label>
            <select className="w-full mt-1 rounded-lg bg-background border border-border p-2 text-sm" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              <option value="">General fund</option>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.title} ({c.vertical})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">XP amount</label>
            <Input type="number" min={RATE} step={RATE} value={amount} onChange={e => setAmount(+e.target.value)} className="mt-1" />
            <div className="flex gap-2 mt-2 flex-wrap">
              {PRESETS.map(p => (
                <Button key={p} size="sm" variant={amount === p ? "default" : "outline"} onClick={() => setAmount(p)}>
                  {p.toLocaleString()} XP
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
            <span className="text-sm">You donate</span>
            <span className="text-lg font-bold flex items-center gap-1"><Euro className="h-4 w-4" /> {(amount / RATE).toFixed(2)}</span>
          </div>
          <Button onClick={donate} disabled={loading || amount < RATE} className="w-full gap-2">
            <Heart className="h-4 w-4" /> Donate now
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Your donations</CardTitle></CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No donations yet.</p>
          ) : (
            <div className="space-y-2">
              {history.map(d => (
                <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{d.campaign_name || "General fund"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">€{Number(d.eur_value).toFixed(2)}</p>
                    <Badge variant="outline" className="text-[10px] capitalize">{d.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
