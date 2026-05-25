import { useState, useEffect, useMemo } from "react";
import { useGroups } from "@/hooks/useGroups";
import { GroupCard } from "./GroupCard";
import { CreateGroupDialog } from "@/components/wall/CreateGroupDialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Users, Compass } from "lucide-react";
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
        if (data) setUserGroups(new Set(data.map(m => m.group_id)));
      }
    };
    fetchUserGroups();
  }, [groups]);

  const filtered = useMemo(
    () =>
      groups.filter(
        (g) =>
          g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [groups, searchQuery]
  );

  const myGroups = filtered.filter(
    (g) => userGroups.has(g.id) || g.creator_id === currentUserId
  );
  const discoverGroups = filtered.filter(
    (g) => !userGroups.has(g.id) && g.creator_id !== currentUserId && !g.is_private
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const renderGrid = (list: typeof groups, emptyMsg: string) =>
    list.length ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            onJoin={joinGroup}
            onLeave={leaveGroup}
            onDelete={deleteGroup}
            isMember={userGroups.has(group.id)}
            isCreator={currentUserId === group.creator_id}
          />
        ))}
      </div>
    ) : (
      <div className="text-center py-12 glass-post-card">
        <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">{emptyMsg}</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Groups
          </h1>
        </div>
        <CreateGroupDialog />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 glass-card"
        />
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="discover" className="gap-2">
            <Compass className="w-4 h-4" />
            Discover ({discoverGroups.length})
          </TabsTrigger>
          <TabsTrigger value="mine" className="gap-2">
            <Users className="w-4 h-4" />
            My Groups ({myGroups.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-6">
          {renderGrid(
            discoverGroups,
            searchQuery ? "No groups match your search" : "No public groups to discover yet"
          )}
        </TabsContent>

        <TabsContent value="mine" className="mt-6">
          {renderGrid(
            myGroups,
            "You haven't joined any groups yet. Discover some above!"
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
