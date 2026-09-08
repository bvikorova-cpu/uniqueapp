import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Sparkles, Mic, Brain, Heart, Stethoscope, GraduationCap, Apple } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroVideo from '@/assets/pet-translator-hero.mp4.asset.json';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

// Pet Translator runs fully on the unified AI credits wallet — no subscriptions.
const TOOLS = [
  { icon: Mic, title: "AI Translator", desc: "Decode your pet's sounds", credits: 3, color: "text-purple-400" },
  { icon: Heart, title: "Emotion Detector", desc: "Analyze mood & stress", credits: 3, color: "text-pink-400" },
  { icon: Stethoscope, title: "Health Scanner", desc: "Early health signals", credits: 5, color: "text-fuchsia-400" },
  { icon: GraduationCap, title: "Training Coach", desc: "Custom training plans", credits: 4, color: "text-violet-400" },
  { icon: Apple, title: "Diet Planner", desc: "Optimal nutrition plans", credits: 4, color: "text-emerald-400" },
  { icon: Brain, title: "Behavior Analyzer", desc: "Deep pattern analysis", credits: 5, color: "text-blue-400" },
];

const PetTranslatorPricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <FloatingHowItWorks
        title="Pet Translator credits"
        intro="Every pet tool is paid with credits from your one wallet."
        steps={[
          { title: "Get credits", desc: "Top up once at AI Credits — no subscription." },
          { title: "Pick a tool", desc: "Each tool shows its credit cost before you run it." },
          { title: "Instant balance", desc: "Credits are deducted the moment a result is created." },
          { title: "Free monthly top-up", desc: "+10 credits on the 1st of each month." },
          { title: "No commitment", desc: "Nothing renews, nothing to cancel." }
        ]}
      />

      <div className="relative overflow-hidden min-h-[260px] sm:min-h-[320px]">
        <div className="absolute inset-0 z-0">
          <video src={heroVideo.url} autoPlay loop muted playsInline className="w-full h-full object-cover" style={{ filter: "brightness(0.7) saturate(1.2)" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-[#1a0a2e]/70 to-[#1a0a2e]/40" />
        </div>
        <div className="relative z-10 container mx-auto px-4 pt-24 pb-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="bg-purple-500/90 text-white font-bold border-purple-400/50 mb-4">
              <Sparkles className="h-3 w-3 mr-1" /> Credits only
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-lg mb-3">
              🐾 Pay with <span className="text-purple-400">credits</span>
            </h1>
            <p className="text-white/80 text-sm sm:text-lg max-w-xl mx-auto">
              No plans, no renewals — one wallet for every AI pet tool
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {TOOLS.map((t, i) => (
            <motion.div key={t.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-3 text-center bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border-purple-500/10">
                <t.icon className={`h-6 w-6 mx-auto mb-1 ${t.color}`} />
                <p className="text-xs font-bold">{t.title}</p>
                <p className="text-[9px] text-muted-foreground mb-1">{t.desc}</p>
                <p className="text-[10px] font-bold text-primary flex items-center justify-center gap-1">
                  <Coins className="h-3 w-3" /> {t.credits}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="max-w-2xl mx-auto p-6 text-center bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border-purple-500/20">
          <h2 className="text-xl font-bold mb-2">Top up your credits</h2>
          <p className="text-sm text-muted-foreground mb-4">
            One balance works across Pet Translator and every other AI tool on the platform.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={() => navigate('/ai-credits')}>
              <Coins className="h-4 w-4 mr-2" /> Get credits
            </Button>
            <Button variant="outline" onClick={() => navigate('/pet-translator')}>
              Open Pet Translator
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PetTranslatorPricing;
