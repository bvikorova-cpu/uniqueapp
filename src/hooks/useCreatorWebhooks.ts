import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CreatorWebhook {
  id: string;
  user_id: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  description: string | null;
  created_at: string;
}

export const WEBHOOK_EVENTS = [
  "post.created",
  "post.liked",
  "follower.new",
  "tip.received",
  "subscription.new",
  "comment.new",
] as const;

export function useCreatorWebhooks() {
  const { user } = useAuth();
  const [hooks, setHooks] = useState<CreatorWebhook[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("creator_webhooks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setHooks((data as CreatorWebhook[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (input: { url: string; events: string[]; description?: string }) => {
    if (!user) return new Error("Not authenticated");
    const { error } = await (supabase as any)
      .from("creator_webhooks")
      .insert({ ...input, user_id: user.id });
    if (!error) await fetch();
    return error;
  };

  const toggle = async (id: string, isActive: boolean) => {
    await (supabase as any)
      .from("creator_webhooks")
      .update({ is_active: isActive })
      .eq("id", id);
    await fetch();
  };

  const remove = async (id: string) => {
    await (supabase as any).from("creator_webhooks").delete().eq("id", id);
    await fetch();
  };

  return { hooks, loading, create, toggle, remove, refetch: fetch };
}
