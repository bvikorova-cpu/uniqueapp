import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Check, Users, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQReferral() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");

  const { data: code, isLoading } = useQuery({
    queryKey: ["iq-referral-code"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_or_create_iq_referral_code");
      if (error) throw error;
      return data as string;
    },
  });

  const { data: refs } = useQuery({
    queryKey: ["iq-referrals-list"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("iq_referrals")
        .select("id, referee_id, created_at, referrer_credits")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const redeem = useMutation({
    mutationFn: async (c: string) => {
      const { data, error } = await supabase.rpc("redeem_iq_referral_code", { _code: c });
      if (error) throw error;
      return data as { referrer_credits: number; referee_credits: number };
    },
    onSuccess: (data) => {
      toast({
        title: "Code redeemed! 🎉",
        description: `You earned +${data.referee_credits} credits. Your friend got +${data.referrer_credits}.`,
      });
      setRedeemCode("");
      qc.invalidateQueries({ queryKey: ["iq-credits"] });
    },
    onError: (e: any) => {
      toast({ title: "Could not redeem", description: e.message, variant: "destructive" });
    },
  });

  const shareUrl = code ? `${window.location.origin}/iq?ref=${code}` : "";

  const copy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    toast({ title: "Link copied!", description: "Share it with your friends." });
  };

  return (
    <>
      <FloatingHowItWorks title="How IQReferral works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4 flex items-center gap-2">
        <Gift className="h-5 w-5 text-primary" /> Invite Friends, Earn Credits
      </h2>
      <Card className="bg-gradient-to-br from-primary/5 to-pink-500/5 border-primary/20">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Your invite code</CardTitle>
          <CardDescription className="text-xs">
            You get +10 credits for each friend, they get +5 on signup.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 px-3 py-2 rounded-lg bg-background/60 border border-border/40 font-mono text-sm tracking-widest text-center">
                {code}
              </div>
              <Button size="sm" onClick={copy} variant="outline">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </motion.div>
          )}

          <div className="pt-2 border-t border-border/30 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Got a code from a friend?</p>
            <div className="flex gap-2">
              <Input
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                className="font-mono uppercase text-xs"
                maxLength={12}
              />
              <Button
                size="sm"
                onClick={() => redeem.mutate(redeemCode)}
                disabled={redeem.isPending || redeemCode.length < 4}
              >
                {redeem.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Redeem"}
              </Button>
            </div>
          </div>

          {refs && refs.length > 0 && (
            <div className="pt-2 border-t border-border/30">
              <p className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                <Users className="h-3.5 w-3.5" /> Your referrals ({refs.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {refs.slice(0, 12).map((r: any) => (
                  <Badge key={r.id} variant="secondary" className="text-[10px]">
                    +{r.referrer_credits}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
    );
}
