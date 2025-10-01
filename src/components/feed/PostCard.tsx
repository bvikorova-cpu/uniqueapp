import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Image as ImageIcon, Video } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { sk } from "date-fns/locale";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    media: Array<{
      id: string;
      file_url: string;
      file_type: string;
    }>;
  };
  onDelete: () => void;
}

const PostCard = ({ post, onDelete }: PostCardProps) => {
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm("Naozaj chceš zmazať tento príspevok?")) return;

    setDeleting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id !== post.user_id) {
        toast({
          title: "Nie je možné zmazať",
          description: "Môžeš mazať len vlastné príspevky",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("posts").delete().eq("id", post.id);

      if (error) throw error;

      toast({
        title: "Úspech",
        description: "Príspevok bol zmazaný",
      });

      onDelete();
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
              locale: sk,
            })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      {post.content && (
        <p className="text-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
      )}

      {post.media && post.media.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {post.media.map((media) => (
            <div
              key={media.id}
              className="rounded-lg overflow-hidden bg-secondary"
            >
              {media.file_type === "image" ? (
                <img
                  src={media.file_url}
                  alt="Post media"
                  className="w-full h-auto"
                />
              ) : (
                <video
                  src={media.file_url}
                  controls
                  className="w-full h-auto"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default PostCard;
