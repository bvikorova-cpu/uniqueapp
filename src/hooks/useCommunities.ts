import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCommunities = () => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: communities = [], isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .order("member_count", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const createCommunity = useMutation({
    mutationFn: async (input: { slug: string; name: string; description?: string; is_nsfw?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("communities")
        .insert({ ...input, creator_id: user.id })
        .select()
        .single();
      if (error) throw error;
      // auto-join creator
      await supabase.from("community_members").insert({ community_id: data.id, user_id: user.id });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["communities"] });
      toast({ title: "Community created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const join = useMutation({
    mutationFn: async (communityId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("community_members")
        .insert({ community_id: communityId, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["communities"] }),
  });

  return { communities, isLoading, createCommunity: createCommunity.mutate, join: join.mutate };
};
