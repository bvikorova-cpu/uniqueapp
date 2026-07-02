import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { sk } from "date-fns/locale";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface ViewersListProps {
  storyId: string;
  viewsCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StoryView {
  id: string;
  user_id: string;
  viewed_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  } | null;
}

export const ViewersList = ({ storyId, viewsCount, open, onOpenChange }: ViewersListProps) => {
  const { data: viewers = [], isLoading } = useQuery({
    queryKey: ["story-viewers", storyId],
    queryFn: async () => {
      const { data: views, error } = await supabase
        .from("story_views")
        .select("id, user_id, viewed_at")
        .eq("story_id", storyId)
        .order("viewed_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for all viewers
      const userIds = views?.map(v => v.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      // Combine views with profiles
      return (views || []).map(view => ({
        ...view,
        profiles: profiles?.find(p => p.id === view.user_id) || null,
      })) as StoryView[];
    },
    enabled: open,
  });

  return (
    <>
      <FloatingHowItWorks title="How Viewers List works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Seen by {viewsCount} {viewsCount === 1 ? "person" : viewsCount < 5 ? "people" : "people"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : viewers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No views yet</p>
          ) : (
            <div className="space-y-3">
              {viewers.map((view) => (
                <div key={view.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={view.profiles?.avatar_url} />
                    <AvatarFallback>
                      {view.profiles?.full_name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {view.profiles?.full_name || "Unknown user"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(view.viewed_at), {
                        addSuffix: true,
                        locale: sk,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
    </>
    );
};
