import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ChevronRight, ChevronLeft, Globe, Palette, SlidersHorizontal } from 'lucide-react';
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface StoryWizardFormProps {
  onGenerate: (config: {
    theme: string;
    language: string;
    sceneCount: number;
    sceneDuration: number;
  }) => void;
  loading: boolean;
  initialTheme?: string;
}

const LANGUAGES = [
  { value: 'english', label: '🇬🇧 English' },
  { value: 'slovak', label: '🇸🇰 Slovak' },
  { value: 'czech', label: '🇨🇿 Czech' },
  { value: 'hungarian', label: '🇭🇺 Magyar' },
  { value: 'german', label: '🇩🇪 Deutsch' },
  { value: 'spanish', label: '🇪🇸 Español' },
  { value: 'french', label: '🇫🇷 Français' },
  { value: 'italian', label: '🇮🇹 Italiano' },
  { value: 'polish', label: '🇵🇱 Polski' },
];

const MAX_SCENES = 6;

export const StoryWizardForm = ({ onGenerate, loading, initialTheme }: StoryWizardFormProps) => {
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState(initialTheme || '');

  useEffect(() => {
    if (initialTheme) {
      setTheme(initialTheme);
      setStep(1); // Jump to theme step
    }
  }, [initialTheme]);
  const [language, setLanguage] = useState('english');
  const [sceneCount, setSceneCount] = useState(4);
  const [sceneDuration, setSceneDuration] = useState(5);

  const steps = [
    { icon: Globe, label: 'Language', description: 'Choose your story language' },
    { icon: Palette, label: 'Story Theme', description: 'What story shall we create?' },
    { icon: SlidersHorizontal, label: 'Settings', description: 'Fine-tune your video' },
  ];

  const canProceed = step === 0 || (step === 1 && theme.trim()) || step === 2;

  const handleSubmit = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      onGenerate({ theme, language, sceneCount, sceneDuration });
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Story Wizard Form - How it works"} steps={[{ title: 'Open', desc: 'Access the Story Wizard Form section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Story Wizard Form.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-purple-100">
      {/* Progress */}
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i <= step
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-400'
                }`}
                animate={i === step ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <s.icon className="w-5 h-5" />
              </motion.div>
              {i < steps.length - 1 && (
                <div className={`hidden md:block w-16 lg:w-24 h-1 rounded ${i < step ? 'bg-purple-600' : 'bg-purple-100'}`} />
              )}
            </div>
          ))}
        </div>
        <Progress value={((step + 1) / steps.length) * 100} className="h-1.5 mb-4" />
      </div>

      {/* Step content */}
      <div className="px-6 pb-6 min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="text-xl font-bold text-purple-800 mb-1">{steps[step].label}</h3>
            <p className="text-purple-500 text-sm mb-6">{steps[step].description}</p>

            {step === 0 && (
              <div className="grid grid-cols-3 gap-3">
                {LANGUAGES.map((lang) => (
                  <motion.button
                    key={lang.value}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setLanguage(lang.value)}
                    className={`p-3 rounded-xl text-left border-2 transition-colors ${
                      language === lang.value
                        ? 'border-purple-500 bg-purple-50 text-purple-800'
                        : 'border-purple-100 hover:border-purple-300 text-purple-600'
                    }`}
                  >
                    <span className="text-lg font-medium">{lang.label}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <Input
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g., A brave little dragon learning to fly..."
                  className="text-lg p-6 border-2 border-purple-200 focus:border-purple-500"
                  disabled={loading}
                  autoFocus
                />
                <p className="text-xs text-purple-400">
                  Tip: Be descriptive! Include characters, settings, and emotions for the best results.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3 bg-purple-50 rounded-xl p-4">
                  <label className="text-sm font-semibold text-purple-800 flex items-center justify-between">
                    Number of Scenes
                    <span className="text-2xl font-bold text-purple-600">{sceneCount}</span>
                  </label>
                  <input
                    type="range" min="2" max={MAX_SCENES} value={sceneCount}
                    onChange={(e) => setSceneCount(Number(e.target.value))}
                    disabled={loading}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <p className="text-xs text-purple-500">More scenes = longer story (max {MAX_SCENES})</p>
                </div>
                <div className="space-y-3 bg-pink-50 rounded-xl p-4">
                  <label className="text-sm font-semibold text-pink-800 flex items-center justify-between">
                    Scene Duration
                    <span className="text-2xl font-bold text-pink-600">{sceneDuration}s</span>
                  </label>
                  <input
                    type="range" min="3" max="10" value={sceneDuration}
                    onChange={(e) => setSceneDuration(Number(e.target.value))}
                    disabled={loading}
                    className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                  <p className="text-xs text-pink-500">How long each scene displays (3-10 seconds)</p>
                </div>
              </div>
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
          disabled={!canProceed || loading}
          size="lg"
          className="gap-2 px-8"
        >
          {step < 2 ? (
            <>Next <ChevronRight className="w-4 h-4" /></>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {loading ? 'Creating Magic...' : 'Generate Story Video'}
            </>
          )}
        </Button>
      </div>
    </div>
    </>
  );
};
