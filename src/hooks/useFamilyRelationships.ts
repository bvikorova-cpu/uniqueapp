import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type FamilyRelationKind =
  | "spouse" | "partner" | "parent" | "child" | "sibling"
  | "grandparent" | "grandchild" | "cousin" | "in_law" | "other";

export interface FamilyRelationship {
  id: string;
  user_id: string;
  related_user_id: string;
  kind: FamilyRelationKind;
  status: "pending" | "confirmed" | "rejected";
  requested_by: string;
  created_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const KEY = ["family-relationships"] as const;

export function useFamilyRelationships(profileUserId: string | undefined) {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: [...KEY, profileUserId],
    enabled: !!profileUserId,
    queryFn: async (): Promise<FamilyRelationship[]> => {
      const { data, error } = await supabase
        .from("family_relationships")
        .select("*")
        .or(`user_id.eq.${profileUserId},related_user_id.eq.${profileUserId}`)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const otherIds = Array.from(
        new Set(
          (data ?? []).map((r: any) =>
            r.user_id === profileUserId ? r.related_user_id : r.user_id
          )
        )
      );
      if (otherIds.length === 0) return [];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", otherIds);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));

      return (data ?? []).map((r: any) => ({
        ...r,
        profile: map.get(
          r.user_id === profileUserId ? r.related_user_id : r.user_id
        ),
      })) as FamilyRelationship[];
    },
  });

  const propose = useMutation({
    mutationFn: async (args: {
      currentUserId: string;
      otherUserId: string;
      kind: FamilyRelationKind;
    }) => {
      const { error } = await supabase.from("family_relationships").insert({
        user_id: args.currentUserId,
        related_user_id: args.otherUserId,
        kind: args.kind,
        requested_by: args.currentUserId,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Family request sent");
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const setStatus = useMutation({
    mutationFn: async (args: {
      id: string;
      status: "confirmed" | "rejected";
    }) => {
      const { error } = await supabase
        .from("family_relationships")
        .update({ status: args.status })
        .eq("id", args.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("family_relationships")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  return { list, propose, setStatus, remove };
}
