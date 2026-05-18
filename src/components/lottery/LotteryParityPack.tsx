import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, Settings2, Users, Calculator, ShieldCheck,
  PiggyBank, Clover, LineChart, Brain,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLotteryParity, LOTTERY_PARITY_COST, type LotteryParityAction } from "@/hooks/useLotteryParity";

const TOOLS: { id: LotteryParityAction; label: string; icon: any; desc: string; color: string }[] = [
  { id: "wheel-builder", label: "Wheel Builder", icon: Settings2, desc: "Cover more combos with smart wheeling", color: "from-amber-500 to-yellow-500" },
  { id: "syndicate-strategy", label: "Syndicate Strategy", icon: Users, desc: "Group play & trust framework", color: "from-emerald-500 to-teal-500" },
  { id: "tax-planner", label: "Tax Planner", icon: Calculator, desc: "Estimate net winnings after tax", color: "from-blue-500 to-cyan-500" },
  { id: "claim-checklist", label: "Claim Checklist", icon: ShieldCheck, desc: "Safely claim a jackpot", color: "from-violet-500 to-purple-500" },
  { id: "budget-coach", label: "Budget Coach", icon: PiggyBank, desc: "Responsible spend caps", color: "from-rose-500 to-pink-500" },
  { id: "lucky-charm", label: "Lucky Charm", icon: Clover, desc: "Personalized lucky numbers", color: "from-lime-500 to-emerald-500" },
  { id: "pattern-detector", label: "Pattern Detector", icon: LineChart, desc: "Hot, cold & overdue analysis", color: "from-orange-500 to-red-500" },
  { id: "winner-mindset", label: "Winner Mindset", icon: Brain, desc: "Psychology of a calm winner", color: "from-fuchsia-500 to-pink-500" },
];

export function LotteryParityPack() {
  const { run, isRunning, lastResult, lastAction } = useLotteryParity();
  const [tab, setTab] = useState<LotteryParityAction>("wheel-builder");
  const [form, setForm] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (action: LotteryParityAction, payload: Record<string, unknown>) => {
    await run({ action, payload });
  };

  const result = lastAction === tab && (lastResult as any)?.result;

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-amber-400/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
          <Sparkles className="h-5 w-5 text-amber-400" />
          Lottery Parity Pack
        </CardTitle>
        <CardDescription>
          8 advanced AI lottery tools · {LOTTERY_PARITY_COST} credits per run
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => { setTab(v as LotteryParityAction); setForm({}); }}>
          <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-1 h-auto bg-background/50 p-1">
            {TOOLS.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="flex-col gap-1 py-2 px-1 text-[10px] data-[state=active]:bg-amber-500/20">
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {TOOLS.map((t) => (
            <TabsContent key={t.id} value={t.id} className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center shrink-0`}>
                  <t.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black">{t.label}</h3>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
              </div>

              {/* Inputs vary per tool */}
              {t.id === "wheel-builder" && (
                <ToolForm onRun={() => submit(t.id, { key_numbers: form.keys, lottery: form.lottery || "EuroJackpot" })}>
                  <Field label="Lottery" value={form.lottery} onChange={(v) => set("lottery", v)} placeholder="EuroJackpot, Powerball..." />
                  <Field label="Your key numbers" value={form.keys} onChange={(v) => set("keys", v)} placeholder="e.g. 7, 14, 21, 28" />
                </ToolForm>
              )}
              {t.id === "syndicate-strategy" && (
                <ToolForm onRun={() => submit(t.id, { group_size: form.size, budget_eur: form.budget, frequency: form.freq })}>
                  <Field label="Group size" value={form.size} onChange={(v) => set("size", v)} placeholder="10" />
                  <Field label="Weekly budget per person (€)" value={form.budget} onChange={(v) => set("budget", v)} placeholder="5" />
                  <Field label="Play frequency" value={form.freq} onChange={(v) => set("freq", v)} placeholder="weekly" />
                </ToolForm>
              )}
              {t.id === "tax-planner" && (
                <ToolForm onRun={() => submit(t.id, { jurisdiction: form.country, gross_eur: form.gross })}>
                  <Field label="Country / region" value={form.country} onChange={(v) => set("country", v)} placeholder="Slovakia, Germany, USA-NY..." />
                  <Field label="Estimated gross win (€)" value={form.gross} onChange={(v) => set("gross", v)} placeholder="1000000" />
                </ToolForm>
              )}
              {t.id === "claim-checklist" && (
                <ToolForm onRun={() => submit(t.id, { lottery: form.lottery, prize_eur: form.prize, country: form.country })}>
                  <Field label="Lottery" value={form.lottery} onChange={(v) => set("lottery", v)} placeholder="EuroJackpot" />
                  <Field label="Prize amount (€)" value={form.prize} onChange={(v) => set("prize", v)} placeholder="500000" />
                  <Field label="Country" value={form.country} onChange={(v) => set("country", v)} placeholder="Slovakia" />
                </ToolForm>
              )}
              {t.id === "budget-coach" && (
                <ToolForm onRun={() => submit(t.id, { monthly_income_eur: form.income, current_spend_eur: form.spend, country: form.country })}>
                  <Field label="Monthly income (€)" value={form.income} onChange={(v) => set("income", v)} placeholder="2000" />
                  <Field label="Current lottery spend / month (€)" value={form.spend} onChange={(v) => set("spend", v)} placeholder="40" />
                  <Field label="Country" value={form.country} onChange={(v) => set("country", v)} placeholder="Slovakia" />
                </ToolForm>
              )}
              {t.id === "lucky-charm" && (
                <ToolForm onRun={() => submit(t.id, { name: form.name, birthdate: form.birth, meaningful: form.dates, lottery: form.lottery })}>
                  <Field label="Your name" value={form.name} onChange={(v) => set("name", v)} placeholder="Anna" />
                  <Field label="Birth date" value={form.birth} onChange={(v) => set("birth", v)} placeholder="1990-04-12" type="date" />
                  <Field label="Other meaningful dates" value={form.dates} onChange={(v) => set("dates", v)} placeholder="anniversaries, kids' birthdays" />
                  <Field label="Lottery" value={form.lottery} onChange={(v) => set("lottery", v)} placeholder="EuroJackpot" />
                </ToolForm>
              )}
              {t.id === "pattern-detector" && (
                <ToolForm onRun={() => submit(t.id, { lottery: form.lottery, recent_draws: form.draws })}>
                  <Field label="Lottery" value={form.lottery} onChange={(v) => set("lottery", v)} placeholder="EuroJackpot" />
                  <Field label="Recent draws (optional)" value={form.draws} onChange={(v) => set("draws", v)} placeholder="3,17,22,34,41 / 1,8,19,25,38..." multiline />
                </ToolForm>
              )}
              {t.id === "winner-mindset" && (
                <ToolForm onRun={() => submit(t.id, { situation: form.situation, family_context: form.family })}>
                  <Field label="Your situation" value={form.situation} onChange={(v) => set("situation", v)} placeholder="Lost €200 this month, feeling frustrated" multiline />
                  <Field label="Family / social context" value={form.family} onChange={(v) => set("family", v)} placeholder="Partner is supportive but worried" multiline />
                </ToolForm>
              )}

              {isRunning && lastAction === t.id && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Running AI…
                </div>
              )}

              {result && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="bg-background/50 border-amber-400/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-black flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-400" /> Result
                        <Badge variant="outline" className="ml-auto text-[10px]">{LOTTERY_PARITY_COST} credits</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs whitespace-pre-wrap break-words font-mono text-foreground/90 max-h-96 overflow-auto">
                        {JSON.stringify((result as any).result, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ToolForm({ children, onRun }: { children: React.ReactNode; onRun: () => void }) {
  return (
    <div className="space-y-3">
      {children}
      <Button onClick={onRun} className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:opacity-90">
        <Sparkles className="h-4 w-4 mr-2" /> Run · {LOTTERY_PARITY_COST} credits
      </Button>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type, multiline,
}: { label: string; value?: string; onChange: (v: string) => void; placeholder?: string; type?: string; multiline?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {multiline ? (
        <Textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="bg-background/50 border-amber-400/20" />
      ) : (
        <Input type={type ?? "text"} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-background/50 border-amber-400/20" />
      )}
    </div>
  );
}
