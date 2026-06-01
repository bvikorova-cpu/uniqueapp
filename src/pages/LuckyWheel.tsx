import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coins, Sparkles, ArrowLeft, History, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

const SPIN_COST = 5;
const PRIZES = [0, 2, 5, 10, 25, 100];

interface SpinResult {
  cost: number;
  prize: number;
  net: number;
  balance_after: number;
}

export default function LuckyWheel() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [angle, setAngle] = useState(0);

  const loadBalance = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      navigate("/auth");
      return;
    }
    const { data } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", u.user.id)
      .maybeSingle();
    setBalance(data?.credits_remaining ?? 0);
  };

  useEffect(() => {
    loadBalance();
  }, []);

  const spin = async () => {
    if (balance !== null && balance < SPIN_COST) {
      toast.error("Not enough credits", {
        description: `You need at least ${SPIN_COST} CR. Top up in the AI Credits Store.`,
        action: { label: "Top up", onClick: () => navigate("/ai-credits-store") },
      });
      return;
    }
    setSpinning(true);
    setResult(null);

    const targetSpin = 1440 + Math.floor(Math.random() * 360);
    setAngle((a) => a + targetSpin);

    try {
      const { data, error } = await supabase.rpc("spin_lucky_wheel");
      if (error) throw error;
      const r = data as unknown as SpinResult;
      await new Promise((r) => setTimeout(r, 1800));
      setResult(r);
      setBalance(r.balance_after);
      if (r.prize > 0) {
        toast.success(`You won ${r.prize} CR!`, {
          description: `Net: ${r.net >= 0 ? "+" : ""}${r.net} CR`,
        });
      } else {
        toast(`No win this time — lost ${SPIN_COST} CR`);
      }
    } catch (e: any) {
      toast.error(e.message || "Spin failed");
    } finally {
      setSpinning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Lucky Wheel | Unique"
        description="Spin the lucky wheel and win credits. 5 CR per spin."
        canonical="/lucky-wheel"
      />
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/credits/history")}>
            <History className="h-4 w-4 mr-2" /> History
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Lucky Wheel</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          Cost <strong>{SPIN_COST} CR</strong> per spin. Possible prizes: {PRIZES.join(" / ")} CR.
        </p>

        <Card className="p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 text-sm">
            <Coins className="h-4 w-4 text-primary" />
            <span>Your balance:</span>
            <strong>{balance ?? "—"} CR</strong>
          </div>

          <div className="relative w-64 h-64 mx-auto mb-8">
            <div
              className="absolute inset-0 rounded-full border-8 border-primary/30 transition-transform duration-[1800ms] ease-out"
              style={{
                transform: `rotate(${angle}deg)`,
                background: `conic-gradient(
                  hsl(var(--primary)) 0deg 60deg,
                  hsl(var(--accent)) 60deg 120deg,
                  hsl(var(--primary)) 120deg 180deg,
                  hsl(var(--accent)) 180deg 240deg,
                  hsl(var(--primary)) 240deg 300deg,
                  hsl(var(--accent)) 300deg 360deg
                )`,
              }}
            >
              <div className="absolute inset-8 rounded-full bg-background flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-8 border-r-8 border-t-[16px] border-l-transparent border-r-transparent border-t-foreground"
              aria-hidden
            />
          </div>

          <Button
            size="lg"
            onClick={spin}
            disabled={spinning || balance === null}
            className="min-w-[200px]"
          >
            {spinning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Spinning…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" /> Spin ({SPIN_COST} CR)
              </>
            )}
          </Button>

          {result && (
            <div className="mt-6 p-4 rounded-lg bg-muted">
              <div className="text-sm text-muted-foreground">Last spin:</div>
              <div className="text-2xl font-bold mt-1">
                {result.prize > 0 ? `+${result.prize} CR won` : "No win"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Net: <strong>{result.net >= 0 ? "+" : ""}{result.net} CR</strong> · Balance:{" "}
                <strong>{result.balance_after} CR</strong>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
