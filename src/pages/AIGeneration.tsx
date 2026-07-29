import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Pencil, Brush, CreditCard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { lazyWithRetry as lazy } from "@/utils/lazyWithRetry";
import { AIGenHero } from "@/components/ai-generation/AIGenHero";
import { PageLoader } from "@/components/ui/PageLoader";

import { AICreditsLowBalanceAlert } from "@/components/ai-credits/AICreditsLowBalanceAlert";
import { AICreditsLiveTicker } from "@/components/ai-credits/AICreditsLiveTicker";
import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const GenerateView = lazy(() => import("@/components/ai-generation/views/GenerateView").then((module) => ({ default: module.GenerateView })));
const ImageEditorView = lazy(() => import("@/components/ai-generation/views/ImageEditorView").then((module) => ({ default: module.ImageEditorView })));

type ActiveView = 'hub' | 'generate' | 'editor';

const tools: { id: ActiveView; icon: any; title: string; desc: string; cost: string; color: string; group: string }[] = [
  { id: 'generate', icon: Wand2, title: "Generate Image", desc: "Create from text", cost: "5 CR", color: "from-primary to-accent", group: "Core" },
  { id: 'editor', icon: Pencil, title: "Image Editor", desc: "Edit & transform", cost: "3 CR", color: "from-blue-500 to-cyan-500", group: "Core" },
];

const GROUPS = ["Core"];

const AIGeneration = () => {
  const [activeView, setActiveView] = useState<ActiveView>('hub');
  const [selectedPrompt] = useState("");
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();

  const renderView = () => {
    switch (activeView) {
      case 'generate': return <GenerateView onCreditsUsed={refresh} initialPrompt={selectedPrompt} />;
      case 'editor': return <ImageEditorView onCreditsUsed={refresh} />;
      default: return null;
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <FloatingHowItWorks
        title="AI Generation"
        intro="Text-to-image and text-to-video generation hub."
        steps={[
          { title: "Pick a model", desc: "Fast, Standard or Premium \u2014 higher costs more credits." },
          { title: "Write the prompt", desc: "Be specific about subject, style, lighting." },
          { title: "Set size & aspect", desc: "Square, portrait or landscape." },
          { title: "Generate", desc: "3\u201310 credits per image depending on quality." },
          { title: "Download or reuse", desc: "Save to gallery, remix or send to Studio." }
        ]}
      />
      <div className="container mx-auto px-3 sm:px-4 py-6 pt-16">
        {activeView !== 'hub' ? (
          <div className="ai-generation-active-shell mb-6 pb-80 sm:pb-0">
            <Button variant="ghost" size="sm" onClick={() => setActiveView('hub')} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Studio
            </Button>
            <Suspense fallback={<PageLoader />}>
              {renderView()}
            </Suspense>
          </div>
        ) : (
          <>
            <AIGenHero credits={credits.credits_remaining} />
            <HeroRewardedAd sectionKey="page_aigeneration" />
            <AICreditsLowBalanceAlert credits={credits.credits_remaining} />
            <AICreditsLiveTicker />

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="bg-card/80 border border-border rounded-xl p-3 sm:p-4 text-center cursor-pointer hover:border-primary/40 transition-all"
                onClick={() => navigate('/ai-credits-store')}>
                <CreditCard className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-lg sm:text-xl font-black">{credits.credits_remaining}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Credits</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                className="bg-card/80 border border-border rounded-xl p-3 sm:p-4 text-center">
                <Sparkles className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-lg sm:text-xl font-black">{tools.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">AI Tools</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="bg-card/80 border border-border rounded-xl p-3 sm:p-4 text-center">
                <Brush className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-lg sm:text-xl font-black">12+</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Art Styles</p>
              </motion.div>
            </div>

            {GROUPS.map(group => (
              <div key={group} className="mb-8">
                <h2 className="text-xl sm:text-2xl font-black mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> {group}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {tools.filter(t => t.group === group).map((tool, i) => (
                    <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      onClick={() => setActiveView(tool.id)}
                      className="group cursor-pointer rounded-xl border border-border bg-card/80 p-4 hover:border-primary/40 hover:shadow-lg transition-all">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <tool.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-sm mb-0.5">{tool.title}</h3>
                      <p className="text-[11px] text-muted-foreground mb-2">{tool.desc}</p>
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {tool.cost}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}

            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-black mb-4">💡 Tips for Better Results</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { title: "Be Specific", tip: "Instead of 'a cat', try 'a fluffy orange tabby cat sitting on a windowsill at sunset, photorealistic'" },
                  { title: "Use Negative Prompts", tip: "Add 'blurry, deformed, low quality' to the negative field to avoid common artifacts" },
                  { title: "Set Aspect Ratio", tip: "Pick 16:9 for cinematic, 9:16 for stories, 1:1 for social posts" },
                  { title: "Try Magic Enhance", tip: "Click ✨ Magic Enhance to expand any short prompt with style/lighting/composition keywords" },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                    className="p-4 rounded-xl border bg-card/60">
                    <p className="font-bold text-sm mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.tip}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIGeneration;
