import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Palette, Paintbrush, Crown, ArrowLeft } from "lucide-react";
import { VirtualMakeup } from "@/components/beauty/VirtualMakeup";
import { HairStyleGenerator } from "@/components/beauty/HairStyleGenerator";
import { NailArtDesigner } from "@/components/beauty/NailArtDesigner";
import { CelebrityLookMatch } from "@/components/beauty/CelebrityLookMatch";

import { motion } from "framer-motion";
import heroVideo from "@/assets/beauty-studio-hero.mp4.asset.json";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const BEAUTY_HOW_IT_WORKS = [
  { title: "Pick a tool", desc: "Choose from AI Virtual Makeup, Hair Styler, Nail Art Designer or Celebrity Match." },
  { title: "Upload your photo", desc: "Most tools ask for a clear selfie or reference photo. Your images stay private to your account." },
  { title: "Spend credits", desc: "Each tool costs 3–5 credits (shown on the tile). You get 10 free credits monthly; buy more anytime in the Credits Store." },
  { title: "Save & download", desc: "Download your generated looks to your phone or computer at any time." },
];

type ActiveView = "hub" | "makeup" | "hair" | "nail-art" | "celebrity-match";

const BeautyStudio = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>("hub");

  const tools = [
    { id: "makeup" as ActiveView, icon: Sparkles, title: "Virtual Makeup", desc: "AI makeup try-on", cost: "3 Credits", color: "text-pink-500" },
    { id: "hair" as ActiveView, icon: Palette, title: "Hair Styler", desc: "Try new hairstyles", cost: "3 Credits", color: "text-purple-500" },
    { id: "nail-art" as ActiveView, icon: Paintbrush, title: "Nail Art Designer", desc: "Custom nail designs", cost: "5 Credits", color: "text-rose-500" },
    { id: "celebrity-match" as ActiveView, icon: Crown, title: "Celebrity Match", desc: "Find your twin", cost: "4 Credits", color: "text-yellow-500" },
  ];

  if (activeView === "makeup") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><VirtualMakeup /><Button variant="ghost" onClick={() => setActiveView("hub")} className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button></div></div>;
  if (activeView === "hair") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><HairStyleGenerator /><Button variant="ghost" onClick={() => setActiveView("hub")} className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button></div></div>;
  if (activeView === "nail-art") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><NailArtDesigner onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "celebrity-match") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><CelebrityLookMatch onBack={() => setActiveView("hub")} /></div></div>;

  return (
    <>
      <FloatingHowItWorks title="How Beauty Studio works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen bg-background">
      <Navbar />

      {/* Cinematic Video Hero */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden bg-black">
        <video
          src={heroVideo.url}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[1.3] saturate-[1.2]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute top-20 right-3 sm:right-6 z-10">
          <HowItWorksButton
            title="Beauty Studio"
            intro="AI-powered beauty hub with makeup, skincare, hair, nails and celebrity matching."
            steps={BEAUTY_HOW_IT_WORKS}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: "spring" }}>
            <p className="text-xs sm:text-sm text-pink-400 font-semibold tracking-wider uppercase drop-shadow-md">
              ✨ AI-Powered Beauty Hub
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mt-1 drop-shadow-lg"
              style={{ 
                textShadow: "0 0 80px rgba(236,72,153,0.6), 0 4px 30px rgba(0,0,0,0.9), 0 0 120px rgba(236,72,153,0.3)",
                WebkitTextStroke: "2px rgba(236,72,153,0.6)"
              }}>
              <span className="bg-gradient-to-r from-pink-300 via-purple-400 to-rose-500 bg-clip-text text-transparent">
                Beauty Studio
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-white/80 mt-2 max-w-xl drop-shadow-md">
              AI makeup, skincare analysis, nail art & celebrity look matching
            </p>
          </motion.div>

        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        {/* Tools Grid */}
        <h2 className="text-2xl sm:text-3xl font-black mb-4"
          style={{ 
            textShadow: "0 0 40px rgba(236,72,153,0.4), 0 2px 15px rgba(0,0,0,0.6)",
            WebkitTextStroke: "1.5px rgba(236,72,153,0.5)"
          }}>
          <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-rose-500 bg-clip-text text-transparent">
            Beauty Tools
          </span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {tools.map((tool, i) => (
            <motion.div key={tool.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.05, type: "spring" }}
              whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}>
              <Card
                className="p-4 sm:p-5 cursor-pointer bg-card/80 backdrop-blur-xl hover:border-pink-500/40 transition-all h-full"
                onClick={() => setActiveView(tool.id)}
              >
                <tool.icon className={`h-7 w-7 sm:h-8 sm:w-8 ${tool.color} mb-2`} />
                <h3 className="font-bold text-sm sm:text-base">{tool.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{tool.desc}</p>
                <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-2 inline-block">
                  {tool.cost}
                </span>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    </>
    );
};

export default BeautyStudio;
