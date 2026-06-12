import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Music, Users, Crown, Ticket, Zap, Star, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props { onBack: () => void; }

export const BrowseConcerts = ({ onBack }: Props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [myTickets, setMyTickets] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("concert_ticket_purchases")
        .select("concert_id")
        .eq("user_id", session.user.id)
        .eq("payment_status", "completed");
      setMyTickets(new Set((data || []).map((r: any) => r.concert_id)));
    })();
  }, []);

  const { data: concerts, isLoading } = useQuery({
    queryKey: ["browse-concerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_concert_streams")
        .select(`*, musician_profiles(stage_name, genre, avatar_url, total_earnings, total_concerts), concert_ticket_types(*)`)
        .in("status", ["scheduled", "live"])
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const handleBuyTicket = async (concertId: string, ticketTypeId: string) => {
    try {
      setLoading(ticketTypeId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in to buy tickets"); return; }
      const { data, error } = await supabase.functions.invoke("create-concert-ticket-checkout", {
        body: { concertId, ticketTypeId },
      });
      if (error) throw error;
      if (data?.url) { window.open(data.url, "_blank"); toast.success("Redirecting to checkout..."); }
    } catch (error: any) {
      toast.error(error.message || "Failed to create checkout");
    } finally { setLoading(null); }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>
      <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
        Browse Concerts
      </h2>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-72 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : concerts?.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Music className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No concerts scheduled yet</p>
            <p className="text-sm text-muted-foreground">Check back soon for upcoming exclusive shows!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {concerts?.map((concert) => (
            <Card key={concert.id} className="group overflow-hidden hover:shadow-2xl transition-all border hover:border-primary">
              <div className="relative h-48 overflow-hidden">
                {concert.musician_profiles?.avatar_url ? (
                  <img src={concert.musician_profiles.avatar_url} alt={concert.musician_profiles.stage_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Music className="h-20 w-20 text-primary" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                {concert.status === "live" && (
                  <Badge className="absolute top-4 left-4 bg-destructive animate-pulse shadow-lg">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-white" /></span>
                      LIVE NOW
                    </div>
                  </Badge>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarImage src={concert.musician_profiles?.avatar_url} />
                      <AvatarFallback className="bg-primary">{concert.musician_profiles?.stage_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold">{concert.musician_profiles?.stage_name}</h3>
                      {concert.musician_profiles?.genre && <Badge variant="secondary" className="text-xs">{concert.musician_profiles.genre}</Badge>}
                    </div>
                  </div>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{concert.title}</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="gap-1"><Calendar className="h-3 w-3" />{format(new Date(concert.scheduled_at), "MMM d, HH:mm")}</Badge>
                  {concert.viewer_count > 0 && <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />{concert.viewer_count} watching</Badge>}
                  <Badge variant="outline" className="gap-1"><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />Exclusive</Badge>
                </div>
                {concert.description && <p className="text-sm text-muted-foreground line-clamp-2">{concert.description}</p>}
              </CardHeader>
              <CardContent className="space-y-2">
                {myTickets.has(concert.id) && concert.status === "live" && (
                  <Button onClick={() => navigate(`/concert-watch/${concert.id}`)} className="w-full bg-destructive hover:bg-destructive/90 animate-pulse">
                    <PlayCircle className="h-4 w-4 mr-2" />Watch Live Now
                  </Button>
                )}
                {myTickets.has(concert.id) && concert.status !== "live" && (
                  <Button variant="outline" onClick={() => navigate(`/concert-watch/${concert.id}`)} className="w-full">
                    <Ticket className="h-4 w-4 mr-2" />Your ticket (waiting room)
                  </Button>
                )}
                {!myTickets.has(concert.id) && concert.concert_ticket_types?.map((ticket: any) => (
                  <div key={ticket.id} className={`p-3 rounded-xl border transition-all ${ticket.name === "vip" ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30" : "bg-primary/5 border-primary/20"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {ticket.name === "vip" ? <Crown className="h-4 w-4 text-yellow-500" /> : <Ticket className="h-4 w-4 text-primary" />}
                        <span className="font-bold uppercase text-sm">{ticket.name}</span>
                      </div>
                      <Badge variant={ticket.name === "vip" ? "default" : "secondary"} className="font-bold">€{ticket.price.toFixed(2)}</Badge>
                    </div>
                    <Button onClick={() => handleBuyTicket(concert.id, ticket.id)} disabled={loading === ticket.id}
                      className={`w-full ${ticket.name === "vip" ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" : ""}`} size="sm">
                      {loading === ticket.id ? "Processing..." : <><Zap className="h-4 w-4 mr-2" />Get Ticket</>}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
