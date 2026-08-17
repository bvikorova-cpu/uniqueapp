import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Loader2, Coffee } from "lucide-react";
import { CoffeeChat } from "./CoffeeChat";

interface ChatRow {
  matchId: string;
  otherId: string;
  name: string;
  avatar: string | null;
  createdAt: string;
}

/** Open coffee chats created by right-swipes (✓). */
export const CoffeeChatsList = () => {
  const [chatMatchId, setChatMatchId] = useState<string | null>(null);

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["coffee-chats"],
    queryFn: async (): Promise<ChatRow[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: matches, error } = await supabase
        .from("coffee_matches")
        .select("id,user1_id,user2_id,created_at,status")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq("status", "accepted")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const rows = (matches ?? []).map((m: any) => ({
        matchId: m.id as string,
        otherId: (m.user1_id === user.id ? m.user2_id : m.user1_id) as string,
        createdAt: m.created_at as string,
      }));
      if (rows.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id,full_name,avatar_url")
        .in("id", rows.map((r) => r.otherId));

      const byId = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      return rows.map((r) => ({
        ...r,
        name: byId.get(r.otherId)?.full_name || "Coffee lover",
        avatar: byId.get(r.otherId)?.avatar_url ?? null,
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-amber-500/20">
        <Coffee className="h-10 w-10 text-amber-400 mx-auto mb-3" />
        <h3 className="font-bold mb-1">No chats yet</h3>
        <p className="text-sm text-muted-foreground">Swipe ✓ on someone to open a coffee chat.</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {chats.map((c) => (
          <Card
            key={c.matchId}
            className="p-4 flex items-center gap-3 bg-card/80 backdrop-blur-xl border-amber-500/20"
          >
            <Avatar className="h-11 w-11">
              <AvatarImage src={c.avatar ?? undefined} alt={c.name} />
              <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{c.name}</p>
              <p className="text-xs text-muted-foreground">
                Coffee chat since {new Date(c.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Button size="sm" onClick={() => setChatMatchId(c.matchId)}>
              <MessageCircle className="h-4 w-4 mr-1.5" /> Open
            </Button>
          </Card>
        ))}
      </div>

      <CoffeeChat
        matchId={chatMatchId}
        open={!!chatMatchId}
        onOpenChange={(o) => {
          if (!o) setChatMatchId(null);
        }}
      />
    </>
  );
};
