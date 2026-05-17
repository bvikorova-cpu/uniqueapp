import { useState } from "react";
import { Shield, MessageSquare, Users, Brain, History, AlertTriangle, ArrowLeft, Coins, Sparkles, Crosshair, Zap, Trophy, Briefcase } from "lucide-react";
import { LieDetectorCinematicHero } from "@/components/lie-detector/LieDetectorCinematicHero";
import { VoiceLieDetectionCard } from "@/components/lie-detector/VoiceLieDetectionCard";
import { ScreenshotForensicsCard } from "@/components/lie-detector/ScreenshotForensicsCard";
import { ConversationTimelineCard } from "@/components/lie-detector/ConversationTimelineCard";
import { TruthReportCard } from "@/components/lie-detector/TruthReportCard";
import { LiveLieCoachCard } from "@/components/lie-detector/LiveLieCoachCard";
import { MultiPersonProfileCard } from "@/components/lie-detector/MultiPersonProfileCard";
import { VoiceCloneDetectorCard } from "@/components/lie-detector/VoiceCloneDetectorCard";
import { DailySpotTheLieCard } from "@/components/lie-detector/DailySpotTheLieCard";
import { WatermarkedPdfReportCard } from "@/components/lie-detector/WatermarkedPdfReportCard";
import { InterrogationModeToggle } from "@/components/lie-detector/InterrogationModeToggle";
import { LieDetectorCredits } from "@/components/lie-detector/LieDetectorCredits";
import { LieDetectorStreak } from "@/components/lie-detector/LieDetectorStreak";
import { LieDetectorProgressPreview } from "@/components/lie-detector/LieDetectorProgressPreview";
import { LieDetectorAchievements } from "@/components/lie-detector/LieDetectorAchievements";
import { LieDetectorToolCard } from "@/components/lie-detector/LieDetectorToolCard";
import { LieDetectorTestimonials } from "@/components/lie-detector/LieDetectorTestimonials";
import { LieDetectorComparisonTable } from "@/components/lie-detector/LieDetectorComparisonTable";
import { SingleMessageAnalysis } from "@/components/lie-detector/SingleMessageAnalysis";
import { ThreadAnalysis } from "@/components/lie-detector/ThreadAnalysis";
import { PsychologicalProfile } from "@/components/lie-detector/PsychologicalProfile";
import { AnalysisHistory } from "@/components/lie-detector/AnalysisHistory";
import { PolygraphCard } from "@/components/lie-detector/PolygraphCard";
import { CrossExaminationCard } from "@/components/lie-detector/CrossExaminationCard";
import { VoiceHeatmapCard } from "@/components/lie-detector/VoiceHeatmapCard";
import { BodyLanguageScanCard } from "@/components/lie-detector/BodyLanguageScanCard";
import { ComparisonModeCard } from "@/components/lie-detector/ComparisonModeCard";
import { BulkUploadCard } from "@/components/lie-detector/BulkUploadCard";
import { ApiKeysCard } from "@/components/lie-detector/ApiKeysCard";
import { MonitoringJobsCard } from "@/components/lie-detector/MonitoringJobsCard";
import { CaseFilesCard } from "@/components/lie-detector/CaseFilesCard";
import { DetectiveRankCard } from "@/components/lie-detector/DetectiveRankCard";
import { SocialCardGenerator } from "@/components/lie-detector/SocialCardGenerator";
import { LieDetectorParityPack } from "@/components/lie-detector/LieDetectorParityPack";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingParticles } from "@/components/wellness/FloatingParticles";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const DETECTOR_TOOLS = [
  {
    id: "single",
    name: "Single Message",
    icon: MessageSquare,
    description: "Analyze any text message for truthfulness indicators and deception patterns",
    color: "from-blue-500 to-cyan-500",
    features: ["Truthfulness score", "Deception indicators", "Emotional analysis", "Manipulation detection"],
    credits: 3,
  },
  {
    id: "thread",
    name: "Conversation Thread",
    icon: Users,
    description: "Scan entire chat threads to detect patterns across multiple messages",
    color: "from-purple-500 to-pink-500",
    features: ["Multi-message analysis", "Pattern detection", "Consistency check", "Red flag alerts"],
    credits: 15,
  },
  {
    id: "profile",
    name: "Psychological Profile",
    icon: Brain,
    description: "Deep psychological insights about communication styles and behavioral patterns",
    color: "from-amber-500 to-orange-500",
    features: ["Personality assessment", "Communication style", "Behavioral patterns", "Risk indicators"],
    credits: 50,
  },
  {
    id: "history",
    name: "Analysis History",
    icon: History,
    description: "View all your past analyses and track patterns over time",
    color: "from-emerald-500 to-teal-500",
    features: ["Past results", "Score trends", "Export reports", "Saved analyses"],
    credits: 0,
  },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Paste Message", desc: "Copy any text message or conversation you want to verify" },
  { step: "2", title: "AI Analyzes", desc: "Our AI scans for 50+ linguistic deception patterns and emotional cues" },
  { step: "3", title: "Get Results", desc: "Receive a detailed truthfulness report with scores and recommendations" },
];

const LieDetector = () => {
  const [activeView, setActiveView] = useState<"hub" | "single" | "thread" | "profile" | "history" | "credits">("hub");

  const openTool = (toolId: string) => {
    setActiveView(toolId as any);
  };

  const renderToolView = () => {
    switch (activeView) {
      case "single": return <SingleMessageAnalysis />;
      case "thread": return <ThreadAnalysis />;
      case "profile": return <PsychologicalProfile />;
      case "history": return <AnalysisHistory />;
      case "credits": return <LieDetectorCredits />;
      default: return null;
    }
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
              <LieDetectorCinematicHero />

              <HeroRewardedAd sectionKey="page_liedetector" />

              {/* Interrogation Mode Toggle */}
              <InterrogationModeToggle />

              {/* Forensic AI Suite (original 4) */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                  <span className="text-xs font-mono uppercase tracking-widest text-red-400">Forensic AI Suite</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <VoiceLieDetectionCard />
                  <ScreenshotForensicsCard />
                  <ConversationTimelineCard />
                  <TruthReportCard />
                </div>
              </div>

              {/* Advanced Forensics */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-400 flex items-center gap-1">
                    <Crosshair className="w-3 h-3" /> Advanced Forensics
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LiveLieCoachCard />
                  <MultiPersonProfileCard />
                  <VoiceCloneDetectorCard />
                  <WatermarkedPdfReportCard />
                </div>
              </div>

              {/* PRO SUITE — Premium AI Tools */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                  <span className="text-xs font-mono uppercase tracking-widest text-purple-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Pro Suite — Elite Forensics
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PolygraphCard />
                  <CrossExaminationCard />
                  <VoiceHeatmapCard />
                  <BodyLanguageScanCard />
                  <ComparisonModeCard />
                  <BulkUploadCard />
                </div>
              </div>

              {/* Parity Pack — Conversational Forensics (8 new AI tools) */}
              <LieDetectorParityPack />

              {/* Daily Challenge + Leaderboard */}
              <DailySpotTheLieCard />

              {/* Detective Workspace */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
                  <span className="text-xs font-mono uppercase tracking-widest text-yellow-400 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Detective Workspace
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <DetectiveRankCard />
                  <CaseFilesCard />
                  <MonitoringJobsCard />
                  <SocialCardGenerator />
                  <ApiKeysCard />
                </div>
              </div>

              {/* Quick Stats Row */}
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
                <LieDetectorStreak />
                <LieDetectorProgressPreview />
                <LieDetectorAchievements />
              </div>

              {/* Main Content: Tools + Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DETECTOR_TOOLS.map((tool, i) => (
                      <LieDetectorToolCard
                        key={tool.id}
                        tool={tool}
                        onSelect={() => openTool(tool.id)}
                        index={i}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <LieDetectorTestimonials />
                  <LieDetectorComparisonTable />
                </div>
              </div>

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

              {/* Disclaimer */}
              <Alert className="border-2 border-yellow-500/50 bg-yellow-500/10">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <AlertTitle className="text-yellow-600 dark:text-yellow-400 font-bold">
                  ⚠️ Important Disclaimer
                </AlertTitle>
                <AlertDescription className="text-yellow-700 dark:text-yellow-300 mt-2">
                  <strong>For entertainment and informational purposes only.</strong> Results are AI-generated estimates
                  based on linguistic patterns and should NOT be used as definitive proof of truthfulness or deception.
                  This tool does not replace professional psychological assessment or legal investigation.
                </AlertDescription>
              </Alert>
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
                  onClick={() => setActiveView("hub")}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Lie Detector
                </Button>
                <Badge variant="outline" className="text-xs">
                  {DETECTOR_TOOLS.find(t => t.id === activeView)?.name || "Credits"}
                </Badge>
              </div>
              {renderToolView()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LieDetector;
