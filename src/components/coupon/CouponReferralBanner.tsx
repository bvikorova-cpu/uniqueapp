import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Copy, Check } from "lucide-react";
import { useReferralProgram } from "@/hooks/useReferralProgram";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function CouponReferralBanner({ userId }: { userId: string | null }) {
  const { toast } = useToast();
  const { stats, loading } = useReferralProgram();
  const [copied, setCopied] = useState(false);

  if (!userId || loading || !stats?.code) return null;
  const link = `${window.location.origin}/coupons?ref=${stats.code}`;

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "Link copied", description: "Share with friends and earn €2 credit per first purchase." });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <FloatingHowItWorks title={"Coupon Referral Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Referral Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Referral Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border-emerald-500/30 mb-6">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-emerald-500" />
          <div>
            <h3 className="font-bold text-sm">Invite friends — earn €2 each</h3>
            <p className="text-xs text-muted-foreground">{stats?.totalReferrals ?? 0} friends invited · €{Number(stats?.totalEarnings ?? 0).toFixed(2)} earned</p>
          </div>
        </div>
        <div className="flex-1 w-full sm:w-auto flex gap-2">
          <input readOnly value={link} className="flex-1 text-xs px-3 py-2 rounded-md bg-background border border-border min-w-0" />
          <Button size="sm" onClick={copy}>{copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}</Button>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
