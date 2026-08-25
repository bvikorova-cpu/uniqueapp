import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { PremiumVideo } from "@/hooks/usePremiumVideos";

/** Creator share of each unlock (1 credit unlock, 50/50 split). */
export const CREATOR_SHARE_PER_UNLOCK = 0.5;

export interface MyVideoStats extends PremiumVideo {
  is_published: boolean;
  earned_credits: number;
}

export interface CreatorBalance {
  pending_credits: number;
  credited_total: number;
}

export function useMyPremiumVideos() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<MyVideoStats[]>([]);
  const [balance, setBalance] = useState<CreatorBalance>({ pending_credits: 0, credited_total: 0 });
  const [boostSpent, setBoostSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      setVideos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [videosRes, balanceRes, boostsRes] = await Promise.all([
        (supabase as any)
          .from("premium_videos")
          .select(
            "id, user_id, title, description, video_url, thumbnail_url, duration_seconds, unlock_cost, unlocks_count, views_count, created_at, boost_tier, boost_until, is_published",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        (supabase as any)
          .from("premium_video_creator_balance")
          .select("pending_credits, credited_total")
          .eq("user_id", user.id)
          .maybeSingle(),
        (supabase as any).from("premium_video_boosts").select("credits_spent").eq("user_id", user.id),
      ]);

      if (videosRes.error) throw videosRes.error;

      const rows: MyVideoStats[] = (videosRes.data || []).map((v: any) => ({
        ...v,
        unlocked: true,
        earned_credits: (v.unlocks_count || 0) * CREATOR_SHARE_PER_UNLOCK,
      }));
      setVideos(rows);
      setBalance({
        pending_credits: Number(balanceRes.data?.pending_credits ?? 0),
        credited_total: Number(balanceRes.data?.credited_total ?? 0),
      });
      setBoostSpent(
        (boostsRes.data || []).reduce((s: number, b: any) => s + (b.credits_spent || 0), 0),
      );
    } catch (e: any) {
      console.error("[useMyPremiumVideos]", e);
      toast.error("Failed to load your videos", { description: e?.message });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener("video-credits-updated", handler);
    return () => window.removeEventListener("video-credits-updated", handler);
  }, [load]);

  const update = useCallback(
    async (
      id: string,
      patch: { title?: string; description?: string | null; is_published?: boolean },
    ): Promise<boolean> => {
      setBusyId(id);
      try {
        const { error } = await (supabase as any)
          .from("premium_videos")
          .update(patch)
          .eq("id", id)
          .eq("user_id", user?.id);
        if (error) throw error;
        setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } as MyVideoStats : v)));
        toast.success("Video updated");
        return true;
      } catch (e: any) {
        toast.error("Update failed", { description: e?.message });
        return false;
      } finally {
        setBusyId(null);
      }
    },
    [user?.id],
  );

  const remove = useCallback(
    async (video: MyVideoStats): Promise<boolean> => {
      setBusyId(video.id);
      try {
        const { error } = await (supabase as any)
          .from("premium_videos")
          .delete()
          .eq("id", video.id)
          .eq("user_id", user?.id);
        if (error) throw error;

        // Best-effort storage cleanup (row is already gone either way).
        const match = video.video_url.match(/\/storage\/v1\/object\/public\/videos\/(.+?)(?:\?.*)?$/);
        if (match) {
          await supabase.storage.from("videos").remove([decodeURIComponent(match[1])]);
        }

        setVideos((prev) => prev.filter((v) => v.id !== video.id));
        toast.success("Video deleted");
        return true;
      } catch (e: any) {
        toast.error("Delete failed", { description: e?.message });
        return false;
      } finally {
        setBusyId(null);
      }
    },
    [user?.id],
  );

  const totals = {
    videos: videos.length,
    views: videos.reduce((s, v) => s + (v.views_count || 0), 0),
    unlocks: videos.reduce((s, v) => s + (v.unlocks_count || 0), 0),
    earnedCredits: videos.reduce((s, v) => s + v.earned_credits, 0),
    paidOutCredits: balance.credited_total,
    pendingCredits: balance.pending_credits,
    boostSpent,
  };

  return { videos, loading, busyId, totals, update, remove, refetch: load };
}
