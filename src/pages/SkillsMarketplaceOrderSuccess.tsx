import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, AlertCircle, ListOrdered } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function SkillsMarketplaceOrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState<"verifying" | "ok" | "pending" | "error">("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setState("error");
      setError("Missing session id");
      return;
    }
    (async () => {
      const { data, error } = await supabase.functions.invoke("verify-skill-service-order", {
        body: { sessionId },
      });
      if (error) {
        setState("error");
        setError(error.message);
        return;
      }
      if (data?.status === "paid") setState("ok");
      else setState("pending");
    })();
  }, [sessionId]);

  return (
    <>
      <FloatingHowItWorks title="How Skills Marketplace Order Success works" steps={[
          { title: 'Browse listings', desc: 'Explore items, services or offers.' },
          { title: 'Open a detail', desc: 'Review price, seller and terms.' },
          { title: 'Buy / order / bid', desc: 'Complete secure Stripe checkout in EUR. Fees follow platform splits.' },
          { title: 'Track & review', desc: 'Manage orders, leave reviews, get notifications.' },
        ]} />
      <div className="container mx-auto px-4 py-16 max-w-xl">
      <Card>
        <CardContent className="py-10 text-center space-y-4">
          {state === "verifying" && (
            <>
              <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
              <h1 className="text-xl font-semibold">Confirming your payment…</h1>
            </>
          )}
          {state === "ok" && (
            <>
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
              <h1 className="text-2xl font-bold">Payment received</h1>
              <p className="text-muted-foreground">Your order is now active. The provider has been notified.</p>
              <div className="flex gap-2 justify-center pt-2">
                <Button asChild><Link to="/skills-marketplace/orders" className="gap-2"><ListOrdered className="h-4 w-4" /> My Orders</Link></Button>
                <Button asChild variant="outline"><Link to="/skills-marketplace">Browse more</Link></Button>
              </div>
            </>
          )}
          {state === "pending" && (
            <>
              <Loader2 className="h-10 w-10 mx-auto text-yellow-500" />
              <h1 className="text-xl font-semibold">Payment pending</h1>
              <p className="text-muted-foreground">Stripe is still processing the payment. Check My Orders shortly.</p>
              <Button asChild><Link to="/skills-marketplace/orders">My Orders</Link></Button>
            </>
          )}
          {state === "error" && (
            <>
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <h1 className="text-xl font-semibold">We couldn't confirm the payment</h1>
              <p className="text-muted-foreground">{error}</p>
              <Button asChild><Link to="/skills-marketplace/orders">Go to My Orders</Link></Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
    </>
    );
}
