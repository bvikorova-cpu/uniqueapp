import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  postId: string;
  onShare?: () => void;
}

export const ShareButton = ({ postId, onShare }: ShareButtonProps) => {
  const [open, setOpen] = useState(false);
  const [shareText, setShareText] = useState("");
  const [sharing, setSharing] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    setSharing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create a new post that references the original
      const { data: newPost, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: shareText.trim(),
          privacy: "public",
        })
        .select()
        .single();

      if (postError) throw postError;

      // Create share record
      const { error: shareError } = await supabase
        .from("post_shares")
        .insert({
          user_id: user.id,
          original_post_id: postId,
          shared_post_id: newPost.id,
          share_text: shareText.trim(),
        });

      if (shareError) throw shareError;

      toast({ title: "Post shared!" });
      setOpen(false);
      setShareText("");
      onShare?.();
    } catch (error: any) {
      toast({ 
        title: "Failed to share", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Add your thoughts..."
            value={shareText}
            onChange={(e) => setShareText(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleShare} 
            disabled={sharing}
            className="w-full"
          >
            {sharing ? "Sharing..." : "Share to Timeline"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
