import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { VIDEO_FRAMES } from "@/lib/videoFrameStyles";

export function useVideoFrames() {
  const { user } = useAuth();
  const [owned, setOwned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      setOwned([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("video_frame_purchases")
        .select("frame_slug")
        .eq("user_id", user.id);
      if (error) throw error;
      setOwned((data || []).map((r: any) => r.frame_slug));
    } catch (e) {
      console.error("[useVideoFrames]", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const buy = useCallback(
    async (slug: string) => {
      const def = VIDEO_FRAMES.find((f) => f.slug === slug);
      setBusySlug(slug);
      try {
        const { data, error } = await (supabase as any).rpc("buy_video_frame", { _slug: slug });
        if (error) throw error;
        if (!data?.ok) {
          if (data?.error === "insufficient") {
            toast.error("Not enough video credits", {
              description: `This frame costs ${def?.credits ?? "?"} credits. Top up in the Credits tab.`,
            });
          } else {
            toast.error("Purchase failed", { description: String(data?.error ?? "Unknown error") });
          }
          return false;
        }
        if (!data?.already_owned) {
          toast.success(`${def?.name ?? "Frame"} unlocked`, {
            description: `${def?.credits ?? 0} video credits used.`,
          });
          window.dispatchEvent(new Event("video-credits-updated"));
        }
        await load();
        return true;
      } catch (e: any) {
        toast.error("Purchase failed", { description: e?.message });
        return false;
      } finally {
        setBusySlug(null);
      }
    },
    [load],
  );

  const applyFrame = useCallback(async (videoId: string, slug: string) => {
    try {
      const { data, error } = await (supabase as any).rpc("set_premium_video_frame", {
        _video_id: videoId,
        _slug: slug,
      });
      if (error) throw error;
      if (!data?.ok) {
        toast.error("Could not apply frame", { description: String(data?.error ?? "Unknown error") });
        return false;
      }
      toast.success("Frame applied");
      return true;
    } catch (e: any) {
      toast.error("Could not apply frame", { description: e?.message });
      return false;
    }
  }, []);

  return { owned, loading, busySlug, buy, applyFrame, refresh: load };
}
