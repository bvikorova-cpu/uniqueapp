import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Check, X, Clock, Send, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useFriendships } from "@/hooks/useFriendships";

/**
 * Wall section listing friend requests — both received (accept / decline)
 * and sent (pending, with cancel).
 */
export function FriendRequestsSection() {
  const [userId, setUserId] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const { incoming, outgoing, accept, reject, cancelRequest } = useFriendships(userId);

  if (!userId) return null;

  const incomingList = (incoming.data ?? []) as any[];
  const outgoingList = (outgoing.data ?? []) as any[];

  if (incomingList.length === 0 && outgoingList.length === 0) return null;

  const initial = (p: any) => p?.full_name?.[0] ?? p?.username?.[0] ?? "?";
  const name = (p: any) => p?.full_name ?? p?.username ?? "User";

  return (
    <Card className="bg-card/80 backdrop-blur-md border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" />
          Friend requests
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            {incomingList.length + outgoingList.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-3">
        {incomingList.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1.5 flex items-center gap-1">
              <Inbox className="h-3 w-3" /> Received ({incomingList.length})
            </p>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2">
                {incomingList.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/40">
                    <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate(`/profile/${r.user_id}`)}>
                      <AvatarImage src={r.profile?.avatar_url ?? undefined} />
                      <AvatarFallback>{initial(r.profile)}</AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => navigate(`/profile/${r.user_id}`)}
                      className="flex-1 min-w-0 text-xs font-medium truncate text-left hover:underline"
                    >
                      {name(r.profile)}
                    </button>
                    <Button
                      size="sm"
                      className="h-7 px-2 text-[10px] gap-1"
                      onClick={() => accept.mutate(r.id)}
                      disabled={accept.isPending}
                    >
                      <Check className="h-3 w-3" /> Confirm
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      aria-label="Decline request"
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

        {outgoingList.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1.5 flex items-center gap-1">
              <Send className="h-3 w-3" /> Sent ({outgoingList.length})
            </p>
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-2">
                {outgoingList.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/40">
                    <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate(`/profile/${r.friend_id}`)}>
                      <AvatarImage src={r.profile?.avatar_url ?? undefined} />
                      <AvatarFallback>{initial(r.profile)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => navigate(`/profile/${r.friend_id}`)}
                        className="text-xs font-medium truncate block text-left hover:underline w-full"
                      >
                        {name(r.profile)}
                      </button>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" /> Pending
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[10px]"
                      onClick={() => cancelRequest.mutate(r.id)}
                      disabled={cancelRequest.isPending}
                    >
                      Cancel
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

export default FriendRequestsSection;
