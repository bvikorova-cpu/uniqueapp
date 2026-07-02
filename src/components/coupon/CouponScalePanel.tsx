import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Crown, Gift, Users, Calculator, Chrome, Bitcoin, ShoppingBag, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  userId: string | null;
  wishlistCount: number;
  onBulkBuy?: () => void;
}

const TIER_META: Record<string, { label: string; color: string; next: number | null }> = {
  bronze: { label: "Bronze", color: "from-amber-700 to-amber-900", next: 100 },
  silver: { label: "Silver", color: "from-slate-400 to-slate-600", next: 300 },
  gold: { label: "Gold", color: "from-yellow-400 to-amber-600", next: 1000 },
  diamond: { label: "Diamond", color: "from-cyan-400 to-blue-600", next: null },
};

export function CouponScalePanel({ userId, wishlistCount, onBulkBuy }: Props) {
  const { toast } = useToast();
  const [tier, setTier] = useState<{ tier: string; lifetime_spent_eur: number; perks: any } | null>(null);
  const [giftBalance, setGiftBalance] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [calcOriginal, setCalcOriginal] = useState("");
  const [calcDiscount, setCalcDiscount] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [{ data: t }, { data: g }, { data: r }] = await Promise.all([
        supabase.from("coupon_loyalty_tier" as any).select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("coupon_gift_card_balance" as any).select("balance_eur").eq("user_id", userId).maybeSingle(),
        supabase.from("coupon_affiliate_referrals" as any).select("commission_eur").eq("referrer_id", userId),
      ]);
      setTier((t as any) ?? { tier: "bronze", lifetime_spent_eur: 0, perks: { cashback_pct: 2, discount_pct: 0 } });
      setGiftBalance(Number((g as any)?.balance_eur ?? 0));
      const arr = ((r as any) || []) as { commission_eur: number }[];
      setReferralEarnings(arr.reduce((s, x) => s + Number(x.commission_eur || 0), 0));
      setReferralCount(arr.length);
    })();
  }, [userId]);

  const referralLink = userId ? `${window.location.origin}/coupon-marketplace?ref=${userId}` : "";
  const copyRef = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const meta = TIER_META[tier?.tier ?? "bronze"];
  const progress = meta?.next ? Math.min(100, ((tier?.lifetime_spent_eur ?? 0) / meta.next) * 100) : 100;

  const sellEstimate = (() => {
    const ov = parseFloat(calcOriginal);
    const dp = parseFloat(calcDiscount);
    if (isNaN(ov) || isNaN(dp) || ov <= 0) return null;
    const sellPrice = ov * (1 - dp / 100);
    const platformFee = sellPrice * 0.1;
    const net = sellPrice - platformFee;
    return { sellPrice, platformFee, net };
  })();

  const joinWaitlist = async (kind: "extension" | "crypto") => {
    if (!userId) { toast({ title: "Login required", variant: "destructive" }); return; }
    const browser = navigator.userAgent.includes("Chrome") ? "chrome" : navigator.userAgent.includes("Firefox") ? "firefox" : "other";
    const { error } = await supabase.from("coupon_extension_waitlist" as any).insert({ user_id: userId, kind, email: waitlistEmail || null, browser });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "You're on the list 🚀", description: kind === "extension" ? "We'll email you when the browser extension launches." : "We'll notify you when crypto payments go live." });
  };

  return (
    <>
      <FloatingHowItWorks title={"Coupon Scale Panel - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Scale Panel section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Scale Panel.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* Loyalty tier */}
      <Card className={`bg-gradient-to-br ${meta?.color ?? "from-amber-700 to-amber-900"} text-white border-0`}>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5" />
            <h3 className="font-bold capitalize">{meta?.label} tier</h3>
          </div>
          <p className="text-2xl font-black">€{(tier?.lifetime_spent_eur ?? 0).toFixed(0)} <span className="text-xs font-normal opacity-80">lifetime</span></p>
          <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 text-[11px] opacity-90 space-y-0.5">
            <div>• {tier?.perks?.cashback_pct ?? 2}% cashback on every purchase</div>
            {tier?.perks?.discount_pct > 0 && <div>• {tier.perks.discount_pct}% extra discount</div>}
            {tier?.perks?.priority_support && <div>• Priority dispute support</div>}
            {tier?.perks?.early_access && <div>• Early access to hot drops</div>}
            {meta?.next && <div className="opacity-75 pt-1">€{(meta.next - (tier?.lifetime_spent_eur ?? 0)).toFixed(0)} to next tier</div>}
          </div>
        </CardContent>
      </Card>

      {/* Affiliate */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Refer & earn 5%</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-2">Earn 5% gift-card credit on every purchase your invitees make.</p>
          <div className="flex gap-1 mb-2">
            <Input readOnly value={referralLink} className="h-8 text-[11px]" />
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={copyRef} disabled={!referralLink}>
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          <div className="flex gap-3 text-xs">
            <Badge variant="secondary">{referralCount} referrals</Badge>
            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">€{referralEarnings.toFixed(2)} earned</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Gift card balance + Bulk buy */}
      <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/5 border-rose-500/30">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold">Gift-card credit</h3>
          </div>
          <p className="text-3xl font-black text-rose-600">€{giftBalance.toFixed(2)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Auto-applied at checkout. Earned via referrals & promotions.</p>
          <Button size="sm" variant="outline" className="mt-3 w-full gap-2" onClick={onBulkBuy} disabled={!wishlistCount}>
            <ShoppingBag className="w-3.5 h-3.5" /> Bulk buy wishlist ({wishlistCount})
          </Button>
        </CardContent>
      </Card>

      {/* Sell calculator */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Sell calculator</h3>
          </div>
          <div className="flex gap-1 mb-2">
            <Input placeholder="Value €" type="number" value={calcOriginal} onChange={e => setCalcOriginal(e.target.value)} className="h-8 text-xs" />
            <Input placeholder="Disc %" type="number" value={calcDiscount} onChange={e => setCalcDiscount(e.target.value)} className="h-8 text-xs w-20" />
          </div>
          {sellEstimate ? (
            <div className="text-xs space-y-0.5">
              <div className="flex justify-between"><span className="text-muted-foreground">Sell at</span><span className="font-bold">€{sellEstimate.sellPrice.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Platform fee 10%</span><span>−€{sellEstimate.platformFee.toFixed(2)}</span></div>
              <div className="flex justify-between text-emerald-600 font-bold border-t border-border/50 pt-1"><span>You receive</span><span>€{sellEstimate.net.toFixed(2)}</span></div>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">Enter face value and discount % to estimate your payout.</p>
          )}
        </CardContent>
      </Card>

      {/* Browser extension waitlist */}
      <Card className="md:col-span-2">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Chrome className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold">Browser extension <Badge variant="outline" className="ml-1 text-[10px]">Coming soon</Badge></h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Auto-apply your purchased coupon codes at checkout on 50+ stores. Get notified when it ships.</p>
          <div className="flex gap-2">
            <Input placeholder="Email (optional)" value={waitlistEmail} onChange={e => setWaitlistEmail(e.target.value)} className="h-8 text-xs" />
            <Button size="sm" className="h-8" onClick={() => joinWaitlist("extension")}>Join waitlist</Button>
          </div>
        </CardContent>
      </Card>

      {/* Crypto pay waitlist */}
      <Card className="md:col-span-2">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Bitcoin className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold">Pay with crypto <Badge variant="outline" className="ml-1 text-[10px]">Beta</Badge></h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">USDC, BTC and ETH checkout — anonymous, low fees, instant escrow release.</p>
          <div className="flex gap-2 items-center">
            <Button size="sm" variant="outline" onClick={() => joinWaitlist("crypto")}>Notify me</Button>
            <PushNotificationToggle showLabel={false} />
            <span className="text-[11px] text-muted-foreground">Enable push for instant deal alerts</span>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
