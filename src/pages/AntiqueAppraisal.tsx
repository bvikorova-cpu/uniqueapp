import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Search, Shield, BookOpen, TrendingUp, Wrench, Upload, 
  ArrowLeft, Flame, Trophy, Crown, Eye, Map, BarChart3, Package,
  ExternalLink, Coins, History as HistoryIcon, Layers, Users, Bell,
  Award, Camera, MessageSquare
} from "lucide-react";
import { useAntiqueCredits } from "@/hooks/useAntiqueCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import heroVideo from "@/assets/antique-hero.mp4.asset.json";
import { AntiqueAnalyze } from "@/components/antiques/AntiqueAnalyze";
import { AntiqueCreditsShop } from "@/components/antiques/AntiqueCreditsShop";
import { loadGoogleFont } from "@/utils/lazyFonts";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type ActiveView = "hub" | "analyze" | "credits";

const AntiqueAppraisal = () => {
  const [activeView, setActiveView] = useState<ActiveView>("hub");
  const { credits } = useAntiqueCredits();

  useEffect(() => { loadGoogleFont("gothic"); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const sessionId = params.get('session_id');
    if (paymentStatus === 'success' && sessionId) {
      (async () => {
        try {
          const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: { session_id: sessionId, product_type: 'antique_credits' } });
          if (error) throw error;
          if (data?.paid) {
            toast.success("Payment successful! Your credits have been added.");
          } else {
            toast.error("Payment verification pending. Please refresh in a moment.");
          }
        } catch (e: any) {
          toast.error("Could not verify payment: " + (e?.message ?? "unknown error"));
        } finally {
          window.history.replaceState({}, '', '/antique-appraisal');
        }
      })();
    } else if (paymentStatus === 'canceled') {
      toast.error("Payment was canceled.");
      window.history.replaceState({}, '', '/antique-appraisal');
    }
  }, []);


  const tools = [
    { id: "analyze" as ActiveView, icon: Search, title: "Antique Identification", desc: "Item, period & style", cost: "3 Credits", color: "text-primary" },
  ];



  const viewLabels: Record<string, string> = { analyze: "Antique Identification", credits: "Buy Credits" };

  if (activeView !== "hub") {
    return (
      <>
        <FloatingHowItWorks title="How Antique Appraisal works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
        <div className="antique-skin min-h-screen">
        <Navbar />
        <div className="container mx-auto px-3 sm:px-4 pt-20 pb-8 max-w-6xl">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setActiveView("hub")} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Badge variant="outline" className="text-xs antique-display border-primary/40">{viewLabels[activeView]}</Badge>
            </div>
            {activeView === "analyze" && <AntiqueAnalyze />}
            {activeView === "credits" && <AntiqueCreditsShop />}
          </motion.div>
        </div>
      </div>
      </>
      );
  }

  return (
    <div className="antique-skin min-h-screen">
      <Navbar />

      {/* Cinematic Video Hero */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden bg-black">
        <video
          src={heroVideo.url}
          autoPlay muted loop playsInline
          className="antique-sepia absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: "spring" }}>
            <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-amber-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              ⚜ Cabinet of Curiosities — Est. MCMXXVII
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mt-1 tracking-widest">
              <span className="bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
                Antique Appraisal
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-white mt-2 max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Connoisseur-grade identification, valuation & provenance — appraised by AI, presented as in an old auction catalogue
            </p>
          </motion.div>

        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 max-w-6xl">
        {/* Engagement Row — single Credits balance card (other stats live in hero overlay) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="flex justify-center mb-8">
          <Card className="antique-frame p-5 rounded-md text-center min-w-[220px]">
            <Flame className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-3xl font-bold antique-display">{credits?.credits_remaining || 0}</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Credits Available</p>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="flex justify-center gap-3 flex-wrap mb-8">
          <Button variant="outline" className="gap-2 antique-display uppercase tracking-widest text-xs bg-card/70 border-primary/40 hover:bg-primary/10"
            onClick={() => setActiveView("credits")}>
            <Coins className="w-4 h-4 text-primary" /> Buy Credits
          </Button>
        </motion.div>

        {/* Tools Grid */}
        <div className="antique-rule mb-5">
          <span className="text-xs sm:text-sm uppercase tracking-[0.3em] antique-display">Appraisal Cabinet</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center antique-gold-text">
          Antique Identification
        </h2>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 max-w-sm w-full">
            {tools.map((tool, i) => (
              <motion.div key={`${tool.id}-${i}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.05, type: "spring" }}
                whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}>
                <Card
                  className="antique-frame rounded-md p-4 sm:p-5 cursor-pointer transition-all h-full text-center"
                  onClick={() => setActiveView(tool.id)}
                >
                  <tool.icon className={`h-7 w-7 sm:h-8 sm:w-8 ${tool.color} mb-2 mx-auto`} />
                  <h3 className="font-bold text-sm sm:text-base antique-display">{tool.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{tool.desc}</p>
                  <span className="antique-seal text-[10px] sm:text-xs px-2.5 py-1 rounded-full mt-3 inline-block tracking-wider">
                    {tool.cost}
                  </span>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AntiqueAppraisal;
