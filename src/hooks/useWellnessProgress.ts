import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export interface MeditationSession {
  id: string;
  user_id: string;
  session_type: string;
  duration_seconds: number;
  completed: boolean;
  notes?: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  entry_text: string;
  mood_rating?: number;
  ai_insights?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface UsageStats {
  id: string;
  user_id: string;
  activity_type: string;
  activity_count: number;
  total_duration_seconds: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export const useWellnessProgress = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id || null;

  // Fetch meditation sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["wellness-meditation-sessions", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("wellness_meditation_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as MeditationSession[];
    },
    enabled: !!userId,
  });

  // Fetch journal entries
  const { data: journalEntries = [], isLoading: journalLoading } = useQuery({
    queryKey: ["wellness-journal-entries", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("wellness_journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as JournalEntry[];
    },
    enabled: !!userId,
  });

  // Fetch usage statistics
  const { data: stats = [], isLoading: statsLoading } = useQuery({
    queryKey: ["wellness-usage-stats", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("wellness_usage_stats")
        .select("*")
        .eq("user_id", userId);
      
      if (error) throw error;
      return data as UsageStats[];
    },
    enabled: !!userId,
  });

  // Log meditation session
  const logSession = useMutation({
    mutationFn: async ({
      sessionType,
      durationSeconds,
      completed,
      notes,
    }: {
      sessionType: string;
      durationSeconds: number;
      completed: boolean;
      notes?: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const { data, error } = await (supabase as any)
        .from("wellness_meditation_sessions")
        .insert({
          user_id: session.user.id,
          session_type: sessionType,
          duration_seconds: durationSeconds,
          completed,
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wellness-meditation-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["wellness-usage-stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to log meditation session",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Save journal entry
  const saveJournalEntry = useMutation({
    mutationFn: async ({
      entryText,
      moodRating,
      aiInsights,
      tags,
    }: {
      entryText: string;
      moodRating?: number;
      aiInsights?: string;
      tags?: string[];
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const { data, error } = await (supabase as any)
        .from("wellness_journal_entries")
        .insert({
          user_id: session.user.id,
          entry_text: entryText,
          mood_rating: moodRating,
          ai_insights: aiInsights,
          tags,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wellness-journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["wellness-usage-stats"] });
      toast({
        title: "Success",
        description: "Journal entry saved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save journal entry",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Update usage statistics
  const updateStats = useMutation({
    mutationFn: async ({
      activityType,
      durationSeconds = 0,
    }: {
      activityType: string;
      durationSeconds?: number;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      // Check if stat exists
      const { data: existing } = await (supabase as any)
        .from("wellness_usage_stats")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("activity_type", activityType)
        .single();

      if (existing) {
        // Update existing stat
        const { error } = await (supabase as any)
          .from("wellness_usage_stats")
          .update({
            activity_count: existing.activity_count + 1,
            total_duration_seconds: existing.total_duration_seconds + durationSeconds,
            last_activity_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Create new stat
        const { error } = await (supabase as any)
          .from("wellness_usage_stats")
          .insert({
            user_id: session.user.id,
            activity_type: activityType,
            activity_count: 1,
            total_duration_seconds: durationSeconds,
            last_activity_at: new Date().toISOString(),
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wellness-usage-stats"] });
    },
    onError: (error) => {
      console.error("Failed to update stats:", error);
    },
  });

  return {
    sessions,
    journalEntries,
    stats,
    isLoading: sessionsLoading || journalLoading || statsLoading,
    logSession: logSession.mutateAsync,
    saveJournalEntry: saveJournalEntry.mutateAsync,
    updateStats: updateStats.mutateAsync,
    isLoggingSession: logSession.isPending,
    isSavingJournal: saveJournalEntry.isPending,
  };
};
