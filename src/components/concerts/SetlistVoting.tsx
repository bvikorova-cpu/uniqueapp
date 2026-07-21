import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ThumbsUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }
interface Song { id: string; title: string; artist: string; votes: number; }

export const SetlistVoting = ({ onBack }: Props) => {
  const [localVotes, setLocalVotes] = useState<Record<string, number>>({});
  const [voted, setVoted] = useState<string[]>([]);

  const { data: baseSongs = [], isLoading } = useQuery({
    queryKey: ["setlist-voting-songs"],
    queryFn: async (): Promise<Song[]> => {
      const { data, error } = await supabase
        .from("concert_song_requests")
        .select("song_title, artist_name")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) return [];
      const tally = new Map<string, Song>();
      (data ?? []).forEach((r: any) => {
        const key = `${(r.song_title || "").toLowerCase()}::${(r.artist_name || "").toLowerCase()}`;
        const existing = tally.get(key);
        if (existing) existing.votes += 1;
        else tally.set(key, { id: key, title: r.song_title || "Untitled", artist: r.artist_name || "Unknown", votes: 1 });
      });
      return Array.from(tally.values()).sort((a, b) => b.votes - a.votes).slice(0, 20);
    },
    staleTime: 60_000,
  });

  const songs = useMemo(() =>
    baseSongs
      .map(s => ({ ...s, votes: s.votes + (localVotes[s.id] || 0) }))
      .sort((a, b) => b.votes - a.votes),
    [baseSongs, localVotes]);

  const handleVote = (songId: string) => {
    if (voted.includes(songId)) { toast.error("Already voted for this song"); return; }
    setLocalVotes(prev => ({ ...prev, [songId]: (prev[songId] || 0) + 1 }));
    setVoted(prev => [...prev, songId]);
    toast.success("Vote recorded!");
  };


  return (
    <>
      <FloatingHowItWorks title="How Setlist Voting works" steps={[
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
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Setlist Voting</h2>
        <p className="text-muted-foreground text-sm mt-1">Vote for the songs you want to hear at the next live concert</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : songs.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">
          No song requests yet. Be the first to tip a request during a live concert!
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {songs.map((song, i) => (
            <Card key={song.id} className={`hover:border-primary transition-all ${i === 0 ? "border-yellow-500/30 bg-yellow-500/5" : ""}`}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                  i === 0 ? "bg-yellow-500/20 text-yellow-500" : i === 1 ? "bg-gray-300/20 text-gray-400" : i === 2 ? "bg-orange-500/20 text-orange-500" : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{song.title}</h3>
                  <p className="text-xs text-muted-foreground">{song.artist}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{song.votes} votes</span>
                  <Button size="sm" variant={voted.includes(song.id) ? "secondary" : "default"}
                    onClick={() => handleVote(song.id)} disabled={voted.includes(song.id)}>
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
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
