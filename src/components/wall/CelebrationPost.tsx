import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, PartyPopper, Heart, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CelebrationPostProps {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  achievementTitle: string;
  achievementType: string;
  description: string;
  createdAt: string;
  congratulationsCount?: number;
  hasCongratulated?: boolean;
}

export const CelebrationPost = ({
  id,
  userId,
  userName,
  userAvatar,
  achievementTitle,
  achievementType,
  description,
  createdAt,
  congratulationsCount = 0,
  hasCongratulated = false,
}: CelebrationPostProps) => {
  const [congratCount, setCongratCount] = useState(congratulationsCount);
  const [hasCongrat, setHasCongrat] = useState(hasCongratulated);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  const getAchievementIcon = () => {
    switch (achievementType) {
      case 'winner':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'finalist':
        return <Star className="h-6 w-6 text-amber-500" />;
      case 'participant':
        return <PartyPopper className="h-6 w-6 text-purple-500" />;
      default:
        return <Sparkles className="h-6 w-6 text-primary" />;
    }
  };

  const getAchievementBadge = () => {
    switch (achievementType) {
      case 'winner':
        return { label: '🏆 Winner', className: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30' };
      case 'finalist':
        return { label: '⭐ Finalist', className: 'bg-amber-500/20 text-amber-600 border-amber-500/30' };
      case 'participant':
        return { label: '🎉 Participant', className: 'bg-purple-500/20 text-purple-600 border-purple-500/30' };
      default:
        return { label: '✨ Achievement', className: 'bg-primary/20 text-primary border-primary/30' };
    }
  };

  const handleCongratulate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login required",
          description: "Please login to congratulate",
          variant: "destructive",
        });
        return;
      }

      setIsAnimating(true);

      if (hasCongrat) {
        await supabase
          .from("celebration_congratulations")
          .delete()
          .eq("celebration_id", id)
          .eq("user_id", user.id);
        setHasCongrat(false);
        setCongratCount(prev => prev - 1);
      } else {
        await supabase
          .from("celebration_congratulations")
          .insert({ celebration_id: id, user_id: user.id });
        setHasCongrat(true);
        setCongratCount(prev => prev + 1);
      }

      setTimeout(() => setIsAnimating(false), 500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const badge = getAchievementBadge();

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl transition-all duration-500",
      "bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-500/10",
      "backdrop-blur-xl border border-yellow-500/20",
      "hover:border-yellow-500/40 hover:shadow-xl hover:shadow-yellow-500/10"
    )}>
      {/* Celebration Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-2 left-4 text-2xl animate-bounce delay-100">🎊</div>
        <div className="absolute top-8 right-8 text-xl animate-bounce delay-200">✨</div>
        <div className="absolute bottom-4 left-8 text-lg animate-bounce delay-300">🌟</div>
        <div className="absolute bottom-6 right-4 text-2xl animate-bounce delay-150">🎉</div>
        <div className="absolute top-1/2 left-1/4 text-sm animate-pulse">⭐</div>
        <div className="absolute top-1/3 right-1/4 text-sm animate-pulse delay-300">💫</div>
      </div>

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-yellow-500/30 shadow-lg">
            <AvatarImage src={userAvatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
              {userName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-lg">{userName}</span>
              <Badge variant="outline" className={cn("text-xs", badge.className)}>
                {badge.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: enUS })}
            </p>
          </div>

          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
            {getAchievementIcon()}
          </div>
        </div>

        {/* Achievement Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
            {achievementTitle}
          </h3>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {/* Congratulate Action */}
        <div className="flex items-center justify-between pt-2 border-t border-yellow-500/20">
          <span className="text-sm text-muted-foreground">
            {congratCount} {congratCount === 1 ? 'person' : 'people'} congratulated
          </span>
          
          <Button
            onClick={handleCongratulate}
            variant={hasCongrat ? "default" : "outline"}
            className={cn(
              "gap-2 transition-all duration-300",
              hasCongrat 
                ? "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-none" 
                : "border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10",
              isAnimating && "scale-110"
            )}
          >
            <PartyPopper className={cn("h-4 w-4", isAnimating && "animate-bounce")} />
            {hasCongrat ? "Congratulated!" : "Congratulate"}
          </Button>
        </div>
      </div>
    </div>
  );
};
