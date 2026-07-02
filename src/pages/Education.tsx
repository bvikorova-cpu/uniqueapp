import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, Brain, Camera, Mic, FileText, Layers, Flame, Trophy, Award, Calculator, GraduationCap, Users, Sparkles } from "lucide-react";
import PhotoMathSolver from "@/components/education/PhotoMathSolver";
import VoiceTutor from "@/components/education/VoiceTutor";
import PdfQuizGenerator from "@/components/education/PdfQuizGenerator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import 'katex/dist/katex.min.css';
import QuizList from "@/components/education/QuizList";
import { TutoringCreditsPanel } from "@/components/education/TutoringCreditsPanel";
import { useTutoringCredits } from "@/hooks/useTutoringCredits";
import { toast as sonnerToast } from "sonner";
import { EducationHero } from "@/components/education/EducationHero";
import { DailyStreak } from "@/components/education/DailyStreak";
import { EducationLeaderboard } from "@/components/education/EducationLeaderboard";
import { QuickChallenge } from "@/components/education/QuickChallenge";
import { LearningPathProgress } from "@/components/education/LearningPathProgress";
import { EnhancedChat } from "@/components/education/EnhancedChat";
import { GlassmorphismCategories } from "@/components/education/GlassmorphismCategories";
import { useEducationStats } from "@/hooks/useEducationStats";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_EDUCATION_STEPS = [
  { title: 'Pick a subject', desc: 'Choose from 30+ categories or launch a quick quiz from the hub.' },
  { title: 'Learn your way', desc: 'Use Photo Math Solver, Voice Tutor, PDF Quiz Generator or AI chat.' },
  { title: 'Practice with quizzes', desc: 'Take daily challenges and category quizzes to earn XP and streaks.' },
  { title: 'Track progress', desc: 'Watch your learning path, achievements and leaderboard ranking grow.' },
  { title: 'Spend credits wisely', desc: 'AI tools use 3–5 credits; free credits refill monthly.' }
];
const __HIW_EDUCATION = { title: 'Education Hub', intro: 'Learn any subject with AI tutors, quizzes and gamified progress.', steps: __HIW_EDUCATION_STEPS };

const quizCategories = [
  { id: "math", name: "Mathematics", icon: "📐" },
  { id: "biology", name: "Biology", icon: "🧬" },
  { id: "physics", name: "Physics", icon: "⚛️" },
  { id: "chemistry", name: "Chemistry", icon: "🧪" },
  { id: "geography", name: "Geography", icon: "🌍" },
  { id: "history", name: "History", icon: "📜" },
  { id: "literature", name: "Literature", icon: "📚" },
  { id: "english", name: "English", icon: "🇬🇧" },
  { id: "computer", name: "Computer Science", icon: "💻" },
  { id: "art", name: "Art", icon: "🎨" },
  { id: "celebrity", name: "Celebrities", icon: "⭐" },
  { id: "sport", name: "Sports", icon: "⚽" },
  { id: "movies", name: "Film & TV", icon: "🎬" },
  { id: "music", name: "Music", icon: "🎵" },
  { id: "food", name: "Food & Cooking", icon: "🍳" },
  { id: "travel", name: "Travel", icon: "✈️" },
  { id: "fashion", name: "Fashion", icon: "👗" },
  { id: "nature", name: "Nature", icon: "🌿" },
  { id: "cars", name: "Cars", icon: "🚗" },
  { id: "gaming", name: "Gaming", icon: "🎮" },
  { id: "business", name: "Business", icon: "💼" },
  { id: "psychology", name: "Psychology", icon: "🧠" },
  { id: "health", name: "Health & Fitness", icon: "💪" },
  { id: "technology", name: "Technology", icon: "📱" },
  { id: "science", name: "Science", icon: "🔬" },
  { id: "politics", name: "Politics", icon: "🏛️" },
  { id: "economics", name: "Economics", icon: "💰" },
  { id: "astronomy", name: "Astronomy", icon: "🌟" },
  { id: "animals", name: "Animals", icon: "🦁" },
  { id: "architecture", name: "Architecture", icon: "🏗️" },
  { id: "languages", name: "World Languages", icon: "🗣️" },
  { id: "mythology", name: "Mythology", icon: "⚡" },
  { id: "religion", name: "Religions", icon: "🕉️" },
  { id: "philosophy", name: "Philosophy", icon: "🤔" },
  { id: "law", name: "Law", icon: "⚖️" },
  { id: "medicine", name: "Medicine", icon: "⚕️" },
  { id: "environment", name: "Environment", icon: "♻️" },
  { id: "beauty", name: "Beauty & Care", icon: "💄" },
  { id: "photography", name: "Photography", icon: "📷" },
  { id: "dance", name: "Dance", icon: "💃" },
  { id: "cooking", name: "Culinary Arts", icon: "👨‍🍳" },
  { id: "wine", name: "Wine & Gastronomy", icon: "🍷" },
  { id: "coffee", name: "Coffee", icon: "☕" },
  { id: "pets", name: "Pets", icon: "🐕" },
  { id: "gardening", name: "Gardening", icon: "🌱" },
  { id: "diy", name: "DIY & Crafts", icon: "🔨" },
  { id: "magic", name: "Magic & Illusions", icon: "🎩" },
  { id: "comics", name: "Comics", icon: "💥" },
  { id: "anime", name: "Anime & Manga", icon: "🎌" },
  { id: "socialMedia", name: "Social Media", icon: "📲" },
  { id: "brands", name: "Brands & Logos", icon: "™️" },
  { id: "flags", name: "Flags & Countries", icon: "🏁" },
];

const Education = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { credits, isLoading: creditsLoading, spendCredit, activatePurchase, refundCredit, isUsingCredit } = useTutoringCredits();
  const { data: eduStats } = useEducationStats();

  useEffect(() => {
    const purchase = searchParams.get("purchase");
    const sessionId = searchParams.get("session_id");
    if (purchase === "success" && sessionId) {
      // Server verifies the Stripe session and credits the authoritative amount.
      activatePurchase(sessionId).finally(() => {
        navigate("/education", { replace: true });
      });
    } else if (purchase === "canceled") {
      sonnerToast.error("Purchase was canceled");
      navigate("/education", { replace: true });
    }
  }, [searchParams, activatePurchase, navigate]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    if (credits < 1) {
      toast({ title: "Insufficient Credits", description: "Please purchase credits to continue.", variant: "destructive" });
      return;
    }
    const userMessage = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    let creditDeducted = false;
    try {
      await spendCredit();
      creditDeducted = true;
      const { data, error } = await supabase.functions.invoke("tutoring-chat", { body: { message: userMessage, history: chatHistory } });
      if (error) throw error;
      setChatHistory(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      // Refund the credit if the AI call failed after deduction
      if (creditDeducted) {
        try { await refundCredit("ai_call_failed"); } catch (e) { console.error("refund failed", e); }
      }
      // Roll back the optimistic user message so they can retry without losing context
      setChatHistory(prev => prev.slice(0, -1));
      setChatMessage(userMessage);
      toast({
        title: "Message failed",
        description: creditDeducted ? "Your credit was refunded. Try again." : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = (categoryId: string, difficulty?: string) => {
    const params = new URLSearchParams({ category: categoryId });
    if (difficulty) params.set("difficulty", difficulty);
    navigate(`/quiz?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <FloatingHowItWorks title={__HIW_EDUCATION.title} intro={__HIW_EDUCATION.intro} steps={__HIW_EDUCATION.steps} />
      <div className="container mx-auto px-2 sm:px-4">
        <EducationHero />


        <HeroRewardedAd sectionKey="page_education" />

        {/* Stats row: Streak + Quick Challenge + Learning Path */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <DailyStreak
            currentStreak={eduStats?.currentStreak ?? 0}
            bestStreak={eduStats?.bestStreak ?? 0}
            todayCompleted={eduStats?.todayCompleted ?? false}
          />
          <QuickChallenge />
          <LearningPathProgress currentXP={eduStats?.currentXP ?? 0} />
        </div>

        {/* Premium AI Learning Tools */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-black">Premium AI Learning Tools</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { to: "/education/daily", icon: Flame, title: "Daily Challenge", desc: "5 questions · 50 XP" },
              { to: "/education/flashcards", icon: Layers, title: "Flashcards", desc: "AI + spaced repetition" },
              { to: "/education/skill-tree", icon: GraduationCap, title: "Skill Tree", desc: "Unlock topics" },
              { to: "/education/league", icon: Trophy, title: "Weekly League", desc: "Bronze → Diamond" },
              { to: "/education/achievements", icon: Award, title: "Achievements", desc: "Unlock badges" },
              { to: "/education/math-solver", icon: Calculator, title: "Math Solver", desc: "Photo → steps" },
              { to: "/education/tutor", icon: Brain, title: "AI Tutor", desc: "Personal chat tutor" },
              { to: "/education/notes", icon: FileText, title: "Notes", desc: "Markdown + AI" },
              { to: "/education/study-groups", icon: Users, title: "Study Groups", desc: "Learn together" },
              { to: "/education/certificates", icon: Sparkles, title: "Certificates", desc: "Earn after passing" },
            ].map((f) => (
              <Link key={f.to} to={f.to}>
                <div className="h-full p-4 rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl hover:border-primary/40 hover:shadow-lg transition-all group cursor-pointer">
                  <f.icon className="w-6 h-6 mb-2 text-primary group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="tutoring" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6 bg-card/80 backdrop-blur-sm border">
                <TabsTrigger value="tutoring" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Brain className="h-4 w-4" /> <span className="hidden sm:inline">Tutoring</span>
                </TabsTrigger>
                <TabsTrigger value="voice" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Mic className="h-4 w-4" /> <span className="hidden sm:inline">Voice</span>
                </TabsTrigger>
                <TabsTrigger value="photo" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Camera className="h-4 w-4" /> <span className="hidden sm:inline">Photo Math</span>
                </TabsTrigger>
                <TabsTrigger value="pdf" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="h-4 w-4" /> <span className="hidden sm:inline">PDF Quiz</span>
                </TabsTrigger>
                <TabsTrigger value="quiz" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <BookOpen className="h-4 w-4" /> <span className="hidden sm:inline">Quizzes</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="voice"><VoiceTutor /></TabsContent>
              <TabsContent value="photo"><PhotoMathSolver /></TabsContent>
              <TabsContent value="pdf"><PdfQuizGenerator /></TabsContent>

              <TabsContent value="tutoring">
                <div className="space-y-4">
                  <TutoringCreditsPanel />
                  <EnhancedChat
                    chatHistory={chatHistory}
                    chatMessage={chatMessage}
                    setChatMessage={setChatMessage}
                    handleSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    credits={credits}
                    creditsLoading={creditsLoading}
                    isUsingCredit={isUsingCredit}
                  />
                </div>
              </TabsContent>

              <TabsContent value="quiz">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {[
                      { icon: "🎯", title: "50+ Categories" },
                      { icon: "🤖", title: "AI Feedback" },
                      { icon: "✏️", title: "Custom Quizzes" },
                      { icon: "📊", title: "Track Progress" },
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/50">
                        <span className="text-lg">{f.icon}</span>
                        <p className="text-xs font-semibold">{f.title}</p>
                      </div>
                    ))}
                  </div>

                  <QuizList />
                  <GlassmorphismCategories categories={quizCategories} onStartQuiz={handleStartQuiz} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <EducationLeaderboard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;
