import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, ArrowRight, RotateCcw, CheckCircle, XCircle, Star, Mic, Loader2, Sparkles, Brain, Zap, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useRoleplayScore } from "@/hooks/useSafetyExtras";
import { RoleplayLeaderboard } from "./RoleplayLeaderboard";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Choice { text: string; score: number; feedback: string; }
interface Scenario { id: string; title: string; description: string; difficulty: "easy" | "medium" | "hard" | "expert"; category: string; steps: { situation: string; choices: Choice[] }[]; }

const scenarios: Scenario[] = [
  {
    id: "verbal-classroom", title: "Verbal Bullying in Class", description: "A classmate keeps making fun of you in front of others",
    difficulty: "easy", category: "School",
    steps: [{
      situation: "A student loudly mocks your answer. Others laugh. The teacher doesn't notice. What do you do?",
      choices: [
        { text: "Yell insults back", score: 0, feedback: "Escalates and gets you in trouble." },
        { text: "Stay calm, then talk to teacher after class", score: 100, feedback: "Calm denies them the reaction. Reporting is right." },
        { text: "Leave crying", score: 20, feedback: "Reinforces bully behavior. Stay grounded." },
        { text: "Laugh along to fit in", score: 10, feedback: "Validates the behavior, hurts your self-esteem." },
      ],
    }],
  },
  {
    id: "cyberbullying", title: "Cyberbullying Attack", description: "Someone created a fake account about you",
    difficulty: "medium", category: "Online",
    steps: [{
      situation: "A fake account posts embarrassing content as you. Friends asking if it's real. First step?",
      choices: [
        { text: "Create fakes to attack back", score: 0, feedback: "Makes you a bully — possibly illegal." },
        { text: "Screenshot everything, report account to platform", score: 100, feedback: "Evidence + proper reporting." },
        { text: "Delete all your social media", score: 30, feedback: "Lets the bully win." },
        { text: "Confront them at school", score: 20, feedback: "Could backfire badly." },
      ],
    }],
  },
  {
    id: "physical-threat", title: "Physical Threat", description: "Someone threatens to hurt you after school",
    difficulty: "hard", category: "Safety",
    steps: [{
      situation: "A bigger student says 'You're dead after school.' Witnesses present. Immediate response?",
      choices: [
        { text: "'I'm not scared of you' and walk off", score: 30, feedback: "Confidence good — but could escalate." },
        { text: "Go to nearest teacher/office and report immediately", score: 100, feedback: "Physical threats MUST be reported. Not snitching." },
        { text: "Find friends to back you up for the fight", score: 0, feedback: "Risk of injury + punishment." },
        { text: "Stay quiet, hope they forget", score: 10, feedback: "Threats rarely just go away." },
      ],
    }],
  },
  {
    id: "expert-coercion", title: "Coercion & Blackmail", description: "Someone threatens to release private content",
    difficulty: "expert", category: "Critical",
    steps: [{
      situation: "Someone says they'll share your private photos unless you pay/comply. What's the right play?",
      choices: [
        { text: "Pay to make it stop", score: 0, feedback: "Blackmailers never stop. This funds more abuse." },
        { text: "Stop responding, screenshot everything, tell a trusted adult + report to police/CyberTipline", score: 100, feedback: "Cutting contact + evidence + authorities is the only safe path." },
        { text: "Try to reason with them", score: 10, feedback: "Engagement gives them leverage." },
        { text: "Threaten them back", score: 0, feedback: "Escalates and could become criminal on your end." },
      ],
    }],
  },
];

const diffColor = { easy: "bg-emerald-500", medium: "bg-amber-500", hard: "bg-red-500", expert: "bg-purple-600" };
const diffIcon = { easy: Zap, medium: Brain, hard: Crown, expert: Sparkles };

const SafetyRoleplay = () => {
  const [tab, setTab] = useState<"play" | "voice" | "leaderboard">("play");
  const [selected, setSelected] = useState<Scenario | null>(null);
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  // Voice mode state
  const [voiceScenario, setVoiceScenario] = useState(scenarios[0]);
  const [voiceDifficulty, setVoiceDifficulty] = useState<"easy" | "medium" | "hard" | "expert">("easy");
  const [userResponse, setUserResponse] = useState("");
  const scoreApi = useRoleplayScore();
  const [aiResult, setAiResult] = useState<any>(null);

  const reset = () => { setSelected(null); setStep(0); setChoice(null); setScore(0); };

  if (selected) {
    const s = selected.steps[step];
    const isComplete = step >= selected.steps.length - 1 && choice !== null;
    const max = selected.steps.length * 100;

    return (
    <>
      <FloatingHowItWorks title={"Safety Roleplay - How it works"} steps={[{ title: 'Open', desc: 'Access the Safety Roleplay section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Safety Roleplay.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
        <Button variant="ghost" onClick={reset} size="sm">← Back</Button>
        <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-card/60 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{selected.title}</CardTitle>
              <Badge className={diffColor[selected.difficulty]}>{selected.difficulty}</Badge>
            </div>
            <Progress value={((step + (choice ? 1 : 0)) / selected.steps.length) * 100} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 bg-card/60 rounded-lg border border-border/40">
              <p className="text-sm font-medium">{s.situation}</p>
            </div>
            <div className="space-y-2">
              {s.choices.map((c, i) => (
                <button key={i} disabled={!!choice} onClick={() => { setChoice(c); setScore(score + c.score); }}
                  className={`w-full p-3 text-left rounded-lg border transition-all ${
                    choice === c
                      ? c.score >= 80 ? "border-emerald-500 bg-emerald-500/10" : c.score >= 40 ? "border-amber-500 bg-amber-500/10" : "border-red-500 bg-red-500/10"
                      : choice ? "opacity-40" : "border-border/40 hover:bg-card/80 hover:border-indigo-400/60"
                  }`}>
                  <div className="flex items-start gap-2">
                    {choice === c && (c.score >= 80 ? <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5" /> : c.score >= 40 ? <Star className="h-4 w-4 text-amber-400 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-400 mt-0.5" />)}
                    <div>
                      <p className="text-sm">{c.text}</p>
                      {choice === c && <p className="text-xs text-muted-foreground mt-1">{c.feedback}</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {choice && !isComplete && (
              <Button onClick={() => { setStep(step + 1); setChoice(null); }} className="w-full bg-indigo-600 hover:bg-indigo-500">
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {isComplete && (
              <Card className="border-amber-500/40 bg-amber-500/5">
                <CardContent className="pt-5 text-center space-y-3">
                  <h3 className="text-lg font-black">Scenario Complete!</h3>
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.ceil((score / max) * 5) ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
                    ))}
                  </div>
                  <p className="text-base font-bold">{score} / {max} pts</p>
                  <Button onClick={() => { setCompleted([...completed, selected.id]); reset(); }}>
                    <RotateCcw className="h-4 w-4 mr-2" /> Try Another
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
  }

  return (
    <div className="space-y-5">
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="bg-card/50 backdrop-blur-md">
          <TabsTrigger value="play"><Gamepad2 className="h-3 w-3 mr-1" /> Quick Play</TabsTrigger>
          <TabsTrigger value="voice"><Mic className="h-3 w-3 mr-1" /> AI Voice Coach</TabsTrigger>
          <TabsTrigger value="leaderboard"><Crown className="h-3 w-3 mr-1" /> Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="play">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {scenarios.map((sc, i) => {
              const Icon = diffIcon[sc.difficulty];
              const done = completed.includes(sc.id);
              return (
                <motion.div key={sc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={`border-border/40 bg-card/50 backdrop-blur-md hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all h-full ${done ? "border-emerald-500/40" : ""}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-[10px]">{sc.category}</Badge>
                        <Badge className={`${diffColor[sc.difficulty]} text-[10px]`}><Icon className="h-2 w-2 mr-1" />{sc.difficulty}</Badge>
                      </div>
                      <CardTitle className="text-sm">{sc.title}</CardTitle>
                      <CardDescription className="text-xs">{sc.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => { setSelected(sc); setStep(0); setChoice(null); setScore(0); }}
                        className="w-full bg-indigo-600 hover:bg-indigo-500" size="sm">
                        {done ? "Play Again" : "Start"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="voice">
          <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-card/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mic className="h-4 w-4 text-indigo-400" /> AI Voice Coach
              </CardTitle>
              <CardDescription className="text-xs">Type your response — AI scores assertiveness, empathy, safety. (6 cr)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <select className="px-3 py-2 rounded-md bg-card/60 border border-border/40 text-sm" value={voiceScenario.id} onChange={(e) => setVoiceScenario(scenarios.find(s => s.id === e.target.value)!)}>
                  {scenarios.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                <select className="px-3 py-2 rounded-md bg-card/60 border border-border/40 text-sm" value={voiceDifficulty} onChange={(e) => setVoiceDifficulty(e.target.value as any)}>
                  <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="expert">Expert</option>
                </select>
              </div>
              <div className="p-3 rounded-lg bg-card/40 border border-border/40">
                <p className="text-xs text-muted-foreground mb-1">Scenario:</p>
                <p className="text-sm">{voiceScenario.steps[0].situation}</p>
              </div>
              <Textarea value={userResponse} onChange={(e) => setUserResponse(e.target.value)} rows={3} placeholder="Type how you'd respond..." className="bg-background/50" />
              <Button
                disabled={!userResponse.trim() || scoreApi.isPending}
                onClick={async () => {
                  const r = await scoreApi.mutateAsync({
                    scenario_id: voiceScenario.id, scenario: voiceScenario.steps[0].situation,
                    user_response: userResponse, difficulty: voiceDifficulty, mode: "text",
                  });
                  setAiResult(r);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500"
              >
                {scoreApi.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" /> Score Me (6 cr)</>}
              </Button>
              {aiResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-card/60 border border-amber-500/40 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Assertive: <strong className="text-teal-300">{aiResult.assertiveness}</strong></span>
                    <span>Empathy: <strong className="text-pink-300">{aiResult.empathy}</strong></span>
                    <span>Safety: <strong className="text-emerald-300">{aiResult.safety}</strong></span>
                    <span>Total: <strong className="text-amber-300">{aiResult.total_score}</strong></span>
                  </div>
                  <p className="text-sm text-foreground/90">{aiResult.feedback}</p>
                  {aiResult.next_line_from_bully && (
                    <div className="p-2 rounded bg-red-500/10 border border-red-500/30">
                      <p className="text-[11px] text-red-300 font-bold mb-1">Bully escalates:</p>
                      <p className="text-xs italic">"{aiResult.next_line_from_bully}"</p>
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <RoleplayLeaderboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SafetyRoleplay;
