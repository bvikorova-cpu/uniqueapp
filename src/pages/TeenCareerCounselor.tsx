import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Heart, TrendingUp, Lightbulb, Sparkles, ArrowRight, ArrowLeft, ArrowLeftRight, ClipboardList, Clock, Target, MessageCircle } from "lucide-react";
import { DayInLifeSimulator } from "@/components/teen-career/DayInLifeSimulator";
import { SkillGapAnalyzer } from "@/components/teen-career/SkillGapAnalyzer";
import { AskCareerMentor } from "@/components/teen-career/AskCareerMentor";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import { useHasShadowArenaAchievementsForCareer } from "@/hooks/useShadowArenaAchievements";
import { useTeenCareerCredits, TEEN_CAREER_CREDIT_COST } from "@/hooks/useTeenCareerCredits";
import { CreditBanner } from "@/components/kids/CreditBanner";
import { CareerHero } from "@/components/teen-career/CareerHero";
import { CareerWizardStepper } from "@/components/teen-career/CareerWizardStepper";
import { CareerQuiz, QuizAnswers } from "@/components/teen-career/CareerQuiz";
import { CareerSkillsDashboard } from "@/components/teen-career/CareerSkillsDashboard";
import { CareerResults } from "@/components/teen-career/CareerResults";
import { CareerComparison } from "@/components/teen-career/CareerComparison";
import { motion, AnimatePresence } from "framer-motion";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface ShadowArenaAchievement {
  id: string;
  placement: number;
  awarded_at: string;
}

export default function TeenCareerCounselor() {
  const [wizardStep, setWizardStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [interests, setInterests] = useState("");
  const [strengths, setStrengths] = useState("");
  const [goals, setGoals] = useState("");
  const [guidance, setGuidance] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("guidance");
  const [shadowArenaAchievements, setShadowArenaAchievements] = useState<ShadowArenaAchievement[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: shadowArenaData } = useHasShadowArenaAchievementsForCareer();
  const {
    balance,
    canUse,
    isLoading: creditsLoading,
    purchase,
    refresh: refreshCredits,
    costPerUse,
  } = useTeenCareerCredits();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      toast({ title: "Payment successful!", description: "Your career credits have been added." });
      refreshCredits();
      window.history.replaceState({}, "", window.location.pathname);
    }
    // Require sign-in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast({ title: "Authentication Required", description: "Please sign in to use Career Counselor", variant: "destructive" });
        navigate("/auth");
      }
    });
  }, []);

  const handleBuyCredits = async () => {
    const url = await purchase(25);
    if (url) { const __w = window.open(url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = url; }
  };

  const handleQuizComplete = (answers: QuizAnswers) => {
    setQuizAnswers(answers);
    // Pre-fill text fields from quiz
    setInterests(answers.interests.join(", "));
    setStrengths(answers.workStyle.join(", ") + ", " + answers.subjects.join(", "));
    setGoals(answers.values.join(", "));
    setWizardStep(1);
  };

  const getCareerGuidance = async () => {
    if (!interests || !strengths) {
      toast({ title: "Missing Information", description: "Please describe your interests and strengths", variant: "destructive" });
      return;
    }

    if (!canUse) {
      toast({ title: "Not enough credits", description: `You need ${costPerUse} credits per session. Buy more to continue.`, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('teen-career-counselor', {
        body: { interests, strengths, goals }
      });

      if (error) {
        if (error.message?.toLowerCase().includes('insufficient credits')) {
          toast({ title: "Not enough credits", description: "Please purchase more career credits to continue.", variant: "destructive" });
          refreshCredits();
          return;
        }
        throw error;
      }

      setGuidance(data.guidance);
      if (data.shadowArenaAchievements) setShadowArenaAchievements(data.shadowArenaAchievements);
      refreshCredits();
      setWizardStep(3);

      if (data.hasShadowArenaBadge) {
        toast({ title: "🏆 Achievement Recognized!", description: "Your Shadow Arena Talent Badge has been included in your career analysis!" });
      }
      toast({ title: "Career Guidance Ready!", description: "Check out your personalized career path recommendations" });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to generate career guidance. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    if (!guidance) return;
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Career Counseling Report", pageWidth / 2, 25, { align: 'center' });
      
      yPos = 50;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(`Generated on: ${date}`, margin, yPos);
      yPos += 15;

      // Profile section
      doc.setFillColor(240, 240, 240);
      doc.rect(margin - 5, yPos - 5, pageWidth - 2 * margin + 10, 8, 'F');
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(99, 102, 241);
      doc.text("Your Profile", margin, yPos);
      yPos += 12;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Interests:", margin, yPos);
      yPos += 5;
      doc.setFont("helvetica", "normal");
      const interestsLines = doc.splitTextToSize(interests, pageWidth - 2 * margin);
      doc.text(interestsLines, margin + 5, yPos);
      yPos += interestsLines.length * 5 + 8;

      doc.setFont("helvetica", "bold");
      doc.text("Strengths:", margin, yPos);
      yPos += 5;
      doc.setFont("helvetica", "normal");
      const strengthsLines = doc.splitTextToSize(strengths, pageWidth - 2 * margin);
      doc.text(strengthsLines, margin + 5, yPos);
      yPos += strengthsLines.length * 5 + 8;

      if (goals) {
        doc.setFont("helvetica", "bold");
        doc.text("Goals:", margin, yPos);
        yPos += 5;
        doc.setFont("helvetica", "normal");
        const goalsLines = doc.splitTextToSize(goals, pageWidth - 2 * margin);
        doc.text(goalsLines, margin + 5, yPos);
        yPos += goalsLines.length * 5 + 8;
      }

      if (yPos > 250) { doc.addPage(); yPos = 20; }

      doc.setFillColor(240, 240, 240);
      doc.rect(margin - 5, yPos - 5, pageWidth - 2 * margin + 10, 8, 'F');
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(99, 102, 241);
      doc.text("Career Recommendations", margin, yPos);
      yPos += 12;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      const guidanceLines = doc.splitTextToSize(guidance, pageWidth - 2 * margin);
      guidanceLines.forEach((line: string) => {
        if (yPos > 280) { doc.addPage(); yPos = 20; }
        if (line.match(/^\d+\.|^[A-Z\s]+:/) || line.match(/^#{1,3}\s/)) {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(99, 102, 241);
          yPos += 3;
        } else {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
        }
        doc.text(line, margin, yPos);
        yPos += 5;
      });

      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount} | Teen Career Counselor`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

      doc.save(`Career_Guidance_${date.replace(/\s/g, '_')}.pdf`);
      toast({ title: "PDF Downloaded!", description: "Your career guidance report has been saved" });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({ title: "Export Failed", description: "Failed to generate PDF", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-16 pb-8 max-w-4xl">
        <CareerHero />

        <HeroRewardedAd sectionKey="page_teencareercounselor" />

        {/* Credit balance */}
        {!creditsLoading && (
          <div className="mb-6">
            <CreditBanner
              label="Career"
              creditsRemaining={balance}
              costPerUse={costPerUse}
              onBuyCredits={handleBuyCredits}
              unitName="session"
            />
          </div>
        )}

        {/* Main content tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 gap-1 h-auto mb-4">
            <TabsTrigger value="guidance" className="text-xs gap-1"><ClipboardList className="h-3 w-3" /> Guidance</TabsTrigger>
            <TabsTrigger value="dayinlife" className="text-xs gap-1"><Clock className="h-3 w-3" /> Day in Life</TabsTrigger>
            <TabsTrigger value="skillgap" className="text-xs gap-1"><Target className="h-3 w-3" /> Skill Gap</TabsTrigger>
            <TabsTrigger value="mentor" className="text-xs gap-1"><MessageCircle className="h-3 w-3" /> Mentor</TabsTrigger>
            <TabsTrigger value="compare" className="text-xs gap-1"><ArrowLeftRight className="h-3 w-3" /> Compare</TabsTrigger>
            <TabsTrigger value="howto" className="text-xs gap-1"><Lightbulb className="h-3 w-3" /> How</TabsTrigger>
          </TabsList>

          <TabsContent value="guidance">
            {/* Wizard Stepper */}
            <CareerWizardStepper currentStep={wizardStep} totalSteps={4} />

            <AnimatePresence mode="wait">
              {/* Step 0: Quiz */}
              {wizardStep === 0 && (
                <motion.div key="quiz" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <CareerQuiz onComplete={handleQuizComplete} />
                </motion.div>
              )}

              {/* Step 1: Profile (pre-filled from quiz, editable) */}
              {wizardStep === 1 && (
                <motion.div key="profile" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  {quizAnswers && (
                    <CareerSkillsDashboard
                      interests={quizAnswers.interests}
                      workStyle={quizAnswers.workStyle}
                      values={quizAnswers.values}
                      subjects={quizAnswers.subjects}
                    />
                  )}

                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Briefcase className="h-5 w-5 text-primary" />
                        Refine Your Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="interests" className="flex items-center gap-2 text-sm">
                          <Heart className="h-4 w-4" /> Interests & Hobbies
                        </Label>
                        <Textarea
                          id="interests"
                          placeholder="e.g., coding, music, helping people, science experiments..."
                          value={interests}
                          onChange={(e) => setInterests(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="strengths" className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4" /> Strengths & Skills
                        </Label>
                        <Textarea
                          id="strengths"
                          placeholder="e.g., problem-solving, creativity, leadership..."
                          value={strengths}
                          onChange={(e) => setStrengths(e.target.value)}
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setWizardStep(0)} className="gap-1">
                          <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                        <Button onClick={() => setWizardStep(2)} className="flex-1 gap-1">
                          Next <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Goals & Generate */}
              {wizardStep === 2 && (
                <motion.div key="goals" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        Your Career Goals (Optional)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="e.g., I want to make a positive impact, earn well, work with technology..."
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        rows={3}
                      />

                      <div className="bg-primary/5 rounded-xl p-4 space-y-2">
                        <h4 className="font-semibold text-sm">What You'll Receive:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• <strong>3-5 Career Paths</strong> with match percentages</li>
                          <li>• <strong>Salary & Demand</strong> insights for each career</li>
                          <li>• <strong>Education Roadmap</strong> — what to study and where</li>
                          <li>• <strong>Action Steps</strong> you can start today</li>
                          <li>• <strong>PDF Export</strong> of your complete report</li>
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setWizardStep(1)} className="gap-1">
                          <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                        <Button
                          onClick={getCareerGuidance}
                          disabled={loading || !canUse}
                          className="flex-1 gap-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          {loading
                            ? "Analyzing Your Profile..."
                            : !canUse
                              ? `Buy credits (need ${TEEN_CAREER_CREDIT_COST})`
                              : `Get AI Career Guidance (${TEEN_CAREER_CREDIT_COST} credits)`}
                        </Button>
                      </div>

                      {!canUse && (
                        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-center">
                          <p className="text-sm font-medium mb-2">Need more credits?</p>
                          <Button onClick={handleBuyCredits} className="gap-2">
                            <Sparkles className="h-4 w-4" /> Buy Career credits
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Results */}
              {wizardStep === 3 && guidance && (
                <motion.div key="results" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <CareerResults guidance={guidance} onExportPDF={exportToPDF} />

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => { setWizardStep(0); setGuidance(""); }} className="gap-1">
                      <ArrowLeft className="h-4 w-4" /> Start New Session
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="dayinlife">
            <DayInLifeSimulator onCredits={refreshCredits} />
          </TabsContent>

          <TabsContent value="skillgap">
            <SkillGapAnalyzer onCredits={refreshCredits} />
          </TabsContent>

          <TabsContent value="mentor">
            <AskCareerMentor onCredits={refreshCredits} context={interests ? `Interests: ${interests}. Strengths: ${strengths}.` : undefined} />
          </TabsContent>

          <TabsContent value="compare">
            <CareerComparison />
          </TabsContent>

          <TabsContent value="howto">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  How AI Career Counselor Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  AI Career Counselor is a personalized guidance tool designed specifically for teenagers aged 13-18.
                  Get professional-grade career advice tailored to your unique interests, strengths, and aspirations!
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { step: "1", title: "Take the Quick Quiz", desc: "Answer fun questions about your interests and preferences" },
                    { step: "2", title: "Review Your Profile", desc: "See your skills dashboard and refine your answers" },
                    { step: "3", title: "Set Your Goals", desc: "Share your dreams and what you want from your future" },
                    { step: "4", title: "Get AI Recommendations", desc: "Receive 3-5 personalized career paths with action steps" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Card className="border-border/50 bg-muted/30">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-2">💡 Career Exploration Tips</h4>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li>• Try job shadowing or internships to experience different careers</li>
                      <li>• Talk to professionals in fields that interest you</li>
                      <li>• Take online courses to explore new subjects</li>
                      <li>• Join clubs and activities related to your interests</li>
                      <li>• Remember: it's okay to change your mind as you learn more!</li>
                    </ul>
                  </CardContent>
                </Card>

                <p className="text-xs text-muted-foreground italic">
                  Each AI career guidance session costs {TEEN_CAREER_CREDIT_COST} credits. Buy a credit pack to start exploring your future.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
