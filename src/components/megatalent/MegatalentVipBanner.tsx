import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Zap, EyeOff, Star } from "lucide-react";
import { useMegatalentVip } from "@/hooks/useMegatalentVip";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const MegatalentVipBanner = () => {
  const { isVip, loading, refresh, startCheckout } = useMegatalentVip();
  const [params, setParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const vip = params.get("vip");
    if (vip === "success") {
      toast({
        title: "👑 VIP Pass activated!",
        description: "Enjoy your exclusive perks.",
      });
      refresh();
      params.delete("vip");
      params.delete("session_id");
      setParams(params, { replace: true });
    } else if (vip === "cancel") {
      params.delete("vip");
      setParams(params, { replace: true });
    }
  }, [params, setParams, toast, refresh]);

  if (loading) return null;

  if (isVip) {
    return (
    <>
      <FloatingHowItWorks title={"Megatalent Vip Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Vip Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Vip Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border-amber-500/40">
        <CardContent className="flex items-center gap-3 py-3">
          <Crown className="h-5 w-5 text-amber-500" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">VIP Viewer Pass</span>
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Star className="h-3 w-3" /> ACTIVE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Ad-free • Early voting • Exclusive content
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/15 via-accent/10 to-amber-500/15 border-primary/30 overflow-hidden relative">
      <CardContent className="py-4 space-y-3">
        <div className="flex items-start gap-3">
          <Crown className="h-6 w-6 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base flex items-center gap-2">
              VIP Viewer Pass
              <Badge className="bg-amber-500 text-black hover:bg-amber-500">
                €4.99/mo
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              For fans who want more from Megatalent
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <EyeOff className="h-3.5 w-3.5 text-primary" />
            <span>Ad-free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>Early voting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Behind-the-scenes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span>VIP badge</span>
          </div>
        </div>

        <Button
          onClick={() => startCheckout()}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:opacity-90"
          size="sm"
        >
          <Crown className="h-4 w-4 mr-2" />
          Become a VIP viewer
        </Button>
      </CardContent>
    </Card>
  );
};

export default MegatalentVipBanner;
