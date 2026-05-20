import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Skull, Ghost, Eye, Flame, Trophy, Sparkles, Volume2, Zap } from 'lucide-react';
import { useShadowSubscription } from '@/hooks/useShadowSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

import shadowPoster from '@/assets/shadow-arena-poster.jpg';

interface SubscriptionGateProps {
  children: ReactNode;
}

const FEATURE_KEYS = [
  { icon: Skull, title: 'AI Horror Story Generator', desc: 'Conjure spine-chilling tales with AI — illustrations, ambient sound, narrative twists.' },
  { icon: Flame, title: 'Live Voting & Gifts', desc: 'Audience sends digital gifts in real time. Each gift = a vote. Top performers win.' },
  { icon: Volume2, title: 'Horror Sound Library', desc: 'Curated screams, whispers, ambient drones + AI-generated atmospheric soundscapes.' },
  { icon: Trophy, title: 'Battle Tournaments', desc: 'Weekly & monthly tournaments with cash prize pools and a global cursed leaderboard.' },
  { icon: Ghost, title: 'Live Horror Battles', desc: 'Go LIVE and perform your tale to a terrified audience in real time.' },
  { icon: Eye, title: 'Story Archive Vault', desc: 'Every AI-enhanced horror story preserved with atmospheric illustrations.' },
];

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { user } = useAuth();
  const { subscribed, loading } = useShadowSubscription();
  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke('create-shadow-subscription');
      if (error) throw error;
      if (data.url) {
        // Open Stripe Checkout in new tab — Stripe blocks iframe embedding
        window.open(data.url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error("Failed to create subscription");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <Skull className="w-16 h-16 text-red-600 animate-pulse drop-shadow-[0_0_25px_rgba(220,38,38,0.7)]" />
        </div>
      </div>
    );
  }

  if (!subscribed) {
    return (
      <div className="relative w-full min-h-screen overflow-hidden bg-black">
        {/* Cinematic poster background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${shadowPoster})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        <div className="absolute inset-0 shadow-vignette" />
        <div className="absolute inset-0 shadow-grain" />

        {/* Drifting blood-red fog layers */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute shadow-fog rounded-full bg-red-900/20 blur-3xl pointer-events-none"
            style={{
              left: `${(i * 23) % 90}%`,
              top: `${10 + i * 18}%`,
              width: 320 + i * 60,
              height: 320 + i * 60,
              animationDelay: `${i * 2.5}s`,
            }}
          />
        ))}

        {/* Blood drips on edges */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`drip-${i}`}
            className="blood-drip absolute top-0 w-[2px] h-32 bg-gradient-to-b from-red-600/0 via-red-700 to-red-900 pointer-events-none"
            style={{
              left: `${5 + i * 12}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${4 + (i % 3)}s`,
            }}
          />
        ))}

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-16">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/60 backdrop-blur border border-red-900/60 text-red-300 text-[11px] tracking-[0.25em] uppercase font-gothic-display">
              <Sparkles className="w-3 h-3" /> {"Forbidden Access"}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
            className="text-center font-gothic-display font-black tracking-tight mb-4 text-5xl sm:text-7xl md:text-8xl shadow-blood-text shadow-flicker leading-[0.9]"
          >
            {"Shadow Arena"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center font-gothic-body italic text-red-100/80 text-base sm:text-xl max-w-2xl mx-auto mb-2"
          >
            {"Where the dead tell stories. Where the living compete for blood and gold."}
          </motion.p>
          <p className="text-center text-[11px] tracking-[0.3em] uppercase text-red-500/70 font-gothic-display mb-12">
            {"— Enter at your own risk —"}
          </p>

          {/* Lock + lore */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-gradient-to-b from-black/80 via-red-950/20 to-black/80 backdrop-blur-md border border-red-900/40 rounded-2xl p-6 sm:p-10 mb-10 shadow-[0_0_60px_-10px_rgba(220,38,38,0.35)]"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-950 border border-red-800/60 flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.5)]">
              <Lock className="w-9 h-9 text-red-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
            </div>
            <h2 className="text-center font-gothic-display text-2xl sm:text-3xl text-red-200 mt-6 mb-4">
              {"Access Sealed by Ancient Curse"}
            </h2>
            <p className="font-gothic-body text-center text-red-100/85 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {"Beyond this seal lies the darkest corner of storytelling. Live horror battles, AI-summoned tales, real cash prizes. Speak the rite — pay the offering — and the gate shall open."}
            </p>
          </motion.div>

          {/* Features grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {FEATURE_KEYS.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  whileHover={{ y: -4, borderColor: 'rgba(220,38,38,0.6)' }}
                  className="group relative bg-black/70 backdrop-blur-sm border border-red-950/50 rounded-xl p-5 overflow-hidden"
                >
                  <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-700/60 to-transparent" />
                  <Icon className="w-8 h-8 text-red-400 mb-3 group-hover:text-red-300 transition-colors drop-shadow-[0_0_10px_rgba(220,38,38,0.4)]" />
                  <h3 className="font-gothic-display text-red-100 text-base mb-1.5 tracking-wide">{f.title}</h3>
                  <p className="font-gothic-body text-red-200/65 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Price + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="relative bg-gradient-to-b from-red-950/40 via-black/90 to-red-950/30 border border-red-800/50 rounded-2xl p-6 sm:p-10 text-center overflow-hidden"
          >
            <div className="absolute inset-0 shadow-grain" />
            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.4em] text-red-400/70 font-gothic-display mb-3">
                {"The Offering"}
              </p>
              <p className="font-gothic-display text-5xl sm:text-6xl shadow-blood-text mb-2">€2.00</p>
              <p className="text-red-200/60 text-sm font-gothic-body italic mb-6">{"per moon · break the pact anytime"}</p>

              <Button
                onClick={handleSubscribe}
                size="lg"
                className="w-full sm:w-auto px-12 py-7 text-lg font-gothic-display tracking-[0.15em] uppercase bg-gradient-to-r from-red-700 via-red-800 to-red-900 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-red-50 border border-red-500/40 shadow-[0_0_40px_rgba(220,38,38,0.45)] hover:shadow-[0_0_60px_rgba(220,38,38,0.7)] transition-all"
              >
                <Zap className="mr-2 w-5 h-5" />
                {"Break the Seal"}
              </Button>

              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-6 text-[11px] uppercase tracking-widest text-red-300/60 font-gothic-display">
                <span>{"· Instant Entry ·"}</span>
                <span>{"· Stripe Secure ·"}</span>
                <span>{"· Cancel Anytime ·"}</span>
              </div>
            </div>
          </motion.div>

          <p className="text-center text-xs text-red-500/50 italic mt-8 font-gothic-body">
            {"\"The arena does not forget those who refuse the offering.\""}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
