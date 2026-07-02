import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Palette, Mic, Film, Check, Loader2 } from 'lucide-react';
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface GenerationProgressProps {
  isGenerating: boolean;
}

const PIPELINE_STEPS = [
  { icon: Pencil, label: 'Writing Story', description: 'AI is crafting your scenes...', duration: 8000 },
  { icon: Palette, label: 'Creating Illustrations', description: 'Generating beautiful artwork...', duration: 25000 },
  { icon: Mic, label: 'Recording Narration', description: 'Adding voice to your story...', duration: 15000 },
  { icon: Film, label: 'Composing Video', description: 'Putting it all together...', duration: 5000 },
];

export const GenerationProgress = ({ isGenerating }: GenerationProgressProps) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setActiveStep(0);
      return;
    }

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 1000;
      let cumulative = 0;
      for (let i = 0; i < PIPELINE_STEPS.length; i++) {
        cumulative += PIPELINE_STEPS[i].duration;
        if (elapsed < cumulative) {
          setActiveStep(i);
          return;
        }
      }
      setActiveStep(PIPELINE_STEPS.length - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 rounded-2xl p-8 shadow-2xl"
    >
      <div className="text-center mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="inline-block mb-3"
        >
          <Loader2 className="w-10 h-10 text-amber-300" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white">Creating Your Story</h3>
        <p className="text-purple-300 text-sm mt-1">This may take up to 2 minutes</p>
      </div>

      <div className="space-y-4">
        {PIPELINE_STEPS.map((step, i) => {
          const status = i < activeStep ? 'done' : i === activeStep ? 'active' : 'pending';
          const Icon = step.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                status === 'active'
                  ? 'bg-white/10 border border-amber-400/40'
                  : status === 'done'
                  ? 'bg-green-500/10 border border-green-400/30'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                status === 'done'
                  ? 'bg-green-500 text-white'
                  : status === 'active'
                  ? 'bg-amber-400 text-purple-900'
                  : 'bg-white/10 text-purple-400'
              }`}>
                {status === 'done' ? (
                  <Check className="w-6 h-6" />
                ) : status === 'active' ? (
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    <Icon className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>

              <div className="flex-1">
                <p className={`font-semibold ${status === 'pending' ? 'text-purple-400' : 'text-white'}`}>
                  {step.label}
                </p>
                <p className={`text-sm ${status === 'pending' ? 'text-purple-500' : 'text-purple-300'}`}>
                  {status === 'done' ? 'Complete ✓' : step.description}
                </p>
              </div>

              {status === 'active' && (
                <motion.div
                  className="w-2 h-2 rounded-full bg-amber-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
