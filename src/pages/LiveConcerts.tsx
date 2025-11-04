import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Music, Users, Ticket, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const LiveConcerts = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const { data: concerts, isLoading } = useQuery({
    queryKey: ["live-concerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_concert_streams")
        .select(`
          *,
          musician_profiles(stage_name, genre, avatar_url),
          concert_ticket_types(*)
        `)
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
      
      if (!session) {
        toast.error("Please sign in to buy tickets");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-concert-ticket-checkout", {
        body: { concertId, ticketTypeId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecting to checkout...");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create checkout");
    } finally {
      setLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Music className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Exclusive Live Concerts
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Watch your favorite musicians perform live in exclusive virtual concerts
        </p>
      </div>

      {concerts?.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Music className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg mb-2">No concerts scheduled yet</p>
            <p className="text-sm text-muted-foreground">Check back soon for upcoming shows!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {concerts?.map((concert) => (
            <Card key={concert.id} className="overflow-hidden hover:shadow-xl transition-all border-2">
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                {concert.musician_profiles?.avatar_url ? (
                  <img
                    src={concert.musician_profiles.avatar_url}
                    alt={concert.musician_profiles.stage_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music className="h-20 w-20 text-primary" />
                )}
                {concert.status === "live" && (
                  <Badge className="absolute top-4 right-4 bg-destructive animate-pulse">
                    🔴 LIVE NOW
                  </Badge>
                )}
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{concert.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Users className="h-4 w-4" />
                      <span className="font-semibold">{concert.musician_profiles?.stage_name}</span>
                      {concert.musician_profiles?.genre && (
                        <>
                          <span>•</span>
                          <span>{concert.musician_profiles.genre}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(concert.scheduled_at), "PPp")}</span>
                </div>
              </CardHeader>

              <CardContent>
                {concert.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {concert.description}
                  </p>
                )}

                <div className="space-y-3">
                  {concert.concert_ticket_types?.map((ticket: any) => (
                    <div
                      key={ticket.id}
                      className={`p-4 rounded-lg border-2 ${
                        ticket.name === "vip"
                          ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/50"
                          : "bg-muted/50 border-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {ticket.name === "vip" ? (
                            <Crown className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <Ticket className="h-5 w-5 text-primary" />
                          )}
                          <span className="font-bold uppercase text-sm">
                            {ticket.name} Ticket
                          </span>
                        </div>
                        <Badge variant={ticket.name === "vip" ? "default" : "secondary"}>
                          €{ticket.price.toFixed(2)}
                        </Badge>
                      </div>
                      {ticket.description && (
                        <p className="text-xs text-muted-foreground mb-3">
                          {ticket.description}
                        </p>
                      )}
                      <Button
                        onClick={() => handleBuyTicket(concert.id, ticket.id)}
                        disabled={loading === ticket.id}
                        className="w-full"
                        variant={ticket.name === "vip" ? "default" : "secondary"}
                      >
                        {loading === ticket.id ? (
                          "Processing..."
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Buy {ticket.name.toUpperCase()} Ticket
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                {concert.viewer_count > 0 && (
                  <div className="mt-4 pt-4 border-t flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{concert.viewer_count} watching now</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveConcerts;
