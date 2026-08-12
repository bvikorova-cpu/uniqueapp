import { ReactNode, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skull, Zap, Coins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useShadowArenaCredits } from '@/hooks/useShadowArenaAI';
import { motion } from 'framer-motion';
import { loadGoogleFont } from '@/utils/lazyFonts';
import shadowPoster from '@/assets/shadow-arena-poster.jpg';
import { FloatingHowItWorks } from '@/components/common/FloatingHowItWorks';

interface ShadowCreditsGateProps {
  children: ReactNode;
}

/**
 * Shadow Arena is 100% credit based — there is no subscription.
 * Signed-in users always get in; every paid action charges unified AI credits.
 */
export function ShadowCreditsGate({ children }: ShadowCreditsGateProps) {
  const { user, loading: authLoading } = useAuth();
  const { credits, isLoading } = useShadowArenaCredits();
  useEffect(() => { loadGoogleFont('gothic'); }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Skull className="w-16 h-16 text-red-600 animate-pulse drop-shadow-[0_0_25px_rgba(220,38,38,0.7)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative w-full min-h-screen overflow-hidden bg-black">
        <FloatingHowItWorks
          title="Shadow Arena — How it works"
          steps={[
            { title: 'Sign in', desc: 'Shadow Arena is credit based — no subscription needed.' },
            { title: 'Top up credits', desc: 'Buy AI credits once and use them anywhere on the platform.' },
            { title: 'Create & compete', desc: 'Battle entry 5 credits, create a battle 3, AI tools 4–25 credits.' },
            { title: 'Send gifts', desc: 'Gifts cost credits and count as weighted votes for the prize pool.' },
          ]}
        />
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${shadowPoster})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/85 to-black" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20 text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-gothic-display font-black text-5xl sm:text-7xl shadow-blood-text shadow-flicker mb-4"
          >
            Shadow Arena
          </motion.h1>
          <p className="font-gothic-body italic text-red-100/80 mb-8">
            Where the dead tell stories. Pay only for what you use — credits, never a subscription.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-red-700 to-red-900 border border-red-500/40">
            <Link to="/auth">
              <Zap className="mr-2 w-5 h-5" /> Sign in to enter
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const balance = credits?.credits_remaining ?? 0;

  return (
    <>
      <div className="fixed bottom-20 right-3 z-30 sm:bottom-6">
        <Link
          to="/ai-credits-store"
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/80 backdrop-blur border border-red-800/60 text-red-100 text-xs font-semibold shadow-[0_0_20px_rgba(220,38,38,0.35)]"
        >
          <Coins className="w-4 h-4 text-yellow-300" />
          {isLoading ? '—' : `${balance} credits`}
        </Link>
      </div>
      {children}
    </>
  );
}
