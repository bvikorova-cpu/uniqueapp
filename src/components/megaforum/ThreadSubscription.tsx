import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ThreadSubscriptionProps {
  postId: string;
  userId: string | undefined;
}

export const ThreadSubscription = ({ postId, userId }: ThreadSubscriptionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: isSubscribed } = useQuery({
    queryKey: ["forum-sub", postId, userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data } = await (supabase as any)
        .from("forum_subscriptions")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!userId,
  });

  const toggleSub = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Login required");
      if (isSubscribed) {
        await (supabase as any).from("forum_subscriptions").delete().eq("post_id", postId).eq("user_id", userId);
      } else {
        await (supabase as any).from("forum_subscriptions").insert({ post_id: postId, user_id: userId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-sub", postId] });
      toast({ title: isSubscribed ? "Unsubscribed" : "Subscribed to thread" });
    },
  });

  if (!userId) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleSub.mutate()}
      className={`h-7 text-xs ${isSubscribed ? "text-primary" : ""}`}
      title={isSubscribed ? "Unsubscribe" : "Subscribe to replies"}
    >
      {isSubscribed ? <BellOff className="h-3.5 w-3.5 mr-1" /> : <Bell className="h-3.5 w-3.5 mr-1" />}
      {isSubscribed ? "Following" : "Follow"}
    </Button>
  );
};
