import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGroups = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("*, profiles(*), group_members(count)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createGroup = useMutation({
    mutationFn: async ({
      name,
      description,
      isPrivate,
      coverImage,
    }: {
      name: string;
      description?: string;
      isPrivate?: boolean;
      coverImage?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
          name,
          description,
          is_private: isPrivate || false,
          cover_image: coverImage,
          creator_id: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: "admin",
        });

      if (memberError) throw memberError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({ title: "Group created!" });
    },
  });

  const joinGroup = useMutation({
    mutationFn: async (groupId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("group_members").insert({
        group_id: groupId,
        user_id: user.id,
        role: "member",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({ title: "Joined group!" });
    },
  });

  const leaveGroup = useMutation({
    mutationFn: async (groupId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({ title: "Left group" });
    },
  });

  return {
    groups: groups || [],
    isLoading,
    createGroup: createGroup.mutate,
    joinGroup: joinGroup.mutate,
    leaveGroup: leaveGroup.mutate,
  };
};
