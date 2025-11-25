import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WallGroups() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: myGroups = [], refetch: refetchGroups } = useQuery({
    queryKey: ["my-groups", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: memberships } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      if (!memberships || memberships.length === 0) return [];

      const groupIds = memberships.map(m => m.group_id);

      const { data: groups } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds);

      return groups || [];
    },
    enabled: !!user,
  });

  const { data: allGroups = [], refetch: refetchAllGroups } = useQuery({
    queryKey: ["all-groups", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("groups")
        .select("*")
        .order("members_count", { ascending: false });

      if (searchQuery.trim()) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data } = await query.limit(20);
      return data || [];
    },
  });

  const createGroup = async () => {
    if (!user || !newGroupName.trim()) return;

    const { data: group, error } = await supabase
      .from("groups")
      .insert({
        name: newGroupName,
        description: newGroupDescription,
        creator_id: user.id,
      })
      .select()
      .single();

    if (error || !group) {
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
      return;
    }

    // Add creator as first member
    await supabase
      .from("group_members")
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: "admin",
      });

    toast({
      title: "Success",
      description: "Group created successfully",
    });

    setIsCreateDialogOpen(false);
    setNewGroupName("");
    setNewGroupDescription("");
    refetchGroups();
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("group_members")
      .insert({
        group_id: groupId,
        user_id: user.id,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Joined group successfully",
    });

    refetchGroups();
    refetchAllGroups();
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to leave group",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Left group successfully",
    });

    refetchGroups();
    refetchAllGroups();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-4">
      <Card className="p-6 glass-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Groups</h2>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Group Name</label>
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="What's your group about?"
                    rows={3}
                  />
                </div>
                <Button onClick={createGroup} className="w-full">
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">My Groups ({myGroups.length})</h3>
          {myGroups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>You haven't joined any groups yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {myGroups.map((group) => (
                <Card 
                  key={group.id} 
                  className="p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div 
                      className="flex items-start gap-3 flex-1 cursor-pointer"
                      onClick={() => window.location.href = `/wall/groups/${group.id}`}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={group.cover_image || undefined} />
                        <AvatarFallback>{group.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{group.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {group.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {group.members_count} members
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => leaveGroup(group.id)}
                    >
                      Leave
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <h3 className="text-lg font-semibold mb-4">Discover Groups</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allGroups
              .filter(g => !myGroups.find(mg => mg.id === g.id))
              .map((group) => (
                <Card key={group.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={group.cover_image || undefined} />
                        <AvatarFallback>{group.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{group.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {group.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {group.members_count} members
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => joinGroup(group.id)}
                    >
                      Join
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
