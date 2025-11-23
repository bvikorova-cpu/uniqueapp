import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, ThumbsUp } from "lucide-react";

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description: string | null;
    video_url: string;
    thumbnail_url: string | null;
    views_count?: number | null;
    view_count?: number | null;
    likes_count?: number | null;
    like_count?: number | null;
    created_at: string;
    profiles?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  };
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <Card className="overflow-hidden">
      <video
        src={video.video_url}
        controls
        className="w-full aspect-video bg-black"
        poster={video.thumbnail_url || undefined}
      />
      
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={video.profiles?.avatar_url || undefined} />
            <AvatarFallback>
              {video.profiles?.full_name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base line-clamp-2">
              {video.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {video.profiles?.full_name || "Unknown User"}
            </p>
          </div>
        </div>

        {video.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {video.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{video.views_count || video.view_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{video.likes_count || video.like_count || 0}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
