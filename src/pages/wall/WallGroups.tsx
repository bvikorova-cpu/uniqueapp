import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Search, Crown, ArrowRight, Sparkles, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function WallGroups() {
  const navigate = useNavigate();
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
    try {
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({ name: newGroupName, description: newGroupDescription, creator_id: user.id })
        .select()
        .single();
      if (groupError || !group) {
        toast({ title: "Error", description: groupError?.message || "Failed to create group", variant: "destructive" });
        return;
      }
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({ group_id: group.id, user_id: user.id, role: "admin" });
      if (memberError) {
        toast({ title: "Error", description: "Group created but failed to add you as member", variant: "destructive" });
        return;
      }
      toast({ title: "Success", description: "Group created successfully" });
      setIsCreateDialogOpen(false);
      setNewGroupName("");
      setNewGroupDescription("");
      refetchGroups();
      refetchAllGroups();
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("group_members")
        .insert({ group_id: groupId, user_id: user.id, role: "member" });
      if (error) {
        toast({ title: "Error", description: error.message || "Failed to join group", variant: "destructive" });
        return;
      }
      toast({ title: "Success", description: "Joined group successfully" });
      refetchGroups();
      refetchAllGroups();
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);
      if (error) {
        toast({ title: "Error", description: error.message || "Failed to leave group", variant: "destructive" });
        return;
      }
      toast({ title: "Success", description: "Left group successfully" });
      refetchGroups();
      refetchAllGroups();
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  const gradients = [
    "from-primary to-accent",
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-violet-500",
  ];

  const GroupCard = ({ group, isMember, index = 0 }: { group: any; isMember: boolean; index?: number }) => {
    const grad = gradients[index % gradients.length];
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="group overflow-hidden border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
          onClick={() => navigate(`/wall/groups/${group.id}`)}
        >
          {/* Cover gradient */}
          <div className={`h-20 bg-gradient-to-br ${grad} relative`}>
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute -bottom-6 left-4">
              <Avatar className="h-14 w-14 border-4 border-card shadow-lg">
                <AvatarImage src={group.cover_image || undefined} />
                <AvatarFallback className={`bg-gradient-to-br ${grad} text-white font-bold text-lg`}>
                  {group.name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <CardContent className="pt-10 pb-4 px-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                  {group.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {group.members_count || 0} members
                </p>
                {group.description && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{group.description}</p>
                )}
              </div>
              {isMember ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs gap-1"
                  onClick={(e) => { e.stopPropagation(); leaveGroup(group.id); }}
                >
                  <LogOut className="w-3 h-3" /> Leave
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="shrink-0 text-xs gap-1 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                  onClick={(e) => { e.stopPropagation(); joinGroup(group.id); }}
                >
                  <Plus className="w-3 h-3" /> Join
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-8 space-y-8">
      {/* Hero header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Groups</h1>
            <p className="text-sm text-muted-foreground">Connect with communities</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="pl-10"
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 gap-2 shadow-lg">
                <Plus className="h-4 w-4" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Create New Group
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Group Name</label>
                  <Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Enter group name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={newGroupDescription} onChange={(e) => setNewGroupDescription(e.target.value)} placeholder="What's your group about?" rows={3} />
                </div>
                <Button onClick={createGroup} className="w-full bg-gradient-to-r from-primary to-accent text-white">
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* My Groups */}
      {myGroups.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">My Groups</h2>
            <Badge variant="secondary" className="text-xs">{myGroups.length}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myGroups.map((group, i) => (
              <GroupCard key={group.id} group={group} isMember index={i} />
            ))}
          </div>
        </section>
      )}

      {myGroups.length === 0 && (
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">No groups yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Join or create a group to start connecting</p>
          </CardContent>
        </Card>
      )}

      {/* Discover */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-bold">Discover Groups</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allGroups
            .filter(g => !myGroups.find(mg => mg.id === g.id))
            .map((group, i) => (
              <GroupCard key={group.id} group={group} isMember={false} index={i} />
            ))}
        </div>
        {allGroups.filter(g => !myGroups.find(mg => mg.id === g.id)).length === 0 && (
          <p className="text-center text-muted-foreground py-8">No groups found</p>
        )}
      </section>
    </div>
  );
}
