import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export const TutoringCreditsPanel = () => {
  const { totalBalance, loading, purchaseCredits } = useAICredits();

  const openCreditStore = async () => {
    const url = await purchaseCredits(50, 9.99);
    if (url) window.location.href = url;
  };

  return (
    <>
      <FloatingHowItWorks title="How Tutoring Credits Panel works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="backdrop-blur-xl bg-card/80 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Coins className="h-4 w-4 text-amber-500" />
              </div>
              <CardTitle className="text-lg">Your Credits</CardTitle>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400">
              {loading
                ? <span className="inline-block h-4 w-16 rounded bg-amber-500/30 animate-pulse" />
                : <>{totalBalance} AI credits</>}
            </Badge>
          </div>
          <CardDescription>Education tutor uses the unified AI credit balance. Chat and voice tutor cost 2 AI credits per message.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={openCreditStore} className="w-full sm:w-auto">Buy AI credits</Button>
        </CardContent>
      </Card>
    </>
    );
};
