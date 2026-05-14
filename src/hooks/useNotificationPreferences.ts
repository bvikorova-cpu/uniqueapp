import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type NotifCategory = "likes" | "comments" | "mentions" | "follows" | "messages" | "marketing" | "system";
export type DigestFrequency = "instant" | "daily" | "weekly" | "off";

export interface NotificationPreference {
  id?: string;
  category: NotifCategory;
  in_app: boolean;
  email: boolean;
  push: boolean;
  digest_frequency: DigestFrequency;
  quiet_hours_start?: number | null;
  quiet_hours_end?: number | null;
}

const ALL_CATEGORIES: NotifCategory[] = ["likes","comments","mentions","follows","messages","marketing","system"];

export function useNotificationPreferences() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [] as NotificationPreference[];
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      const map = new Map<NotifCategory, NotificationPreference>();
      (data ?? []).forEach((p: any) => map.set(p.category, p));
      return ALL_CATEGORIES.map((cat) =>
        map.get(cat) ?? {
          category: cat,
          in_app: true,
          email: cat === "mentions" || cat === "messages",
          push: true,
          digest_frequency: "instant" as DigestFrequency,
          quiet_hours_start: null,
          quiet_hours_end: null,
        },
      );
    },
  });

  const upsert = useMutation({
    mutationFn: async (pref: NotificationPreference) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("notification_preferences")
        .upsert(
          { ...pref, user_id: user.id },
          { onConflict: "user_id,category" },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  return { ...query, save: upsert.mutate };
}
