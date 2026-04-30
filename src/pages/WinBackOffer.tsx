import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Sparkles, Loader2, CheckCircle2, Clock, X } from "lucide-react";
import { toast } from "sonner";

interface Offer {
  id: string;
  email: string;
  offer_percent_off: number;
  offer_duration_months: number;
  offer_expires_at: string;
  status: string;
  claimed_at: string | null;
}

// Default subscription price for win-back claim — main monthly plan.
const DEFAULT_PRICE_ID = "price_1SZr6QGaXSfGtYFtT7ccy644";

const WinBackOffer = () => {
  const { token } = useParams<{ token: string }>();
  const [params] = useSearchParams();
  const justClaimed = params.get("success") === "1";
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("winback-get-offer", {
        body: { token },
      });
      if (error || (data as any)?.error) {
        toast.error("Offer not found or expired");
      } else {
        setOffer(data as Offer);
      }
      setLoading(false);
    })();
  }, [token]);

  const claim = async () => {
    if (!token) return;
    setClaiming(true);
    const { data, error } = await supabase.functions.invoke("winback-claim", {
      body: { token, priceId: DEFAULT_PRICE_ID },
    });
    setClaiming(false);
    if (error || !(data as any)?.url) {
      toast.error((data as any)?.error || "Couldn't start checkout");
      return;
    }
    { const __u = (data as any).url; const __w = window.open(__u, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = __u; }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="p-8 text-center max-w-md">
          <X className="h-10 w-10 mx-auto mb-3 text-destructive" />
          <h1 className="text-xl font-bold mb-2">Offer not found</h1>
          <p className="text-muted-foreground">This link may have expired or been claimed already.</p>
        </Card>
      </div>
    );
  }

  const expired = new Date(offer.offer_expires_at).getTime() < Date.now();
  const claimed = offer.status === "claimed" || justClaimed;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4">
      <Card className="max-w-lg w-full p-8 sm:p-10 backdrop-blur-xl bg-card/80 border-primary/20 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto mb-6 p-4 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 w-fit">
            {claimed ? (
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            ) : (
              <Heart className="h-12 w-12 text-primary fill-primary/30" />
            )}
          </div>

          {claimed ? (
            <>
              <h1 className="text-3xl font-bold mb-3">Welcome back! 🎉</h1>
              <p className="text-muted-foreground mb-6">
                Your discount is active. We're so glad to have you back.
              </p>
              <Button asChild size="lg" className="w-full">
                <a href="/account/subscriptions">Go to my subscription</a>
              </Button>
            </>
          ) : expired ? (
            <>
              <h1 className="text-2xl font-bold mb-3">This offer has expired</h1>
              <p className="text-muted-foreground mb-6">
                But you're still welcome back any time at our regular pricing.
              </p>
              <Button asChild size="lg" variant="outline" className="w-full">
                <a href="/subscription">View plans</a>
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-2">
                Exclusive offer for {offer.email}
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
                We miss you.
                <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {offer.offer_percent_off}% off
                </span>{" "}
                for {offer.offer_duration_months} months
              </h1>
              <p className="text-muted-foreground mb-6">
                Come back to everything you loved — at a special price, just for you.
              </p>

              <div className="flex items-center justify-center gap-2 mb-6 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Expires {new Date(offer.offer_expires_at).toLocaleDateString()}
              </div>

              <Button
                onClick={claim}
                disabled={claiming}
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold text-lg py-6 hover:opacity-95 shadow-lg shadow-primary/30"
              >
                {claiming ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Claim my {offer.offer_percent_off}% discount
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Cancel anytime. After {offer.offer_duration_months} months, regular pricing applies.
              </p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WinBackOffer;
