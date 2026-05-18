import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAnonymousDate() {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeMatches, setActiveMatches] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("anonymous_dating_credits")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!data) {
        const { data: newCredits, error: insertError } = await supabase
          .from("anonymous_dating_credits")
          .insert({ user_id: user.id, credits_remaining: 0 })
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
  };

  const fetchActiveMatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("anonymous_dating_matches")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .in("status", ["active", "revealed"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Hide matches where I blocked the partner.
      const { data: myBlocks } = await supabase
        .from("blocked_users")
        .select("blocked_user_id")
        .eq("user_id", user.id);
      const blockedIds = new Set((myBlocks ?? []).map((b: any) => b.blocked_user_id));

      const visibleMatches = (data || []).filter((m: any) => {
        const partnerId = m.user1_id === user.id ? m.user2_id : m.user1_id;
        return !blockedIds.has(partnerId);
      });

      const partnerIds = Array.from(
        new Set(
          visibleMatches.flatMap((m: any) =>
            [m.user1_id, m.user2_id].filter((id) => id && id !== user.id)
          )
        )
      );

      let profilesById: Record<string, any> = {};
      if (partnerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("anonymous_dating_profiles")
          .select("user_id, anonymous_name, age_range, interests, personality_traits")
          .in("user_id", partnerIds);
        profilesById = Object.fromEntries((profiles ?? []).map((p: any) => [p.user_id, p]));
      }

      const enriched = visibleMatches.map((m: any) => {
        const partnerId = m.user1_id === user.id ? m.user2_id : m.user1_id;
        return {
          ...m,
          current_user_id: user.id,
          partner_profile: profilesById[partnerId] ?? null,
        };
      });

      setActiveMatches(enriched);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  const purchaseCredits = async (packageType: string) => {
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
  };

  const previewMatches = async (filters?: {
    location?: string;
    preferred_gender?: string;
    relationship_goal?: string;
    languages?: string[];
    min_shared_interests?: number;
  }) => {
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
  };

  const findMatch = async (
    filters?: {
      location?: string;
      preferred_gender?: string;
      relationship_goal?: string;
      languages?: string[];
      min_shared_interests?: number;
    },
    targetUserId?: string,
  ) => {
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
  };

  useEffect(() => {
    fetchCredits();
    fetchActiveMatches();
  }, []);

  return {
    credits,
    loading,
    activeMatches,
    fetchCredits,
    fetchActiveMatches,
    purchaseCredits,
    findMatch,
  };
}