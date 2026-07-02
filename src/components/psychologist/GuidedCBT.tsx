import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, ChevronRight, CheckCircle2, RotateCcw, Lightbulb, Target, AlertTriangle, Scale } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

interface CBTExercise {
  id: string;
  title: string;
  desc: string;
  icon: any;
  color: string;
  steps: { title: string; prompt: string; tip: string }[];
}

const EXERCISES: CBTExercise[] = [
  {
    id: "thought-record", title: "Thought Record", desc: "Challenge negative automatic thoughts with evidence-based reasoning",
    icon: Brain, color: "from-purple-500 to-pink-500",
    steps: [
      { title: "Situation", prompt: "Describe the situation that triggered your negative emotion. What happened? Where were you? Who was involved?", tip: "Be specific about time, place, and context." },
      { title: "Automatic Thought", prompt: "What thought automatically popped into your mind? Write it exactly as it occurred.", tip: "These are often 'hot thoughts' — the first thing your mind says." },
      { title: "Emotions", prompt: "What emotions did you feel? Rate each one from 0-100% intensity.", tip: "Common emotions: anxiety, sadness, anger, guilt, shame, frustration." },
      { title: "Evidence For", prompt: "What evidence supports this thought? What facts back it up?", tip: "Stick to facts only — not feelings or interpretations." },
      { title: "Evidence Against", prompt: "What evidence contradicts this thought? What proves it might not be fully true?", tip: "Consider what you'd tell a friend in the same situation." },
      { title: "Balanced Thought", prompt: "Now write a more balanced, realistic thought that considers all the evidence.", tip: "This isn't positive thinking — it's accurate thinking." },
    ],
  },
  {
    id: "cognitive-distortions", title: "Cognitive Distortion Spotter", desc: "Learn to identify thinking traps and patterns that fuel negative emotions",
    icon: AlertTriangle, color: "from-orange-500 to-red-500",
    steps: [
      { title: "The Thought", prompt: "Write down a thought that's been bothering you or causing distress.", tip: "Choose a thought that feels emotionally charged." },
      { title: "Identify the Distortion", prompt: "Which thinking trap applies?\n\n• All-or-Nothing: Seeing in black/white\n• Catastrophizing: Expecting the worst\n• Mind Reading: Assuming what others think\n• Fortune Telling: Predicting negative outcomes\n• Personalization: Blaming yourself for everything\n• Overgeneralization: 'Always' or 'Never' thinking\n• Emotional Reasoning: Feeling = fact\n• Should Statements: Rigid rules for self/others", tip: "A single thought can contain multiple distortions." },
      { title: "Challenge It", prompt: "How would you respond to this distortion? What's a more accurate way to think about it?", tip: "Ask: 'Is this thought helpful? Is it true? What would I tell a friend?'" },
      { title: "Reframe", prompt: "Write a reframed version of the thought that's more balanced and compassionate.", tip: "Self-compassion is key — treat yourself like you'd treat someone you care about." },
    ],
  },
  {
    id: "behavioral-activation", title: "Behavioral Activation", desc: "Plan activities that boost mood and combat depression through action",
    icon: Target, color: "from-green-500 to-emerald-500",
    steps: [
      { title: "Current State", prompt: "How are you feeling right now? What activities have you been avoiding?", tip: "Depression often makes us withdraw — recognizing this is the first step." },
      { title: "Values Check", prompt: "What matters most to you? List 3-5 things you value (relationships, health, creativity, learning, etc.)", tip: "Activities aligned with values tend to boost mood more." },
      { title: "Activity Plan", prompt: "List 3 small, achievable activities you could do today or this week. They can be tiny — even a 5-minute walk counts.", tip: "Start small. 'Do the dishes' is better than 'Clean the whole house'." },
      { title: "Predict & Track", prompt: "For each activity, predict your mood before (0-10) and rate it after completing it. You'll often find it was better than predicted.", tip: "This gap between prediction and reality is the key insight of behavioral activation." },
    ],
  },
  {
    id: "worry-tree", title: "Worry Tree", desc: "Systematically sort worries into actionable and non-actionable categories",
    icon: Scale, color: "from-blue-500 to-cyan-500",
    steps: [
      { title: "The Worry", prompt: "Write down what you're worried about. Be specific.", tip: "Vague worries feel bigger. Naming them makes them manageable." },
      { title: "Can You Act?", prompt: "Is there anything you can actually do about this worry right now? If yes, what? If no, acknowledge that.", tip: "Distinguish between productive problem-solving and unproductive rumination." },
      { title: "Action Plan (if actionable)", prompt: "If you can act: What's the next concrete step? When will you do it? Write a simple plan.", tip: "Break it into the smallest possible first step." },
      { title: "Let Go (if not actionable)", prompt: "If you can't act: Practice accepting uncertainty. Write a compassionate statement to yourself about letting go of what you can't control.", tip: "Try: 'I notice I'm worrying about X. I can't control this right now, and that's okay.'" },
    ],
  },
];

export const GuidedCBT = ({ onBack }: Props) => {
  const [selectedExercise, setSelectedExercise] = useState<CBTExercise | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [completed, setCompleted] = useState(false);

  const startExercise = (ex: CBTExercise) => {
    setSelectedExercise(ex);
    setCurrentStep(0);
    setResponses([]);
    setCurrentResponse("");
    setCompleted(false);
  };

  const nextStep = () => {
    if (!currentResponse.trim()) { toast.error("Please write a response before continuing."); return; }
    const newResponses = [...responses, currentResponse.trim()];
    setResponses(newResponses);
    setCurrentResponse("");
    if (selectedExercise && currentStep < selectedExercise.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setCompleted(true);
      toast.success("Exercise complete! Great work on your mental wellness.");
    }
  };

  const reset = () => {
    setSelectedExercise(null);
    setCurrentStep(0);
    setResponses([]);
    setCurrentResponse("");
    setCompleted(false);
  };

  if (!selectedExercise) {
    return (
    <>
      <FloatingHowItWorks title={"Guided C B T - How it works"} steps={[{ title: 'Open', desc: 'Access the Guided C B T section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Guided C B T.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
            Guided CBT Exercises
          </h2>
          <p className="text-muted-foreground">Interactive cognitive behavioral therapy tools for managing thoughts and emotions.</p>
          <Badge variant="outline" className="mt-2">100% Free</Badge>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EXERCISES.map((ex, i) => (
            <motion.div key={ex.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}>
              <Card className="p-5 bg-card/60 backdrop-blur-sm border-border/50 cursor-pointer hover:bg-card/90 transition-all h-full"
                onClick={() => startExercise(ex)}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${ex.color} flex items-center justify-center mb-3`}>
                  <ex.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-bold mb-1">{ex.title}</h4>
                <p className="text-xs text-muted-foreground">{ex.desc}</p>
                <p className="text-[10px] text-muted-foreground mt-2">{ex.steps.length} steps</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
  }

  if (completed) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={reset} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Exercises</Button>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">Exercise Complete!</h2>
          <p className="text-muted-foreground mb-6">Here's your full {selectedExercise.title} summary.</p>
        </motion.div>

        <div className="space-y-4">
          {selectedExercise.steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
                <p className="text-xs font-bold text-primary mb-1">Step {i + 1}: {step.title}</p>
                <p className="text-sm">{responses[i]}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={reset} variant="outline" className="flex-1 gap-2"><RotateCcw className="h-4 w-4" /> Try Another</Button>
          <Button onClick={() => startExercise(selectedExercise)} className="flex-1 gap-2"><Brain className="h-4 w-4" /> Redo This</Button>
        </div>
      </div>
    );
  }

  const step = selectedExercise.steps[currentStep];
  const progress = ((currentStep) / selectedExercise.steps.length) * 100;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={reset} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Exercises</Button>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold">{selectedExercise.title}</h3>
          <span className="text-sm text-muted-foreground">Step {currentStep + 1}/{selectedExercise.steps.length}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div animate={{ width: `${progress}%` }} className="bg-primary h-2 rounded-full" transition={{ duration: 0.3 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="text-xl font-black mb-3 text-primary">{step.title}</h3>
            <p className="text-sm text-foreground mb-4 whitespace-pre-line">{step.prompt}</p>
            <div className="p-3 bg-primary/5 rounded-lg mb-4 flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">{step.tip}</p>
            </div>
            <Textarea value={currentResponse} onChange={e => setCurrentResponse(e.target.value)}
              placeholder="Write your response here..." rows={4} className="mb-4" />
            <Button onClick={nextStep} className="w-full gap-2" disabled={!currentResponse.trim()}>
              {currentStep === selectedExercise.steps.length - 1 ? (
                <><CheckCircle2 className="h-4 w-4" /> Complete Exercise</>
              ) : (
                <><ChevronRight className="h-4 w-4" /> Next Step</>
              )}
            </Button>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
