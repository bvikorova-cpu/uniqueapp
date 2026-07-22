import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Users, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FollowButton } from "./FollowButton";

interface FollowersModalProps {
  userId: string;
  currentUserId?: string;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "followers" | "following";
}

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export const FollowersModal = ({ userId,
  currentUserId,
  isOpen,
  onClose,
  defaultTab = "followers" }: FollowersModalProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Fetch followers
  const { data: followers, isLoading: followersLoading } = useQuery({
    queryKey: ["followers-list", userId],
    queryFn: async () => {
      const { data: followsData, error: followsError } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId);

      if (followsError) throw followsError;

      const followerIds = followsData?.map((f) => f.follower_id) || [];

      if (followerIds.length === 0) return [];

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", followerIds);

      if (profilesError) throw profilesError;

      return profilesData as UserProfile[];
    },
    enabled: isOpen });

  // Fetch following
  const { data: following, isLoading: followingLoading } = useQuery({
    queryKey: ["following-list", userId],
    queryFn: async () => {
      const { data: followsData, error: followsError } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);

      if (followsError) throw followsError;

      const followingIds = followsData?.map((f) => f.following_id) || [];

      if (followingIds.length === 0) return [];

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", followingIds);

      if (profilesError) throw profilesError;

      return profilesData as UserProfile[];
    },
    enabled: isOpen });

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Connections</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">
              Followers ({followers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="following">
              Following ({following?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="mt-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {followersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !followers || followers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No followers yet</p>
                </div>
              ) : (
                followers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => handleUserClick(user.id)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {user.full_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {user.full_name || "User"}
                        </p>
                      </div>
                    </div>
                    <FollowButton
                      userId={user.id}
                      currentUserId={currentUserId}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="following" className="mt-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {followingLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !following || following.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Not following anyone yet</p>
                </div>
              ) : (
                following.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => handleUserClick(user.id)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {user.full_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {user.full_name || "User"}
                        </p>
                      </div>
                    </div>
                    <FollowButton
                      userId={user.id}
                      currentUserId={currentUserId}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
