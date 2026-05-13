import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProductTag {
  id: string;
  post_id: string;
  product_url: string;
  product_name: string;
  price_eur: number | null;
  currency: string | null;
  image_url: string | null;
  position_x: number | null;
  position_y: number | null;
  created_by: string;
  created_at: string;
}

export function useShoppableTags(postId?: string) {
  const { user } = useAuth();
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTags = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("post_product_tags")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setTags((data as ProductTag[]) ?? []);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const addTag = async (input: Omit<ProductTag, "id" | "created_at" | "created_by">) => {
    if (!user) return;
    const { error } = await (supabase as any)
      .from("post_product_tags")
      .insert({ ...input, created_by: user.id });
    if (!error) await fetchTags();
    return error;
  };

  const removeTag = async (id: string) => {
    await (supabase as any).from("post_product_tags").delete().eq("id", id);
    await fetchTags();
  };

  return { tags, loading, addTag, removeTag, refetch: fetchTags };
}
