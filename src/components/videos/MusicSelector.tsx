import { useState } from "react";
import { musicLibrary, genres, type MusicTrack } from "@/data/musicLibrary";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Music, Play, Pause, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MusicSelectorProps {
  selectedTrack: MusicTrack | null;
  onSelectTrack: (track: MusicTrack | null) => void;
}

export function MusicSelector({ selectedTrack, onSelectTrack }: MusicSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const filteredTracks = musicLibrary.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "all" || track.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handlePlayPreview = (trackId: string) => {
    if (playingTrackId === trackId) {
      setPlayingTrackId(null);
    } else {
      setPlayingTrackId(trackId);
      // In real implementation, play audio preview
      setTimeout(() => setPlayingTrackId(null), 3000);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Music className="h-4 w-4" />
          Select Background Music
        </Label>
        {selectedTrack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectTrack(null)}
          >
            Clear Selection
          </Button>
        )}
      </div>

      {/* Search */}
      <Input
        placeholder="Search songs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Genre Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedGenre === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedGenre("all")}
        >
          All
        </Button>
        {genres.map(genre => (
          <Button
            key={genre}
            variant={selectedGenre === genre ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedGenre(genre)}
          >
            {genre}
          </Button>
        ))}
      </div>

      {/* Selected Track Display */}
      {selectedTrack && (
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedTrack.thumbnail}</span>
              <div>
                <p className="font-medium">{selectedTrack.title}</p>
                <p className="text-sm text-muted-foreground">{selectedTrack.artist}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSelectTrack(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Music List */}
      <div className="h-[300px] rounded-lg border overflow-y-auto bg-background">
        <RadioGroup
          value={selectedTrack?.id}
          onValueChange={(value) => {
            const track = musicLibrary.find(t => t.id === value);
            if (track) onSelectTrack(track);
          }}
        >
          <div className="divide-y">
            {filteredTracks.map((track) => (
              <div
                key={track.id}
                className="p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={track.id} id={track.id} />
                  <span className="text-xl">{track.thumbnail}</span>
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={track.id}
                      className="font-medium cursor-pointer block truncate"
                    >
                      {track.title}
                    </Label>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artist} • {track.genre} • {formatDuration(track.duration)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePlayPreview(track.id);
                    }}
                  >
                    {playingTrackId === track.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {filteredTracks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No songs found matching your search
        </div>
      )}
    </div>
  );
}
