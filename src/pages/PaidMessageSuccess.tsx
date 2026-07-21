import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function PaidMessageSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "paid" | "pending" | "error">(
    "loading"
  );
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const id = params.get("id");
    const sessionId = params.get("session_id");
    if (!id) {
      setState("error");
      setErrorMsg("Missing message id");
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "verify-paid-message",
          { body: { id, sessionId } }
        );
        if (error) throw error;
        setState(data?.status === "paid" ? "paid" : "pending");
      } catch (e: any) {
        setState("error");
        setErrorMsg(e?.message ?? "Verification failed");
      }
    })();
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          {state === "loading" && (
            <>
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <h1 className="text-xl font-semibold">Verifying payment...</h1>
            </>
          )}
          {state === "paid" && (
            <>
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
              <h1 className="text-2xl font-bold">Payment successful!</h1>
              <p className="text-muted-foreground">
                Your message was delivered to the creator. You'll get a
                notification when they respond.
              </p>
              <Button onClick={() => navigate("/messages")} className="w-full">
                Go to Messages
              </Button>
            </>
          )}
          {state === "pending" && (
            <>
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-amber-500" />
              <h1 className="text-xl font-semibold">Payment pending</h1>
              <p className="text-muted-foreground">
                Stripe is still processing. Refresh in a moment or check your
                messages later.
              </p>
              <Button variant="outline" onClick={() => location.reload()}>
                Refresh
              </Button>
            </>
          )}
          {state === "error" && (
            <>
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <h1 className="text-xl font-semibold">Verification failed</h1>
              <p className="text-muted-foreground text-sm">{errorMsg}</p>
              <Button onClick={() => navigate("/")}>Home</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
