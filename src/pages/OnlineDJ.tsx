import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Volume2, Music, Disc3, Radio } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import UploadAudioDialog from "@/components/dj/UploadAudioDialog";

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  duration: string;
  audio_url: string;
}

export default function OnlineDJ() {
  const [deckA, setDeckA] = useState<Track | null>(null);
  const [deckB, setDeckB] = useState<Track | null>(null);
  const [playingA, setPlayingA] = useState(false);
  const [playingB, setPlayingB] = useState(false);
  const [volumeA, setVolumeA] = useState([75]);
  const [volumeB, setVolumeB] = useState([75]);
  const [crossfader, setCrossfader] = useState([50]);
  const [eqLowA, setEqLowA] = useState([50]);
  const [eqMidA, setEqMidA] = useState([50]);
  const [eqHighA, setEqHighA] = useState([50]);
  const [eqLowB, setEqLowB] = useState([50]);
  const [eqMidB, setEqMidB] = useState([50]);
  const [eqHighB, setEqHighB] = useState([50]);
  const [selectedGenre, setSelectedGenre] = useState<string>("All");

  const audioRefA = useRef<HTMLAudioElement | null>(null);
  const audioRefB = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeA = useRef<GainNode | null>(null);
  const gainNodeB = useRef<GainNode | null>(null);

  // Fetch tracks from database with refetch capability
  const { data: musicLibrary = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .order('artist', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    }
  });

  const genres = ["All", ...new Set(musicLibrary.map(track => track.genre))];
  const filteredTracks = selectedGenre === "All" 
    ? musicLibrary 
    : musicLibrary.filter(track => track.genre === selectedGenre);

  useEffect(() => {
    // Initialize Web Audio API
    audioContextRef.current = new AudioContext();
    gainNodeA.current = audioContextRef.current.createGain();
    gainNodeB.current = audioContextRef.current.createGain();
    
    gainNodeA.current.connect(audioContextRef.current.destination);
    gainNodeB.current.connect(audioContextRef.current.destination);

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (audioRefA.current && gainNodeA.current && audioContextRef.current) {
      const source = audioContextRef.current.createMediaElementSource(audioRefA.current);
      source.connect(gainNodeA.current);
    }
  }, [deckA]);

  useEffect(() => {
    if (audioRefB.current && gainNodeB.current && audioContextRef.current) {
      const source = audioContextRef.current.createMediaElementSource(audioRefB.current);
      source.connect(gainNodeB.current);
    }
  }, [deckB]);

  useEffect(() => {
    if (gainNodeA.current) {
      const crossfadeValue = crossfader[0] / 100;
      const volumeValue = volumeA[0] / 100;
      gainNodeA.current.gain.value = volumeValue * (1 - crossfadeValue);
    }
  }, [volumeA, crossfader]);

  useEffect(() => {
    if (gainNodeB.current) {
      const crossfadeValue = crossfader[0] / 100;
      const volumeValue = volumeB[0] / 100;
      gainNodeB.current.gain.value = volumeValue * crossfadeValue;
    }
  }, [volumeB, crossfader]);

  const loadTrack = (track: any, deck: 'A' | 'B') => {
    if (deck === 'A') {
      setDeckA(track);
      setPlayingA(false);
      toast.success(`${track.title} loaded to Deck A`);
    } else {
      setDeckB(track);
      setPlayingB(false);
      toast.success(`${track.title} loaded to Deck B`);
    }
  };

  const togglePlay = (deck: 'A' | 'B') => {
    const audio = deck === 'A' ? audioRefA.current : audioRefB.current;
    const isPlaying = deck === 'A' ? playingA : playingB;
    const setPlaying = deck === 'A' ? setPlayingA : setPlayingB;

    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-950/20 to-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Disc3 className="h-12 w-12 text-purple-500 animate-spin" style={{ animationDuration: '3s' }} />
            Online DJ Mixer
            <Radio className="h-12 w-12 text-pink-500" />
          </h1>
          <p className="text-xl text-muted-foreground">Mixuj hudbu ako profesionálny DJ</p>
        </div>

        {/* DJ Decks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Deck A */}
          <Card className="bg-gradient-to-br from-blue-950/50 to-background border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Disc3 className="h-6 w-6 text-blue-400" />
                  Deck A
                </span>
                <Button
                  onClick={() => togglePlay('A')}
                  disabled={!deckA}
                  size="lg"
                  variant={playingA ? "destructive" : "default"}
                >
                  {playingA ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
              </CardTitle>
              {deckA && (
                <CardDescription className="text-lg">
                  {deckA.title} - {deckA.artist} | {deckA.bpm} BPM
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {!deckA ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Vyber skladbu z knižnice</p>
                </div>
              ) : (
                <>
                  <audio ref={audioRefA} src={deckA.audio_url} loop />
                  
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Volume2 className="h-4 w-4" />
                      Volume: {volumeA[0]}%
                    </label>
                    <Slider
                      value={volumeA}
                      onValueChange={setVolumeA}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium mb-2 block">LOW</label>
                      <Slider
                        value={eqLowA}
                        onValueChange={setEqLowA}
                        max={100}
                        step={1}
                        orientation="vertical"
                        className="h-24"
                      />
                      <span className="text-xs text-center block mt-1">{eqLowA[0]}%</span>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-2 block">MID</label>
                      <Slider
                        value={eqMidA}
                        onValueChange={setEqMidA}
                        max={100}
                        step={1}
                        orientation="vertical"
                        className="h-24"
                      />
                      <span className="text-xs text-center block mt-1">{eqMidA[0]}%</span>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-2 block">HIGH</label>
                      <Slider
                        value={eqHighA}
                        onValueChange={setEqHighA}
                        max={100}
                        step={1}
                        orientation="vertical"
                        className="h-24"
                      />
                      <span className="text-xs text-center block mt-1">{eqHighA[0]}%</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Deck B */}
          <Card className="bg-gradient-to-br from-red-950/50 to-background border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Disc3 className="h-6 w-6 text-red-400" />
                  Deck B
                </span>
                <Button
                  onClick={() => togglePlay('B')}
                  disabled={!deckB}
                  size="lg"
                  variant={playingB ? "destructive" : "default"}
                >
                  {playingB ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
              </CardTitle>
              {deckB && (
                <CardDescription className="text-lg">
                  {deckB.title} - {deckB.artist} | {deckB.bpm} BPM
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {!deckB ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Vyber skladbu z knižnice</p>
                </div>
              ) : (
                <>
                  <audio ref={audioRefB} src={deckB.audio_url} loop />
                  
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Volume2 className="h-4 w-4" />
                      Volume: {volumeB[0]}%
                    </label>
                    <Slider
                      value={volumeB}
                      onValueChange={setVolumeB}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium mb-2 block">LOW</label>
                      <Slider
                        value={eqLowB}
                        onValueChange={setEqLowB}
                        max={100}
                        step={1}
                        orientation="vertical"
                        className="h-24"
                      />
                      <span className="text-xs text-center block mt-1">{eqLowB[0]}%</span>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-2 block">MID</label>
                      <Slider
                        value={eqMidB}
                        onValueChange={setEqMidB}
                        max={100}
                        step={1}
                        orientation="vertical"
                        className="h-24"
                      />
                      <span className="text-xs text-center block mt-1">{eqMidB[0]}%</span>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-2 block">HIGH</label>
                      <Slider
                        value={eqHighB}
                        onValueChange={setEqHighB}
                        max={100}
                        step={1}
                        orientation="vertical"
                        className="h-24"
                      />
                      <span className="text-xs text-center block mt-1">{eqHighB[0]}%</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Crossfader */}
        <Card className="mb-6 bg-gradient-to-r from-blue-950/30 via-purple-950/30 to-red-950/30 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-center">Crossfader</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-400">Deck A</span>
              <Slider
                value={crossfader}
                onValueChange={setCrossfader}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium text-red-400">Deck B</span>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              {crossfader[0] < 25 ? "Deck A Dominant" : crossfader[0] > 75 ? "Deck B Dominant" : "Balanced Mix"}
            </p>
          </CardContent>
        </Card>

        {/* Music Library */}
        <Card className="bg-background/95">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-6 w-6" />
                  Hudobná knižnica {!loading && `(${musicLibrary.length} skladieb)`}
                </CardTitle>
                <CardDescription>Vyber skladby pre mixovanie</CardDescription>
              </div>
              <UploadAudioDialog onUploadComplete={() => refetch()} />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Načítavam skladby...</p>
              </div>
            ) : (
            <Tabs value={selectedGenre} onValueChange={setSelectedGenre}>
              <TabsList className="mb-4 flex-wrap h-auto">
                {genres.map(genre => (
                  <TabsTrigger key={genre} value={genre}>
                    {genre}
                  </TabsTrigger>
                ))}
              </TabsList>

              {genres.map(genre => (
                <TabsContent key={genre} value={genre}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTracks.map(track => (
                      <Card key={track.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold">{track.title}</h4>
                              <p className="text-sm text-muted-foreground">{track.artist}</p>
                              <div className="flex gap-2 mt-2 text-xs">
                                <span className="bg-primary/20 px-2 py-1 rounded">{track.genre}</span>
                                <span className="bg-secondary px-2 py-1 rounded">{track.bpm} BPM</span>
                                <span className="bg-accent px-2 py-1 rounded">{track.duration}</span>
                              </div>
                            </div>
                            <Disc3 className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              onClick={() => loadTrack(track, 'A')}
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              Load to A
                            </Button>
                            <Button
                              onClick={() => loadTrack(track, 'B')}
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              Load to B
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
