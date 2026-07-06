import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function PromotionsSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!sessionId) { setState("error"); setMessage("Missing session id"); return; }
    (async () => {
      const { data, error } = await supabase.functions.invoke("verify-promo-subscription", {
        body: { sessionId },
      });
      if (error || data?.error) {
        setState("error");
        setMessage(error?.message || data?.error || "Verification failed");
        return;
      }
      if (data?.ok) { setState("ok"); }
      else { setState("error"); setMessage("Payment not completed yet — try again in a moment."); }
    })();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          {state === "loading" && (
            <>
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <h1 className="text-xl font-bold">Confirming your payment…</h1>
            </>
          )}
          {state === "ok" && (
            <>
              <CheckCircle2 className="h-14 w-14 mx-auto text-green-500" />
              <h1 className="text-2xl font-bold">Promotion is live!</h1>
              <p className="text-muted-foreground">
                Your listing is now on the Promotions Board for the next 30 days.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <Button asChild variant="premium"><Link to="/promotions">View board</Link></Button>
                <Button asChild variant="outline"><Link to="/promotions/mine">My promotions</Link></Button>
              </div>
            </>
          )}
          {state === "error" && (
            <>
              <XCircle className="h-14 w-14 mx-auto text-destructive" />
              <h1 className="text-xl font-bold">We could not confirm the payment</h1>
              <p className="text-muted-foreground text-sm">{message}</p>
              <Button asChild><Link to="/promotions/mine">Go to my promotions</Link></Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
