import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Sparkles, Loader2, Smile, Frown, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const COST = 3;

interface Props { onCredits?: () => void; }

export const DayInLifeSimulator = ({ onCredits }: Props) => {
  const [career, setCareer] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const run = async () => {
    if (!career.trim()) return toast.error("Enter a career");
    setLoading(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("teen-career-counselor", {
        body: { action: "dayInLife", career },
      });
      if (error || res?.error) {
        const msg = res?.error || error?.message || "Failed";
        if (String(msg).toLowerCase().includes("insufficient")) {
          toast.error(`Need ${COST} credits`);
        } else toast.error(msg);
        return;
      }
      setData(res);
      onCredits?.();
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Day In Life Simulator - How it works"} steps={[{ title: 'Open', desc: 'Access the Day In Life Simulator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Day In Life Simulator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-primary" /> Day in the Life Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input placeholder="e.g. UX Designer, Marine Biologist, Game Developer" value={career} onChange={e => setCareer(e.target.value)} />
          <Button onClick={run} disabled={loading} className="gap-1">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {COST} cr
          </Button>
        </div>

        {data && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="font-bold text-emerald-500 mb-1 flex items-center gap-1"><Smile className="h-3 w-3" /> Best part</p>
                <p>{data.best_part}</p>
              </div>
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <p className="font-bold text-rose-500 mb-1 flex items-center gap-1"><Frown className="h-3 w-3" /> Hardest part</p>
                <p>{data.hardest_part}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2 flex items-center gap-1"><Clock className="h-4 w-4" /> Schedule</h4>
              <div className="space-y-1.5">
                {(data.schedule || []).map((s: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex gap-3 p-2 rounded-lg bg-muted/40">
                    <div className="text-xs font-mono font-bold text-primary w-14 shrink-0">{s.time}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{s.activity}</div>
                      <div className="text-xs text-muted-foreground">{s.detail}</div>
                    </div>
                    {s.mood && <span className="text-[10px] px-2 py-0.5 h-5 rounded-full bg-primary/10 text-primary">{s.mood}</span>}
                  </motion.div>
                ))}
              </div>
            </div>

            {data.tools?.length > 0 && (
              <div>
                <h4 className="font-bold text-xs mb-1 flex items-center gap-1"><Wrench className="h-3 w-3" /> Tools used</h4>
                <div className="flex flex-wrap gap-1">
                  {data.tools.map((t: string, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {data.salary_range_eur && (
              <p className="text-xs text-center text-muted-foreground">💰 Typical: <strong>{data.salary_range_eur}</strong></p>
            )}

            {data.fit_signals?.length > 0 && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs font-bold mb-1">You'd love this if…</p>
                <ul className="text-xs space-y-0.5">
                  {data.fit_signals.map((s: string, i: number) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
