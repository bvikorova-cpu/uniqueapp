import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Star, Crown, Gift, Eye, Zap, Sparkles, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useToast } from "@/hooks/use-toast";


interface Pack {
  key: string;
  label: string;
  count: number;
  credits: number;
  perUnit: number;
  popular?: boolean;
  icon: typeof Flame;
  gradient: string;
}

const BOOST_PACKS: Pack[] = [
  { key: "boost_1", label: "Single Boost", count: 1, credits: 20, perUnit: 20, icon: Flame, gradient: "from-orange-500 to-pink-500" },
  { key: "boost_5", label: "5 Boosts", count: 5, credits: 80, perUnit: 16, popular: true, icon: Flame, gradient: "from-orange-500 to-pink-500" },
  { key: "boost_15", label: "15 Boosts", count: 15, credits: 200, perUnit: 13, icon: Flame, gradient: "from-orange-500 to-pink-500" },
];

const SUPER_PACKS: Pack[] = [
  { key: "super_5", label: "5 Super Likes", count: 5, credits: 25, perUnit: 5, icon: Star, gradient: "from-blue-500 to-cyan-500" },
  { key: "super_25", label: "25 Super Likes", count: 25, credits: 100, perUnit: 4, popular: true, icon: Star, gradient: "from-blue-500 to-cyan-500" },
  { key: "super_60", label: "60 Super Likes", count: 60, credits: 200, perUnit: 3, icon: Star, gradient: "from-blue-500 to-cyan-500" },
];

interface Props {
  userId: string;
  isSubscribed: boolean;
  likesYouCount: number;
  onSubscribe: () => void;
}

export const DatingPremiumPanel = ({ userId, isSubscribed, likesYouCount, onSubscribe }: Props) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [credits, setCredits] = useState<number>(0);
  const [gifts, setGifts] = useState<any[]>([]);
  const [perks, setPerks] = useState<{ boosts: number; super_likes: number }>({ boosts: 0, super_likes: 0 });
  const [buying, setBuying] = useState<string | null>(null);

  const refresh = async () => {
    const [{ data }, { data: p }] = await Promise.all([
      supabase.from("ai_credits").select("credits_remaining").eq("user_id", userId).maybeSingle(),
      supabase.from("dating_perk_balances").select("boosts, super_likes").eq("user_id", userId).maybeSingle(),
    ]);
    setCredits(data?.credits_remaining ?? 0);
    setPerks({ boosts: p?.boosts ?? 0, super_likes: p?.super_likes ?? 0 });
  };

  useEffect(() => {
    (async () => {
      await refresh();
      const { data: g } = await supabase.from("dating_gifts").select("*").order("price", { ascending: true });
      setGifts(g || []);
    })();
  }, [userId]);

  const goTopUp = () => navigate("/ai-credits");

  const buyPack = async (pack: Pack, kind: "boost" | "super_like") => {
    if (buying) return;
    if (credits < pack.credits) {
      toast({ title: "Not enough credits", description: `${pack.label} costs ${pack.credits} credits. You have ${credits}.`, variant: "destructive" });
      return;
    }
    setBuying(pack.key);
    try {
      const { data, error } = await supabase.rpc("purchase_dating_perk", { p_kind: kind, p_count: pack.count, p_credits: pack.credits });
      const res = data as any;
      if (error || !res?.success) {
        toast({
          title: res?.error === "insufficient_credits" ? "Not enough credits" : "Purchase failed",
          description: res?.error === "insufficient_credits" ? `${pack.label} costs ${pack.credits} credits.` : (error?.message || "Please try again."),
          variant: "destructive",
        });
        return;
      }
      setPerks({ boosts: res.boosts ?? 0, super_likes: res.super_likes ?? 0 });
      setCredits(c => Math.max(0, c - pack.credits));
      window.dispatchEvent(new Event("ai-credits-updated"));
      toast({ title: "Purchased!", description: `${pack.label} added to your account (−${pack.credits} credits).` });
    } finally {
      setBuying(null);
    }
  };


  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Dating Premium Panel"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      {/* Credit balance */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-pink-500/10">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Your credit balance</p>
            <p className="text-2xl font-bold">{credits} credits</p>
          </div>
          <Button onClick={goTopUp} className="gap-2"><Zap className="h-4 w-4" /> Top up</Button>
        </CardContent>
      </Card>

      {/* See who likes you paywall */}
      {!isSubscribed && likesYouCount > 0 && (
        <Card className="border-2 border-pink-500/40 bg-gradient-to-br from-pink-500/10 to-primary/10">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-pink-500 to-primary flex items-center justify-center text-white shrink-0">
              <Eye className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">{likesYouCount} people like you</p>
              <p className="text-sm text-muted-foreground">Unlock with Unique+ to see who and match instantly.</p>
            </div>
            <Button onClick={onSubscribe} className="gap-2 bg-gradient-to-r from-pink-500 to-primary">
              <Crown className="h-4 w-4" /> Unlock
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Boost packs */}
      <section>
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><Flame className="h-5 w-5 text-orange-500" /> Boost packs</h2>
        <p className="text-sm text-muted-foreground mb-3">Be a top profile for 30 minutes. 10× more views. You own <strong>{perks.boosts}</strong> boost{perks.boosts === 1 ? "" : "s"}.</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {BOOST_PACKS.map(p => <PackCard key={p.key} pack={p} busy={buying === p.key} onBuy={() => buyPack(p, "boost")} />)}
        </div>
      </section>

      {/* Super Like packs */}
      <section>
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><Star className="h-5 w-5 text-blue-500" /> Super Like packs</h2>
        <p className="text-sm text-muted-foreground mb-3">Stand out. Super Likes are 3× more likely to match. You own <strong>{perks.super_likes}</strong> extra.</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {SUPER_PACKS.map(p => <PackCard key={p.key} pack={p} busy={buying === p.key} onBuy={() => buyPack(p, "super_like")} />)}
        </div>
      </section>


      {/* Daily credit access */}
      {!isSubscribed && (
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><Crown className="h-5 w-5 text-yellow-500" /> Daily access</h2>
          <Card className="border-2 border-primary/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Dating access</CardTitle>
              <p className="text-3xl font-bold">2<span className="text-sm font-normal text-muted-foreground"> credits / day</span></p>
            </CardHeader>
            <CardContent className="space-y-2">
              {["See who likes you", "Unlimited likes", "Super Likes", "Rewind last swipe", "AI Tools (3 credits each)"].map(f => (
                <div key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
              <Button className="w-full mt-3 bg-gradient-to-r from-primary to-pink-500" onClick={onSubscribe}>Unlock today · 2 credits</Button>
            </CardContent>
          </Card>
        </section>
      )}


      {/* Gift store */}
      {gifts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><Gift className="h-5 w-5 text-pink-500" /> Gift store</h2>
          <p className="text-sm text-muted-foreground mb-3">Send a gift to any of your matches from the chat.</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {gifts.map(g => (
              <Card key={g.id} className="border hover:border-primary/50 transition-all">
                <CardContent className="p-3 text-center">
                  <div className="text-4xl mb-1">{g.icon}</div>
                  <p className="text-xs font-semibold truncate">{g.name}</p>
                  <p className="text-xs text-muted-foreground">{g.price} cr</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const PackCard = ({ pack, onBuy, busy }: { pack: Pack; onBuy: () => void; busy?: boolean }) => {
  const Icon = pack.icon;
  return (
    <Card className={`relative border-2 ${pack.popular ? "border-primary shadow-lg" : "border-border"}`}>
      {pack.popular && <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">Best value</Badge>}
      <CardContent className="p-4 text-center space-y-2">
        <div className={`mx-auto h-12 w-12 rounded-full bg-gradient-to-br ${pack.gradient} flex items-center justify-center text-white`}>
          <Icon className="h-6 w-6" />
        </div>
        <p className="font-bold">{pack.label}</p>
        <p className="text-2xl font-bold">{pack.credits}<span className="text-sm font-normal text-muted-foreground"> cr</span></p>
        <p className="text-xs text-muted-foreground">{pack.perUnit} cr each</p>
        <Button size="sm" className="w-full" onClick={onBuy} disabled={busy}>{busy ? "Buying…" : "Buy"}</Button>

      </CardContent>
    </Card>
  );
};



