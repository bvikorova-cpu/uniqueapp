import { Users, Lock, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  onDelete?: (groupId: string) => void;
  isMember: boolean;
  isCreator?: boolean;
}

export const GroupCard = ({ group, onJoin, onLeave, onDelete, isMember, isCreator }: GroupCardProps) => {
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

        {isCreator ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                onClick={(e) => e.stopPropagation()}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Group
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{group.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the group and remove all members. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete?.(group.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
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
        )}
      </div>
    </div>
  );
};
