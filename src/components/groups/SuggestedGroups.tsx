import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroups } from "@/hooks/useGroups";

export const SuggestedGroups = () => {
  const { joinGroup } = useGroups();

  const { data: suggestedGroups, isLoading } = useQuery({
    queryKey: ["suggested-groups"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get groups user is not a member of
      let query = supabase
        .from("groups")
        .select("*, group_members(count)")
        .eq("is_private", false)
        .order("created_at", { ascending: false })
        .limit(5);

      if (user) {
        // Get user's group IDs
        const { data: userGroups } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("user_id", user.id);
        
        const userGroupIds = userGroups?.map(g => g.group_id) || [];
        
        if (userGroupIds.length > 0) {
          query = query.not("id", "in", `(${userGroupIds.join(",")})`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !suggestedGroups?.length) return null;

  return (
    <div className="glass-post-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Suggested Groups</h3>
      </div>
      <div className="space-y-3">
        {suggestedGroups.map((group) => (
          <div
            key={group.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
              {group.cover_image ? (
                <img
                  src={group.cover_image}
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{group.name}</p>
              <p className="text-xs text-muted-foreground">
                {(group.group_members as any)?.[0]?.count || 0} members
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => joinGroup(group.id)}
            >
              Join
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
