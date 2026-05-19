import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users2, UserPlus, UserMinus, Loader2, ChevronRight, X, Check, Search, Heart, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  profile: Profile | null;
  mutual_count: number;
}

interface FriendSuggestion {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  mutual_count: number;
}

export default function WallFriends() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [friendSearch, setFriendSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalResults, setGlobalResults] = useState<Profile[]>([]);
  const [searchingGlobal, setSearchingGlobal] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Global search across all profiles (debounced)
  useState(() => null);
  // Inline effect via useQuery would re-run; we use a simple async on change instead.
  const runGlobalSearch = async (q: string) => {
    setGlobalSearch(q);
    if (!q.trim() || q.trim().length < 2) { setGlobalResults([]); return; }
    setSearchingGlobal(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, username")
        .or(`full_name.ilike.%${q}%,username.ilike.%${q}%`)
        .limit(15);
      setGlobalResults((data || []) as any);
    } finally {
      setSearchingGlobal(false);
    }
  };

  const { data: friends = [], refetch: refetchFriends } = useQuery({
    queryKey: ["friends", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: friendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "accepted");
      const friendIds = friendships?.map((f) =>
        f.user_id === user.id ? f.friend_id : f.user_id
      ) || [];
      if (friendIds.length === 0) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", friendIds);
      return profiles || [];
    },
    enabled: !!user,
  });

  const { data: requests = [], refetch: refetchRequests } = useQuery({
    queryKey: ["friend-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: friendships } = await supabase
        .from("friendships")
        .select("id, user_id, friend_id, created_at")
        .eq("friend_id", user.id)
        .eq("status", "pending");
      if (!friendships || friendships.length === 0) return [];
      const userIds = friendships.map(f => f.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);
      const requestsWithMutual = await Promise.all(friendships.map(async (f) => {
        const { data: requesterFriends } = await supabase
          .from("friendships")
          .select("user_id, friend_id")
          .or(`user_id.eq.${f.user_id},friend_id.eq.${f.user_id}`)
          .eq("status", "accepted");
        const requesterFriendIds = requesterFriends?.map(rf =>
          rf.user_id === f.user_id ? rf.friend_id : rf.user_id
        ) || [];
        const myFriendIds = friends.map(friend => friend.id);
        const mutualCount = requesterFriendIds.filter(id => myFriendIds.includes(id)).length;
        return { ...f, profile: profiles?.find(p => p.id === f.user_id) || null, mutual_count: mutualCount };
      }));
      return requestsWithMutual as FriendRequest[];
    },
    enabled: !!user && friends.length >= 0,
  });

  const { data: suggestions = [] } = useQuery({
    queryKey: ["friend-suggestions", user?.id, friends],
    queryFn: async () => {
      if (!user || friends.length === 0) return [];
      const friendIds = friends.map(f => f.id);
      const { data: friendsOfFriends } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(friendIds.map(id => `user_id.eq.${id}`).join(',') + ',' + friendIds.map(id => `friend_id.eq.${id}`).join(','))
        .eq("status", "accepted");
      if (!friendsOfFriends) return [];
      const suggestionIds = new Set<string>();
      const mutualCountMap: Record<string, number> = {};
      friendsOfFriends.forEach(fof => {
        const potentialFriendId = friendIds.includes(fof.user_id) ? fof.friend_id : fof.user_id;
        if (potentialFriendId === user.id || friendIds.includes(potentialFriendId)) return;
        suggestionIds.add(potentialFriendId);
        mutualCountMap[potentialFriendId] = (mutualCountMap[potentialFriendId] || 0) + 1;
      });
      if (suggestionIds.size === 0) return [];
      const { data: existingRequests } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "pending");
      const pendingIds = new Set(existingRequests?.map(r =>
        r.user_id === user.id ? r.friend_id : r.user_id
      ) || []);
      const filteredIds = Array.from(suggestionIds).filter(id => !pendingIds.has(id));
      if (filteredIds.length === 0) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", filteredIds)
        .limit(20);
      return (profiles || []).map(p => ({
        ...p,
        mutual_count: mutualCountMap[p.id] || 0
      })).sort((a, b) => b.mutual_count - a.mutual_count) as FriendSuggestion[];
    },
    enabled: !!user,
  });

  const acceptMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Request accepted", description: "You are now friends" });
      refetchRequests(); refetchFriends();
      queryClient.invalidateQueries({ queryKey: ["friend-suggestions"] });
    },
    onError: () => { toast({ title: "Error", description: "Failed to accept request", variant: "destructive" }); }
  });

  const declineMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: "Request declined" }); refetchRequests(); },
    onError: () => { toast({ title: "Error", description: "Failed to decline request", variant: "destructive" }); }
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("friendships").insert({ user_id: user.id, friend_id: targetUserId, status: "pending" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Request sent", description: "Waiting for acceptance" });
      queryClient.invalidateQueries({ queryKey: ["friend-suggestions"] });
    },
    onError: () => { toast({ title: "Error", description: "Failed to send request", variant: "destructive" }); }
  });

  const [hiddenSuggestions, setHiddenSuggestions] = useState<string[]>([]);
  const removeSuggestion = (id: string) => setHiddenSuggestions(prev => [...prev, id]);

  const visibleSuggestions = suggestions.filter(s => !hiddenSuggestions.includes(s.id));
  const displayedRequests = showAllRequests ? requests : requests.slice(0, 8);
  const displayedSuggestions = showAllSuggestions ? visibleSuggestions : visibleSuggestions.slice(0, 12);

  const filteredFriends = friends.filter(f =>
    !friendSearch.trim() || f.full_name?.toLowerCase().includes(friendSearch.toLowerCase())
  );

  const gradients = [
    "from-purple-600 via-violet-500 to-indigo-500",
    "from-blue-600 via-cyan-500 to-teal-400",
    "from-rose-500 via-pink-500 to-fuchsia-500",
    "from-emerald-500 via-green-500 to-lime-400",
    "from-orange-500 via-amber-500 to-yellow-400",
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-8 space-y-6">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/15 via-primary/10 to-accent/5 border border-primary/20 p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-500/15 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500 to-primary shadow-xl shadow-pink-500/30" whileHover={{ rotate: -5, scale: 1.05 }}>
              <Users2 className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-foreground via-pink-500 to-primary bg-clip-text text-transparent">Friends</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Manage your connections & discover new people</p>
            </div>
          </div>
        </div>
        <div className="relative flex items-center justify-between sm:justify-start sm:gap-6 mt-6">
          {[
            { icon: <Users2 className="w-4 h-4" />, label: "Friends", value: friends.length },
            { icon: <UserPlus className="w-4 h-4" />, label: "Requests", value: requests.length },
            { icon: <Sparkles className="w-4 h-4" />, label: "Tips", value: visibleSuggestions.length },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{stat.icon}</div>
              <div>
                <p className="text-lg font-black">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Friend Requests */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black">Friend Requests</h2>
            {requests.length > 0 && (
              <Badge className="bg-destructive text-destructive-foreground text-xs">{requests.length}</Badge>
            )}
          </div>
          {requests.length > 8 && (
            <Button variant="link" className="text-primary text-xs" onClick={() => setShowAllRequests(!showAllRequests)}>
              {showAllRequests ? "Show less" : "See all"}
            </Button>
          )}
        </div>

        {requests.length === 0 ? (
          <Card className="border-dashed border-2 border-border/50 bg-card/50">
            <CardContent className="py-10 text-center">
              <UserPlus className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No pending friend requests</p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-4">
              {displayedRequests.map((request, i) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="flex-shrink-0 w-[180px] overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-xl transition-all duration-300">
                    <div className={`h-16 bg-gradient-to-br ${gradients[i % gradients.length]} relative`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                    <div className="px-3 pb-3 -mt-6 relative">
                      <Avatar className="h-12 w-12 border-[3px] border-card shadow-lg">
                        <AvatarImage src={request.profile?.avatar_url || undefined} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 font-bold">
                          {request.profile?.full_name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-sm truncate mt-2">{request.profile?.full_name || "Unknown"}</h3>
                      {request.mutual_count > 0 && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Users2 className="h-2.5 w-2.5" /> {request.mutual_count} mutual
                        </p>
                      )}
                      <div className="space-y-1.5 mt-2">
                        <Button size="sm" className="w-full text-xs bg-gradient-to-r from-primary to-accent text-white shadow-md active:scale-95"
                          onClick={() => acceptMutation.mutate(request.id)} disabled={acceptMutation.isPending}>
                          {acceptMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Check className="h-3 w-3 mr-1" /> Confirm</>}
                        </Button>
                        <Button size="sm" variant="outline" className="w-full text-xs"
                          onClick={() => declineMutation.mutate(request.id)} disabled={declineMutation.isPending}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </section>

      {/* People You May Know */}
      {visibleSuggestions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-black">People You May Know</h2>
            </div>
            {visibleSuggestions.length > 12 && (
              <Button variant="link" className="text-primary text-xs" onClick={() => setShowAllSuggestions(!showAllSuggestions)}>
                {showAllSuggestions ? "Show less" : "See all"}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {displayedSuggestions.map((suggestion, i) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-xl transition-all duration-300 group">
                  <div className={`h-14 bg-gradient-to-br ${gradients[i % gradients.length]} relative`}>
                    <button onClick={() => removeSuggestion(suggestion.id)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/30 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                  <div className="px-2.5 pb-3 -mt-5 relative">
                    <Avatar className="h-10 w-10 border-[2px] border-card shadow-md">
                      <AvatarImage src={suggestion.avatar_url || undefined} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-sm font-bold">
                        {suggestion.full_name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-xs truncate mt-1.5">{suggestion.full_name || "Unknown"}</h3>
                    {suggestion.mutual_count > 0 && (
                      <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                        <Users2 className="h-2 w-2" /> {suggestion.mutual_count} mutual
                      </p>
                    )}
                    <Button size="sm" className="w-full mt-2 text-[10px] h-7 gap-1 bg-gradient-to-r from-primary to-accent text-white shadow-sm active:scale-95"
                      onClick={() => sendRequestMutation.mutate(suggestion.id)} disabled={sendRequestMutation.isPending}>
                      {sendRequestMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><UserPlus className="h-3 w-3" /> Add</>}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* All Friends */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-black">All Friends</h2>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">{friends.length}</Badge>
          </div>
        </div>
        {friends.length > 5 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={friendSearch} onChange={(e) => setFriendSearch(e.target.value)} placeholder="Search friends..." className="pl-10 bg-muted/30 border-border/50" />
          </div>
        )}
        {filteredFriends.length === 0 ? (
          <Card className="border-dashed border-2 border-border/50 bg-card/50">
            <CardContent className="py-10 text-center">
              <Users2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{friendSearch ? "No friends match your search" : "No friends yet"}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Start connecting with people!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredFriends.map((friend, i) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -3 }}
              >
                <Card className="overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/profile/${friend.id}`)}>
                  <div className={`h-14 bg-gradient-to-br ${gradients[i % gradients.length]} relative`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  <div className="px-2.5 pb-3 -mt-5 relative">
                    <Avatar className="h-10 w-10 border-[2px] border-card shadow-md">
                      <AvatarImage src={friend.avatar_url || undefined} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-sm font-bold">
                        {friend.full_name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-xs truncate mt-1.5">{friend.full_name || "Unknown"}</h3>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
