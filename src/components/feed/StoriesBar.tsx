import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface StoryUser {
  user_id: string;
  story_count: number;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export default function StoriesBar() {
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });

  // Get users with active stories
  const { data: storyUsers = [] } = useQuery({
    queryKey: ["story-users"],
    queryFn: async () => {
      if (!currentUser) return [];

      // Get friends
      const { data: friendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(`user_id.eq.${currentUser.id},friend_id.eq.${currentUser.id}`)
        .eq("status", "accepted");

      const friendIds = friendships?.map((f) =>
        f.user_id === currentUser.id ? f.friend_id : f.user_id
      );

      // Get stories
      const { data: stories } = await supabase
        .from("stories")
        .select("user_id")
        .in("user_id", [...(friendIds || []), currentUser.id])
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString());

      // Get unique user IDs with stories
      const userIds = [...new Set(stories?.map((s) => s.user_id) || [])];

      // Get profiles for these users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      // Count stories per user
      const userMap = new Map<string, StoryUser>();
      stories?.forEach((story) => {
        if (userMap.has(story.user_id)) {
          userMap.get(story.user_id)!.story_count++;
        } else {
          const profile = profiles?.find((p) => p.id === story.user_id);
          userMap.set(story.user_id, {
            user_id: story.user_id,
            story_count: 1,
            profiles: profile ? {
              full_name: profile.full_name || "",
              avatar_url: profile.avatar_url || "",
            } : undefined,
          });
        }
      });

      return Array.from(userMap.values());
    },
    enabled: !!currentUser,
  });

  // Check if current user has stories
  const { data: hasOwnStory } = useQuery({
    queryKey: ["own-story", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return false;

      const { data } = await supabase
        .from("stories")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .limit(1);

      return (
    <>
      <FloatingHowItWorks title={"Stories Bar - How it works"} steps={[{ title: 'Open', desc: 'Access the Stories Bar section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Stories Bar.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      data?.length || 0
    </>
  ) > 0;
    },
    enabled: !!currentUser,
  });

  return (
    <ScrollArea className="w-full whitespace-nowrap border-b">
      <div className="flex gap-4 p-4">
        {/* Add story button or view own story */}
        <button
          onClick={() => {
            if (hasOwnStory) {
              navigate(`/stories/${currentUser?.id}`);
            } else {
              // Open create story dialog
              document.getElementById("create-story-trigger")?.click();
            }
          }}
          className="flex flex-col items-center gap-2 min-w-[80px] group"
        >
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={currentUser?.user_metadata?.avatar_url} />
              <AvatarFallback>{currentUser?.user_metadata?.full_name?.[0]}</AvatarFallback>
            </Avatar>
            {!hasOwnStory && (
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
                <Plus className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>
          <span className="text-xs text-center font-medium truncate w-full">
            {hasOwnStory ? "Your Story" : "Add"}
          </span>
        </button>

        {/* Friends' stories */}
        {storyUsers
          .filter((u) => u.user_id !== currentUser?.id)
          .map((user) => (
            <button
              key={user.user_id}
              onClick={() => navigate(`/stories/${user.user_id}`)}
              className="flex flex-col items-center gap-2 min-w-[80px] group"
            >
              <Avatar className="h-16 w-16 border-2 border-primary ring-2 ring-primary/20">
                <AvatarImage src={user.profiles?.avatar_url} />
                <AvatarFallback>{user.profiles?.full_name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-center font-medium truncate w-full">
                {user.profiles?.full_name}
              </span>
            </button>
          ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
