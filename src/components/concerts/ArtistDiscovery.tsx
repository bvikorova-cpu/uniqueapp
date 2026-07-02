import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Music, Star, Users, TrendingUp } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const ArtistDiscovery = ({ onBack }: Props) => {
  const { data: artists, isLoading } = useQuery({
    queryKey: ["discover-artists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("musician_profiles")
        .select("*")
        .order("followers_count", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <FloatingHowItWorks title="How Artist Discovery works" steps={[
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
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Artist Discovery</h2>
        <p className="text-muted-foreground text-sm mt-1">Explore talented musicians on our platform</p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : artists?.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Music className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No artists registered yet</p>
            <p className="text-sm text-muted-foreground">Be the first to register as a musician!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artists?.map((artist, i) => (
            <Card key={artist.id} className="group hover:shadow-xl transition-all border hover:border-primary overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20">
                {i < 3 && (
                  <Badge className="absolute top-3 right-3 bg-yellow-500/90 text-white">
                    #{i + 1} Top Artist
                  </Badge>
                )}
              </div>
              <CardContent className="-mt-10 relative z-10">
                <Avatar className="h-20 w-20 border-4 border-background mb-3">
                  <AvatarImage src={artist.avatar_url} />
                  <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">
                    {artist.stage_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-black text-lg">{artist.stage_name}</h3>
                {artist.genre && <Badge variant="secondary" className="mt-1">{artist.genre}</Badge>}
                {artist.bio && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{artist.bio}</p>}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-sm font-bold">{artist.total_concerts || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Shows</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold">{artist.total_earnings?.toFixed(0) || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Earned (€)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />{artist.total_concerts > 0 ? "★" : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
    );
};
