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

// ---------- TIME CAPSULE ----------
export function useCapsuleEntries() {
  return useQuery({
    queryKey: ["capsule-entries"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("handwriting_time_capsule")
        .select("*")
        .eq("user_id", user.id)
        .order("captured_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUploadCapsuleEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { file: File; label?: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in required");
      const ext = vars.file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("handwriting-capsule")
        .upload(path, vars.file, { upsert: false });
      if (upErr) throw upErr;
      const pub = { publicUrl: await getReadableUrl("handwriting-capsule", path) };
      const { data: row, error } = await supabase
        .from("handwriting_time_capsule")
        .insert({
          user_id: user.id,
          image_url: pub.publicUrl,
          label: vars.label ?? null,
          notes: vars.notes ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return row;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["capsule-entries"] });
      toast.success("Snapshot saved to your capsule");
    },
    onError: handleErr,
  });
}

export function useDeleteCapsuleEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("handwriting_time_capsule").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["capsule-entries"] });
      toast.success("Entry removed");
    },
    onError: handleErr,
  });
}

export function useCapsuleDiff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { entryAId: string; entryBId: string }) =>
      invokeRouter("capsule-diff", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["handwriting-credits"] });
      toast.success("Evolution diff ready");
    },
    onError: handleErr,
  });
}

// ---------- LIVE INK ----------
export function useLiveInkAnalyze() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      strokes: any[];
      durationMs: number;
      pressureAvg?: number;
      speedAvg?: number;
    }) => invokeRouter("live-ink-analyze", vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["handwriting-credits"] });
      toast.success("Live reading ready");
    },
    onError: handleErr,
  });
}
