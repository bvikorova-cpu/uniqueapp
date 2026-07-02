import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Target, Sparkles } from "lucide-react";
import { useResponseCoach } from "@/hooks/useSafetyAIFeatures";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const SCENARIOS = [
  "A classmate publicly mocks your appearance in front of others.",
  "Someone keeps sending you threatening DMs late at night.",
  "A 'friend' pressures you to share embarrassing photos.",
  "A coworker spreads false rumors about you online.",
];

export function ResponseCoachCard() {
  const [open, setOpen] = useState(false);
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [response, setResponse] = useState("");
  const { items, score } = useResponseCoach();
  const last = items[0];

  return (
    <>
      <FloatingHowItWorks title={"Response Coach Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Response Coach Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Response Coach Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer relative overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 via-card/40 to-sky-950/30 backdrop-blur-xl p-5 hover:border-cyan-400/40 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/30 to-sky-500/30 flex items-center justify-center">
              <Target className="w-5 h-5 text-cyan-200" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground">Safe Response Coach</h3>
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-cyan-600 text-white shadow-md ring-1 ring-cyan-300/40 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 8 credits
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Roleplay & get scored on assertiveness/safety</p>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-cyan-950/95 to-sky-950/95 border-cyan-500/30 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-cyan-100 flex items-center gap-2">
            <Target className="w-5 h-5" /> Safe Response Coach
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          <p className="text-xs font-bold text-cyan-200">Scenario:</p>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="w-full bg-black/40 border border-cyan-500/30 text-cyan-50 rounded-md px-3 py-2 text-sm"
          >
            {SCENARIOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type how you would respond..."
          rows={4}
          className="bg-black/40 border-cyan-500/30 text-cyan-50 placeholder:text-cyan-300/40"
        />
        <Button
          onClick={() => score.mutate({ scenario, user_response: response }, { onSuccess: () => setResponse("") })}
          disabled={response.length < 5 || score.isPending}
          className="w-full bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {score.isPending ? "Coaching..." : "Score My Response (8 credits)"}
        </Button>

        {last && (
          <div className="space-y-3 mt-3 max-h-80 overflow-auto">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Assertive", val: last.assertiveness_score },
                { label: "Empathy", val: last.empathy_score },
                { label: "Safety", val: last.safety_score },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                  <p className="text-2xl font-black text-cyan-100">{s.val}</p>
                  <p className="text-[10px] text-cyan-300">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-xs font-bold text-cyan-200 mb-1">Coach feedback:</p>
              <p className="text-xs text-cyan-100/90">{last.feedback}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs font-bold text-emerald-200 mb-1">Improved response:</p>
              <p className="text-xs italic text-emerald-100/90">"{last.improved_response}"</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
