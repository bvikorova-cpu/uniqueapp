import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGroups = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups, isLoading, error: queryError } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      console.log("Fetching groups...");
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching groups:", error);
        throw error;
      }
      console.log("Groups fetched:", data?.length);
      return data;
    },
  });

  if (queryError) {
    console.error("Query error:", queryError);
  }

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
      console.log("Creating group:", name);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        throw new Error("Not authenticated");
      }

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

      if (groupError) {
        console.error("Error creating group:", groupError);
        throw groupError;
      }
      console.log("Group created:", group);

      // Add creator as admin
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: "admin",
        });

      if (memberError) {
        console.error("Error adding creator as member:", memberError);
        throw memberError;
      }
      console.log("Creator added as admin");
      
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({ title: "Group created!" });
    },
    onError: (error: Error) => {
      console.error("Create group mutation error:", error);
      toast({ 
        title: "Error creating group", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const joinGroup = useMutation({
    mutationFn: async (groupId: string) => {
      console.log("Joining group:", groupId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        throw new Error("Not authenticated");
      }

      // Use upsert to avoid duplicate key errors if the user is already a member
      const { error } = await supabase.from("group_members").upsert(
        {
          group_id: groupId,
          user_id: user.id,
          role: "member",
        },
        {
          onConflict: "group_id,user_id",
          ignoreDuplicates: true,
        }
      );

      if (error) {
        console.error("Error joining group:", error);
        throw error;
      }
      console.log("Successfully joined group");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({ title: "Joined group!" });
    },
    onError: (error: Error) => {
      console.error("Join group mutation error:", error);
      toast({ 
        title: "Error joining group", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const leaveGroup = useMutation({
    mutationFn: async (groupId: string) => {
      console.log("Leaving group:", groupId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        throw new Error("Not authenticated");
      }

      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error leaving group:", error);
        throw error;
      }
      console.log("Successfully left group");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({ title: "Left group" });
    },
    onError: (error: Error) => {
      console.error("Leave group mutation error:", error);
      toast({ 
        title: "Error leaving group", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteGroup = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase.from("groups").delete().eq("id", groupId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({ title: "Group deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting group", description: error.message, variant: "destructive" });
    },
  });

  return {
    groups: groups || [],
    isLoading,
    createGroup: createGroup.mutate,
    joinGroup: joinGroup.mutate,
    leaveGroup: leaveGroup.mutate,
    deleteGroup: deleteGroup.mutate,
  };
};
