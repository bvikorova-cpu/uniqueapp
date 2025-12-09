import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Copy, Users, DollarSign, Share2, Facebook, Twitter, Mail, RefreshCw, TrendingUp, Sparkles } from "lucide-react";

export const ReferralProgram = () => {
  const [referralCode, setReferralCode] = useState<string>("");
  const [earnings, setEarnings] = useState(0);
  const [referredCount, setReferredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get or create referral code
      let { data: codeData } = await supabase
        .from("megatalent_referral_codes")
        .select("code")
        .eq("user_id", user.id)
        .single();

      if (!codeData) {
        // Generate new code
        const { data: newCode } = await supabase.rpc("generate_referral_code");
        
        const { data: insertedCode } = await supabase
          .from("megatalent_referral_codes")
          .insert({ user_id: user.id, code: newCode })
          .select("code")
          .single();

        codeData = insertedCode;
      }

      if (codeData) {
        setReferralCode(codeData.code);
      }

      // Get referral statistics
      const { data: earningsData } = await supabase
        .from("megatalent_referral_earnings")
        .select("amount")
        .eq("referrer_id", user.id);

      const totalEarnings = earningsData?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      setEarnings(totalEarnings);

      // Get count of referred users
      const { data: subsData } = await supabase
        .from("megatalent_subscriptions")
        .select("id")
        .eq("referred_by", user.id)
        .eq("status", "active");

      setReferredCount(subsData?.length || 0);
    } catch (error) {
      console.error("Error loading referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Code copied!",
      description: "Referral code has been copied to clipboard.",
    });
  };

  const shareReferralCode = (platform: string) => {
    const text = `Join me on MegaTalent Contest! Use my referral code: ${referralCode}`;
    const url = `${window.location.origin}?ref=${referralCode}`;
    
    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent("Join MegaTalent Contest")}&body=${encodeURIComponent(text + "\n\n" + url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* RECURRING INCOME HIGHLIGHT BANNER */}
      <Card className="p-6 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 border-2 border-green-500/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/20 rounded-full animate-pulse">
              <RefreshCw className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-green-400">
                RECURRING PASSIVE INCOME!
              </h2>
              <p className="text-green-300/80 text-sm">Earn money every single month</p>
            </div>
          </div>
          
          <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-lg font-semibold text-foreground mb-2">
                  Earn €5 EVERY MONTH for each friend you invite!
                </p>
                <p className="text-muted-foreground">
                  This is <span className="text-green-400 font-bold">NOT a one-time bonus</span>. 
                  When your friend pays their subscription in January, you get €5. 
                  When they pay again in February, you get <span className="text-green-400 font-bold">another €5</span>. 
                  March? <span className="text-green-400 font-bold">Another €5</span>. 
                  And so on, <span className="text-green-400 font-bold">EVERY MONTH</span> they stay subscribed!
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-background/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">10 Friends</p>
              <p className="text-sm text-muted-foreground">= €50/month passive income</p>
            </div>
            <div className="bg-background/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">50 Friends</p>
              <p className="text-sm text-muted-foreground">= €250/month passive income</p>
            </div>
            <div className="bg-background/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-amber-400">100 Friends</p>
              <p className="text-sm text-muted-foreground">= €500/month passive income</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Referral Program
          </span>
        </h2>
        
        <p className="text-muted-foreground mb-6">
          Invite friends to the contest and earn <span className="text-green-400 font-bold">€5 EVERY MONTH</span> for each active participant!
        </p>

        <div className="bg-muted p-4 rounded-lg mb-6">
          <p className="text-sm text-muted-foreground mb-2">Your unique code:</p>
          <div className="flex items-center gap-2 mb-3">
            <code className="text-2xl font-bold tracking-wider flex-1">{referralCode}</code>
            <Button
              variant="outline"
              size="icon"
              onClick={copyReferralCode}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <p className="text-sm text-muted-foreground mr-2">Share:</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => shareReferralCode("facebook")}
              className="h-8 w-8 p-0"
            >
              <Facebook className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => shareReferralCode("twitter")}
              className="h-8 w-8 p-0"
            >
              <Twitter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => shareReferralCode("whatsapp")}
              className="h-8 w-8 p-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => shareReferralCode("email")}
              className="h-8 w-8 p-0"
            >
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Invited Friends</span>
            </div>
            <p className="text-3xl font-bold">{referredCount}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Earnings</span>
            </div>
            <p className="text-3xl font-bold">€{earnings.toFixed(2)}</p>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            How does it work?
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Share your unique referral code with friends</li>
            <li>• They enter your code when they subscribe</li>
            <li className="text-green-400 font-medium">• You earn €5 EVERY MONTH for each active subscriber you referred!</li>
            <li className="text-green-400 font-medium">• The income is RECURRING - as long as they pay, you earn!</li>
            <li>• Invite 10 friends = €50/month, Invite 100 friends = €500/month</li>
            <li className="text-amber-600 font-medium mt-3">⚠️ NOTE: Only NEW participants can use referral codes. Existing members cannot apply codes retroactively.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
