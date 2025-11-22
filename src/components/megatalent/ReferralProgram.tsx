import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Copy, Users, DollarSign, Share2, Facebook, Twitter, Mail } from "lucide-react";

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
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Referral Program
          </span>
        </h2>
        
        <p className="text-muted-foreground mb-6">
          Invite friends to the contest and earn €5 monthly for each active participant!
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

        <div className="mt-6 p-4 bg-primary/10 rounded-lg">
          <h3 className="font-semibold mb-2">How does it work?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Share your code with friends</li>
            <li>• They enter your code during registration</li>
            <li>• You earn €5 monthly for each active participant</li>
            <li>• You receive earnings every month while they are active</li>
            <li className="text-amber-600 font-medium">⚠️ WARNING: Only new participants can use the code! If the person is already in the contest, they cannot use a referral code and you will not receive €5 for them</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
