import { useState, useEffect } from "react";
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
import { Users, Plus, Search, Crown, Sparkles, LogOut, Globe, Lock, TrendingUp, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function WallGroups() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingGroupId, setPendingGroupId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"my" | "discover">("my");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

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
    queryKey: ["all-groups", debouncedSearch],
    queryFn: async () => {
      let query = supabase
        .from("groups")
        .select("*")
        .order("members_count", { ascending: false });
      if (debouncedSearch.trim()) {
        query = query.ilike("name", `%${debouncedSearch}%`);
      }
      const { data } = await query.limit(20);
      return data || [];
    },
  });

  const createGroup = async () => {
    if (!user || !newGroupName.trim() || isSubmitting) return;
    setIsSubmitting(true);
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
    "from-purple-600 via-violet-500 to-indigo-500",
    "from-blue-600 via-cyan-500 to-teal-400",
    "from-rose-500 via-pink-500 to-fuchsia-500",
    "from-emerald-500 via-green-500 to-lime-400",
    "from-orange-500 via-amber-500 to-yellow-400",
    "from-indigo-600 via-blue-500 to-sky-400",
  ];

  const discoverGroups = allGroups.filter(g => !myGroups.find(mg => mg.id === g.id));

  const GroupCard = ({ group, isMember, index = 0 }: { group: any; isMember: boolean; index?: number }) => {
    const grad = gradients[index % gradients.length];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.06, type: "spring", stiffness: 200 }}
        whileHover={{ y: -4 }}
      >
        <Card className="group overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer relative"
          onClick={() => navigate(`/wall/groups/${group.id}`)}
        >
          {/* Cover with pattern overlay */}
          <div className={`h-24 bg-gradient-to-br ${grad} relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            
            {isMember && (
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="absolute top-2 right-2"
              >
                <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 text-[10px] gap-1 shadow-lg">
                  <Crown className="w-3 h-3" /> Member
                </Badge>
              </motion.div>
            )}

            <div className="absolute -bottom-7 left-4">
              <div className="relative">
                <Avatar className="h-14 w-14 border-[3px] border-card shadow-xl ring-2 ring-primary/20">
                  <AvatarImage src={group.cover_image || undefined} />
                  <AvatarFallback className={`bg-gradient-to-br ${grad} text-white font-black text-lg`}>
                    {group.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-card" />
              </div>
            </div>
          </div>

          <CardContent className="pt-10 pb-4 px-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-black text-sm truncate group-hover:text-primary transition-colors">
                  {group.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" /> {group.members_count || 0} members
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Public
                  </span>
                </div>
                {group.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{group.description}</p>
                )}
              </div>
              {isMember ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs gap-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                  onClick={(e) => { e.stopPropagation(); leaveGroup(group.id); }}
                >
                  <LogOut className="w-3 h-3" /> Leave
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="shrink-0 text-xs gap-1 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-lg shadow-primary/20 active:scale-95 transition-all"
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
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-8 space-y-6">
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div 
              className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/30"
              whileHover={{ rotate: 5, scale: 1.05 }}
            >
              <Users className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Groups
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Connect with communities that share your interests</p>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 gap-2 shadow-xl shadow-primary/25 active:scale-[0.97] transition-all">
                <Plus className="h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="border-primary/20">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Create New Group
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold">Group Name</label>
                  <Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Enter group name" className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-bold">Description</label>
                  <Textarea value={newGroupDescription} onChange={(e) => setNewGroupDescription(e.target.value)} placeholder="What's your group about?" rows={3} className="mt-1.5" />
                </div>
                <Button onClick={createGroup} className="w-full bg-gradient-to-r from-primary to-accent text-white shadow-lg">
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Row */}
        <div className="relative flex items-center gap-6 mt-6">
          {[
            { icon: <Users className="w-4 h-4" />, label: "My Groups", value: myGroups.length },
            { icon: <Globe className="w-4 h-4" />, label: "Discover", value: discoverGroups.length },
            { icon: <TrendingUp className="w-4 h-4" />, label: "Total", value: allGroups.length },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{stat.icon}</div>
              <div>
                <p className="text-lg font-black">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex bg-muted/50 rounded-xl p-1 border border-border/50">
          {[
            { id: "my" as const, label: "My Groups", icon: <Crown className="w-3.5 h-3.5" /> },
            { id: "discover" as const, label: "Discover", icon: <Sparkles className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups..."
            className="pl-10 bg-muted/30 border-border/50"
          />
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "my" ? (
          <motion.div key="my" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {myGroups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myGroups.map((group, i) => (
                  <GroupCard key={group.id} group={group} isMember index={i} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                <CardContent className="py-16 text-center relative">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-5"
                  >
                    <Users className="h-10 w-10 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-black mb-2">No groups yet</h3>
                  <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
                    Join a community or create your own group to start connecting with like-minded people
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("discover")}
                      className="gap-2"
                    >
                      <Search className="w-4 h-4" /> Discover
                    </Button>
                    <Button 
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="gap-2 bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                    >
                      <Plus className="w-4 h-4" /> Create
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          <motion.div key="discover" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {discoverGroups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoverGroups.map((group, i) => (
                  <GroupCard key={group.id} group={group} isMember={false} index={i} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">No groups found</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
