import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users2, UserPlus, UserMinus, Loader2, ChevronRight, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

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

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Get all friends
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

  // Get friend requests with mutual friends count
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

      // Get mutual friends count for each requester
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

        return {
          ...f,
          profile: profiles?.find(p => p.id === f.user_id) || null,
          mutual_count: mutualCount
        };
      }));

      return requestsWithMutual as FriendRequest[];
    },
    enabled: !!user && friends.length >= 0,
  });

  // Get friend suggestions (friends of friends who are not yet friends)
  const { data: suggestions = [] } = useQuery({
    queryKey: ["friend-suggestions", user?.id, friends],
    queryFn: async () => {
      if (!user || friends.length === 0) return [];
      
      const friendIds = friends.map(f => f.id);
      
      // Get friends of friends
      const { data: friendsOfFriends } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(friendIds.map(id => `user_id.eq.${id}`).join(',') + ',' + friendIds.map(id => `friend_id.eq.${id}`).join(','))
        .eq("status", "accepted");

      if (!friendsOfFriends) return [];

      // Collect all potential suggestions
      const suggestionIds = new Set<string>();
      const mutualCountMap: Record<string, number> = {};

      friendsOfFriends.forEach(fof => {
        const potentialFriendId = friendIds.includes(fof.user_id) ? fof.friend_id : fof.user_id;
        
        // Skip if it's the current user or already a friend
        if (potentialFriendId === user.id || friendIds.includes(potentialFriendId)) return;
        
        suggestionIds.add(potentialFriendId);
        mutualCountMap[potentialFriendId] = (mutualCountMap[potentialFriendId] || 0) + 1;
      });

      if (suggestionIds.size === 0) return [];

      // Check for existing pending requests
      const { data: existingRequests } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "pending");

      const pendingIds = new Set(existingRequests?.map(r => 
        r.user_id === user.id ? r.friend_id : r.user_id
      ) || []);

      // Filter out pending requests
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

  // Accept friend request mutation
  const acceptMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Žiadosť prijatá", description: "Teraz ste priateľmi" });
      refetchRequests();
      refetchFriends();
      queryClient.invalidateQueries({ queryKey: ["friend-suggestions"] });
    },
    onError: () => {
      toast({ title: "Chyba", description: "Nepodarilo sa prijať žiadosť", variant: "destructive" });
    }
  });

  // Decline friend request mutation
  const declineMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Žiadosť odmietnutá" });
      refetchRequests();
    },
    onError: () => {
      toast({ title: "Chyba", description: "Nepodarilo sa odmietnuť žiadosť", variant: "destructive" });
    }
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase
        .from("friendships")
        .insert({ user_id: user.id, friend_id: targetUserId, status: "pending" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Žiadosť odoslaná", description: "Čakáme na prijatie" });
      queryClient.invalidateQueries({ queryKey: ["friend-suggestions"] });
    },
    onError: () => {
      toast({ title: "Chyba", description: "Nepodarilo sa odoslať žiadosť", variant: "destructive" });
    }
  });

  // Remove from suggestions
  const [hiddenSuggestions, setHiddenSuggestions] = useState<string[]>([]);
  const removeSuggestion = (id: string) => {
    setHiddenSuggestions(prev => [...prev, id]);
  };

  const visibleSuggestions = suggestions.filter(s => !hiddenSuggestions.includes(s.id));
  const displayedRequests = showAllRequests ? requests : requests.slice(0, 8);
  const displayedSuggestions = showAllSuggestions ? visibleSuggestions : visibleSuggestions.slice(0, 12);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Friend Requests Section */}
      <Card className="p-6 bg-card/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Žiadosti o priateľstvo</h2>
          {requests.length > 8 && (
            <Button 
              variant="link" 
              className="text-primary hover:text-primary/80"
              onClick={() => setShowAllRequests(!showAllRequests)}
            >
              {showAllRequests ? "Skryť" : "Zobraziť všetky"}
            </Button>
          )}
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Žiadne nové žiadosti o priateľstvo</p>
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {displayedRequests.map((request) => (
                <Card 
                  key={request.id} 
                  className="flex-shrink-0 w-[200px] overflow-hidden border border-border/50 hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-secondary/20 to-primary/10">
                    <Avatar className="w-full h-full rounded-none">
                      <AvatarImage 
                        src={request.profile?.avatar_url || undefined} 
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-none text-4xl bg-gradient-to-br from-primary/20 to-secondary/20">
                        {request.profile?.full_name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="font-semibold text-sm truncate text-foreground">
                      {request.profile?.full_name || "Neznámy používateľ"}
                    </h3>
                    {request.mutual_count > 0 && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users2 className="h-3 w-3" />
                        {request.mutual_count} spoločných priateľov
                      </p>
                    )}
                    <div className="space-y-1.5">
                      <Button 
                        size="sm" 
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => acceptMutation.mutate(request.id)}
                        disabled={acceptMutation.isPending}
                      >
                        {acceptMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Potvrdiť"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full"
                        onClick={() => declineMutation.mutate(request.id)}
                        disabled={declineMutation.isPending}
                      >
                        Odstrániť
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}

        {requests.length > 8 && !showAllRequests && (
          <div className="flex justify-center mt-4">
            <Button 
              variant="ghost" 
              className="text-primary"
              onClick={() => setShowAllRequests(true)}
            >
              Zobraziť viac <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </Card>

      {/* People You May Know Section */}
      <Card className="p-6 bg-card/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Ľudia, ktorých možno poznáte</h2>
          {visibleSuggestions.length > 12 && (
            <Button 
              variant="link" 
              className="text-primary hover:text-primary/80"
              onClick={() => setShowAllSuggestions(!showAllSuggestions)}
            >
              {showAllSuggestions ? "Skryť" : "Zobraziť všetky"}
            </Button>
          )}
        </div>

        {visibleSuggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Žiadne návrhy priateľov</p>
            <p className="text-sm mt-2">Pridajte si viac priateľov, aby sme vám mohli navrhnúť ďalších</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayedSuggestions.map((suggestion) => (
              <Card 
                key={suggestion.id} 
                className="overflow-hidden border border-border/50 hover:shadow-lg transition-shadow group"
              >
                <div className="relative aspect-square bg-gradient-to-br from-secondary/20 to-primary/10">
                  <Avatar className="w-full h-full rounded-none">
                    <AvatarImage 
                      src={suggestion.avatar_url || undefined} 
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-none text-4xl bg-gradient-to-br from-primary/20 to-secondary/20">
                      {suggestion.full_name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => removeSuggestion(suggestion.id)}
                    className="absolute top-2 right-2 p-1 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="font-semibold text-sm truncate text-foreground">
                    {suggestion.full_name || "Neznámy používateľ"}
                  </h3>
                  {suggestion.mutual_count > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users2 className="h-3 w-3" />
                      {suggestion.mutual_count} spoločných priateľov
                    </p>
                  )}
                  <div className="space-y-1.5">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => sendRequestMutation.mutate(suggestion.id)}
                      disabled={sendRequestMutation.isPending}
                    >
                      {sendRequestMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Pridať
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-foreground"
                      onClick={() => removeSuggestion(suggestion.id)}
                    >
                      Odstrániť
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* All Friends Section */}
      <Card className="p-6 bg-card/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Všetci priatelia ({friends.length})</h2>
        </div>

        {friends.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Zatiaľ nemáte žiadnych priateľov</p>
            <p className="text-sm mt-2">Začnite sa spájať s ľuďmi!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {friends.map((friend) => (
              <Card 
                key={friend.id} 
                className="overflow-hidden border border-border/50 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/profile/${friend.id}`)}
              >
                <div className="relative aspect-square bg-gradient-to-br from-secondary/20 to-primary/10">
                  <Avatar className="w-full h-full rounded-none">
                    <AvatarImage 
                      src={friend.avatar_url || undefined} 
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-none text-4xl bg-gradient-to-br from-primary/20 to-secondary/20">
                      {friend.full_name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate text-foreground">
                    {friend.full_name || "Neznámy používateľ"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Priateľ</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
