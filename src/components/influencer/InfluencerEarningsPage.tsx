import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wallet, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { InfluencerWithdrawalForm } from "./InfluencerWithdrawalForm";
import { format } from "date-fns";
import { EarningsHero, EarningsLiveTicker, EarningsTipsBanner } from "@/components/earnings";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const InfluencerEarningsPage = () => {
  const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null);

  const { data: influencers, isLoading: loadingInfluencers } = useQuery({
    queryKey: ["user-influencers"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("virtual_influencers")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  const { data: balance, isLoading: loadingBalance, refetch: refetchBalance } = useQuery({
    queryKey: ["influencer-balance", selectedInfluencer],
    queryFn: async () => {
      if (!selectedInfluencer) return null;

      const { data, error } = await supabase
        .from("influencer_balances")
        .select("*")
        .eq("influencer_id", selectedInfluencer)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!selectedInfluencer,
  });

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
    enabled: !!selectedInfluencer,
  });

  const { data: earnings } = useQuery({
    queryKey: ["influencer-earnings", selectedInfluencer],
    queryFn: async () => {
      if (!selectedInfluencer) return [];

      const { data, error } = await supabase
        .from("influencer_earnings")
        .select("*")
        .eq("influencer_id", selectedInfluencer)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!selectedInfluencer,
  });

  if (loadingInfluencers) {
    return (
    <>
      <FloatingHowItWorks title={"Influencer Earnings Page - How it works"} steps={[{ title: 'Open', desc: 'Access the Influencer Earnings Page section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Influencer Earnings Page.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </>
  );
  }

  if (!influencers || influencers.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No influencers found. Create one first!</p>
      </Card>
    );
  }

  const currentInfluencer = influencers.find((i) => i.id === selectedInfluencer);

  return (
    <div className="space-y-6">
      <EarningsHero
        title="Influencer Earnings"
        subtitle="Manage your virtual influencer balances and request withdrawals."
        totalEarnings={Number(balance?.total_earned || 0)}
        available={Number(balance?.available_balance || 0)}
        pending={Number(balance?.pending_withdrawal || 0)}
        paidOut={Number(balance?.withdrawn || 0)}
        badge="Creator Treasury"
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <EarningsLiveTicker />
      </div>

      <EarningsTipsBanner />

      <Card className="p-4 border-amber-500/20">
        <label className="text-sm font-medium mb-2 block">Select Influencer</label>
        <select
          className="w-full p-2 border rounded-md bg-background"
          value={selectedInfluencer || ""}
          onChange={(e) => setSelectedInfluencer(e.target.value)}
        >
          <option value="">Choose an influencer...</option>
          {influencers.map((inf) => (
            <option key={inf.id} value={inf.id}>{inf.name}</option>
          ))}
        </select>
      </Card>

      {selectedInfluencer && currentInfluencer && (
        <>

          <Tabs defaultValue="withdraw">
            <TabsList>
              <TabsTrigger value="withdraw">Request Withdrawal</TabsTrigger>
              <TabsTrigger value="history">Withdrawal History</TabsTrigger>
              <TabsTrigger value="earnings">Earnings History</TabsTrigger>
            </TabsList>

            <TabsContent value="withdraw" className="mt-6">
              {(balance?.available_balance || 0) >= 50 ? (
                <InfluencerWithdrawalForm
                  influencerId={selectedInfluencer}
                  availableBalance={balance?.available_balance || 0}
                  onSuccess={() => {
                    refetchBalance();
                    refetchWithdrawals();
                  }}
                />
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-2">
                    Minimum withdrawal amount is €50
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Current balance: €{balance?.available_balance?.toFixed(2) || "0.00"}
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Withdrawal Requests</h3>
                <div className="space-y-3">
                  {withdrawals && withdrawals.length > 0 ? (
                    withdrawals.map((w) => (
                      <div key={w.id} className="flex justify-between items-center p-4 border rounded">
                        <div>
                          <p className="font-medium">€{Number(w.amount).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {w.payment_method?.replace("_", " ")} • {format(new Date(w.created_at), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            w.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : w.status === "approved"
                              ? "bg-blue-100 text-blue-700"
                              : w.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {w.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No withdrawal requests yet</p>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="earnings" className="mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Earnings</h3>
                <div className="space-y-2">
                  {earnings && earnings.length > 0 ? (
                    earnings.map((e) => (
                      <div key={e.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium capitalize">{e.source.replace(/_/g, " ")}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(e.created_at), "MMM dd, yyyy HH:mm")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">+€{Number(e.net_amount).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            Fee: €{Number(e.platform_fee).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No earnings yet</p>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};