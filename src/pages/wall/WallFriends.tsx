import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users2, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WallFriends() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

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

  // Get friend requests
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

      return friendships.map(f => ({
        ...f,
        profile: profiles?.find(p => p.id === f.user_id)
      }));
    },
    enabled: !!user,
  });

  const acceptFriendRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Friend request accepted",
    });
    
    refetchRequests();
    refetchFriends();
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("friendships")
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove friend",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Friend removed",
    });
    
    refetchFriends();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users2 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Friends</h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Friends ({friends.length})</TabsTrigger>
            <TabsTrigger value="requests">Friend Requests ({requests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {friends.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No friends yet. Start connecting with people!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friend) => (
                  <Card key={friend.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={friend.avatar_url || undefined} />
                          <AvatarFallback>{friend.full_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{friend.full_name}</p>
                          <p className="text-sm text-muted-foreground">Friend</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFriend(friend.id)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            {requests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No friend requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.profile?.avatar_url || undefined} />
                          <AvatarFallback>{request.profile?.full_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{request.profile?.full_name}</p>
                          <p className="text-sm text-muted-foreground">Friend request</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptFriendRequest(request.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
