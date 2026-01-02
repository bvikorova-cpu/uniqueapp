import { Users, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description?: string | null;
    cover_image?: string | null;
    is_private: boolean | null;
    creator_id: string;
    created_at: string;
    members_count?: number | null;
  };
  onJoin: (groupId: string) => void;
  onLeave: (groupId: string) => void;
  isMember: boolean;
}

export const GroupCard = ({ group, onJoin, onLeave, isMember }: GroupCardProps) => {
  const navigate = useNavigate();
  const memberCount = group.members_count || 0;

  const handleCardClick = () => {
    navigate(`/wall/groups/${group.id}`);
  };

  return (
    <div 
      className="glass-post-card overflow-hidden hover:scale-[1.02] transition-all duration-500 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Cover Image */}
      <div 
        className="h-32 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 relative"
        style={group.cover_image ? { backgroundImage: `url(${group.cover_image})`, backgroundSize: 'cover' } : {}}
      >
        {group.is_private && (
          <Badge className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm">
            <Lock className="w-3 h-3 mr-1" />
            Private
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary">
              {group.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {group.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{memberCount} members</span>
            </div>
          </div>
        </div>

        {group.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {group.description}
          </p>
        )}

        <Button
          onClick={(e) => {
            e.stopPropagation();
            isMember ? onLeave(group.id) : onJoin(group.id);
          }}
          variant={isMember ? "outline" : "default"}
          className="w-full"
        >
          {isMember ? "Leave Group" : "Join Group"}
        </Button>
      </div>
    </div>
  );
};
