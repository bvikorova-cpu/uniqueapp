import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Share2, Plus, Loader2, Check, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Ref = { id: string; code: string; referrer_id: string; referred_id: string | null; rewarded: boolean; created_at: string; redeemed_at: string | null };

interface Props { userId: string | null; }

const genCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const MegatalentReferralProgram = ({ userId }: Props) => {
  const [refs, setRefs] = useState<Ref[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [redeem, setRedeem] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const load = async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await (supabase as any).from("talent_referrals")
        .select("*").or(`referrer_id.eq.${userId},referred_id.eq.${userId}`).order("created_at", { ascending: false });
      setRefs((data as Ref[]) || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-line */ }, [userId]);

  const mine = useMemo(() => refs.filter(r => r.referrer_id === userId), [refs, userId]);
  const redeemed = useMemo(() => mine.filter(r => r.rewarded).length, [mine]);

  const createCode = async () => {
    if (!userId) { toast.error("Sign in first"); return; }
    setCreating(true);
    try {
      let attempt = 0;
      let inserted: Ref | null = null;
      while (attempt < 4 && !inserted) {
        const code = genCode();
        const { data, error } = await (supabase as any).from("talent_referrals").insert({ referrer_id: userId, code }).select().single();
        if (!error) inserted = data as Ref;
        else if (!String(error.message).includes("unique") && !String(error.message).includes("duplicate")) throw error;
        attempt++;
      }
      if (inserted) { setRefs(prev => [inserted!, ...prev]); toast.success("Code created"); }
      else toast.error("Couldn't create code, try again");
    } catch (e: any) { toast.error(e?.message || "Couldn't create"); }
    finally { setCreating(false); }
  };

  const share = async (code: string) => {
    const url = `${window.location.origin}/auth?ref=${code}`;
    const text = `Join me on Unique's MegaTalent — use my code ${code} for +50 XP head start: ${url}`;
    try {
      if (navigator.share) await navigator.share({ title: "Join MegaTalent", text, url });
      else { await navigator.clipboard.writeText(text); toast.success("Copied link"); }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        try { await navigator.clipboard.writeText(text); toast.success("Copied link"); } catch { toast.error("Couldn't share"); }
      }
    }
  };

  const doRedeem = async () => {
    const code = redeem.trim().toUpperCase();
    if (!code) return;
    if (!userId) { toast.error("Sign in first"); return; }
    setRedeeming(true);
    try {
      const { error } = await (supabase as any).rpc("redeem_referral", { _code: code });
      if (error) throw error;
      toast.success("Redeemed! +50 XP for you, +100 XP for your friend");
      setRedeem("");
      load();
    } catch (e: any) {
      const m = String(e?.message || "");
      toast.error(m.includes("invalid_code") ? "Invalid code"
        : m.includes("self_referral") ? "You can't redeem your own code"
        : m.includes("already_redeemed") ? "Code already used"
        : m || "Couldn't redeem");
    } finally { setRedeeming(false); }
  };

  return (
    <Card className="backdrop-blur-xl bg-card/60 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="font-bold">Invite Friends</h2>
          <Badge variant="secondary" className="ml-auto gap-1"><Gift className="h-3 w-3" /> {redeemed} redeemed · +{redeemed * 100} XP</Badge>
        </div>

        <p className="text-xs text-muted-foreground mb-3">Each redeemed code gives you <strong>+100 XP</strong> and your friend <strong>+50 XP</strong>.</p>

        <div className="flex gap-2 mb-4">
          <Button size="sm" onClick={createCode} disabled={!userId || creating} className="gap-1">
            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} New code
          </Button>
          <Input value={redeem} onChange={e => setRedeem(e.target.value.toUpperCase())} placeholder="Enter friend's code" className="bg-background/60 text-xs h-8 uppercase" />
          <Button size="sm" variant="secondary" onClick={doRedeem} disabled={!userId || redeeming || !redeem.trim()} className="gap-1">
            {redeeming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Redeem
          </Button>
        </div>

        {loading ? (
          <div className="py-4 flex items-center justify-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading…</div>
        ) : mine.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">No codes yet. Create one to start inviting.</p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {mine.map(r => (
              <div key={r.id} className="flex items-center gap-2 rounded-lg border border-border/30 bg-background/40 p-2 text-xs">
                <code className="font-mono font-bold tracking-wider">{r.code}</code>
                <Badge variant={r.rewarded ? "default" : "outline"} className="text-[10px]">{r.rewarded ? "Redeemed" : "Pending"}</Badge>
                <span className="text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
                <Button size="sm" variant="ghost" onClick={() => share(r.code)} className="h-7 px-2 gap-1"><Share2 className="h-3 w-3" /></Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MegatalentReferralProgram;
