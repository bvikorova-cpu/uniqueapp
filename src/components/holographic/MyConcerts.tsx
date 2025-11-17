import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Music, Calendar, Clock, Play, Loader2, Ticket } from "lucide-react";
import { format } from "date-fns";
import ConcertPlayer from "./ConcertPlayer";

const MyConcerts = () => {
  const [concerts, setConcerts] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConcert, setSelectedConcert] = useState<any>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConcerts();
  }, []);

  const loadConcerts = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-user-concerts');
      if (error) throw error;

      setConcerts(data.concerts || []);
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const upcomingConcerts = concerts.filter(c => new Date(c.concert_date) > new Date());
  const myTickets = tickets.map(t => t.concert);

  const handleWatchConcert = (concert: any) => {
    const hasTicket = myTickets.find(t => t?.id === concert.id);
    if (!hasTicket) {
      toast({
        title: "Ticket Required",
        description: "Please purchase a ticket to watch this concert",
        variant: "destructive",
      });
      return;
    }
    setSelectedConcert(concert);
    setPlayerOpen(true);
  };

  const handleGetTicket = () => {
    // Scroll to marketplace section at bottom
    const marketplace = document.querySelector('[data-marketplace]');
    if (marketplace) {
      marketplace.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    toast({
      title: "Purchase Concert Ticket",
      description: "Scroll down to purchase Premium Concert Ticket (€150)",
    });
  };

  return (
    <>
      <ConcertPlayer
        concert={selectedConcert}
        open={playerOpen}
        onClose={() => {
          setPlayerOpen(false);
          setSelectedConcert(null);
        }}
      />
      
    <div className="space-y-8">
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Music className="w-6 h-6 text-purple-400" />
            Upcoming Holographic Concerts
          </CardTitle>
          <CardDescription>
            Experience legendary artists brought back to life
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingConcerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No upcoming concerts available yet
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingConcerts.map((concert) => (
                <Card key={concert.id} className="border-purple-500/30 overflow-hidden">
                  {concert.thumbnail_url && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={concert.thumbnail_url} 
                        alt={concert.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4 space-y-3">
                    {concert.is_live && (
                      <Badge className="bg-red-500 text-white mb-2 animate-pulse">
                        🔴 LIVE NOW
                      </Badge>
                    )}

                    <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      {concert.title}
                    </h3>
                    <p className="text-sm font-medium text-purple-300">{concert.artist_name}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>{format(new Date(concert.concert_date), 'MMMM d, yyyy')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>{concert.duration_minutes} minutes</span>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                      onClick={() => {
                        const hasTicket = myTickets.find(t => t?.id === concert.id);
                        if (hasTicket) {
                          handleWatchConcert(concert);
                        } else {
                          handleGetTicket();
                        }
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {myTickets.find(t => t?.id === concert.id) ? 'Watch Concert' : 'Get Ticket'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {myTickets.length > 0 && (
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-950/10 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Ticket className="w-6 h-6 text-purple-400" />
              My Concert Tickets
            </CardTitle>
            <CardDescription>
              Your purchased concert tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="border-purple-500/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-purple-400">{ticket.concert?.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(ticket.purchase_date), 'PPP')}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        {ticket.ticket_type}
                      </Badge>
                    </div>
                    <Button size="sm">View Details</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
};

export default MyConcerts;
