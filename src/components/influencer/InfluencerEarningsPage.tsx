import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { InfluencerWithdrawalForm } from "./InfluencerWithdrawalForm";
import { format } from "date-fns";
import { EarningsHero, EarningsLiveTicker, EarningsTipsBanner } from "@/components/earnings";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface GiftRow {
  id: string;
  amount: number;
  chef_amount: number | null;
  platform_commission: number | null;
  status: string | null;
  created_at: string;
  influencer_gifts?: { name: string | null; icon: string | null } | null;
}

export const InfluencerEarningsPage = () => {
  const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null);
  const refetchGiftsRef = useRef<(() => void) | null>(null);

  const { data: influencers, isLoading: loadingInfluencers } = useQuery({
    queryKey: ["my-influencer-profiles"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("influencer_profiles")
        .select("id, display_name, pending_balance, lifetime_earnings, total_withdrawn")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    } });

  // Repair gift records that were paid in Stripe but never recorded
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("verify-influencer-gift", {
          body: { recover: true } });
        if ((data as { settled?: number } | null)?.settled) {
          refetchGiftsRef.current?.();
        }
      } catch { /* non-blocking */ }
    })();
  }, []);

  useEffect(() => {
    if (!selectedInfluencer && influencers && influencers.length > 0) {
      setSelectedInfluencer(influencers[0].id);
    }
  }, [influencers, selectedInfluencer]);

  const { data: withdrawals, refetch: refetchWithdrawals } = useQuery({
    queryKey: ["influencer-withdrawals", selectedInfluencer],
    queryFn: async () => {
      if (!selectedInfluencer) return [];
      const { data, error } = await supabase
        .from("influencer_withdrawal_requests")
        .select("*")
        .eq("influencer_id", selectedInfluencer)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedInfluencer });

  const { data: gifts, refetch: refetchGifts } = useQuery({
    queryKey: ["influencer-gift-earnings", selectedInfluencer],
    queryFn: async () => {
      if (!selectedInfluencer) return [] as GiftRow[];
      const { data, error } = await supabase
        .from("influencer_sent_gifts")
        .select("id, amount, chef_amount, platform_commission, status, created_at, influencer_gifts(name, icon)")
        .eq("influencer_id", selectedInfluencer)
        .in("status", ["completed", "paid", "succeeded"])
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as unknown as GiftRow[];
    },
    enabled: !!selectedInfluencer });

  refetchGiftsRef.current = () => { refetchGifts(); };

  if (loadingInfluencers) {
    return (
      <>
        <FloatingHowItWorks title={"Influencer Earnings - How it works"} steps={[{ title: 'Gifts', desc: 'Fans buy gifts in EUR on your influencer profile.' }, { title: 'Split', desc: 'You keep 80% of every gift, the platform keeps 20%.' }, { title: 'Balance', desc: 'Your share is added to your available balance automatically.' }, { title: 'Withdraw', desc: 'Request a payout once your balance reaches €50.' }]} />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

  if (!influencers || influencers.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No influencer profile found. Create your influencer profile first.</p>
      </Card>
    );
  }

  const current = influencers.find((i) => i.id === selectedInfluencer);
  const lockedInWithdrawals = (withdrawals || [])
    .filter((w) => w.status === "pending" || w.status === "approved")
    .reduce((sum, w) => sum + Number(w.amount || 0), 0);
  const pendingBalance = Number(current?.pending_balance || 0);
  const available = Math.max(0, pendingBalance - lockedInWithdrawals);
  const grossFromGifts = (gifts || []).reduce((s, g) => s + Number(g.amount || 0), 0);
  const platformFee = (gifts || []).reduce(
    (s, g) => s + Number(g.platform_commission ?? Number(g.amount || 0) * 0.2), 0);

  return (
    <div className="space-y-6">
      <FloatingHowItWorks title={"Influencer Earnings - How it works"} steps={[{ title: 'Gifts', desc: 'Fans buy gifts in EUR on your influencer profile.' }, { title: 'Split', desc: 'You keep 80% of every gift, the platform keeps 20%.' }, { title: 'Balance', desc: 'Your share is added to your available balance automatically.' }, { title: 'Withdraw', desc: 'Request a payout once your balance reaches €50.' }]} />

      <EarningsHero
        title="Influencer Earnings"
        subtitle="Gifts, subscriptions and paid content — 80% is yours."
        totalEarnings={Number(current?.lifetime_earnings || 0)}
        available={available}
        pending={lockedInWithdrawals}
        paidOut={Number(current?.total_withdrawn || 0)}
        badge="Creator Treasury"
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <EarningsLiveTicker />
      </div>

      <EarningsTipsBanner />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Gross from gifts</p>
          <p className="text-xl font-bold">€{grossFromGifts.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Platform fee (20%)</p>
          <p className="text-xl font-bold">€{platformFee.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Your share (80%)</p>
          <p className="text-xl font-bold text-green-600">€{(grossFromGifts - platformFee).toFixed(2)}</p>
        </Card>
      </div>

      {influencers.length > 1 && (
        <Card className="p-4 border-amber-500/20">
          <label className="text-sm font-medium mb-2 block">Select profile</label>
          <select
            className="w-full p-2 border rounded-md bg-background"
            value={selectedInfluencer || ""}
            onChange={(e) => setSelectedInfluencer(e.target.value)}
          >
            {influencers.map((inf) => (
              <option key={inf.id} value={inf.id}>{inf.display_name}</option>
            ))}
          </select>
        </Card>
      )}

      {selectedInfluencer && current && (
        <Tabs defaultValue="earnings">
          <TabsList className="w-full flex-wrap h-auto">
            <TabsTrigger value="earnings">Gift earnings</TabsTrigger>
            <TabsTrigger value="withdraw">Request withdrawal</TabsTrigger>
            <TabsTrigger value="history">Withdrawal history</TabsTrigger>
          </TabsList>

          <TabsContent value="earnings" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Received gifts</h3>
              <div className="space-y-2">
                {gifts && gifts.length > 0 ? (
                  gifts.map((g) => {
                    const gross = Number(g.amount || 0);
                    const fee = Number(g.platform_commission ?? gross * 0.2);
                    const net = Number(g.chef_amount ?? gross - fee);
                    return (
                      <div key={g.id} className="flex justify-between items-center p-3 border rounded gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {g.influencer_gifts?.icon} {g.influencer_gifts?.name || "Gift"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(g.created_at), "MMM dd, yyyy HH:mm")} • gross €{gross.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-green-600">+€{net.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Fee: €{fee.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-8">No gift earnings yet</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw" className="mt-6">
            {available >= 50 ? (
              <InfluencerWithdrawalForm
                influencerId={selectedInfluencer}
                availableBalance={available}
                onSuccess={() => { refetchWithdrawals(); refetchGifts(); }}
              />
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-2">Minimum withdrawal amount is €50</p>
                <p className="text-sm text-muted-foreground">
                  Available balance: €{available.toFixed(2)}
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Withdrawal requests</h3>
              <div className="space-y-3">
                {withdrawals && withdrawals.length > 0 ? (
                  withdrawals.map((w) => (
                    <div key={w.id} className="flex justify-between items-center p-4 border rounded gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">€{Number(w.amount).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground capitalize truncate">
                          {w.payment_method?.replace("_", " ")} • {format(new Date(w.created_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm bg-muted shrink-0">{w.status}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No withdrawal requests yet</p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
