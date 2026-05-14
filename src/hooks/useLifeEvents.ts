import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type LifeEventKind =
  | "new_job" | "promotion" | "retired" | "started_school" | "graduated"
  | "moved" | "bought_home" | "engagement" | "marriage" | "baby"
  | "new_pet" | "travel" | "milestone" | "other";

export interface LifeEvent {
  id: string;
  user_id: string;
  kind: LifeEventKind;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string | null;
  cover_image_url: string | null;
  visibility: "public" | "friends" | "private";
  post_id: string | null;
  created_at: string;
}

export const LIFE_EVENT_LABELS: Record<LifeEventKind, { label: string; emoji: string }> = {
  new_job: { label: "New Job", emoji: "💼" },
  promotion: { label: "Promotion", emoji: "🚀" },
  retired: { label: "Retired", emoji: "🏖️" },
  started_school: { label: "Started School", emoji: "🎒" },
  graduated: { label: "Graduated", emoji: "🎓" },
  moved: { label: "Moved", emoji: "📦" },
  bought_home: { label: "Bought a Home", emoji: "🏡" },
  engagement: { label: "Engaged", emoji: "💍" },
  marriage: { label: "Got Married", emoji: "💒" },
  baby: { label: "New Baby", emoji: "👶" },
  new_pet: { label: "New Pet", emoji: "🐾" },
  travel: { label: "Travelled", emoji: "✈️" },
  milestone: { label: "Milestone", emoji: "🏆" },
  other: { label: "Life Event", emoji: "✨" },
};

const KEY = ["life-events"] as const;

export function useLifeEvents(profileUserId: string | undefined) {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: [...KEY, profileUserId],
    enabled: !!profileUserId,
    queryFn: async (): Promise<LifeEvent[]> => {
      const { data, error } = await supabase
        .from("life_events")
        .select("*")
        .eq("user_id", profileUserId!)
        .order("event_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LifeEvent[];
    },
  });

  const create = useMutation({
    mutationFn: async (input: Omit<LifeEvent, "id" | "created_at" | "post_id"> & { post_id?: string | null }) => {
      const { error } = await supabase.from("life_events").insert(input);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Life event added");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("life_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  return { list, create, remove };
}
