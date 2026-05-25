import { useState, useEffect } from "react";
import { useGroups } from "@/hooks/useGroups";
import { GroupCard } from "./GroupCard";
import { CreateGroupDialog } from "@/components/wall/CreateGroupDialog";
import { SuggestedGroups } from "./SuggestedGroups";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const GroupsList = () => {
  const { groups, isLoading, joinGroup, leaveGroup, deleteGroup } = useGroups();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userGroups, setUserGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchUserGroups = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        const { data } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("user_id", user.id);
        
        if (data) {
          setUserGroups(new Set(data.map(m => m.group_id)));
        }
      }
    };

    fetchUserGroups();
  }, [groups]);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Groups
          </h1>
        </div>
        <CreateGroupDialog />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 glass-card"
        />
      </div>

      {/* Suggestions */}
      <SuggestedGroups />

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            onJoin={joinGroup}
            onLeave={leaveGroup}
            isMember={userGroups.has(group.id)}
          />
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12 glass-post-card">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {searchQuery ? "No groups found" : "No groups yet. Create one to get started!"}
          </p>
        </div>
      )}
    </div>
  );
};
