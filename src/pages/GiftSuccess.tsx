import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertCircle, Gift } from "lucide-react";

export default function GiftSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "paid" | "pending" | "error">("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const id = params.get("id");
    const sessionId = params.get("session_id");
    if (!id) {
      setState("error");
      setMsg("Missing gift id");
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-creator-gift", {
          body: { id, sessionId } });
        if (error) throw error;
        setState(data?.status === "paid" ? "paid" : "pending");
      } catch (e: any) {
        setState("error");
        setMsg(e?.message ?? "Verification failed");
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
              <h1 className="text-xl font-semibold">Confirming your gift…</h1>
            </>
          )}
          {state === "paid" && (
            <>
              <div className="relative">
                <CheckCircle2 className="h-16 w-16 mx-auto text-primary" />
                <Gift className="h-6 w-6 absolute top-0 right-1/3 text-accent-foreground" />
              </div>
              <h1 className="text-2xl font-bold">Gift delivered! 🎁</h1>
              <p className="text-muted-foreground">
                Your gift is now on the creator's public Gift Wall.
              </p>
              <Button onClick={() => navigate(-1)} className="w-full">
                Back to creator
              </Button>
            </>
          )}
          {state === "pending" && (
            <>
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-amber-500" />
              <h1 className="text-xl font-semibold">Payment pending</h1>
              <p className="text-muted-foreground">
                Stripe is still processing. Refresh in a moment.
              </p>
              <Button variant="outline" onClick={() => location.reload()}>Refresh</Button>
            </>
          )}
          {state === "error" && (
            <>
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <h1 className="text-xl font-semibold">Verification failed</h1>
              <p className="text-sm text-muted-foreground">{msg}</p>
              <Button onClick={() => navigate("/")}>Home</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
