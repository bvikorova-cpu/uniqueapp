import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Gift, Euro, Lock, MessageCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const eur = (n: number) => `€${Number(n || 0).toFixed(2)}`;

interface Profile {
  id: string;
  display_name: string;
  pending_balance: number;
  lifetime_earnings: number;
  total_withdrawn: number;
}

export const InfluKingEarningsCard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gifts, setGifts] = useState({ count: 0, net: 0 });
  const [ppv, setPpv] = useState({ count: 0, net: 0 });
  const [dms, setDms] = useState({ count: 0, net: 0 });

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: prof } = await supabase
          .from("influencer_profiles")
          .select("id, display_name, pending_balance, lifetime_earnings, total_withdrawn")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!prof) return;

        const p: any = prof;
        setProfile({
          id: p.id,
          display_name: p.display_name,
          pending_balance: Number(p.pending_balance || 0),
          lifetime_earnings: Number(p.lifetime_earnings || 0),
          total_withdrawn: Number(p.total_withdrawn || 0),
        });

        const [giftRes, ppvRes, dmRes] = await Promise.all([
          supabase
            .from("influencer_sent_gifts")
            .select("chef_amount, status")
            .eq("influencer_id", p.id)
            .in("status", ["completed", "paid", "succeeded"]),
          supabase
            .from("influking_ppv_unlocks")
            .select("creator_earnings_cents")
            .eq("creator_id", user.id)
            .eq("status", "completed"),
          supabase
            .from("creator_paid_messages")
            .select("creator_payout")
            .eq("creator_id", user.id)
            .in("status", ["paid", "completed", "replied", "succeeded"]),

        ]);

        const giftRows = (giftRes.data as any[]) || [];
        setGifts({
          count: giftRows.length,
          net: giftRows.reduce((s, r) => s + Number(r.chef_amount || 0), 0),
        });

        const ppvRows = (ppvRes.data as any[]) || [];
        setPpv({
          count: ppvRows.length,
          net: ppvRows.reduce((s, r) => s + Number(r.creator_earnings_cents || 0), 0) / 100,
        });

        const dmRows = (dmRes.data as any[]) || [];
        setDms({
          count: dmRows.length,
          net: dmRows.reduce((s, r) => s + Number(r.creator_payout || 0), 0),
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !profile) return null;

  const totalNet = gifts.net + ppv.net + dms.net;

  return (
    <Card className="border-pink-500/30 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-pink-500/10 to-purple-500/10">
        <CardTitle className="flex flex-wrap items-center gap-2">
          <Crown className="w-5 h-5 text-pink-600" />
          InfluKing earnings — {profile.display_name}
          <Badge variant="outline" className="ml-auto border-pink-500/40 text-pink-700">85 / 15</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><Gift className="w-3 h-3" /> Gifts</div>
            <div className="text-lg font-bold">{gifts.count}</div>
            <div className="text-xs text-muted-foreground">{eur(gifts.net)} net</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><Lock className="w-3 h-3" /> PPV unlocks</div>
            <div className="text-lg font-bold">{ppv.count}</div>
            <div className="text-xs text-muted-foreground">{eur(ppv.net)} net</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><MessageCircle className="w-3 h-3" /> Paid DMs</div>
            <div className="text-lg font-bold">{dms.count}</div>
            <div className="text-xs text-muted-foreground">{eur(dms.net)} net</div>
          </div>
          <div className="rounded-lg border p-3 bg-gradient-to-br from-pink-500/10 to-purple-500/10">
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><Euro className="w-3 h-3" /> Your net total</div>
            <div className="text-lg font-bold text-pink-700">{eur(totalNet || profile.lifetime_earnings)}</div>
            <div className="text-xs text-muted-foreground">Pending: {eur(profile.pending_balance)}</div>
          </div>
        </div>

        <div className="rounded-lg border divide-y text-sm">
          <div className="flex items-center justify-between p-3">
            <span className="text-muted-foreground">Pending payout</span>
            <span className="font-semibold">{eur(profile.pending_balance)}</span>
          </div>
          <div className="flex items-center justify-between p-3">
            <span className="text-muted-foreground">Lifetime earnings</span>
            <span className="font-semibold">{eur(profile.lifetime_earnings)}</span>
          </div>
          <div className="flex items-center justify-between p-3">
            <span className="text-muted-foreground">Already withdrawn</span>
            <span className="font-semibold">{eur(profile.total_withdrawn)}</span>
          </div>
        </div>

        <Button className="w-full" onClick={() => navigate("/influencer/earnings")}>
          Open full InfluKing earnings & withdrawals <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default InfluKingEarningsCard;
