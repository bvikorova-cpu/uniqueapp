import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Coins, Loader2, Sparkles } from "lucide-react";
import {
  MESSENGER_TOOL_COSTS,
  isMessengerToolUnlocked,
  useMessengerToolCredits,
  type MessengerTool,
} from "@/hooks/useMessengerToolCredits";

interface MessengerToolGateProps {
  tool: MessengerTool;
  title: string;
  description: string;
  userId: string;
  onBack: () => void;
  children: ReactNode;
}

export const MessengerToolGate = ({ tool, title, description, userId, onBack, children }: MessengerToolGateProps) => {
  const cost = MESSENGER_TOOL_COSTS[tool];
  const { balance, loading, unlock } = useMessengerToolCredits(userId);
  const [unlocked, setUnlocked] = useState(() => isMessengerToolUnlocked(tool, userId));
  const [paying, setPaying] = useState(false);

  if (unlocked) return <>{children}</>;

  const handleUnlock = async () => {
    setPaying(true);
    const ok = await unlock(tool);
    setPaying(false);
    if (ok) setUnlocked(true);
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to hub
      </Button>

      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardContent className="space-y-5 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="rounded-lg bg-primary/5 p-4 text-sm">
            <p className="font-semibold">{cost} credits — full access for today</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No subscription. One payment unlocks this tool until midnight, refreshes don&apos;t charge again.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4" />
            {loading ? "Loading balance…" : `Your balance: ${balance} credits`}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleUnlock} disabled={paying || loading} className="w-full">
              {paying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Unlock for {cost} credits
            </Button>
            <Button variant="outline" className="w-full" onClick={() => { window.location.href = "/ai-credits"; }}>
              Buy credits
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
