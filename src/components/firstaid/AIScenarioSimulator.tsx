import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gamepad2, Loader2, RotateCcw, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const SCENARIOS = [
  { id: "car_accident", label: "🚗 Car Accident", desc: "Multi-victim roadside emergency" },
  { id: "drowning", label: "🏊 Drowning", desc: "Pool or beach water rescue" },
  { id: "heart_attack", label: "💔 Heart Attack", desc: "Chest pain in public place" },
  { id: "allergic_reaction", label: "🥜 Severe Allergic Reaction", desc: "Anaphylaxis at restaurant" },
  { id: "choking_child", label: "👶 Choking Child", desc: "Infant choking on food" },
  { id: "workplace_injury", label: "🏭 Workplace Injury", desc: "Heavy machinery accident" },
  { id: "hiking_fall", label: "⛰️ Hiking Fall", desc: "Remote trail injury" },
  { id: "electrical_shock", label: "⚡ Electrical Shock", desc: "Household electrical accident" },
];

export const AIScenarioSimulator = ({ onBack }: Props) => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [story, setStory] = useState<{ text: string; choices: string[] } | null>(null);
  const [history, setHistory] = useState<{ text: string; choice: string }[]>([]);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { credits, spendCredit } = useAICredits();

  const startScenario = async (scenarioId: string) => {
    const ok = await spendCredit("custom_generation", "First Aid Scenario Simulator");
    if (!ok) { toast({ title: "Insufficient Credits", description: "You need 3 credits to start a scenario.", variant: "destructive" }); return; }
    
    setSelectedScenario(scenarioId);
    setHistory([]);
    setOutcome(null);
    setLoading(true);

    try {
      const scenario = SCENARIOS.find(s => s.id === scenarioId);
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          recipientName: scenario?.label || scenarioId,
          senderName: "interactive",
          message: `You are a first aid emergency scenario simulator. Create an interactive "choose your own adventure" scenario for: ${scenario?.desc}.

Start the scenario with a vivid 3-4 sentence description of the emergency situation. Then present exactly 3 choices the person can make (labeled A, B, C). Make it realistic and educational.

Format your response EXACTLY like this:
SITUATION: [vivid description of what you see and hear]
CHOICE_A: [first option]
CHOICE_B: [second option]  
CHOICE_C: [third option]`,
        },
      });
      if (error) throw error;
      const text = data?.message || data?.analysis || "";
      parseResponse(text);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to generate scenario", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const makeChoice = async (choice: string) => {
    if (!story) return;
    setLoading(true);
    setHistory(prev => [...prev, { text: story.text, choice }]);

    try {
      const historyText = history.map((h, i) => `Step ${i + 1}: ${h.text}\nChosen: ${h.choice}`).join("\n\n");
      const isLastStep = history.length >= 2;
      
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "travel_planner",
          recipientName: selectedScenario || "",
          senderName: "continue",
          message: `You are a first aid emergency scenario simulator. Continue this scenario.

Previous steps:
${historyText}

Current situation: ${story.text}
User chose: ${choice}

${isLastStep ? `This is the FINAL step. Describe the outcome based on their choices. Rate their performance (Excellent/Good/Needs Improvement). Explain what was done right and wrong with proper first aid procedures.

Format:
OUTCOME: [description of what happened]
RATING: [Excellent/Good/Needs Improvement]
CORRECT: [what they did right]
IMPROVE: [what could be better]
LESSON: [key first aid lesson learned]` : `Describe what happens next (3-4 sentences) based on their choice. Then present 3 new choices.

Format:
SITUATION: [what happens next]
CHOICE_A: [first option]
CHOICE_B: [second option]
CHOICE_C: [third option]`}`,
        },
      });
      if (error) throw error;
      const text = data?.message || data?.analysis || "";
      
      if (isLastStep || text.includes("OUTCOME:")) {
        setOutcome(text);
        setStory(null);
      } else {
        parseResponse(text);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to continue scenario", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const parseResponse = (text: string) => {
    const situationMatch = text.match(/SITUATION:\s*([\s\S]*?)(?=CHOICE_A:|$)/);
    const choiceA = text.match(/CHOICE_A:\s*(.*)/);
    const choiceB = text.match(/CHOICE_B:\s*(.*)/);
    const choiceC = text.match(/CHOICE_C:\s*(.*)/);

    setStory({
      text: situationMatch?.[1]?.trim() || text,
      choices: [choiceA?.[1]?.trim(), choiceB?.[1]?.trim(), choiceC?.[1]?.trim()].filter(Boolean) as string[],
    });
  };

  const reset = () => {
    setSelectedScenario(null);
    setStory(null);
    setHistory([]);
    setOutcome(null);
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Scenario Simulator - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Scenario Simulator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Scenario Simulator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Badge className="bg-red-100 text-red-700">3 Credits</Badge>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mx-auto mb-3">
          <Gamepad2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">AI Scenario Simulator</h2>
        <p className="text-muted-foreground">Interactive "choose your own adventure" emergency training</p>
      </div>

      {!selectedScenario && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCENARIOS.map(s => (
            <Card key={s.id} className="cursor-pointer hover:scale-[1.02] transition-all hover:border-red-300" onClick={() => startScenario(s.id)}>
              <CardContent className="py-4 flex items-center gap-3">
                <span className="text-3xl">{s.label.split(" ")[0]}</span>
                <div>
                  <p className="font-semibold text-sm">{s.label.substring(s.label.indexOf(" ") + 1)}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {loading && (
        <Card><CardContent className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-red-500" /><p className="text-muted-foreground">Generating scenario...</p></CardContent></Card>
      )}

      {story && !loading && (
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Step {history.length + 1} of 3</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed bg-red-50 dark:bg-red-950 p-4 rounded-xl">{story.text}</p>
            <p className="font-semibold text-sm">What do you do?</p>
            <div className="space-y-2">
              {story.choices.map((choice, i) => (
                <Button key={i} variant="outline" className="w-full justify-start text-left h-auto py-3 hover:border-red-400" onClick={() => makeChoice(choice)}>
                  <span className="font-bold mr-2 text-red-500">{String.fromCharCode(65 + i)}.</span>
                  <span className="text-sm">{choice}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {outcome && (
        <Card className="border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30">
          <CardHeader><CardTitle className="flex items-center gap-2">🏁 Scenario Complete</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">{outcome}</div>
            <Button onClick={reset} className="w-full"><RotateCcw className="mr-2 h-4 w-4" /> Try Another Scenario</Button>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
};
