import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowLeft, Zap, Gem, Crown, Shirt
} from "lucide-react";
import FashionGenerator from "@/components/fashion/FashionGenerator";
import { useAICredits } from "@/hooks/useAICredits";
import heroVideo from "@/assets/fashion-runway-hero.mp4.asset.json";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type ActiveView = "hub" | "generator";

export default function FashionStudio() {
  const navigate = useNavigate();
  const { credits, loading: creditsLoading } = useAICredits();
  const [activeView, setActiveView] = useState<ActiveView>("hub");

  const tools = [
    { id: "generator", title: "AI Dressing Generator", desc: "Create unique clothing designs with AI", cost: "5 Credits", icon: Sparkles, gradient: "from-fuchsia-500 to-pink-600" },
  ];

  const renderView = () => {
    switch (activeView) {
      case "generator": return <FashionGenerator />;
      default: return null;
    }
  };

  if (activeView !== "hub") {
    const currentTool = tools.find(t => t.id === activeView);
    return (
      <div className="min-h-screen bg-background pt-16 sm:pt-0">
        <FloatingHowItWorks
          title="Fashion Studio"
          intro="Try on outfits, mix styles and get AI stylist advice."
          steps={[
            { title: "Upload your photo", desc: "Full-body preferred." },
            { title: "Try on outfits", desc: "AI dresses you in clothes from the catalog." },
            { title: "Get a stylist review", desc: "AI suggests better matches." },
            { title: "Shop the look", desc: "Direct links to retailers." },
            { title: "Save looks", desc: "Build a lookbook for outfits you love." }
          ]}
        />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <Button variant="ghost" onClick={() => setActiveView("hub")} className="mb-4 gap-2 drop-shadow-md">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Button>
          <h2 className="text-2xl sm:text-3xl font-black mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            {currentTool?.title}
          </h2>
          {renderView()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cinematic Video Hero */}
      <div className="relative overflow-hidden h-[360px] sm:h-[440px] pt-16 sm:pt-0">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[1.3] saturate-[1.3]"
          src={heroVideo.url}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-black/20" />

        <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/30 mb-3">
              <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-white">AI Fashion Design Studio</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black mb-2"
              style={ {
                background: "linear-gradient(135deg, #fff, #f0abfc, #e879f9, #d946ef)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                WebkitTextStroke: "1.5px rgba(0,0,0,0.3)",
                textShadow: "0 0 40px rgba(217,70,239,0.5), 0 0 80px rgba(217,70,239,0.3)" }}
            >
              Fashion Studio
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-xl mb-4">
              Design, compete & shop — powered by AI fashion intelligence
            </p>

             {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-2xl">
              {[
                { label: "AI Credits", value: creditsLoading ? "..." : credits?.credits_remaining || 0, icon: Zap },
                { label: "Tools", value: "1", icon: Shirt },
                { label: "Buy Credits", value: "Get More", icon: Gem, action: () => navigate('/ai-credits-store') },
              ].map((stat) => (
                <div
                  key={stat.label}
                  onClick={stat.action}
                  className={`bg-black/30 backdrop-blur-xl rounded-lg p-2 sm:p-3 border border-white/10 ${stat.action ? 'cursor-pointer hover:bg-black/40' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    <span className="text-xs text-white/60 truncate">{stat.label}</span>
                  </div>
                  <p className="text-lg sm:text-xl font-black text-white">{stat.value ?? "—"}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tool Cards Grid */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h2 className="text-xl sm:text-2xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Fashion Studio Arsenal
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Card
                className="group cursor-pointer p-3 sm:p-4 bg-card/80 backdrop-blur-xl border-white/10 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_25px_rgba(217,70,239,0.2)] h-full relative overflow-hidden"
                onClick={() => setActiveView(tool.id as ActiveView)}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-2 group-hover:scale-110 group-hover:shadow-lg transition-all`}>
                  <tool.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm mb-0.5 line-clamp-1">{tool.title}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-1.5">{tool.desc}</p>
                <span className="text-[9px] sm:text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                  {tool.cost}
                </span>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-3 sm:px-4 pb-8">
        <div className="p-5 sm:p-8 rounded-2xl bg-gradient-to-br from-pink-950/60 to-purple-950/60 border border-primary/30">
          <h2 className="text-xl sm:text-2xl font-black text-white mb-5">How Fashion Studio Works</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { n: "1", t: "Design", d: "Create AI-powered fashion designs" },
              { n: "2", t: "Analyze", d: "Body shape & style insights" },
              { n: "3", t: "Score", d: "Get AI ratings on your outfits" },
              { n: "4", t: "Eco", d: "Build a sustainable wardrobe" },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 text-center"
              >
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-br from-pink-400 to-purple-500 bg-clip-text text-transparent mb-1">
                  {step.n}
                </div>
                <h3 className="font-semibold text-white text-xs sm:text-sm mb-0.5">{step.t}</h3>
                <p className="text-[10px] sm:text-xs text-white/60">{step.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
