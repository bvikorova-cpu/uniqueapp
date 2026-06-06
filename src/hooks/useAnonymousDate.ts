import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AnonMatchRow = Database["public"]["Tables"]["anonymous_dating_matches"]["Row"];
type AnonProfileRow = Database["public"]["Tables"]["anonymous_dating_profiles"]["Row"];

export interface PartnerProfile {
  user_id: string;
  anonymous_name: AnonProfileRow["anonymous_name"];
  age_range: AnonProfileRow["age_range"];
  interests: AnonProfileRow["interests"];
  personality_traits: AnonProfileRow["personality_traits"];
}

export interface ActiveMatch extends AnonMatchRow {
  current_user_id: string;
  partner_profile: PartnerProfile | null;
}

interface MatchFilters {
  location?: string;
  preferred_gender?: string;
  relationship_goal?: string;
  languages?: string[];
  min_shared_interests?: number;
}

export function useAnonymousDate() {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeMatches, setActiveMatches] = useState<ActiveMatch[]>([]);
  const { toast } = useToast();
  // Cache auth user — `supabase.auth.getUser()` hits the network each call.
  const userIdRef = useRef<string | null>(null);

  const getUserId = useCallback(async (): Promise<string | null> => {
    if (userIdRef.current) return userIdRef.current;
    const { data: { user } } = await supabase.auth.getUser();
    userIdRef.current = user?.id ?? null;
    return userIdRef.current;
  }, []);

  const fetchCredits = useCallback(async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const { data, error } = await supabase
        .from("anonymous_dating_credits")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (!data) {
        const { data: newCredits, error: insertError } = await supabase
          .from("anonymous_dating_credits")
          .insert({ user_id: userId, credits_remaining: 0 })
          .select()
          .single();

        if (insertError) throw insertError;
        setCredits(newCredits.credits_remaining);
      } else {
        setCredits(data.credits_remaining);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
      toast({
        title: "Error",
        description: "Failed to load credits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [getUserId, toast]);

  const fetchActiveMatches = useCallback(async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const { data, error } = await supabase
        .from("anonymous_dating_matches")
        .select("*")
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .in("status", ["active", "revealed"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Hide matches where I blocked the partner.
      const { data: myBlocks } = await supabase
        .from("blocked_users")
        .select("blocked_user_id")
        .eq("user_id", userId);
      const blockedIds = new Set((myBlocks ?? []).map((b) => b.blocked_user_id));

      const visibleMatches = (data ?? []).filter((m) => {
        const partnerId = m.user1_id === userId ? m.user2_id : m.user1_id;
        return !blockedIds.has(partnerId);
      });

      const partnerIds = Array.from(
        new Set(
          visibleMatches.flatMap((m) =>
            [m.user1_id, m.user2_id].filter((id): id is string => Boolean(id) && id !== userId)
          )
        )
      );

      let profilesById: Record<string, PartnerProfile> = {};
      if (partnerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("anonymous_dating_profiles")
          .select("user_id, anonymous_name, age_range, interests, personality_traits")
          .in("user_id", partnerIds);
        profilesById = Object.fromEntries(
          (profiles ?? []).map((p) => [p.user_id, p as PartnerProfile])
        );
      }

      const enriched: ActiveMatch[] = visibleMatches.map((m) => {
        const partnerId = m.user1_id === userId ? m.user2_id : m.user1_id;
        return {
          ...m,
          current_user_id: userId,
          partner_profile: profilesById[partnerId] ?? null,
        };
      });

      setActiveMatches(enriched);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  }, [getUserId]);

  const purchaseCredits = useCallback(async (packageType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-anonymous-date-payment",
        { body: { packageType } }
      );

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error purchasing credits:", error);
      toast({
        title: "Error",
        description: "Failed to initiate payment",
        variant: "destructive",
      });
    }
  }, [toast]);

  const previewMatches = useCallback(async (filters?: MatchFilters) => {
    try {
      const { data, error } = await supabase.functions.invoke("find-anonymous-match", {
        body: { mode: "preview", filters: filters ?? {} },
      });
      if (error) throw error;
      return data?.candidates ?? [];
    } catch (error: any) {
      console.error("Error previewing matches:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load candidates",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  const findMatch = useCallback(async (filters?: MatchFilters, targetUserId?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("find-anonymous-match", {
        body: { mode: "match", filters: filters ?? {}, targetUserId },
      });

      if (error) throw error;

      if (data?.match) {
        toast({
          title: "Match Found!",
          description: `You've been matched with ${data.partner.anonymous_name}`,
        });
        await fetchCredits();
        await fetchActiveMatches();
        return data;
      }
    } catch (error: any) {
      console.error("Error finding match:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to find match",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, fetchCredits, fetchActiveMatches]);

  useEffect(() => {
    fetchCredits();
    fetchActiveMatches();
    // Reset cached user when auth changes so a fresh sign-in is picked up.
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      userIdRef.current = null;
    });
    return () => { sub.subscription.unsubscribe(); };
  }, [fetchCredits, fetchActiveMatches]);

  return {
    credits,
    loading,
    activeMatches,
    fetchCredits,
    fetchActiveMatches,
    purchaseCredits,
    findMatch,
    previewMatches,
  };
}
