import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, Loader2, Calendar, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MeetGreetScheduler = () => {
  const [artistName, setArtistName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [booking, setBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  const checkAccessAndLoad = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('has_holographic_access', {
        user_id_param: session.user.id,
        service_type_param: 'vip_meet_greet'
      });

      if (!error) {
        setHasAccess(data);
        if (data) await loadSessions();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-user-concerts');
      if (error) throw error;
      setSessions(data.meetGreets || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleBook = async () => {
    if (!artistName || !selectedDate) {
      toast({
        title: "Missing Information",
        description: "Please select an artist and date",
        variant: "destructive",
      });
      return;
    }

    try {
      setBooking(true);

      const { data, error } = await supabase.functions.invoke('book-meet-greet', {
        body: { artistName, scheduledAt: selectedDate }
      });

      if (error) throw error;

      toast({
        title: "Session Booked! 🎉",
        description: `Your VIP meet & greet with ${artistName} is scheduled`,
      });

      setArtistName("");
      setSelectedDate("");
      await loadSessions();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Booking Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-950/10 to-background">
        <CardContent className="py-12 text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto" />
          <h3 className="text-xl font-semibold">VIP Access Required</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Purchase "VIP Holographic Meet & Greet" to book sessions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="w-6 h-6 text-purple-400" />
            VIP Meet & Greet Scheduler
          </CardTitle>
          <CardDescription>
            Book your private holographic session with legendary artists
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Artist</Label>
            <Select value={artistName} onValueChange={setArtistName}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an artist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Freddie Mercury">Freddie Mercury</SelectItem>
                <SelectItem value="Elvis Presley">Elvis Presley</SelectItem>
                <SelectItem value="Michael Jackson">Michael Jackson</SelectItem>
                <SelectItem value="Whitney Houston">Whitney Houston</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Date & Time</Label>
            <input
              type="datetime-local"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <Button 
            onClick={handleBook}
            disabled={booking}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
          >
            {booking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Book VIP Session
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {sessions.length > 0 && (
        <Card className="border-purple-500/20">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card key={session.id} className="border-purple-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-purple-400">{session.artist_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.scheduled_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Duration: {session.duration_minutes} minutes
                        </p>
                      </div>
                      <Button size="sm">Join Session</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MeetGreetScheduler;
