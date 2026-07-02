import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Music } from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const ConcertSchedule = ({ onBack }: Props) => {
  const { data: upcoming, isLoading } = useQuery({
    queryKey: ["concert-schedule"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_concert_streams")
        .select(`*, musician_profiles(stage_name, genre)`)
        .eq("status", "scheduled")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const getTimeLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    if (isThisWeek(d)) return "This Week";
    return format(d, "MMM d");
  };

  return (
    <>
      <FloatingHowItWorks title="How Concert Schedule works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>
      <div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Concert Schedule</h2>
        <p className="text-muted-foreground text-sm mt-1">Upcoming live performances</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : upcoming?.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No upcoming concerts</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {upcoming?.map((concert) => (
            <Card key={concert.id} className="hover:border-primary transition-all">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center border border-primary/20">
                  <span className="text-xs font-bold text-primary">{getTimeLabel(concert.scheduled_at)}</span>
                  <span className="text-lg font-black">{format(new Date(concert.scheduled_at), "HH:mm")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{concert.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs gap-1"><Music className="h-3 w-3" />{concert.musician_profiles?.stage_name}</Badge>
                    {concert.musician_profiles?.genre && <Badge variant="secondary" className="text-xs">{concert.musician_profiles.genre}</Badge>}
                  </div>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
    );
};
