import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Pencil, Brush, ArrowUpRight, BookOpen, CreditCard, ArrowLeft, Copy, Globe, Eraser, Layers, History, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { AIGenHero } from "@/components/ai-generation/AIGenHero";
import { GenerateView } from "@/components/ai-generation/views/GenerateView";
import { ImageEditorView } from "@/components/ai-generation/views/ImageEditorView";
import { StyleTransferView } from "@/components/ai-generation/views/StyleTransferView";
import { UpscalerView } from "@/components/ai-generation/views/UpscalerView";
import { PromptGalleryView } from "@/components/ai-generation/views/PromptGalleryView";
import { VariationsView } from "@/components/ai-generation/views/VariationsView";
import { CommunityGalleryView } from "@/components/ai-generation/views/CommunityGalleryView";
import { InpaintingView } from "@/components/ai-generation/views/InpaintingView";
import { BatchGenerationView } from "@/components/ai-generation/views/BatchGenerationView";
import { PromptHistoryView } from "@/components/ai-generation/views/PromptHistoryView";
import { ImageToPromptView } from "@/components/ai-generation/views/ImageToPromptView";

type ActiveView = 'hub' | 'generate' | 'editor' | 'style' | 'upscaler' | 'gallery' | 'variations' | 'community' | 'inpainting' | 'batch' | 'history' | 'img2prompt';

const tools = [
  { id: 'generate' as ActiveView, icon: Wand2, title: "Generate Image", desc: "Create from text", cost: "5 CR", color: "from-primary to-accent" },
  { id: 'editor' as ActiveView, icon: Pencil, title: "Image Editor", desc: "Edit & transform", cost: "3 CR", color: "from-blue-500 to-cyan-500" },
  { id: 'style' as ActiveView, icon: Brush, title: "Style Transfer", desc: "Apply art styles", cost: "3 CR", color: "from-purple-500 to-pink-500" },
  { id: 'upscaler' as ActiveView, icon: ArrowUpRight, title: "AI Upscaler", desc: "Enhance to HD", cost: "2 CR", color: "from-green-500 to-emerald-500" },
  { id: 'gallery' as ActiveView, icon: BookOpen, title: "Prompt Gallery", desc: "Browse & inspire", cost: "Free", color: "from-amber-500 to-orange-500" },
  { id: 'variations' as ActiveView, icon: Copy, title: "Image Variations", desc: "4 unique versions", cost: "8 CR", color: "from-rose-500 to-red-500" },
  { id: 'community' as ActiveView, icon: Globe, title: "Community Gallery", desc: "Share & discover", cost: "Free", color: "from-teal-500 to-cyan-500" },
  { id: 'inpainting' as ActiveView, icon: Eraser, title: "AI Inpainting", desc: "Edit image areas", cost: "4 CR", color: "from-indigo-500 to-violet-500" },
  { id: 'batch' as ActiveView, icon: Layers, title: "Batch Generation", desc: "Up to 10 at once", cost: "5 CR/img", color: "from-orange-500 to-yellow-500" },
  { id: 'history' as ActiveView, icon: History, title: "Prompt History", desc: "Saved & favorites", cost: "Free", color: "from-slate-500 to-gray-500" },
  { id: 'img2prompt' as ActiveView, icon: ScanSearch, title: "Image-to-Prompt", desc: "Reverse engineer", cost: "3 CR", color: "from-fuchsia-500 to-pink-500" },
];

const AIGeneration = () => {
  const [activeView, setActiveView] = useState<ActiveView>('hub');
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();

  const renderView = () => {
    switch (activeView) {
      case 'generate': return <GenerateView onCreditsUsed={refresh} />;
      case 'editor': return <ImageEditorView onCreditsUsed={refresh} />;
      case 'style': return <StyleTransferView onCreditsUsed={refresh} />;
      case 'upscaler': return <UpscalerView onCreditsUsed={refresh} />;
      case 'gallery': return <PromptGalleryView onSelectPrompt={() => setActiveView('generate')} />;
      case 'variations': return <VariationsView onCreditsUsed={refresh} />;
      case 'community': return <CommunityGalleryView />;
      case 'inpainting': return <InpaintingView onCreditsUsed={refresh} />;
      case 'batch': return <BatchGenerationView onCreditsUsed={refresh} />;
      case 'history': return <PromptHistoryView onSelectPrompt={() => setActiveView('generate')} />;
      case 'img2prompt': return <ImageToPromptView onCreditsUsed={refresh} onUsePrompt={() => setActiveView('generate')} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-6 pt-16">
        {activeView !== 'hub' ? (
          <div className="mb-6">
            <Button variant="ghost" size="sm" onClick={() => setActiveView('hub')} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Studio
            </Button>
            {renderView()}
          </div>
        ) : (
          <>
            <AIGenHero credits={credits.credits_remaining} />

            {/* Engagement Row */}
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
                <p className="text-lg sm:text-xl font-black">11</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">AI Tools</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="bg-card/80 border border-border rounded-xl p-3 sm:p-4 text-center">
                <Brush className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-lg sm:text-xl font-black">12+</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Art Styles</p>
              </motion.div>
            </div>

            {/* Tool Grid */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-black mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Creative AI Tools
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tools.map((tool, i) => (
                  <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
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

            {/* Tips Section */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-black mb-4">💡 Tips for Better Results</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { title: "Be Specific", tip: "Instead of 'a cat', try 'a fluffy orange tabby cat sitting on a windowsill at sunset, photorealistic'" },
                  { title: "Include Art Style", tip: "Mention styles like watercolor, oil painting, digital art, anime, or 3D render" },
                  { title: "Add Lighting", tip: "Describe lighting: golden hour, studio lighting, neon lights, or dramatic shadows" },
                  { title: "Specify Quality", tip: "Add terms like 'high quality', '4K', 'ultra detailed' for better results" },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
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
