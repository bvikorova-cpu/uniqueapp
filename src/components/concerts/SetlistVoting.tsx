import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ListMusic, ThumbsUp, Music } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const sampleSongs = [
  { id: "1", title: "Bohemian Rhapsody", artist: "Cover", votes: 42 },
  { id: "2", title: "Stairway to Heaven", artist: "Cover", votes: 38 },
  { id: "3", title: "Hotel California", artist: "Cover", votes: 31 },
  { id: "4", title: "Sweet Child O' Mine", artist: "Cover", votes: 27 },
  { id: "5", title: "Wonderwall", artist: "Cover", votes: 24 },
];

export const SetlistVoting = ({ onBack }: Props) => {
  const [songs, setSongs] = useState(sampleSongs);
  const [voted, setVoted] = useState<string[]>([]);

  const handleVote = (songId: string) => {
    if (voted.includes(songId)) {
      toast.error("Already voted for this song");
      return;
    }
    setSongs(prev => prev.map(s => s.id === songId ? { ...s, votes: s.votes + 1 } : s).sort((a, b) => b.votes - a.votes));
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
    </div>
    </>
    );
};
