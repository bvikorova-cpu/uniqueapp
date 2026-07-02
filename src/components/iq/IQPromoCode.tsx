import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ticket, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQPromoCode() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [code, setCode] = useState("");

  const redeem = useMutation({
    mutationFn: async (c: string) => {
      const { data, error } = await supabase.rpc("redeem_iq_promo_code", { _code: c });
      if (error) throw error;
      return data as { credits: number; code: string };
    },
    onSuccess: (d) => {
      toast({
        title: "Promo redeemed! 🎟️",
        description: `+${d.credits} IQ credits added to your balance.`,
      });
      setCode("");
      qc.invalidateQueries({ queryKey: ["iq-credits"] });
    },
    onError: (e: any) => {
      toast({ title: "Could not redeem", description: e.message, variant: "destructive" });
    },
  });

  return (
    <>
      <FloatingHowItWorks title="How IQPromo Code works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20">
      <CardHeader className="p-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Ticket className="h-4 w-4 text-amber-400" /> Promo Code
        </CardTitle>
        <CardDescription className="text-xs">
          Got a promotional code? Redeem it for free credits.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER PROMO CODE"
            className="font-mono uppercase text-xs"
            maxLength={20}
          />
          <Button
            size="sm"
            onClick={() => redeem.mutate(code)}
            disabled={redeem.isPending || code.length < 3}
          >
            {redeem.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Redeem"}
          </Button>
        </div>
      </CardContent>
    </Card>
    </>
    );
}
