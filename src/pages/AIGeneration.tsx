import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Wand2, Pencil, Brush, ArrowUpRight, BookOpen, CreditCard, ArrowLeft, Copy,
  Globe, Eraser, Layers, History, ScanSearch,
  Scissors, Image as ImageIcon, Maximize2, Target, Type, PenTool,
  UserCheck, VenetianMask, PersonStanding, Grid3x3, Users, Film,
  Folder, Share2, Settings, Zap,
} from "lucide-react";
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
const StyleTransferView = lazy(() => import("@/components/ai-generation/views/StyleTransferView").then((module) => ({ default: module.StyleTransferView })));
const UpscalerView = lazy(() => import("@/components/ai-generation/views/UpscalerView").then((module) => ({ default: module.UpscalerView })));
const PromptGalleryView = lazy(() => import("@/components/ai-generation/views/PromptGalleryView").then((module) => ({ default: module.PromptGalleryView })));
const VariationsView = lazy(() => import("@/components/ai-generation/views/VariationsView").then((module) => ({ default: module.VariationsView })));
const CommunityGalleryView = lazy(() => import("@/components/ai-generation/views/CommunityGalleryView").then((module) => ({ default: module.CommunityGalleryView })));
const InpaintingView = lazy(() => import("@/components/ai-generation/views/InpaintingView").then((module) => ({ default: module.InpaintingView })));
const BatchGenerationView = lazy(() => import("@/components/ai-generation/views/BatchGenerationView").then((module) => ({ default: module.BatchGenerationView })));
const PromptHistoryView = lazy(() => import("@/components/ai-generation/views/PromptHistoryView").then((module) => ({ default: module.PromptHistoryView })));
const ImageToPromptView = lazy(() => import("@/components/ai-generation/views/ImageToPromptView").then((module) => ({ default: module.ImageToPromptView })));
const BackgroundRemoveView = lazy(() => import("@/components/ai-generation/views/BackgroundRemoveView").then((module) => ({ default: module.BackgroundRemoveView })));
const BackgroundReplaceView = lazy(() => import("@/components/ai-generation/views/BackgroundReplaceView").then((module) => ({ default: module.BackgroundReplaceView })));
const OutpaintingView = lazy(() => import("@/components/ai-generation/views/OutpaintingView").then((module) => ({ default: module.OutpaintingView })));
const ReferenceImageView = lazy(() => import("@/components/ai-generation/views/ReferenceImageView").then((module) => ({ default: module.ReferenceImageView })));
const LogoTextView = lazy(() => import("@/components/ai-generation/views/LogoTextView").then((module) => ({ default: module.LogoTextView })));
const CharacterConsistencyView = lazy(() => import("@/components/ai-generation/views/CharacterConsistencyView").then((module) => ({ default: module.CharacterConsistencyView })));
const SketchToImageView = lazy(() => import("@/components/ai-generation/views/SketchToImageView").then((module) => ({ default: module.SketchToImageView })));
const RealtimeView = lazy(() => import("@/components/ai-generation/views/RealtimeView").then((module) => ({ default: module.RealtimeView })));
const FaceSwapView = lazy(() => import("@/components/ai-generation/views/FaceSwapView").then((module) => ({ default: module.FaceSwapView })));
const PoseControlView = lazy(() => import("@/components/ai-generation/views/PoseControlView").then((module) => ({ default: module.PoseControlView })));
const TilePatternView = lazy(() => import("@/components/ai-generation/views/TilePatternView").then((module) => ({ default: module.TilePatternView })));
const AvatarPackView = lazy(() => import("@/components/ai-generation/views/AvatarPackView").then((module) => ({ default: module.AvatarPackView })));
const AnimateImageView = lazy(() => import("@/components/ai-generation/views/AnimateImageView").then((module) => ({ default: module.AnimateImageView })));
const FoldersView = lazy(() => import("@/components/ai-generation/views/FoldersView").then((module) => ({ default: module.FoldersView })));
const PublicProfileView = lazy(() => import("@/components/ai-generation/views/PublicProfileView").then((module) => ({ default: module.PublicProfileView })));
const SettingsApiView = lazy(() => import("@/components/ai-generation/views/SettingsApiView").then((module) => ({ default: module.SettingsApiView })));

type ActiveView =
  | 'hub' | 'generate' | 'editor' | 'style' | 'upscaler' | 'gallery' | 'variations'
  | 'community' | 'inpainting' | 'batch' | 'history' | 'img2prompt'
  | 'bg_remove' | 'bg_replace' | 'outpainting' | 'reference' | 'logo'
  | 'character' | 'sketch' | 'realtime' | 'face_swap' | 'pose' | 'tile' | 'avatar' | 'animate'
  | 'folders' | 'profile' | 'settings';

const tools: { id: ActiveView; icon: any; title: string; desc: string; cost: string; color: string; group: string }[] = [
  // Core
  { id: 'generate', icon: Wand2, title: "Generate Image", desc: "Create from text", cost: "5 CR", color: "from-primary to-accent", group: "Core" },
  { id: 'editor', icon: Pencil, title: "Image Editor", desc: "Edit & transform", cost: "3 CR", color: "from-blue-500 to-cyan-500", group: "Core" },
  { id: 'variations', icon: Copy, title: "Variations", desc: "4 unique versions", cost: "8 CR", color: "from-rose-500 to-red-500", group: "Core" },
  { id: 'batch', icon: Layers, title: "Batch", desc: "Up to 10 at once", cost: "5 CR/img", color: "from-orange-500 to-yellow-500", group: "Core" },
  { id: 'realtime', icon: Zap, title: "Realtime", desc: "Live as you type", cost: "5 CR", color: "from-yellow-500 to-amber-500", group: "Core" },
  // Editing
  { id: 'inpainting', icon: Eraser, title: "Inpainting", desc: "Edit image areas", cost: "4 CR", color: "from-indigo-500 to-violet-500", group: "Editing" },
  { id: 'outpainting', icon: Maximize2, title: "Outpainting", desc: "Expand the canvas", cost: "4 CR", color: "from-violet-500 to-purple-500", group: "Editing" },
  { id: 'bg_remove', icon: Scissors, title: "BG Remove", desc: "Isolate subject", cost: "2 CR", color: "from-emerald-500 to-teal-500", group: "Editing" },
  { id: 'bg_replace', icon: ImageIcon, title: "BG Replace", desc: "New background", cost: "3 CR", color: "from-teal-500 to-cyan-500", group: "Editing" },
  { id: 'upscaler', icon: ArrowUpRight, title: "Upscaler", desc: "Enhance to HD", cost: "2 CR", color: "from-green-500 to-emerald-500", group: "Editing" },
  { id: 'style', icon: Brush, title: "Style Transfer", desc: "Apply art styles", cost: "3 CR", color: "from-purple-500 to-pink-500", group: "Editing" },
  // Pro
  { id: 'reference', icon: Target, title: "Reference Img", desc: "Match a style", cost: "4 CR", color: "from-fuchsia-500 to-purple-500", group: "Pro" },
  { id: 'character', icon: UserCheck, title: "Character Lock", desc: "Same face, new scenes", cost: "5 CR", color: "from-pink-500 to-rose-500", group: "Pro" },
  { id: 'face_swap', icon: VenetianMask, title: "Face Swap", desc: "Swap a face", cost: "4 CR", color: "from-red-500 to-orange-500", group: "Pro" },
  { id: 'pose', icon: PersonStanding, title: "Pose Control", desc: "Specific pose", cost: "4 CR", color: "from-orange-500 to-red-500", group: "Pro" },
  { id: 'sketch', icon: PenTool, title: "Sketch → Image", desc: "From rough idea", cost: "4 CR", color: "from-amber-500 to-yellow-500", group: "Pro" },
  { id: 'logo', icon: Type, title: "Logo & Text", desc: "Legible typography", cost: "4 CR", color: "from-cyan-500 to-blue-500", group: "Pro" },
  { id: 'avatar', icon: Users, title: "Avatar Pack", desc: "Headshot bundle", cost: "8 CR", color: "from-blue-500 to-indigo-500", group: "Pro" },
  { id: 'tile', icon: Grid3x3, title: "Seamless Tile", desc: "Repeating pattern", cost: "3 CR", color: "from-indigo-500 to-blue-500", group: "Pro" },
  { id: 'animate', icon: Film, title: "Animate", desc: "Motion keyframe", cost: "6 CR", color: "from-purple-500 to-pink-500", group: "Pro" },
  // Inspiration
  { id: 'gallery', icon: BookOpen, title: "Prompt Gallery", desc: "Browse & inspire", cost: "Free", color: "from-amber-500 to-orange-500", group: "Inspiration" },
  { id: 'community', icon: Globe, title: "Community", desc: "Share & discover", cost: "Free", color: "from-teal-500 to-cyan-500", group: "Inspiration" },
  { id: 'history', icon: History, title: "Prompt History", desc: "Saved prompts", cost: "Free", color: "from-slate-500 to-gray-500", group: "Inspiration" },
  { id: 'img2prompt', icon: ScanSearch, title: "Image→Prompt", desc: "Reverse engineer", cost: "3 CR", color: "from-fuchsia-500 to-pink-500", group: "Inspiration" },
  // Organize
  { id: 'folders', icon: Folder, title: "Folders & Tags", desc: "Organize work", cost: "Free", color: "from-stone-500 to-amber-600", group: "Organize" },
  { id: 'profile', icon: Share2, title: "Public Profile", desc: "Share gallery", cost: "Free", color: "from-sky-500 to-blue-500", group: "Organize" },
  { id: 'settings', icon: Settings, title: "Settings & API", desc: "Watermark, EXIF, API", cost: "Free", color: "from-gray-500 to-slate-600", group: "Organize" },
];

const GROUPS = ["Core", "Editing", "Pro", "Inspiration", "Organize"];

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
      case 'bg_remove': return <BackgroundRemoveView onCreditsUsed={refresh} />;
      case 'bg_replace': return <BackgroundReplaceView onCreditsUsed={refresh} />;
      case 'outpainting': return <OutpaintingView onCreditsUsed={refresh} />;
      case 'reference': return <ReferenceImageView onCreditsUsed={refresh} />;
      case 'logo': return <LogoTextView onCreditsUsed={refresh} />;
      case 'character': return <CharacterConsistencyView onCreditsUsed={refresh} />;
      case 'sketch': return <SketchToImageView onCreditsUsed={refresh} />;
      case 'realtime': return <RealtimeView onCreditsUsed={refresh} />;
      case 'face_swap': return <FaceSwapView onCreditsUsed={refresh} />;
      case 'pose': return <PoseControlView onCreditsUsed={refresh} />;
      case 'tile': return <TilePatternView onCreditsUsed={refresh} />;
      case 'avatar': return <AvatarPackView onCreditsUsed={refresh} />;
      case 'animate': return <AnimateImageView onCreditsUsed={refresh} />;
      case 'folders': return <FoldersView />;
      case 'profile': return <PublicProfileView />;
      case 'settings': return <SettingsApiView />;
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
          <div className="mb-6">
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
