import { useState, useEffect } from "react";
import { HandwritingCreditsDisplay } from "@/components/handwriting/HandwritingCreditsDisplay";
import { HandwritingUpload } from "@/components/handwriting/HandwritingUpload";
import { HandwritingAnalysisResult } from "@/components/handwriting/HandwritingAnalysisResult";
import { HandwritingHistory } from "@/components/handwriting/HandwritingHistory";
import { HandwritingHero } from "@/components/handwriting/HandwritingHero";
import { HandwritingStreak } from "@/components/handwriting/HandwritingStreak";
import { HandwritingProgressPreview } from "@/components/handwriting/HandwritingProgressPreview";
import { HandwritingAchievements } from "@/components/handwriting/HandwritingAchievements";
import { HandwritingToolCard } from "@/components/handwriting/HandwritingToolCard";
import { HandwritingTestimonials } from "@/components/handwriting/HandwritingTestimonials";
import { HandwritingComparisonTable } from "@/components/handwriting/HandwritingComparisonTable";
import { SignatureAnalyzerCard } from "@/components/handwriting/SignatureAnalyzerCard";
import { CompatibilityCard } from "@/components/handwriting/CompatibilityCard";
import { MoodTrackerCard } from "@/components/handwriting/MoodTrackerCard";
import { ForgeryDetectorCard } from "@/components/handwriting/ForgeryDetectorCard";
import { TwinFinderCard } from "@/components/handwriting/TwinFinderCard";
import { FamousComparisonCard } from "@/components/handwriting/FamousComparisonCard";
import { AcademyCard } from "@/components/handwriting/AcademyCard";
import { CouplesSubscriptionCard } from "@/components/handwriting/CouplesSubscriptionCard";
import { HrProCard } from "@/components/handwriting/HrProCard";
import { VoiceDiaryCard } from "@/components/handwriting/VoiceDiaryCard";
import { LiveInkCard } from "@/components/handwriting/LiveInkCard";
import { TimeCapsuleCard } from "@/components/handwriting/TimeCapsuleCard";
import { PublicGalleryCard } from "@/components/handwriting/PublicGalleryCard";
import HandwritingParityPack from "@/components/handwriting/HandwritingParityPack";
import { useHandwritingCredits } from "@/hooks/useHandwritingCredits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Coins, History, Sparkles, PenTool, Briefcase, Heart, Building2, Upload, Info, Feather } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingParticles } from "@/components/wellness/FloatingParticles";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const ANALYSIS_TOOLS = [
  {
    id: "personal",
    name: "Personal Analysis",
    icon: PenTool,
    description: "Discover personality traits, emotional states, and self-awareness insights from your handwriting",
    color: "from-purple-500 to-violet-500",
    features: ["Personality traits", "Emotional intelligence", "Stress indicators", "Creativity level"],
    credits: 5,
  },
  {
    id: "professional",
    name: "Professional Analysis",
    icon: Briefcase,
    description: "Career strengths, work style assessment, and leadership qualities analysis",
    color: "from-blue-500 to-cyan-500",
    features: ["Work style", "Leadership qualities", "Decision making", "Career strengths"],
    credits: 10,
  },
  {
    id: "relationship",
    name: "Relationship Analysis",
    icon: Heart,
    description: "Communication patterns, compatibility insights, and relationship dynamics",
    color: "from-pink-500 to-rose-500",
    features: ["Communication style", "Compatibility traits", "Emotional patterns", "Trust indicators"],
    credits: 15,
  },
  {
    id: "business",
    name: "Business Analysis",
    icon: Building2,
    description: "Strategic thinking, decision-making patterns, and negotiation style insights",
    color: "from-emerald-500 to-teal-500",
    features: ["Strategic thinking", "Risk assessment", "Negotiation style", "Innovation capacity"],
    credits: 20,
  },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Upload Sample", desc: "Take a clear photo of your handwriting — at least 3-4 lines of natural text" },
  { step: "2", title: "Choose Analysis", desc: "Select from Personal, Professional, Relationship, or Business analysis types" },
  { step: "3", title: "Get Insights", desc: "Receive a comprehensive report with personality traits, strengths, and recommendations" },
];

const Handwriting = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState<"hub" | "analyze" | "history" | "credits">("hub");
  const [selectedType, setSelectedType] = useState("personal");
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const { analyzeHandwriting, isAnalyzing } = useHandwritingCredits();

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast.success("Payment successful! Your credits have been added.");
      setSearchParams({});
    } else if (payment === "cancelled") {
      toast.error("Payment cancelled");
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleAnalysisComplete = (result: any) => {
    setCurrentAnalysis(result.analysis);
    toast.success("Analysis complete!");
  };

  const openTool = (toolId: string) => {
    setSelectedType(toolId);
    setActiveView("analyze");
  };

  const getViewLabel = () => {
    if (activeView === "analyze") return ANALYSIS_TOOLS.find(t => t.id === selectedType)?.name || "Analysis";
    if (activeView === "history") return "Analysis History";
    if (activeView === "credits") return "Credits";
    return "";
  };

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-8 sm:pb-12 relative overflow-hidden">
      <FloatingParticles />
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl relative z-10">
        <AnimatePresence mode="wait">
          {activeView === "hub" ? (
            <motion.div
              key="hub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 sm:space-y-8"
            >
              <HandwritingHero />

              <HeroRewardedAd sectionKey="page_handwriting" />

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center gap-3 flex-wrap"
              >
                <Button
                  variant="outline"
                  className="gap-2 bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/30"
                  onClick={() => setActiveView("credits")}
                >
                  <Coins className="w-4 h-4 text-primary" />
                  Buy Credits
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/30"
                  onClick={() => setActiveView("history")}
                >
                  <History className="w-4 h-4 text-primary" />
                  View History
                </Button>
              </motion.div>

              {/* 3-Column Engagement Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <HandwritingStreak />
                <HandwritingProgressPreview />
                <HandwritingAchievements />
              </div>

              {/* Main Content: Tools + Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ANALYSIS_TOOLS.map((tool, i) => (
                      <HandwritingToolCard
                        key={tool.id}
                        tool={tool}
                        onSelect={() => openTool(tool.id)}
                        index={i}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <HandwritingTestimonials />
                  <HandwritingComparisonTable />
                </div>
              </div>

              {/* Forensic Suite */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
                  <h2 className="text-2xl font-black text-amber-900 dark:text-amber-200" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Forensic Suite</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SignatureAnalyzerCard />
                  <CompatibilityCard />
                  <MoodTrackerCard />
                  <ForgeryDetectorCard />
                </div>
              </motion.div>

              {/* Premium Membership */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.57 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
                  <h2 className="text-2xl font-black text-amber-900 dark:text-amber-200" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Premium Memberships</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CouplesSubscriptionCard />
                  <HrProCard />
                  <VoiceDiaryCard />
                </div>
              </motion.div>

              {/* Living Studio: Live Ink + Time Capsule */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
                  <h2 className="text-2xl font-black text-amber-900 dark:text-amber-200" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>The Living Studio</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <LiveInkCard />
                  <TimeCapsuleCard />
                </div>
              </motion.div>

              {/* Public Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.59 }}
              >
                <PublicGalleryCard />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.595 }}
              >
                <HandwritingParityPack />
              </motion.div>

              {/* Engagement Workshop */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
                  <h2 className="text-2xl font-black text-amber-900 dark:text-amber-200" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>The Atelier Workshop</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AcademyCard />
                  <TwinFinderCard />
                  <FamousComparisonCard />
                  <Card className="bg-gradient-to-br from-amber-50/80 to-yellow-100/60 border-amber-300/40">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2"><Feather className="w-5 h-5 text-amber-700" /> Forensic PDF Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-amber-900/80 space-y-2">
                      <p>Every analysis can be exported as a court-grade PDF with watermark, executive summary and AI insights.</p>
                      <p className="italic">Open any analysis in History → "Export Forensic PDF" (5 credits).</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* How It Works */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      How It Works
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {HOW_IT_WORKS.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                          className="text-center p-4 rounded-xl bg-muted/10 border border-border/20"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                            <span className="text-sm font-bold text-primary">{item.step}</span>
                          </div>
                          <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                          <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm mb-2">Tips for Best Results</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                          <p>• Use clear, high-resolution images</p>
                          <p>• Ensure good lighting without shadows</p>
                          <p>• Include at least 3-4 lines of handwriting</p>
                          <p>• Natural, unforced writing works best</p>
                          <p>• Write on white unlined paper if possible</p>
                          <p>• Use a pen rather than pencil</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => { setActiveView("hub"); setCurrentAnalysis(null); }}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Handwriting
                </Button>
                <Badge variant="outline" className="text-xs">{getViewLabel()}</Badge>
              </div>

              {activeView === "analyze" && (
                <div className="space-y-6">
                  <HandwritingUpload
                    onAnalysisComplete={handleAnalysisComplete}
                    isAnalyzing={isAnalyzing}
                    preselectedType={selectedType}
                  />
                  {currentAnalysis && (
                    <HandwritingAnalysisResult analysis={currentAnalysis} />
                  )}
                </div>
              )}

              {activeView === "history" && <HandwritingHistory />}
              {activeView === "credits" && <HandwritingCreditsDisplay />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Handwriting;
