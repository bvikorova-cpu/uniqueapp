import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import PostCard from "@/components/feed/PostCard";

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  reposts_count: number;
  media: Array<{
    id: string;
    file_url: string;
    file_type: string;
  }>;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        navigate("/wall");
        return;
      }

      try {
        setLoading(true);

        // Fetch post with media
        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select(`*, media (*)`)
          .eq("id", id)
          .single();

        if (postError) throw postError;

        if (!postData) {
          toast({
            title: "Post not found",
            description: "The post you're looking for doesn't exist",
            variant: "destructive",
          });
          navigate("/wall");
          return;
        }

        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", postData.user_id)
          .single();

        setPost({
          ...postData,
          profiles: profileData || {
            id: postData.user_id,
            full_name: null,
            avatar_url: null,
          },
        });
      } catch (error: any) {
        toast({
          title: "Error loading post",
          description: error.message,
          variant: "destructive",
        });
        navigate("/wall");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Card>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/wall")}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Button>

        {/* Post detail */}
        <PostCard
          post={post}
          onDelete={() => navigate("/wall")}
          defaultShowComments
        />

      </div>
    </div>
  );
};

export default PostDetail;
