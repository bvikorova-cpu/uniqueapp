import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Music, Download, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const MySongs = () => {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('ai_generated_songs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSongs(data || []);
    } catch (error: any) {
      console.error('Error fetching songs:', error);
      toast.error("Failed to load songs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (songId: string) => {
    try {
      const { error } = await supabase
        .from('ai_generated_songs')
        .delete()
        .eq('id', songId);

      if (error) throw error;

      toast.success("Song deleted");
      fetchSongs();
    } catch (error: any) {
      console.error('Error deleting song:', error);
      toast.error("Failed to delete song");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Songs Yet</h3>
        <p className="text-muted-foreground">
          Generate your first song to see it here!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {songs.map((song) => (
        <Card key={song.id} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">{song.title}</h3>
                {song.is_remix && (
                  <Badge variant="secondary">Remix</Badge>
                )}
                <Badge variant={song.status === 'completed' ? 'default' : 'secondary'}>
                  {song.status}
                </Badge>
              </div>

              <div className="grid md:grid-cols-3 gap-2 text-sm text-muted-foreground mb-3">
                <span>Genre: {song.genre}</span>
                {song.mood && <span>Mood: {song.mood}</span>}
                {song.tempo && <span>Tempo: {song.tempo} BPM</span>}
              </div>

              {song.lyrics && (
                <div className="bg-muted/30 p-3 rounded-lg mb-3">
                  <p className="text-sm whitespace-pre-line line-clamp-3">{song.lyrics}</p>
                </div>
              )}

              {song.original_song_reference && (
                <p className="text-sm text-muted-foreground">
                  Original: {song.original_song_reference}
                </p>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                Created: {new Date(song.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {song.status === 'completed' && song.song_url && (
                <Button variant="outline" size="sm" className="gap-2" onClick={async () => {
                  try {
                    const a = document.createElement("a");
                    a.href = song.song_url;
                    a.download = `${song.title || "song"}.mp3`;
                    a.target = "_blank";
                    a.rel = "noopener";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    toast.success("Download started");
                  } catch (e) {
                    window.open(song.song_url, "_blank");
                  }
                }}>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDelete(song.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {song.cover_art_url && (
            <img 
              src={song.cover_art_url} 
              alt={song.title}
              className="w-full h-48 object-cover rounded-lg mt-4"
            />
          )}
        </Card>
      ))}
    </div>
  );
};
