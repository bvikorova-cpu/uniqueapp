import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CustomEmoji {
  id: string;
  name: string;
  emoji: string;
  style: string;
}

/** Custom emojis created in the Emoji Creator — shared with the chat Emoji Picker. */
export const useCustomEmojis = (userId?: string) => {
  const [emojis, setEmojis] = useState<CustomEmoji[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setEmojis([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("messenger_custom_emojis")
      .select("id, name, emoji, style")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setEmojis((data as CustomEmoji[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener("custom-emojis-updated", onUpdate);
    return () => window.removeEventListener("custom-emojis-updated", onUpdate);
  }, [refresh]);

  const create = useCallback(
    async (name: string, emoji: string, style: string) => {
      if (!userId) throw new Error("Sign in required");
      const { error } = await supabase
        .from("messenger_custom_emojis")
        .insert({ user_id: userId, name, emoji, style });
      if (error) throw error;
      await refresh();
      window.dispatchEvent(new Event("custom-emojis-updated"));
    },
    [userId, refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("messenger_custom_emojis").delete().eq("id", id);
      if (error) throw error;
      await refresh();
      window.dispatchEvent(new Event("custom-emojis-updated"));
    },
    [refresh],
  );

  return { emojis, loading, refresh, create, remove };
};
