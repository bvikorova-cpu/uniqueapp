import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Sparkles, Loader2, Palette, Users, MapPin, BookText } from "lucide-react";
import { CategorySelector } from "./CategorySelector";
import { IllustrationStylePicker } from "./IllustrationStylePicker";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface StoryWizardFlowProps {
  onGenerate: (data: {
    title: string;
    characters: string;
    theme: string;
    category: string;
    illustrationStyle: string;
  }) => void;
  loading: boolean;
  disabled?: boolean;
  initialData?: { title: string; characters: string; theme: string; category: string };
}

const STEPS = [
  { icon: Palette, label: "Category", description: "Choose your story world" },
  { icon: Users, label: "Characters", description: "Create your heroes" },
  { icon: MapPin, label: "Setting", description: "Set the scene" },
  { icon: BookText, label: "Style", description: "Choose illustration style" },
];

export const StoryWizardFlow = ({ onGenerate, loading, disabled, initialData }: StoryWizardFlowProps) => {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(initialData?.category || "adventure");
  const [title, setTitle] = useState(initialData?.title || "");
  const [characters, setCharacters] = useState(initialData?.characters || "");
  const [theme, setTheme] = useState(initialData?.theme || "");
  const [illustrationStyle, setIllustrationStyle] = useState("storybook");
  const [appliedTemplate, setAppliedTemplate] = useState<string | null>(null);

  // Auto-fill from template
  useEffect(() => {
    if (initialData && initialData.title !== appliedTemplate) {
      setTitle(initialData.title);
      setCharacters(initialData.characters);
      setTheme(initialData.theme);
      setCategory(initialData.category);
      setStep(1);
      setAppliedTemplate(initialData.title);
    }
  }, [initialData]);

  const canProceed =
    step === 0 ||
    (step === 1 && title.trim() && characters.trim()) ||
    (step === 2 && theme.trim()) ||
    step === 3;

  const handleSubmit = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onGenerate({ title, characters, theme, category, illustrationStyle });
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Story Wizard Flow - How it works"} steps={[{ title: 'Open', desc: 'Access the Story Wizard Flow section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Story Wizard Flow.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
      {/* Progress header */}
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
                animate={i === step ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <s.icon className="w-5 h-5" />
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className={`hidden md:block w-12 lg:w-20 h-1 rounded ${i < step ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5 mb-4" />
      </div>

      {/* Step content */}
      <div className="px-6 pb-6 min-h-[340px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="text-xl font-bold text-foreground mb-1">{STEPS[step].label}</h3>
            <p className="text-muted-foreground text-sm mb-6">{STEPS[step].description}</p>

            {step === 0 && (
              <CategorySelector value={category} onChange={setCategory} />
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Story Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., The Magic Dragon's Adventure"
                    className="text-base p-5 border-2"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Characters</label>
                  <Input
                    value={characters}
                    onChange={(e) => setCharacters(e.target.value)}
                    placeholder="e.g., A brave knight, a friendly dragon, a wise wizard"
                    className="text-base p-5 border-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Describe your heroes — the more detail, the better!</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Textarea
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g., A magical forest where animals can talk and trees whisper secrets..."
                  className="min-h-[140px] text-base p-5 border-2"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Include locations, emotions, and magic elements for the best story!
                </p>
              </div>
            )}

            {step === 3 && (
              <IllustrationStylePicker value={illustrationStyle} onChange={setIllustrationStyle} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep(step - 1)}
          disabled={step === 0 || loading}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={!canProceed || loading || (disabled && step === 3)}
          size="lg"
          className="gap-2 px-8"
        >
          {step < 3 ? (
            <>Next <ChevronRight className="w-4 h-4" /></>
          ) : loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Creating Magic...</>
          ) : disabled ? (
            "Limit Reached — Upgrade"
          ) : (
            <><Sparkles className="w-5 h-5" /> Create Story!</>
          )}
        </Button>
      </div>
    </div>
    </>
  );
};
