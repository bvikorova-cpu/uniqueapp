import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { InfluencerWithdrawalForm } from "./InfluencerWithdrawalForm";
import CreatorPaidInbox from "./CreatorPaidInbox";

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

interface SubRow {
  id: string;
  gross_cents: number | null;
  platform_fee_cents: number | null;
  net_cents: number | null;
  period_end: string | null;
  created_at: string;
}

interface PpvRow {
  id: string;
  amount_cents: number | null;
  creator_earnings_cents: number | null;
  platform_fee_cents: number | null;
  created_at: string;
  influking_ppv_posts?: { title: string | null } | null;
}

interface DmRow {
  id: string;
  amount_paid: number | null;
  platform_fee: number | null;
  creator_payout: number | null;
  request_type: string | null;
  created_at: string;
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

  // Subscriptions (85/15), PPV unlocks (85/15) and paid DMs / shoutouts (85/15)
  const { data: extra } = useQuery({
    queryKey: ["influencer-extra-earnings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { subs: [] as SubRow[], members: [] as any[], ppv: [] as PpvRow[], dms: [] as DmRow[] };

      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      const creatorIds = [user.id, profile?.id].filter(Boolean) as string[];

      const [subsRes, ppvRes, dmsRes] = await Promise.all([
        supabase
          .from("creator_subscription_earnings")
          .select("id, gross_cents, platform_fee_cents, net_cents, currency, period_end, created_at")
          .in("creator_id", creatorIds)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("influking_ppv_unlocks")
          .select("id, amount_cents, creator_earnings_cents, platform_fee_cents, status, created_at, influking_ppv_posts(title)")
          .eq("creator_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("creator_paid_messages")
          .select("id, amount_paid, platform_fee, creator_payout, status, request_type, created_at")
          .in("creator_id", creatorIds)
          .in("status", ["paid", "completed", "replied", "succeeded"])
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      // Active fan club members (VIP tiers) of clubs owned by this creator
      const { data: clubs } = await supabase
        .from("influencer_fan_clubs")
        .select("id, name, tier, price_cents")
        .eq("creator_id", user.id);
      let members: any[] = [];
      if (clubs && clubs.length > 0) {
        const { data: memberRows } = await supabase
          .from("influencer_fan_club_members")
          .select("id, fan_club_id, status, subscribed_at, current_period_end")
          .in("fan_club_id", clubs.map((c: any) => c.id))
          .in("status", ["active", "trialing", "past_due"])
          .order("subscribed_at", { ascending: false })
          .limit(100);
        members = (memberRows || []).map((m: any) => {
          const club = clubs.find((c: any) => c.id === m.fan_club_id);
          const gross = Number(club?.price_cents || 0);
          return {
            id: m.id,
            name: club?.name || club?.tier || "Fan club",
            status: m.status,
            gross_cents: gross,
            net_cents: Math.round(gross * 0.85),
            created_at: m.subscribed_at,
            current_period_end: m.current_period_end };
        });
      }

      return {
        subs: (subsRes.data || []) as unknown as SubRow[],
        members,
        ppv: (ppvRes.data || []) as unknown as PpvRow[],
        dms: (dmsRes.data || []) as unknown as DmRow[] };
    } });

  const subs = extra?.subs || [];
  const members = extra?.members || [];
  const ppv = extra?.ppv || [];
  const dms = extra?.dms || [];
  const membersNet = members.reduce((s: number, r: any) => s + Number(r.net_cents || 0), 0) / 100;
  const subsNet = subs.reduce((s, r) => s + Number(r.net_cents || 0), 0) / 100 + membersNet;
  const ppvNet = ppv.reduce((s, r) => s + Number(r.creator_earnings_cents || 0), 0) / 100;
  const dmsNet = dms.reduce((s, r) => s + Number(r.creator_payout || 0), 0);


  if (loadingInfluencers) {
    return (
      <>
        <FloatingHowItWorks title={"Influencer Earnings - How it works"} steps={[{ title: 'Gifts', desc: 'Fans buy gifts in EUR on your influencer profile.' }, { title: 'Split', desc: 'You keep 85% of every gift, the platform keeps 15%.' }, { title: 'Balance', desc: 'Your share is added to your available balance automatically.' }, { title: 'Withdraw', desc: 'Request a payout once your balance reaches €50.' }]} />
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
    (s, g) => s + Number(g.platform_commission ?? Number(g.amount || 0) * 0.15), 0);

  return (
    <div className="space-y-6">
      <FloatingHowItWorks title={"Influencer Earnings - How it works"} steps={[{ title: 'Gifts', desc: 'Fans buy gifts in EUR on your influencer profile.' }, { title: 'Split', desc: 'You keep 85% of every gift, the platform keeps 15%.' }, { title: 'Balance', desc: 'Your share is added to your available balance automatically.' }, { title: 'Withdraw', desc: 'Request a payout once your balance reaches €50.' }]} />

      <EarningsHero
        title="Influencer Earnings"
        subtitle="Gifts, subscriptions and paid content — 85% is yours."
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
          <p className="text-xs text-muted-foreground">Platform fee (15%)</p>
          <p className="text-xl font-bold">€{platformFee.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Your share (85%)</p>
          <p className="text-xl font-bold text-green-600">€{(grossFromGifts - platformFee).toFixed(2)}</p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Subscriptions (your 85%)</p>
          <p className="text-xl font-bold text-green-600">€{subsNet.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{subs.length + members.length} payments</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">PPV posts (your 85%)</p>
          <p className="text-xl font-bold text-green-600">€{ppvNet.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{ppv.length} unlocks</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Paid DMs (your 85%)</p>
          <p className="text-xl font-bold text-green-600">€{dmsNet.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{dms.length} messages</p>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Gifts are withdrawn here (min €50). Subscriptions, PPV and paid DMs are paid out from My Earnings.
      </p>


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
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="subs">Subscriptions</TabsTrigger>
            <TabsTrigger value="ppv">PPV posts</TabsTrigger>
            <TabsTrigger value="dms">Paid DMs</TabsTrigger>
            <TabsTrigger value="withdraw">Request withdrawal</TabsTrigger>
            <TabsTrigger value="history">Withdrawal history</TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="mt-6">
            <CreatorPaidInbox />
          </TabsContent>



          <TabsContent value="earnings" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Received gifts</h3>
              <div className="space-y-2">
                {gifts && gifts.length > 0 ? (
                  gifts.map((g) => {
                    const gross = Number(g.amount || 0);
                    const fee = Number(g.platform_commission ?? gross * 0.15);
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

          <TabsContent value="subs" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Fan club subscriptions (85% yours)</h3>
              <div className="space-y-2">
                {members.map((m: any) => (
                  <div key={m.id} className="flex justify-between items-center p-3 border rounded gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{m.name} • active subscriber</p>
                      <p className="text-sm text-muted-foreground">
                        {m.created_at ? format(new Date(m.created_at), "MMM dd, yyyy") : "—"} • gross €{(Number(m.gross_cents || 0) / 100).toFixed(2)}/mo
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-green-600">+€{(Number(m.net_cents || 0) / 100).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                  </div>
                ))}
                {subs.map((s) => (
                  <div key={s.id} className="flex justify-between items-center p-3 border rounded gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">Subscription payment</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(s.created_at), "MMM dd, yyyy")} • gross €{(Number(s.gross_cents || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-green-600">+€{(Number(s.net_cents || 0) / 100).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Fee: €{(Number(s.platform_fee_cents || 0) / 100).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {subs.length === 0 && members.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No subscription earnings yet</p>
                )}
              </div>

            </Card>
          </TabsContent>

          <TabsContent value="ppv" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">PPV unlocks (85% yours)</h3>
              <div className="space-y-2">
                {ppv.length > 0 ? ppv.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-3 border rounded gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.influking_ppv_posts?.title || "PPV post"}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(p.created_at), "MMM dd, yyyy")} • gross €{(Number(p.amount_cents || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-green-600">+€{(Number(p.creator_earnings_cents || 0) / 100).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Fee: €{(Number(p.platform_fee_cents || 0) / 100).toFixed(2)}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-8">No PPV earnings yet</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="dms" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Paid DMs &amp; shoutouts (85% yours)</h3>
              <div className="space-y-2">
                {dms.length > 0 ? dms.map((d) => (
                  <div key={d.id} className="flex justify-between items-center p-3 border rounded gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate capitalize">{(d.request_type || "message").replace("_", " ")}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(d.created_at), "MMM dd, yyyy")} • gross €{Number(d.amount_paid || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-green-600">+€{Number(d.creator_payout || 0).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Fee: €{Number(d.platform_fee || 0).toFixed(2)}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-8">No paid DM earnings yet</p>
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
