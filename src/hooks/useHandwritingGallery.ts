import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getReadableUrl } from "@/lib/storageSigned";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const invokeRouter = async (action: string, payload: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("handwriting-ai", {
    body: { action, ...payload },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data;
};

const handleErr = (e: Error) => {
  const m = e.message || "";
  if (m.includes("Insufficient")) toast.error("Not enough credits — top up to continue.");
  else if (m.includes("Rate limited")) toast.error("Too many requests, slow down.");
  else if (m.includes("AI credits")) toast.error("AI workspace credits exhausted.");
  else toast.error(m || "Something went wrong");
};

export function useGalleryItems(filter: "all" | "famous" | "community" = "all") {
  return useQuery({
    queryKey: ["gallery-items", filter],
    queryFn: async () => {
      let q = supabase
        .from("handwriting_gallery_items")
        .select("*")
        .eq("status", "approved")
        .order("likes_count", { ascending: false })
        .limit(60);
      if (filter === "famous") q = q.eq("source_type", "seeded");
      if (filter === "community") q = q.eq("source_type", "user");
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyGallerySubmissions() {
  return useQuery({
    queryKey: ["my-gallery-submissions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("handwriting_gallery_items")
        .select("*")
        .eq("submitter_user_id", user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useMyGalleryLikes() {
  return useQuery({
    queryKey: ["my-gallery-likes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return new Set<string>();
      const { data } = await supabase
        .from("handwriting_gallery_likes")
        .select("item_id")
        .eq("user_id", user.id);
      return new Set((data ?? []).map((r: any) => r.item_id));
    },
  });
}

export function useToggleGalleryLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { itemId: string; liked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to like");
      if (vars.liked) {
        const { error } = await supabase
          .from("handwriting_gallery_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("item_id", vars.itemId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("handwriting_gallery_likes")
          .insert({ user_id: user.id, item_id: vars.itemId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery-items"] });
      qc.invalidateQueries({ queryKey: ["my-gallery-likes"] });
    },
    onError: handleErr,
  });
}

export function useSubmitGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      file: File;
      figureName: string;
      title?: string;
      era?: string;
      region?: string;
      story?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const ext = vars.file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("handwriting-gallery")
        .upload(path, vars.file);
      if (upErr) throw upErr;
      const pub = { publicUrl: await getReadableUrl("handwriting-gallery", path) };
      const { data: item, error } = await supabase
        .from("handwriting_gallery_items")
        .insert({
          source_type: "user",
          submitter_user_id: user.id,
          figure_name: vars.figureName,
          title: vars.title ?? null,
          era: vars.era ?? null,
          region: vars.region ?? null,
          story: vars.story ?? null,
          image_url: pub.publicUrl,
          status: "pending",
        })
        .select()
        .single();
      if (error) throw error;
      // Auto-moderate via AI
      await invokeRouter("gallery-moderate", { itemId: item.id });
      return item;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery-items"] });
      qc.invalidateQueries({ queryKey: ["my-gallery-submissions"] });
      toast.success("Submission reviewed by AI — check 'My submissions'");
    },
    onError: handleErr,
  });
}

export function useGalleryTour(itemId: string | null) {
  const qc = useQueryClient();
  const history = useQuery({
    queryKey: ["gallery-tour-history", itemId],
    enabled: !!itemId,
    queryFn: async () => {
      if (!itemId) return [];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("handwriting_gallery_tour_chats")
        .select("*")
        .eq("user_id", user.id)
        .eq("item_id", itemId)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });
  const ask = useMutation({
    mutationFn: (vars: { message: string }) =>
      invokeRouter("gallery-tour", { itemId, message: vars.message }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery-tour-history", itemId] });
      qc.invalidateQueries({ queryKey: ["handwriting-credits"] });
    },
    onError: handleErr,
  });
  return { history, ask };
}
