import { useNavigate } from "react-router-dom";
import { Sparkles, Hash, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSmartSuggestions } from "@/hooks/useSmartSuggestions";

export const SmartSuggestionsCard = () => {
  const navigate = useNavigate();
  const { suggestedUsers, suggestedHashtags, isLoading } = useSmartSuggestions(5);

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (suggestedUsers.length === 0 && suggestedHashtags.length === 0) return null;

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Discover</h3>
      </div>

      {suggestedUsers.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">People to follow</p>
          <div className="space-y-2">
            {suggestedUsers.slice(0, 3).map((u: any) => (
              <div key={u.id} className="flex items-center gap-2">
                <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate(`/profile/${u.id}`)}>
                  <AvatarImage src={u.avatar_url || undefined} />
                  <AvatarFallback>{u.full_name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => navigate(`/profile/${u.id}`)}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-sm font-medium truncate">{u.full_name || "Unknown"}</p>
                  {u.username && <p className="text-xs text-muted-foreground truncate">@{u.username}</p>}
                </button>
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => navigate(`/profile/${u.id}`)}>
                  <UserPlus className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestedHashtags.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Trending tags</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedHashtags.slice(0, 5).map((h: any) => (
              <button
                key={h.id}
                onClick={() => navigate(`/wall?hashtag=${h.tag}`)}
                className="inline-flex items-center gap-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded-full transition-colors"
              >
                <Hash className="h-3 w-3" />
                {h.tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
