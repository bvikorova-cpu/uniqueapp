import { motion } from "framer-motion";
import { MessageSquare, Clock, Smile, Headphones } from "lucide-react";
import heroVideo from "@/assets/contact-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  responseTime: string;
  todayCount: number;
  satisfaction: number;
}

export const ContactHero = ({ responseTime, todayCount, satisfaction }: Props) => {
  const stats = [
    { icon: Clock, label: "Avg response", value: responseTime, color: "from-cyan-300 to-blue-400" },
    { icon: MessageSquare, label: "Today", value: todayCount.toLocaleString(), color: "from-pink-300 to-purple-400" },
    { icon: Smile, label: "Satisfaction", value: `${satisfaction}%`, color: "from-emerald-300 to-teal-400" },
    { icon: Headphones, label: "Channels", value: "5+", color: "from-amber-300 to-orange-400" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Contact Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Contact Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Contact Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full min-h-[560px] sm:min-h-[520px] sm:h-[520px] rounded-3xl overflow-hidden mb-8 border border-primary/20">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.6) saturate(1.3) contrast(1.05)" }}
        src={heroVideo.url}
      />
      {/* Strong dark overlays for text legibility */}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-pink-600/25" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_70%,rgba(0,0,0,0.6)_0%,transparent_70%)]" />

      <div className="relative z-10 h-full flex flex-col justify-end pt-16 sm:pt-12 px-5 sm:px-12 pb-6 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 mb-4 bg-gradient-to-r from-primary/30 to-pink-500/30 border border-primary/50 text-white backdrop-blur-xl px-3 py-1.5 rounded-full shadow-lg text-xs font-bold">
            <Headphones className="h-3.5 w-3.5" /> Customer Care Hub
          </span>

          <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            We're here to{" "}
            <span className="bg-gradient-to-r from-pink-300 via-primary to-purple-400 bg-clip-text text-transparent">
              help
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] font-medium">
            Real humans, AI-powered triage, instant FAQ matching, and full ticket tracking — every message gets the attention it deserves.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 rounded-xl bg-black/70 border-2 border-white/15 backdrop-blur-xl shadow-xl shadow-black/40"
              >
                <s.icon className={`h-5 w-5 sm:h-6 sm:w-6 bg-gradient-to-br ${s.color} bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`} strokeWidth={2.5} />
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-black text-white leading-tight truncate drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">{s.value}</p>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-white/80 truncate">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};
