import { Heart, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface PageCardProps {
  page: {
    id: string;
    name: string;
    description?: string | null;
    category?: string | null;
    cover_image_url?: string | null;
    avatar_url?: string | null;
    user_id: string;
    created_at: string;
    follower_count?: number | null;
  };
  onFollow: (pageId: string) => void;
  onUnfollow: (pageId: string) => void;
  isFollowing: boolean;
}

export const PageCard = ({ page, onFollow, onUnfollow, isFollowing }: PageCardProps) => {
  const navigate = useNavigate();
  const followerCount = page.follower_count || 0;

  const handleCardClick = () => {
    navigate(`/wall/pages/${page.id}`);
  };

  return (
    <>
      <FloatingHowItWorks title={"Page Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Page Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Page Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div 
      className="glass-post-card overflow-hidden hover:scale-[1.02] transition-all duration-500 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Cover Image */}
      <div 
        className="h-32 bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 relative"
        style={page.cover_image_url ? { backgroundImage: `url(${page.cover_image_url})`, backgroundSize: 'cover' } : {}}
      >
        {page.category && (
          <Badge className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm capitalize">
            {page.category}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12 border-2 border-accent/20">
            <AvatarImage src={page.avatar_url || undefined} />
            <AvatarFallback className="bg-accent/10 text-accent">
              {page.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {page.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4" />
              <span>{followerCount} followers</span>
            </div>
          </div>
        </div>

        {page.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {page.description}
          </p>
        )}

        <Button
          onClick={(e) => {
            e.stopPropagation();
            if (isFollowing) onUnfollow(page.id); else onFollow(page.id);
          }}
          variant={isFollowing ? "outline" : "default"}
          className="w-full"
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      </div>
    </div>
    </>
  );
};
