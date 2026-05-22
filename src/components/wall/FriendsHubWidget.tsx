import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Users, Check, X, Sparkles, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useFriendships } from "@/hooks/useFriendships";

export function FriendsHubWidget() {
  const [userId, setUserId] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const { friends, incoming, suggestions, accept, reject, sendRequest } =
    useFriendships(userId);

  if (!userId) return null;

  const friendsList = friends.data ?? [];
  const incomingList = incoming.data ?? [];
  const suggestionList = suggestions.data ?? [];

  if (friendsList.length === 0 && incomingList.length === 0 && suggestionList.length === 0) return null;

  return (
    <Card className="bg-card/80 backdrop-blur-md border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Friends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3">
        {friendsList.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1.5 flex items-center gap-1">
              <UserCheck className="h-3 w-3" /> My friends ({friendsList.length})
            </p>
            <ScrollArea className="max-h-[220px]">
              <div className="space-y-2">
                {friendsList.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/40"
                  >
                    <Avatar
                      className="h-8 w-8 cursor-pointer"
                      onClick={() => navigate(`/profile/${friend.id}`)}
                    >
                      <AvatarImage src={friend.avatar_url ?? undefined} />
                      <AvatarFallback>
                        {friend.full_name?.[0] ?? friend.username?.[0] ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => navigate(`/profile/${friend.id}`)}
                      className="flex-1 text-xs font-medium truncate text-left hover:underline"
                    >
                      {friend.full_name ?? friend.username ?? "User"}
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {incomingList.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1.5 flex items-center gap-1">
              <UserPlus className="h-3 w-3" /> Requests ({incomingList.length})
            </p>
            <ScrollArea className="max-h-[200px]">
              <div className="space-y-2">
                {incomingList.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/40"
                  >
                    <Avatar
                      className="h-8 w-8 cursor-pointer"
                      onClick={() => navigate(`/profile/${r.user_id}`)}
                    >
                      <AvatarImage src={r.profile?.avatar_url ?? undefined} />
                      <AvatarFallback>
                        {r.profile?.full_name?.[0] ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => navigate(`/profile/${r.user_id}`)}
                      className="flex-1 text-xs font-medium truncate text-left hover:underline"
                    >
                      {r.profile?.full_name ?? "User"}
                    </button>
                    <Button
                      size="icon"
                      variant="default"
                      className="h-7 w-7"
                      onClick={() => accept.mutate(r.id)}
                      disabled={accept.isPending}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => reject.mutate(r.id)}
                      disabled={reject.isPending}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {suggestionList.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1.5 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> People you may know
            </p>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2">
                {suggestionList.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/40"
                  >
                    <Avatar
                      className="h-8 w-8 cursor-pointer"
                      onClick={() => navigate(`/profile/${s.id}`)}
                    >
                      <AvatarImage src={s.avatar_url ?? undefined} />
                      <AvatarFallback>
                        {s.full_name?.[0] ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => navigate(`/profile/${s.id}`)}
                        className="text-xs font-medium truncate block text-left hover:underline w-full"
                      >
                        {s.full_name ?? "User"}
                      </button>
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1 py-0 h-3.5"
                      >
                        {s.mutual_count} mutual
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[10px]"
                      onClick={() => sendRequest.mutate(s.id)}
                      disabled={sendRequest.isPending}
                    >
                      <UserPlus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
