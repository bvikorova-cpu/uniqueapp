import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import type { GameMode } from '@/components/brain-duel/GameModeSelector';

interface MatchmakingState {
  status: 'idle' | 'searching' | 'found' | 'ready' | 'playing' | 'finished';
  matchId: string | null;
  opponentId: string | null;
  opponentProfile: any | null;
  error: string | null;
}

export const useBrainDuelMatchmaking = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [state, setState] = useState<MatchmakingState>({
    status: 'idle',
    matchId: null,
    opponentId: null,
    opponentProfile: null,
    error: null,
  });
  const [presenceChannel, setPresenceChannel] = useState<any>(null);

  // Initialize presence tracking
  const initPresence = useCallback(async (category: string, gameMode: GameMode) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create a presence channel for matchmaking
    const channel = supabase.channel(`matchmaking-${category}-${gameMode.id}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const players = Object.keys(presenceState).filter(id => id !== user.id);
        
        // If we find another player searching, try to match
        if (players.length > 0 && state.status === 'searching') {
          const opponentId = players[0];
          attemptMatch(opponentId, category, gameMode);
        }
      })
      .on('presence', { event: 'join' }, async ({ key, newPresences }) => {
        if (key !== user.id && state.status === 'searching') {
          attemptMatch(key, category, gameMode);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            searching: true,
            category,
            game_mode: gameMode.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    setPresenceChannel(channel);
    return channel;
  }, [state.status]);

  const attemptMatch = async (opponentId: string, category: string, gameMode: GameMode) => {
    try {
      const { data, error } = await supabase.functions.invoke('brain-duel-matchmaking', {
        body: { 
          category,
          game_mode: gameMode.id,
          questions: gameMode.questions,
          time_per_question: gameMode.timePerQuestion,
          entry_cost: gameMode.entry,
          win_reward: gameMode.reward,
        },
      });

      if (error) throw error;

      // Fetch opponent profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', data.match.player2_id || opponentId)
        .single();

      setState(prev => ({
        ...prev,
        status: data.match.status === 'ready' ? 'ready' : 'found',
        matchId: data.match.id,
        opponentId: data.match.player2_id || opponentId,
        opponentProfile: profile,
      }));

      if (data.match.status === 'ready') {
        toast({
          title: 'Match found! 🎮',
          description: `Playing against ${profile?.full_name || 'an opponent'}`,
        });
      }

      return data.match;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      toast({
        title: 'Matchmaking error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const startSearching = async (category: string, gameMode: GameMode) => {
    setState({
      status: 'searching',
      matchId: null,
      opponentId: null,
      opponentProfile: null,
      error: null,
    });

    // Initialize presence-based matchmaking
    const channel = await initPresence(category, gameMode);

    // Also call the edge function for database-based matchmaking
    try {
      const { data, error } = await supabase.functions.invoke('brain-duel-matchmaking', {
        body: { 
          category,
          game_mode: gameMode.id,
          questions: gameMode.questions,
          time_per_question: gameMode.timePerQuestion,
          entry_cost: gameMode.entry,
          win_reward: gameMode.reward,
        },
      });

      if (error) throw error;

      if (data.match.status === 'ready') {
        // Match found immediately
        const { data: { user } } = await supabase.auth.getUser();
        const opponentId = data.match.player1_id === user?.id 
          ? data.match.player2_id 
          : data.match.player1_id;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', opponentId)
          .single();

        setState({
          status: 'ready',
          matchId: data.match.id,
          opponentId,
          opponentProfile: profile,
          error: null,
        });

        toast({
          title: 'Match found! 🎮',
          description: `Playing against ${profile?.full_name || 'an opponent'}`,
        });
      } else {
        // Waiting for opponent
        setState(prev => ({
          ...prev,
          matchId: data.match.id,
        }));
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, status: 'idle', error: error.message }));
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const cancelSearch = useCallback(() => {
    if (presenceChannel) {
      supabase.removeChannel(presenceChannel);
    }
    setState({
      status: 'idle',
      matchId: null,
      opponentId: null,
      opponentProfile: null,
      error: null,
    });
  }, [presenceChannel]);

  // Listen for match updates
  useEffect(() => {
    if (!state.matchId) return;

    const channel = supabase
      .channel(`match-updates-${state.matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'brain_duel_matches',
          filter: `id=eq.${state.matchId}`,
        },
        async (payload) => {
          if (payload.new.status === 'ready' && state.status === 'searching') {
            const { data: { user } } = await supabase.auth.getUser();
            const opponentId = payload.new.player1_id === user?.id 
              ? payload.new.player2_id 
              : payload.new.player1_id;

            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .eq('id', opponentId)
              .single();

            setState(prev => ({
              ...prev,
              status: 'ready',
              opponentId,
              opponentProfile: profile,
            }));

            toast({
              title: 'Match found! 🎮',
              description: `Playing against ${profile?.full_name || 'an opponent'}`,
            });
          } else if (payload.new.status === 'finished') {
            setState(prev => ({ ...prev, status: 'finished' }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.matchId, state.status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
    };
  }, [presenceChannel]);

  return {
    ...state,
    startSearching,
    cancelSearch,
    isSearching: state.status === 'searching',
    isReady: state.status === 'ready',
  };
};
