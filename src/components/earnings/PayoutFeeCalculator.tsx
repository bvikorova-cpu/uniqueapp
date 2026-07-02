import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const FEES: Record<string, { pct: number; fixed: number; label: string }> = {
  stripe: { pct: 0.0025, fixed: 0.25, label: "Stripe Connect" },
  instant: { pct: 0.01, fixed: 0, label: "Instant payout" },
  paypal: { pct: 0.02, fixed: 0.35, label: "PayPal" },
  wise: { pct: 0.005, fixed: 0.5, label: "Wise" },
};

/** Quick fee calculator — shows net for each payout method. */
export function PayoutFeeCalculator() {
  const [amount, setAmount] = useState(100);
  const [method, setMethod] = useState<keyof typeof FEES>("stripe");
  const f = FEES[method];
  const fee = +(amount * f.pct + f.fixed).toFixed(2);
  const net = +(amount - fee).toFixed(2);

  return (
    <>
      <FloatingHowItWorks title={"Payout Fee Calculator - How it works"} steps={[{ title: 'Open', desc: 'Access the Payout Fee Calculator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Payout Fee Calculator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" /> Fee calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Withdraw amount (€)</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <Tabs value={method} onValueChange={(v) => setMethod(v as any)}>
          <TabsList className="grid grid-cols-4 h-8">
            {Object.entries(FEES).map(([k, v]) => (
              <TabsTrigger key={k} value={k} className="text-[11px]">{v.label.split(" ")[0]}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="rounded-lg bg-muted/40 p-3 space-y-1">
          <div className="flex justify-between text-xs"><span>Fee</span><span>€{fee.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold"><span>Net</span><span className="text-emerald-500">€{net.toFixed(2)}</span></div>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
