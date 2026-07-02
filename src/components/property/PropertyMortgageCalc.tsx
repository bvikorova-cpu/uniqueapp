import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Calculator, DollarSign, Percent, Calendar, TrendingUp, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const PropertyMortgageCalc = ({ onBack }: Props) => {
  const [price, setPrice] = useState(150000);
  const [downPayment, setDownPayment] = useState(20);
  const [interestRate, setInterestRate] = useState(4.5);
  const [years, setYears] = useState(25);

  const result = useMemo(() => {
    const principal = price * (1 - downPayment / 100);
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = years * 12;
    const monthly = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    const totalPaid = monthly * numPayments;
    const totalInterest = totalPaid - principal;

    return {
      monthly: Math.round(monthly),
      totalPaid: Math.round(totalPaid),
      totalInterest: Math.round(totalInterest),
      principal: Math.round(principal),
      downPaymentAmount: Math.round(price * downPayment / 100),
    };
  }, [price, downPayment, interestRate, years]);

  return (
    <>
      <FloatingHowItWorks title={"Property Mortgage Calc - How it works"} steps={[{ title: 'Open', desc: 'Access the Property Mortgage Calc section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property Mortgage Calc.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </Button>

      <Card className="backdrop-blur-xl bg-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            <Calculator className="w-6 h-6 text-emerald-500" />
            Mortgage Calculator Pro
          </CardTitle>
          <p className="text-sm text-muted-foreground">Advanced mortgage calculations with visual breakdowns</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Property Price</Label>
                  <span className="text-sm font-bold text-primary">€{price.toLocaleString()}</span>
                </div>
                <Slider value={[price]} onValueChange={v => setPrice(v[0])} min={30000} max={1000000} step={5000} />
                <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="text-sm" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><PiggyBank className="w-4 h-4" /> Down Payment</Label>
                  <span className="text-sm font-bold text-primary">{downPayment}% (€{result.downPaymentAmount.toLocaleString()})</span>
                </div>
                <Slider value={[downPayment]} onValueChange={v => setDownPayment(v[0])} min={5} max={80} step={1} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><Percent className="w-4 h-4" /> Interest Rate</Label>
                  <span className="text-sm font-bold text-primary">{interestRate}%</span>
                </div>
                <Slider value={[interestRate]} onValueChange={v => setInterestRate(v[0])} min={0.5} max={15} step={0.1} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Loan Term</Label>
                  <span className="text-sm font-bold text-primary">{years} years</span>
                </div>
                <Slider value={[years]} onValueChange={v => setYears(v[0])} min={5} max={40} step={1} />
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                  <div className="text-5xl font-black bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                    €{result.monthly.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{years * 12} payments over {years} years</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-card/60 border-border/30">
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Loan Amount</p>
                    <p className="text-lg font-black text-sky-500">€{result.principal.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/60 border-border/30">
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Down Payment</p>
                    <p className="text-lg font-black text-amber-500">€{result.downPaymentAmount.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/60 border-border/30">
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Total Interest</p>
                    <p className="text-lg font-black text-red-500">€{result.totalInterest.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/60 border-border/30">
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Total Paid</p>
                    <p className="text-lg font-black text-purple-500">€{result.totalPaid.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Visual bar */}
              <Card className="bg-card/60 border-border/30">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-2">Payment Breakdown</p>
                  <div className="h-6 rounded-full overflow-hidden flex">
                    <div className="bg-gradient-to-r from-sky-500 to-blue-500 h-full" style={{ width: `${(result.principal / result.totalPaid) * 100}%` }} />
                    <div className="bg-gradient-to-r from-red-400 to-red-500 h-full" style={{ width: `${(result.totalInterest / result.totalPaid) * 100}%` }} />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px]">
                    <span className="text-sky-500 font-semibold">Principal ({Math.round((result.principal / result.totalPaid) * 100)}%)</span>
                    <span className="text-red-500 font-semibold">Interest ({Math.round((result.totalInterest / result.totalPaid) * 100)}%)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
