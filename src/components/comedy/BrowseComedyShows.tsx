import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Mic, Users, Ticket, Zap, Star, PlayCircle, Sparkles, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useAICredits } from "@/hooks/useAICredits";

interface Props { onBack: () => void; }

export const BrowseComedyShows = ({ onBack }: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [myTickets, setMyTickets] = useState<Set<string>>(new Set());
  const { totalBalance, loadCredits } = useAICredits();
  const [buying, setBuying] = useState<string | null>(null);

  const loadMyTickets = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase
      .from("comedy_tickets")
      .select("show_id")
      .eq("user_id", session.user.id);
    setMyTickets(new Set((data || []).map((r: { show_id: string }) => r.show_id)));
  };

  useEffect(() => { void loadMyTickets(); }, []);

  const { data: shows, isLoading } = useQuery({
    queryKey: ["browse-comedy-shows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comedy_shows")
        .select(`*, comedian:comedian_profiles(stage_name, avatar_url, follower_count, is_verified, experience_level)`)
        .in("status", ["scheduled", "live"])
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000,
  });

  /** Tickets are paid in AI credits — atomic spend RPC keeps balance + ledger consistent. */
  const handleBuy = async (showId: string, price: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Please sign in to buy tickets"); return; }
    try {
      setBuying(showId);
      const { data: spend, error: spendErr } = await (supabase as any).rpc("spend_ai_credits", {
        _amount: price,
        _reason: "Comedy show ticket",
        _source: "comedy_ticket",
      });
      if (spendErr) throw spendErr;
      if (!spend?.ok) {
        toast.error("Not enough credits", {
          description: `This ticket costs ${price} credit${price === 1 ? "" : "s"}.`,
          action: { label: "Top up", onClick: () => navigate("/ai-credits") },
        });
        return;
      }

      const { error } = await supabase
        .from("comedy_tickets")
        .insert({ show_id: showId, user_id: session.user.id, price_paid: price });
      if (error) throw error;

      toast.success("Ticket purchased! Enjoy the show!");
      await loadMyTickets();
      await loadCredits();
      queryClient.invalidateQueries({ queryKey: ["browse-comedy-shows"] });
    } catch (e: any) {
      toast.error(e?.message || "Failed to buy ticket");
    } finally {
      setBuying(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Browse Shows works" steps={[
        { title: "Open this section", desc: "See every upcoming and live stand-up show." },
        { title: "Buy a ticket", desc: "Tickets are paid in comedy coins from your comedy wallet." },
        { title: "Watch live", desc: "When the comedian goes live, open the stream from here." },
        { title: "Support comedians", desc: "Send tips during the show — creators keep the majority." },
      ]} />
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Browse Shows
          </h2>
          <Badge variant="outline" className="gap-1 text-sm">
            <Coins className="h-3.5 w-3.5 text-amber-500" /> {currency?.coins ?? 0} coins
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : !shows || shows.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Mic className="mb-4 h-16 w-16 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">No shows scheduled yet</p>
              <p className="text-sm text-muted-foreground">Check back soon — or open Comedian Studio and host your own!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {shows.map((show: any) => {
              const owned = myTickets.has(show.id);
              return (
                <Card key={show.id} className="group overflow-hidden border transition-all hover:border-primary hover:shadow-2xl">
                  <div className="relative h-48 overflow-hidden">
                    {show.thumbnail_url || show.comedian?.avatar_url ? (
                      <img
                        src={show.thumbnail_url || show.comedian?.avatar_url}
                        alt={show.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20">
                        <Mic className="h-20 w-20 text-primary" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    {show.status === "live" && (
                      <Badge className="absolute left-4 top-4 animate-pulse bg-destructive shadow-lg">
                        <span className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                          </span>
                          LIVE NOW
                        </span>
                      </Badge>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white">
                          <AvatarImage src={show.comedian?.avatar_url} />
                          <AvatarFallback className="bg-primary">{show.comedian?.stage_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="flex items-center gap-1 font-bold">
                            {show.comedian?.stage_name}
                            {show.comedian?.is_verified && <BadgeCheck className="h-4 w-4 text-sky-400" />}
                          </h3>
                          {show.comedian?.experience_level && (
                            <Badge variant="secondary" className="text-xs capitalize">{show.comedian.experience_level}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{show.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="gap-1"><Calendar className="h-3 w-3" />{format(new Date(show.scheduled_at), "MMM d, HH:mm")}</Badge>
                      {show.viewer_count > 0 && <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />{show.viewer_count} watching</Badge>}
                      <Badge variant="outline" className="gap-1"><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />{show.duration_minutes} min</Badge>
                    </div>
                    {show.description && <p className="line-clamp-2 text-sm text-muted-foreground">{show.description}</p>}
                  </CardHeader>

                  <CardContent className="space-y-2">
                    {owned && show.status === "live" && (
                      <Button onClick={() => navigate(`/comedy-watch/${show.id}`)} className="w-full animate-pulse bg-destructive hover:bg-destructive/90">
                        <PlayCircle className="mr-2 h-4 w-4" />Watch Live Now
                      </Button>
                    )}
                    {owned && show.status !== "live" && (
                      <Button variant="outline" onClick={() => navigate(`/comedy-watch/${show.id}`)} className="w-full border-primary text-primary">
                        <Ticket className="mr-2 h-4 w-4" />Open show (ticket owned)
                      </Button>
                    )}
                    {!owned && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm font-bold uppercase">
                            <Ticket className="h-4 w-4 text-primary" /> Ticket
                          </span>
                          <Badge variant="secondary" className="gap-1 font-bold">
                            <Coins className="h-3 w-3" />{show.ticket_price_coins}
                          </Badge>
                        </div>
                        <Button size="sm" className="w-full" disabled={buying === show.id} onClick={() => handleBuy(show.id, show.ticket_price_coins)}>
                          {buying === show.id ? "Processing..." : <><Zap className="mr-2 h-4 w-4" />Get Ticket</>}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
