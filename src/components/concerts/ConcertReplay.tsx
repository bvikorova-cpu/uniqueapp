import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PlayCircle, Calendar, Music } from "lucide-react";
import { format } from "date-fns";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const ConcertReplay = ({ onBack }: Props) => {
  const { data: pastConcerts, isLoading } = useQuery({
    queryKey: ["past-concerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_concert_streams")
        .select(`*, musician_profiles(stage_name, genre, avatar_url)`)
        .eq("status", "ended")
        .order("scheduled_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <FloatingHowItWorks title="How Concert Replay works" steps={[
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
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Concert Replays</h2>
        <p className="text-muted-foreground text-sm mt-1">Relive the best performances</p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : pastConcerts?.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <PlayCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No replays available yet</p>
            <p className="text-sm text-muted-foreground">Past concerts will appear here once shows conclude</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pastConcerts?.map((concert) => (
            <Card key={concert.id} className="group hover:shadow-xl transition-all border hover:border-primary overflow-hidden">
              <div className="relative h-40 bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center">
                <PlayCircle className="h-16 w-16 text-primary/60 group-hover:text-primary group-hover:scale-110 transition-all" />
                <Badge className="absolute top-3 right-3 bg-card/70 backdrop-blur-sm">Replay</Badge>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{concert.title}</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="gap-1 text-xs"><Music className="h-3 w-3" />{concert.musician_profiles?.stage_name}</Badge>
                  <Badge variant="outline" className="gap-1 text-xs"><Calendar className="h-3 w-3" />{format(new Date(concert.scheduled_at), "MMM d, yyyy")}</Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
    );
};
