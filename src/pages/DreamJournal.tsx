import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, BookOpen, TrendingUp, Sparkles, Brain, GitBranch, Users, Coins, CreditCard, Flame, Trophy, BarChart3, Palette, Volume2, Map, Swords } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAICredits } from "@/hooks/useAICredits";
import Navbar from "@/components/Navbar";
import DreamEntryForm from "@/components/dream-journal/DreamEntryForm";
import DreamList from "@/components/dream-journal/DreamList";
import JournalEntryForm from "@/components/dream-journal/JournalEntryForm";
import JournalList from "@/components/dream-journal/JournalList";
import MoodTracker from "@/components/dream-journal/MoodTracker";
import TrendsAnalysis from "@/components/dream-journal/TrendsAnalysis";
import AILucidDreamCoach from "@/components/dream-journal/AILucidDreamCoach";
import DreamPatternTimeline from "@/components/dream-journal/DreamPatternTimeline";
import SleepQualityAnalyzer from "@/components/dream-journal/SleepQualityAnalyzer";
import DreamSharingCommunity from "@/components/dream-journal/DreamSharingCommunity";
import AIDreamVisualizer from "@/components/dream-journal/AIDreamVisualizer";
import DreamSoundscapes from "@/components/dream-journal/DreamSoundscapes";
import DreamDictionary from "@/components/dream-journal/DreamDictionary";
import SleepRitualBuilder from "@/components/dream-journal/SleepRitualBuilder";
import DreamInterpretationBattles from "@/components/dream-journal/DreamInterpretationBattles";
import DreamMoodCorrelation from "@/components/dream-journal/DreamMoodCorrelation";
import { motion } from "framer-motion";
import heroVideo from "@/assets/dream-journal-hero-v2.mp4.asset.json";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type ActiveView = "hub" | "dreams" | "journal" | "mood" | "trends" | "lucid-coach" | "pattern-timeline" | "sleep-analyzer" | "community" | "visualizer" | "soundscapes" | "dictionary" | "ritual-builder" | "interpretation-battles" | "mood-correlation";

const DreamJournal = () => {
  const [activeView, setActiveView] = useState<ActiveView>("hub");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const { credits } = useAICredits();

  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  const tools = [
    { id: "dreams" as const, title: "Dream Analysis", desc: "Record & analyze dreams with AI", icon: Moon, cost: "1 Credit", color: "from-violet-500 to-purple-600" },
    { id: "journal" as const, title: "Daily Journal", desc: "Express thoughts & get AI insights", icon: BookOpen, cost: "1 Credit", color: "from-blue-500 to-indigo-600" },
    { id: "mood" as const, title: "Mood Tracker", desc: "Track mood, energy & stress", icon: Sparkles, cost: "Free", color: "from-emerald-500 to-teal-600" },
    { id: "trends" as const, title: "Mental Health Trends", desc: "30-day pattern analysis", icon: TrendingUp, cost: "1 Credit", color: "from-amber-500 to-orange-600" },
    { id: "lucid-coach" as const, title: "AI Lucid Dream Coach", desc: "Personalized lucid dreaming guidance", icon: Brain, cost: "1 Credit", color: "from-pink-500 to-rose-600" },
    { id: "pattern-timeline" as const, title: "Dream Pattern Timeline", desc: "Discover recurring dream themes", icon: GitBranch, cost: "1 Credit", color: "from-cyan-500 to-blue-600" },
    { id: "sleep-analyzer" as const, title: "Sleep Quality Analyzer", desc: "AI sleep analysis & recommendations", icon: Moon, cost: "1 Credit", color: "from-indigo-500 to-violet-600" },
    { id: "community" as const, title: "Dream Community", desc: "Share & discuss dreams", icon: Users, cost: "Free", color: "from-fuchsia-500 to-pink-600" },
    { id: "visualizer" as const, title: "AI Dream Visualizer", desc: "Turn dreams into stunning artwork", icon: Palette, cost: "3 Credits", color: "from-rose-500 to-red-600" },
    { id: "soundscapes" as const, title: "Dream Soundscapes", desc: "AI ambient audio for dream recreation", icon: Volume2, cost: "2 Credits", color: "from-teal-500 to-emerald-600" },
    { id: "dictionary" as const, title: "AI Dream Dictionary", desc: "Personalized symbol interpretations", icon: BookOpen, cost: "1 Credit", color: "from-orange-500 to-amber-600" },
    { id: "ritual-builder" as const, title: "Sleep Ritual Builder", desc: "Custom bedtime routines by AI", icon: Moon, cost: "1 Credit", color: "from-purple-500 to-indigo-600" },
    { id: "interpretation-battles" as const, title: "Interpretation Battles", desc: "Community dream interpretation contests", icon: Swords, cost: "Free", color: "from-red-500 to-pink-600" },
    { id: "mood-correlation" as const, title: "Dream-Mood Correlation", desc: "AI maps dream-emotion connections", icon: Map, cost: "1 Credit", color: "from-sky-500 to-cyan-600" },
  ];

  const stats = [
    { label: "Dreams", value: "—", icon: Moon },
    { label: "Entries", value: "—", icon: BookOpen },
    { label: "Moods", value: "—", icon: Sparkles },
    { label: "Insights", value: "—", icon: Brain },
  ];

  // Sub-view wrapper
  const SubView = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-3 sm:px-4 pt-24 pb-12 max-w-5xl space-y-6">
        {children}
      </main>
    </div>
  );

  if (activeView === "dreams") return (
    
    <>
      <FloatingHowItWorks title="Dream Analyzer" steps={[{ title: "Log your dream", desc: "Write it down as soon as you wake up." }, { title: "Analyze with AI", desc: "Symbols, emotions, and archetypes are decoded." }, { title: "Track patterns", desc: "See recurring themes over weeks and months." }, { title: "Reflect", desc: "Use prompts to connect dreams to waking life." }]} />
      <SubView>
      <Button variant="ghost" onClick={() => setActiveView("hub")} className="gap-2">← Back to Dashboard</Button>
      <Card className="p-4 sm:p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <h2 className="text-xl font-bold mb-4">Dream Analysis</h2>
        <DreamEntryForm onSuccess={handleRefresh} />
      </Card>
      <DreamList key={refreshTrigger} />
    </SubView>
    </>
  );

  if (activeView === "journal") return (
    <SubView>
      <Button variant="ghost" onClick={() => setActiveView("hub")} className="gap-2">← Back to Dashboard</Button>
      <Card className="p-4 sm:p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <h2 className="text-xl font-bold mb-4">Daily Journal</h2>
        <JournalEntryForm onSuccess={handleRefresh} />
      </Card>
      <JournalList key={refreshTrigger} />
    </SubView>
  );

  if (activeView === "mood") return (
    <SubView>
      <Button variant="ghost" onClick={() => setActiveView("hub")} className="gap-2">← Back to Dashboard</Button>
      <Card className="p-4 sm:p-6 bg-card/80 backdrop-blur-xl border-primary/20">
        <h2 className="text-xl font-bold mb-4">Mood Tracker</h2>
        <MoodTracker onSuccess={handleRefresh} />
      </Card>
    </SubView>
  );

  if (activeView === "trends") return (
    <SubView>
      <Button variant="ghost" onClick={() => setActiveView("hub")} className="gap-2">← Back to Dashboard</Button>
      <TrendsAnalysis />
    </SubView>
  );

  if (activeView === "lucid-coach") return (
    <SubView><AILucidDreamCoach onBack={() => setActiveView("hub")} /></SubView>
  );
  if (activeView === "pattern-timeline") return (
    <SubView><DreamPatternTimeline onBack={() => setActiveView("hub")} /></SubView>
  );
  if (activeView === "sleep-analyzer") return (
    <SubView><SleepQualityAnalyzer onBack={() => setActiveView("hub")} /></SubView>
  );
  if (activeView === "community") return (
    <SubView><DreamSharingCommunity onBack={() => setActiveView("hub")} /></SubView>
  );
  if (activeView === "visualizer") return (
    <SubView><AIDreamVisualizer onBack={() => setActiveView("hub")} /></SubView>
  );
  if (activeView === "soundscapes") return (
    <SubView><DreamSoundscapes onBack={() => setActiveView("hub")} /></SubView>
  );
  if (activeView === "dictionary") return (
    <SubView><DreamDictionary onBack={() => setActiveView("hub")} /></SubView>
  );
  if (activeView === "ritual-builder") return (
    <SubView><SleepRitualBuilder onBack={() => setActiveView("hub")} /></SubView>
  );
  if (activeView === "interpretation-battles") return (
    <SubView><DreamInterpretationBattles onBack={() => setActiveView("hub")} /></SubView>
  );
  if (activeView === "mood-correlation") return (
    <SubView><DreamMoodCorrelation onBack={() => setActiveView("hub")} /></SubView>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Cinematic Video Hero */}
      <section className="relative w-full min-h-[62vh] flex items-end overflow-hidden bg-black">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          src={heroVideo.url}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />

        <div className="relative z-10 w-full container mx-auto px-3 sm:px-4 pb-8 pt-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs text-primary mb-4 drop-shadow-md">
              <Moon className="w-3 h-3" />
              <span className="font-semibold">AI-Powered Dream Lab</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}
            className="mb-4 inline-flex max-w-fit rounded-2xl border border-border/50 bg-background/80 px-4 py-3 shadow-glow backdrop-blur-xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
              Dream Analyzer
            </h1>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-sm sm:text-base text-muted-foreground max-w-xl mb-6 drop-shadow-md">
            Unlock your subconscious with AI-powered dream analysis, lucid coaching, visualization, and sleep optimization
          </motion.p>

          {/* Stats Row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-2xl">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl bg-card/60 backdrop-blur-md border border-border/30 px-3 py-2">
                <stat.icon className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-lg font-bold leading-none">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-3 sm:px-4 py-8 max-w-7xl space-y-8">
        {/* Credits & Engagement Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 h-full">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10"><Flame className="h-5 w-5 text-orange-500" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Daily Streak</p>
                  <p className="text-2xl font-bold">0 Days</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 h-full">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Coins className="h-5 w-5 text-primary" /></div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Credits</p>
                  <p className="text-2xl font-bold">{credits?.credits_remaining || 0}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/ai-credits-store")} className="text-xs">
                  <CreditCard className="h-3 w-3 mr-1" /> Buy
                </Button>
              </div>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 h-full">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Trophy className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Dream Explorer</p>
                  <p className="text-2xl font-bold">Level 1</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tool Grid */}
        <div>
          <h2 className="text-xl font-bold mb-4">Dream Tools & AI Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((tool, i) => (
              <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Card
                  className="p-4 cursor-pointer bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-all h-full group"
                  onClick={() => setActiveView(tool.id)}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{tool.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{tool.desc}</p>
                  <span className="text-[10px] font-medium text-primary">{tool.cost}</span>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Enhancement Tips */}
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Tips for Better Dream Insights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex gap-2"><span className="text-primary font-bold">1.</span> Record dreams within 5 minutes of waking for best recall</div>
            <div className="flex gap-2"><span className="text-primary font-bold">2.</span> Track mood daily to discover emotional-dream connections</div>
            <div className="flex gap-2"><span className="text-primary font-bold">3.</span> Use the Pattern Timeline after 5+ entries for deep insights</div>
            <div className="flex gap-2"><span className="text-primary font-bold">4.</span> Practice reality checks from the Lucid Coach throughout the day</div>
            <div className="flex gap-2"><span className="text-primary font-bold">5.</span> Generate Dream Visualizations to reinforce dream memory</div>
            <div className="flex gap-2"><span className="text-primary font-bold">6.</span> Build a Sleep Ritual to improve dream vividness consistently</div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default DreamJournal;
