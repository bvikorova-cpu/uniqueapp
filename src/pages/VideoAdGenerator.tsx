import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { VideoAdHero } from "@/components/video-ads/VideoAdHero";
import { VideoAdCreditsDisplay } from "@/components/video-ads/VideoAdCreditsDisplay";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Layout, PenTool, Users, BarChart3, Globe, Search, Mic, Music, Target, Calculator, Flame, Trophy, Star, Lightbulb, ImageIcon, CalendarDays, Mic2, BarChart2, Globe2, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";
import { StoryboardView } from "@/components/video-ads/views/StoryboardView";
import { AdCopyView } from "@/components/video-ads/views/AdCopyView";
import { AudienceAnalyzerView } from "@/components/video-ads/views/AudienceAnalyzerView";
import { PerformancePredictorView } from "@/components/video-ads/views/PerformancePredictorView";
import { MultiPlatformView } from "@/components/video-ads/views/MultiPlatformView";
import { CompetitorAnalysisView } from "@/components/video-ads/views/CompetitorAnalysisView";
import { VoiceoverScriptView } from "@/components/video-ads/views/VoiceoverScriptView";
import { MusicComposerView } from "@/components/video-ads/views/MusicComposerView";
import { CampaignPlannerView } from "@/components/video-ads/views/CampaignPlannerView";
import { RoiCalculatorView } from "@/components/video-ads/views/RoiCalculatorView";
import { ThumbnailGeneratorView } from "@/components/video-ads/views/ThumbnailGeneratorView";
import { SocialCalendarView } from "@/components/video-ads/views/SocialCalendarView";
import { BrandVoiceView } from "@/components/video-ads/views/BrandVoiceView";
import { AdAnalyticsDashboardView } from "@/components/video-ads/views/AdAnalyticsDashboardView";
import { MultiLanguageView } from "@/components/video-ads/views/MultiLanguageView";
import { ABTesterView } from "@/components/video-ads/views/ABTesterView";
import { useVideoAdCredits } from "@/hooks/useVideoAdCredits";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, Lock, Zap, Sparkles, Crown } from "lucide-react";
import { toast } from "sonner";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
interface VideoAdResult {
  title: string; script: string;
  scenes: Array<{ duration: string; description: string; voiceover: string; visuals: string; }>;
  callToAction: string; musicSuggestion: string; targetEmotions: string[];
  competitiveAnalysis?: string; abTestVariants?: Array<{ title: string; tagline: string }>;
  voiceActors?: Array<{ name: string; style: string }>; budgetBreakdown?: { production: number; distribution: number; total: number };
  performancePrediction?: { reach: string; engagement: string; conversion: string };
}

const ScriptGeneratorView = ({ onBack }: { onBack: () => void }) => {
  const { credits, isLoading: creditsLoading, generateVideoAd, isGenerating, getTierLimits, calculateCreditCost } = useVideoAdCredits();
  const [formData, setFormData] = useState({ product: "", targetAudience: "", keyMessage: "", tone: "professional", duration: "30", platform: "youtube" });
  const [premiumFeatures, setPremiumFeatures] = useState({ competitiveAnalysis: false, abTesting: false, voiceActorSuggestions: false, budgetOptimizer: false, multiLanguage: [] as string[], storyboardExport: false, brandVoiceMatching: false, performancePredictions: false });
  const [result, setResult] = useState<VideoAdResult | null>(null);
  const tier = credits?.tier || 'free';
  const tierLimits = getTierLimits(tier);
  const estimatedCost = calculateCreditCost({ productService: formData.product, targetAudience: formData.targetAudience, keyMessage: formData.keyMessage, tone: formData.tone, duration: parseInt(formData.duration), platform: formData.platform, premiumFeatures });

  const handleGenerate = async () => {
    if (!formData.product || !formData.targetAudience || !formData.keyMessage) { toast.error("Fill in all required fields"); return; }
    if (!credits || credits.credits_remaining < estimatedCost) { toast.error("Insufficient credits"); return; }
    try {
      const data = await generateVideoAd({ productService: formData.product, targetAudience: formData.targetAudience, keyMessage: formData.keyMessage, tone: formData.tone, duration: parseInt(formData.duration), platform: formData.platform, premiumFeatures });
      setResult(data as VideoAdResult);
    } catch (e) { console.error(e); }
  };

  const downloadScript = () => {
    if (!result) return;
    const content = `${result.title}\n${'='.repeat(result.title.length)}\n\nSCRIPT:\n${result.script}\n\nSCENES:\n${result.scenes.map((s, i) => `Scene ${i+1} (${s.duration})\n${s.description}\nVO: ${s.voiceover}\nVisuals: ${s.visuals}`).join('\n\n')}\n\nCTA: ${result.callToAction}\nMUSIC: ${result.musicSuggestion}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `video-ad-${Date.now()}.txt`; a.click();
  };

  const isPremiumFeature = (f: keyof typeof premiumFeatures) => { if (tier === 'agency') return false; if (tier === 'pro' && ['competitiveAnalysis','abTesting','voiceActorSuggestions','budgetOptimizer'].includes(f)) return false; return true; };
  const togglePremiumFeature = (f: keyof typeof premiumFeatures) => { if (isPremiumFeature(f)) { toast.error("PRO/Agency only"); return; } setPremiumFeatures(p => ({ ...p, [f]: typeof p[f] === 'boolean' ? !p[f] : p[f] })); };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><span className="mr-2">←</span>Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg"><Video className="w-6 h-6 text-white" /></div>
          <div><h2 className="text-2xl font-black">AI Video Script Generator</h2><p className="text-muted-foreground text-sm">Complete ad scripts with scenes & voiceover</p></div>
          <Badge className="ml-auto bg-gradient-to-r from-orange-500 to-red-500 text-white border-0"><Sparkles className="w-3 h-3 mr-1" />{estimatedCost} CR</Badge>
        </div>
      </motion.div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" />Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Product/Service *</Label><Input placeholder="e.g. Fitness app" value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} /></div>
            <div><Label>Target Audience *</Label><Input placeholder="e.g. Young adults 18-30" value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})} /></div>
            <div><Label>Key Message *</Label><Textarea placeholder="What to tell customers?" value={formData.keyMessage} onChange={e => setFormData({...formData, keyMessage: e.target.value})} rows={3} /></div>
            <div><Label>Tone</Label><Select value={formData.tone} onValueChange={v => setFormData({...formData, tone: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="professional">Professional</SelectItem><SelectItem value="casual">Casual</SelectItem><SelectItem value="energetic">Energetic</SelectItem><SelectItem value="emotional">Emotional</SelectItem><SelectItem value="humorous">Humorous</SelectItem></SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Duration</Label><Select value={formData.duration} onValueChange={v => setFormData({...formData, duration: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15s</SelectItem><SelectItem value="30">30s</SelectItem><SelectItem value="60">60s</SelectItem><SelectItem value="90">90s</SelectItem></SelectContent></Select></div>
              <div><Label>Platform</Label><Select value={formData.platform} onValueChange={v => setFormData({...formData, platform: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="youtube">YouTube</SelectItem><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="tiktok">TikTok</SelectItem><SelectItem value="facebook">Facebook</SelectItem><SelectItem value="tv">TV</SelectItem></SelectContent></Select></div>
            </div>
            <div className="pt-4 border-t"><h3 className="font-semibold mb-3 flex items-center gap-2"><Zap className="w-4 h-4" />Premium Features</h3>
              <div className="space-y-2">
                {[{id:'competitiveAnalysis',label:'Competitive Analysis',cost:2},{id:'abTesting',label:'A/B Testing Variants',cost:2},{id:'voiceActorSuggestions',label:'Voice Actor Suggestions',cost:2},{id:'budgetOptimizer',label:'Budget Optimizer',cost:2},{id:'performancePredictions',label:'Performance Predictions',cost:3}].map(f => (
                  <div key={f.id} className="flex items-center space-x-2">
                    <Checkbox id={f.id} checked={(premiumFeatures as any)[f.id]} onCheckedChange={() => togglePremiumFeature(f.id as any)} disabled={isPremiumFeature(f.id as any)} />
                    <Label htmlFor={f.id} className="text-sm flex items-center gap-1">{f.label}{isPremiumFeature(f.id as any) && <Lock className="w-3 h-3" />}<Badge variant="outline" className="ml-1">+{f.cost}</Badge></Label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={isGenerating || creditsLoading} className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Video className="mr-2 h-4 w-4" />Generate ({estimatedCost} CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center justify-between"><span className="flex items-center gap-2"><Video className="w-5 h-5" />Result</span>{result && <Button variant="outline" size="sm" onClick={downloadScript}><Download className="w-4 h-4 mr-2" />Download</Button>}</CardTitle></CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center py-12 text-muted-foreground"><Video className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>Fill the form to generate your video ad</p></div>
            ) : (
              <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2">
                <h3 className="font-bold text-lg">{result.title}</h3>
                <div><h4 className="font-semibold mb-2">📝 Script:</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.script}</p></div>
                <div><h4 className="font-semibold mb-3">🎬 Scenes:</h4>{result.scenes.map((s, i) => (
                  <Card key={i} className="mb-3 bg-muted/30"><CardContent className="pt-4"><div className="font-medium mb-2">Scene {i+1} ({s.duration})</div><div className="space-y-2 text-sm"><p><strong>Description:</strong> {s.description}</p><p><strong>Voiceover:</strong> "{s.voiceover}"</p><p><strong>Visuals:</strong> {s.visuals}</p></div></CardContent></Card>
                ))}</div>
                {result.competitiveAnalysis && <div><h4 className="font-semibold mb-2">🔍 Competitive Analysis:</h4><p className="text-sm text-muted-foreground">{result.competitiveAnalysis}</p></div>}
                {result.performancePrediction && <div><h4 className="font-semibold mb-2">📊 Predictions:</h4><div className="space-y-1 text-sm"><p>Reach: {result.performancePrediction.reach}</p><p>Engagement: {result.performancePrediction.engagement}</p><p>Conversion: {result.performancePrediction.conversion}</p></div></div>}
                <div><h4 className="font-semibold mb-2">📢 CTA:</h4><p className="text-sm">{result.callToAction}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><h4 className="font-semibold mb-2">🎵 Music:</h4><p className="text-sm text-muted-foreground">{result.musicSuggestion}</p></div>
                  <div><h4 className="font-semibold mb-2">💭 Emotions:</h4><div className="flex flex-wrap gap-1">{result.targetEmotions.map((e, i) => (<span key={i} className="text-xs px-2 py-1 bg-primary/10 rounded-full">{e}</span>))}</div></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const tools = [
  { id: "script", icon: Video, title: "Video Script Generator", desc: "Complete ad scripts with scenes", cost: "1+ CR", gradient: "from-orange-500 to-red-600" },
  { id: "storyboard", icon: Layout, title: "Storyboard Creator", desc: "Visual frame-by-frame breakdown", cost: "3 CR", gradient: "from-orange-500 to-red-600" },
  { id: "ad-copy", icon: PenTool, title: "Ad Copy Optimizer", desc: "Headlines, CTAs & hashtags", cost: "2 CR", gradient: "from-orange-500 to-amber-600" },
  { id: "audience", icon: Users, title: "Audience Analyzer", desc: "Deep audience insights", cost: "2 CR", gradient: "from-blue-500 to-cyan-600" },
  { id: "performance", icon: BarChart3, title: "Performance Predictor", desc: "Predict reach & conversions", cost: "3 CR", gradient: "from-emerald-500 to-teal-600" },
  { id: "multi-platform", icon: Globe, title: "Multi-Platform Adapter", desc: "Adapt for all platforms", cost: "3 CR", gradient: "from-violet-500 to-purple-600" },
  { id: "competitor", icon: Search, title: "Competitor Analyzer", desc: "Competitive intelligence", cost: "4 CR", gradient: "from-red-500 to-rose-600" },
  { id: "voiceover", icon: Mic, title: "Voiceover Script", desc: "Professional VO direction", cost: "2 CR", gradient: "from-pink-500 to-rose-600" },
  { id: "music", icon: Music, title: "Music Director", desc: "Music & sound design", cost: "3 CR", gradient: "from-yellow-500 to-orange-600" },
  { id: "campaign", icon: Target, title: "Campaign Planner", desc: "Complete campaign strategy", cost: "4 CR", gradient: "from-indigo-500 to-blue-600" },
  { id: "roi", icon: Calculator, title: "ROI Calculator", desc: "Predict return on investment", cost: "2 CR", gradient: "from-green-500 to-emerald-600" },
  { id: "thumbnail", icon: ImageIcon, title: "Thumbnail Generator", desc: "Click-worthy thumbnails", cost: "2 CR", gradient: "from-pink-500 to-rose-600" },
  { id: "social-calendar", icon: CalendarDays, title: "Social Media Calendar", desc: "30-day posting schedule", cost: "3 CR", gradient: "from-blue-500 to-indigo-600" },
  { id: "brand-voice", icon: Mic2, title: "Brand Voice Matcher", desc: "Define your brand identity", cost: "2 CR", gradient: "from-teal-500 to-cyan-600" },
  { id: "ad-analytics", icon: BarChart2, title: "Ad Analytics Dashboard", desc: "Campaign insights & stats", cost: "3 CR", gradient: "from-emerald-500 to-green-600" },
  { id: "multi-language", icon: Globe2, title: "Multi-Language Translator", desc: "Localize for global markets", cost: "3 CR", gradient: "from-cyan-500 to-blue-600" },
  { id: "ab-tester", icon: FlaskConical, title: "Ad A/B Tester", desc: "Compare ad variants", cost: "4 CR", gradient: "from-purple-500 to-violet-600" },
];

const VideoAdGenerator = () => {
  const [activeView, setActiveView] = useState("dashboard");

  const renderView = () => {
    switch (activeView) {
      case "script": return <ScriptGeneratorView onBack={() => setActiveView("dashboard")} />;
      case "storyboard": return <StoryboardView onBack={() => setActiveView("dashboard")} />;
      case "ad-copy": return <AdCopyView onBack={() => setActiveView("dashboard")} />;
      case "audience": return <AudienceAnalyzerView onBack={() => setActiveView("dashboard")} />;
      case "performance": return <PerformancePredictorView onBack={() => setActiveView("dashboard")} />;
      case "multi-platform": return <MultiPlatformView onBack={() => setActiveView("dashboard")} />;
      case "competitor": return <CompetitorAnalysisView onBack={() => setActiveView("dashboard")} />;
      case "voiceover": return <VoiceoverScriptView onBack={() => setActiveView("dashboard")} />;
      case "music": return <MusicComposerView onBack={() => setActiveView("dashboard")} />;
      case "campaign": return <CampaignPlannerView onBack={() => setActiveView("dashboard")} />;
      case "roi": return <RoiCalculatorView onBack={() => setActiveView("dashboard")} />;
      case "thumbnail": return <ThumbnailGeneratorView onBack={() => setActiveView("dashboard")} />;
      case "social-calendar": return <SocialCalendarView onBack={() => setActiveView("dashboard")} />;
      case "brand-voice": return <BrandVoiceView onBack={() => setActiveView("dashboard")} />;
      case "ad-analytics": return <AdAnalyticsDashboardView onBack={() => setActiveView("dashboard")} />;
      case "multi-language": return <MultiLanguageView onBack={() => setActiveView("dashboard")} />;
      case "ab-tester": return <ABTesterView onBack={() => setActiveView("dashboard")} />;
      default:
        return (
          <>
            <VideoAdHero />
            <HeroRewardedAd sectionKey="page_videoadgenerator" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/5 border-orange-500/20">
                <div className="flex items-center gap-3"><Flame className="w-8 h-8 text-orange-500" /><div><p className="text-2xl font-black">7</p><p className="text-xs text-muted-foreground">Day Streak</p></div></div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
                <div className="flex items-center gap-3"><Trophy className="w-8 h-8 text-blue-500" /><div><p className="text-2xl font-black">142</p><p className="text-xs text-muted-foreground">Ads Created</p></div></div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/20">
                <div className="flex items-center gap-3"><Star className="w-8 h-8 text-amber-500" /><div><p className="text-2xl font-black">Pro</p><p className="text-xs text-muted-foreground">Creator Level</p></div></div>
              </Card>
            </div>
            <VideoAdCreditsDisplay />
            <h2 className="text-xl font-bold mt-8 mb-4">AI Tools & Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {tools.map((tool, i) => (
                <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 h-full" onClick={() => setActiveView(tool.id)}>
                    <CardContent className="pt-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                        <tool.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold mb-1">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{tool.desc}</p>
                      <Badge variant="secondary">{tool.cost}</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <Card className="p-6 bg-gradient-to-r from-orange-500/5 to-red-500/5 border-orange-500/10">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-orange-500" />Tips for Better Video Ads</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2"><h4 className="font-semibold">🎯 Know Your Audience</h4><p className="text-muted-foreground">Use the Audience Analyzer first to understand your ideal customer before writing scripts.</p></div>
                <div className="space-y-2"><h4 className="font-semibold">🎬 Start with Storyboard</h4><p className="text-muted-foreground">Create a storyboard to visualize your ad before generating the script for better results.</p></div>
                <div className="space-y-2"><h4 className="font-semibold">📊 Test & Optimize</h4><p className="text-muted-foreground">Use Performance Predictor and ROI Calculator to optimize before spending your budget.</p></div>
              </div>
            </Card>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">{renderView()}</main>
    </div>
  );
};

export default VideoAdGenerator;
