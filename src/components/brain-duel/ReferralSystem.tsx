import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Copy, Gift, Check, Share2, Sparkles, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const ReferralSystem = () => {
  const queryClient = useQueryClient();
  const [referralInput, setReferralInput] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: myCode, isLoading: codeLoading } = useQuery({
    queryKey: ["brain-duel-referral-code"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("brain_duel_referral_codes")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) return data;

      // Generate unique code
      const code = `BD${user.id.substring(0, 6).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      const { data: newCode } = await supabase
        .from("brain_duel_referral_codes")
        .insert({ user_id: user.id, code })
        .select()
        .single();

      return newCode;
    },
  });

  const { data: referrals } = useQuery({
    queryKey: ["brain-duel-referrals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("brain_duel_referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      return data || [];
    },
  });

  const useReferral = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase.functions.invoke("brain-duel-use-referral", {
        body: { referralCode: code },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`🎉 Referral bonus! +${data.bonusCredits} credits added!`);
      setReferralInput("");
      queryClient.invalidateQueries({ queryKey: ["brain-duel-credits"] });
      queryClient.invalidateQueries({ queryKey: ["brain-duel-referrals"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const copyCode = () => {
    if (myCode?.code) {
      navigator.clipboard.writeText(myCode.code);
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareCode = () => {
    if (myCode?.code && navigator.share) {
      navigator.share({
        title: "Join me on BrainDuel!",
        text: `Use my referral code ${myCode.code} to get 10 bonus credits when you join BrainDuel!`,
        url: window.location.origin + "/brain-duel",
      }).catch(() => copyCode());
    } else {
      copyCode();
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Referral System - How it works"} steps={[{ title: 'Open', desc: 'Access the Referral System section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Referral System.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-green-500/10">
            <Users className="h-5 w-5 text-green-400" />
          </div>
          Referral System
        </CardTitle>
        <CardDescription>
          Invite friends and both earn <span className="text-green-400 font-bold">10 bonus credits!</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* Your referral code */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <p className="text-xs text-muted-foreground mb-2">Your Referral Code</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-background/50 rounded-lg px-4 py-3 font-mono text-lg font-bold text-green-400 tracking-wider text-center border border-green-500/20">
              {codeLoading ? "..." : myCode?.code || "N/A"}
            </div>
            <Button size="icon" variant="outline" onClick={copyCode} className="border-green-500/30 hover:bg-green-500/10">
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="outline" onClick={shareCode} className="border-green-500/30 hover:bg-green-500/10">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div className="p-3 rounded-xl bg-muted/30 border border-primary/10 text-center" whileHover={{ scale: 1.03 }}>
            <UserPlus className="h-5 w-5 mx-auto mb-1 text-green-400" />
            <div className="text-xl font-black text-green-400">{myCode?.total_referrals || 0}</div>
            <div className="text-[10px] text-muted-foreground">Friends Invited</div>
          </motion.div>
          <motion.div className="p-3 rounded-xl bg-muted/30 border border-primary/10 text-center" whileHover={{ scale: 1.03 }}>
            <Sparkles className="h-5 w-5 mx-auto mb-1 text-yellow-400" />
            <div className="text-xl font-black text-yellow-400">{myCode?.total_bonus_credits || 0}</div>
            <div className="text-[10px] text-muted-foreground">Bonus Credits Earned</div>
          </motion.div>
        </div>

        {/* Use a referral code */}
        <div className="border-t border-border/30 pt-4">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            Have a referral code?
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter code..."
              value={referralInput}
              onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
              className="font-mono uppercase bg-muted/20"
              maxLength={20}
            />
            <Button
              onClick={() => useReferral.mutate(referralInput)}
              disabled={!referralInput || useReferral.isPending}
              className="shadow-lg shadow-primary/20"
            >
              {useReferral.isPending ? "..." : "Redeem"}
            </Button>
          </div>
        </div>

        {/* Recent referrals */}
        {referrals && referrals.length > 0 && (
          <div className="border-t border-border/30 pt-4">
            <p className="text-xs text-muted-foreground mb-2">Recent Referrals</p>
            <div className="space-y-1">
              {referrals.slice(0, 5).map((ref: any, i: number) => (
                <motion.div
                  key={ref.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-muted/20 text-xs"
                >
                  <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                    +{ref.bonus_credits_awarded} credits
                  </Badge>
                  <span className="text-muted-foreground">
                    {new Date(ref.created_at).toLocaleDateString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
