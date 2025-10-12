import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Copy, Users, DollarSign } from "lucide-react";

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
      title: "Kód skopírovaný!",
      description: "Referenčný kód bol skopírovaný do schránky.",
    });
  };

  if (loading) {
    return <div>Načítavam...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Referenčný program
          </span>
        </h2>
        
        <p className="text-muted-foreground mb-6">
          Pozvi priateľov do súťaže a zarábaš 5€ mesačne za každého aktívneho účastníka!
        </p>

        <div className="bg-muted p-4 rounded-lg mb-6">
          <p className="text-sm text-muted-foreground mb-2">Tvoj unikátny kód:</p>
          <div className="flex items-center gap-2">
            <code className="text-2xl font-bold tracking-wider">{referralCode}</code>
            <Button
              variant="outline"
              size="icon"
              onClick={copyReferralCode}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Pozvaní priatelia</span>
            </div>
            <p className="text-3xl font-bold">{referredCount}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Celkové výnosy</span>
            </div>
            <p className="text-3xl font-bold">{earnings.toFixed(2)}€</p>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-primary/10 rounded-lg">
          <h3 className="font-semibold mb-2">Ako to funguje?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Zdieľaj svoj kód s priateľmi</li>
            <li>• Pri registrácii zadajú tvoj kód</li>
            <li>• Zarobíš 5€ mesačne za každého aktívneho účastníka</li>
            <li>• Výnosy dostávaš každý mesiac, kým sú aktívni</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
