import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const PREMIUM_VIDEO_UNLOCK_COST = 1;

export interface PremiumVideo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  unlock_cost: number;
  unlocks_count: number;
  views_count: number;
  created_at: string;
  boost_tier?: string | null;
  boost_until?: string | null;
  author_name?: string | null;
  author_avatar?: string | null;
  unlocked?: boolean;
}

export function usePremiumVideos() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<PremiumVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("premium_videos")
        .select(
          "id, user_id, title, description, video_url, thumbnail_url, duration_seconds, unlock_cost, unlocks_count, views_count, created_at, boost_tier, boost_until",
        )
        .eq("is_published", true)
        .order("boost_until", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;

      const rows: PremiumVideo[] = data || [];
      const authorIds = [...new Set(rows.map((r) => r.user_id))];

      const [profilesRes, unlocksRes] = await Promise.all([
        authorIds.length
          ? (supabase as any).from("profiles").select("id, full_name, avatar_url").in("id", authorIds)
          : Promise.resolve({ data: [] }),
        user?.id
          ? (supabase as any).from("premium_video_unlocks").select("video_id").eq("user_id", user.id)
          : Promise.resolve({ data: [] }),
      ]);

      const profileMap = new Map<string, any>((profilesRes.data || []).map((p: any) => [p.id, p]));
      const unlockedSet = new Set<string>((unlocksRes.data || []).map((u: any) => u.video_id));

      setVideos(
        rows.map((r) => ({
          ...r,
          author_name: profileMap.get(r.user_id)?.full_name ?? null,
          author_avatar: profileMap.get(r.user_id)?.avatar_url ?? null,
          unlocked: r.user_id === user?.id || unlockedSet.has(r.id),
        })),
      );
    } catch (e: any) {
      console.error("[usePremiumVideos]", e);
      toast.error("Failed to load videos", { description: e?.message });
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const unlock = useCallback(
    async (videoId: string): Promise<boolean> => {
      if (!user) {
        toast.error("Sign in required");
        return false;
      }
      setUnlocking(videoId);
      try {
        const { data, error } = await (supabase as any).rpc("unlock_premium_video", { _video_id: videoId });
        if (error) throw error;
        if (!data?.ok) {
          if (data?.error === "insufficient") {
            toast.error("Not enough credits", {
              description: `Unlocking costs ${PREMIUM_VIDEO_UNLOCK_COST} video credit. Top up above to continue.`,
            });
          } else {
            toast.error("Unlock failed", { description: String(data?.error ?? "Unknown error") });
          }
          return false;
        }
        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId
              ? { ...v, unlocked: true, unlocks_count: v.unlocks_count + (data?.already ? 0 : 1) }
              : v,
          ),
        );
        if (!data?.already) {
          toast.success("Video unlocked — enjoy the rest!");
          window.dispatchEvent(new Event("video-credits-updated"));
        }
        return true;
      } catch (e: any) {
        toast.error("Unlock failed", { description: e?.message });
        return false;
      } finally {
        setUnlocking(null);
      }
    },
    [user],
  );

  const addView = useCallback(async (videoId: string) => {
    try {
      await (supabase as any).rpc("premium_video_add_view", { _video_id: videoId });
    } catch {
      /* non-critical */
    }
  }, []);

  return { videos, loading, unlock, unlocking, addView, refetch: load };
}
