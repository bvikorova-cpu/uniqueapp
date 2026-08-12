import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skull, Zap, Coins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useShadowArenaCredits } from '@/hooks/useShadowArenaAI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  const { credits, isLoading, refetch } = useShadowArenaCredits();
  const queryClient = useQueryClient();
  useEffect(() => { loadGoogleFont('gothic'); }, []);

  const { data: access, isLoading: accessLoading } = useQuery({
    queryKey: ['shadow-arena-access'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('shadow-arena-router', {
        body: { action: 'arena_access_status' },
      });
      if (error) throw error;
      return data as { has_access: boolean; expires_at: string | null; cost: number };
    },
  });

  const enter = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('shadow-arena-router', {
        body: { action: 'arena_enter' },
      });
      if (error) throw error;
      if (data?.error === 'insufficient_credits') throw new Error('You need 5 credits to enter Shadow Arena.');
      if (data?.error) throw new Error(String(data.error));
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['shadow-arena-access'] });
      refetch();
      toast.success(data?.charged ? '5 credits charged — welcome to the Shadow Arena.' : 'Access active.');
    },
    onError: (e: Error) => toast.error(e.message || 'Could not enter the arena'),
  });

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
            { title: 'Enter the arena', desc: 'Arena entry costs 5 credits and unlocks everything for 24 hours.' },
            { title: 'Create & compete', desc: 'Battle entry 5 credits, create a battle 3, AI tools 4–25 credits.' },
            { title: 'Send gifts', desc: 'Gifts cost credits, count as weighted votes and add points to the prize pool.' },
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

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-black">
        <Skull className="w-16 h-16 text-red-600 animate-pulse drop-shadow-[0_0_25px_rgba(220,38,38,0.7)]" />
      </div>
    );
  }

  if (!access?.has_access) {
    return (
      <div className="relative w-full min-h-screen overflow-hidden bg-black">
        <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url(${shadowPoster})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/90 to-black" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20 text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-gothic-display font-black text-5xl sm:text-7xl shadow-blood-text shadow-flicker mb-4"
          >
            Shadow Arena
          </motion.h1>
          <p className="font-gothic-body italic text-red-100/80 mb-6">
            Entry to the arena costs <span className="font-bold text-red-300">5 credits</span> and keeps the gates open for 24 hours.
          </p>
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-red-800/60 bg-black/70 text-red-100 text-sm">
            <Coins className="w-4 h-4 text-yellow-300" /> Your balance: {isLoading ? '—' : `${balance} credits`}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              disabled={enter.isPending || balance < 5}
              onClick={() => enter.mutate()}
              className="bg-gradient-to-r from-red-700 to-red-900 border border-red-500/40"
            >
              <Zap className="mr-2 w-5 h-5" />
              {enter.isPending ? 'Opening the gates…' : 'Enter the arena — 5 credits'}
            </Button>
            <Button asChild size="lg" variant="outline" className="border-red-800/60 text-red-100 bg-black/50">
              <Link to="/ai-credits-store">
                <Coins className="mr-2 w-5 h-5 text-yellow-300" /> Top up credits
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
