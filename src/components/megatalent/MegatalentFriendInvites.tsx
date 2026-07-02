import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserPlus, Copy, Check, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export default function MegatalentFriendInvites({ userId }: { userId: string | null }) {
  const [code, setCode] = useState<string | null>(null);
  const [invited, setInvited] = useState(0);
  const [earned, setEarned] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: rpcCode, error: rpcErr } = await supabase
        .rpc("get_or_create_megatalent_referral_code");
      if (rpcErr) console.error("[referral] code RPC", rpcErr);
      const finalCode = (rpcCode as string | null) || null;

      const { data: earnings } = await supabase
        .from("megatalent_referral_earnings")
        .select("referred_user_id, amount")
        .eq("referrer_id", userId);
      const uniqueInvited = new Set((earnings || []).map((e: any) => e.referred_user_id)).size;
      const totalEarned = (earnings || []).reduce((s: number, e: any) => s + Number(e.amount || 0), 0);

      if (!cancelled) {
        setCode(finalCode);
        setInvited(uniqueInvited);
        setEarned(totalEarned);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!userId) return null;

  const link = code ? `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${code}` : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  const share = async () => {
    const text = `Join me on Unique Megatalent and earn rewards! Use my code: ${code}`;
    try {
      if (navigator.share) await navigator.share({ text, url: link, title: "Join Unique" });
      else await copy();
    } catch {
      // user cancelled
    }
  };

  const milestones = [
    { n: 1, reward: "+100 XP" },
    { n: 5, reward: "Boost x1" },
    { n: 10, reward: "Premium 1d" },
    { n: 25, reward: "Premium 7d" },
  ];

  return (
    <Card className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="h-5 w-5 text-emerald-500" />
          Invite Friends
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {invited} invited · €{earned.toFixed(2)} earned
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          €5 commission each month for every friend who subscribes (top €10 or top_premium €15).
        </p>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading invite code…
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Input value={link} readOnly className="text-xs font-mono" />
              <Button size="icon" variant="outline" onClick={copy}>
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button size="icon" onClick={share}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/30">
              {milestones.map((m) => (
                <Badge key={m.n} variant={invited >= m.n ? "default" : "outline"} className="text-[10px]">
                  {m.n} friend{m.n > 1 ? "s" : ""}: {m.reward}
                </Badge>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
