import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Repeat2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import PostCard from "./PostCard";
import type { Repost } from "@/types/database";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface RepostCardProps {
  repost: Repost;
  onDelete: () => void;
}

const RepostCard = ({ repost, onDelete }: RepostCardProps) => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  const handleUserClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Do you really want to delete this repost?")) return;

    setDeleting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id !== repost.user_id) {
        toast({
          title: "Cannot delete",
          description: "You can only delete your own reposts",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("reposts").delete().eq("id", repost.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Repost was deleted",
      });

      onDelete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Repost Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Repost Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Repost Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="glass-post-card overflow-hidden group hover:-translate-y-1 border-l-4 border-l-blue-500">
      <div className="p-6 pb-4">
        {/* Repost Header */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar 
            className="h-10 w-10 ring-2 ring-primary/10 cursor-pointer hover:ring-primary/30 transition-all"
            onClick={(e) => handleUserClick(e, repost.user_id)}
          >
            <AvatarImage src={repost.profiles?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {repost.profiles?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Repeat2 className="h-4 w-4 text-blue-500" />
              <p 
                className="font-semibold text-base truncate cursor-pointer hover:underline" 
                onClick={(e) => handleUserClick(e, repost.user_id)}
              >
                {repost.profiles?.full_name || "User"}
              </p>
              <span className="text-muted-foreground text-sm">shared</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(repost.created_at), {
                addSuffix: true,
                locale: enUS,
              })}
            </p>
          </div>
          {currentUserId === repost.user_id && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={deleting}
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          )}
        </div>

        {/* Repost Comment */}
        {repost.comment && (
          <p className="text-base text-foreground mb-4 leading-relaxed whitespace-pre-wrap">
            {repost.comment}
          </p>
        )}
      </div>

      {/* Original Post */}
      <div className="px-6 pb-6">
        <div className="border rounded-lg overflow-hidden">
          <PostCard post={repost.original_post} onDelete={onDelete} />
        </div>
      </div>
    </div>
    </>
  );
};

export default RepostCard;
