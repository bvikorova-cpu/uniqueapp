import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Volume2, Music, Disc3, Radio, Sparkles, Download, Circle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  
  // Style and effects state
  const [styleA, setStyleA] = useState<string>("original");
  const [styleB, setStyleB] = useState<string>("original");
  const [filterA, setFilterA] = useState([1000]);
  const [filterB, setFilterB] = useState([1000]);
  const [reverbA, setReverbA] = useState([0]);
  const [reverbB, setReverbB] = useState([0]);
  const [delayA, setDelayA] = useState([0]);
  const [delayB, setDelayB] = useState([0]);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  const audioRefA = useRef<HTMLAudioElement | null>(null);
  const audioRefB = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeA = useRef<MediaElementAudioSourceNode | null>(null);
  const sourceNodeB = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeA = useRef<GainNode | null>(null);
  const gainNodeB = useRef<GainNode | null>(null);
  const filterNodeA = useRef<BiquadFilterNode | null>(null);
  const filterNodeB = useRef<BiquadFilterNode | null>(null);
  const delayNodeA = useRef<DelayNode | null>(null);
  const delayNodeB = useRef<DelayNode | null>(null);
  const delayGainA = useRef<GainNode | null>(null);
  const delayGainB = useRef<GainNode | null>(null);
  const reverbGainA = useRef<GainNode | null>(null);
  const reverbGainB = useRef<GainNode | null>(null);

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
    
    // Create stream destination for recording
    streamDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
    
    // Deck A chain
    gainNodeA.current = audioContextRef.current.createGain();
    filterNodeA.current = audioContextRef.current.createBiquadFilter();
    delayNodeA.current = audioContextRef.current.createDelay(5.0);
    delayGainA.current = audioContextRef.current.createGain();
    reverbGainA.current = audioContextRef.current.createGain();
    
    // Deck B chain
    gainNodeB.current = audioContextRef.current.createGain();
    filterNodeB.current = audioContextRef.current.createBiquadFilter();
    delayNodeB.current = audioContextRef.current.createDelay(5.0);
    delayGainB.current = audioContextRef.current.createGain();
    reverbGainB.current = audioContextRef.current.createGain();
    
    // Setup filter defaults
    filterNodeA.current.type = "lowpass";
    filterNodeA.current.frequency.value = 22000;
    filterNodeB.current.type = "lowpass";
    filterNodeB.current.frequency.value = 22000;
    
    // Setup delay defaults
    delayNodeA.current.delayTime.value = 0;
    delayGainA.current.gain.value = 0;
    delayNodeB.current.delayTime.value = 0;
    delayGainB.current.gain.value = 0;
    
    // Setup reverb defaults
    reverbGainA.current.gain.value = 0;
    reverbGainB.current.gain.value = 0;
    
    // Connect nodes A
    gainNodeA.current.connect(filterNodeA.current);
    filterNodeA.current.connect(reverbGainA.current);
    filterNodeA.current.connect(delayNodeA.current);
    delayNodeA.current.connect(delayGainA.current);
    delayGainA.current.connect(filterNodeA.current);
    reverbGainA.current.connect(audioContextRef.current.destination);
    reverbGainA.current.connect(streamDestinationRef.current);
    
    // Connect nodes B
    gainNodeB.current.connect(filterNodeB.current);
    filterNodeB.current.connect(reverbGainB.current);
    filterNodeB.current.connect(delayNodeB.current);
    delayNodeB.current.connect(delayGainB.current);
    delayGainB.current.connect(filterNodeB.current);
    reverbGainB.current.connect(audioContextRef.current.destination);
    reverbGainB.current.connect(streamDestinationRef.current);

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (deckA && audioRefA.current && gainNodeA.current && audioContextRef.current && !sourceNodeA.current) {
      try {
        sourceNodeA.current = audioContextRef.current.createMediaElementSource(audioRefA.current);
        sourceNodeA.current.connect(gainNodeA.current);
        console.log("Deck A audio source created");
      } catch (error) {
        console.error("Error creating audio source A:", error);
      }
    }
  }, [deckA]);

  useEffect(() => {
    if (deckB && audioRefB.current && gainNodeB.current && audioContextRef.current && !sourceNodeB.current) {
      try {
        sourceNodeB.current = audioContextRef.current.createMediaElementSource(audioRefB.current);
        sourceNodeB.current.connect(gainNodeB.current);
        console.log("Deck B audio source created");
      } catch (error) {
        console.error("Error creating audio source B:", error);
      }
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

  // Audio effects for Deck A
  useEffect(() => {
    if (filterNodeA.current) {
      filterNodeA.current.frequency.value = filterA[0];
    }
  }, [filterA]);

  useEffect(() => {
    if (reverbGainA.current) {
      reverbGainA.current.gain.value = reverbA[0] / 100;
    }
  }, [reverbA]);

  useEffect(() => {
    if (delayNodeA.current && delayGainA.current) {
      const delayTime = delayA[0] / 100;
      delayNodeA.current.delayTime.value = delayTime * 0.5;
      delayGainA.current.gain.value = delayTime * 0.7;
    }
  }, [delayA]);

  // Audio effects for Deck B
  useEffect(() => {
    if (filterNodeB.current) {
      filterNodeB.current.frequency.value = filterB[0];
    }
  }, [filterB]);

  useEffect(() => {
    if (reverbGainB.current) {
      reverbGainB.current.gain.value = reverbB[0] / 100;
    }
  }, [reverbB]);

  useEffect(() => {
    if (delayNodeB.current && delayGainB.current) {
      const delayTime = delayB[0] / 100;
      delayNodeB.current.delayTime.value = delayTime * 0.5;
      delayGainB.current.gain.value = delayTime * 0.7;
    }
  }, [delayB]);

  // Style presets
  const applyStyle = (style: string, deck: 'A' | 'B') => {
    const setFilter = deck === 'A' ? setFilterA : setFilterB;
    const setReverb = deck === 'A' ? setReverbA : setReverbB;
    const setDelay = deck === 'A' ? setDelayA : setDelayB;
    const setEqLow = deck === 'A' ? setEqLowA : setEqLowB;
    const setEqMid = deck === 'A' ? setEqMidA : setEqMidB;
    const setEqHigh = deck === 'A' ? setEqHighA : setEqHighB;

    switch (style) {
      case "disko":
        setFilter([800]);
        setReverb([40]);
        setDelay([25]);
        setEqLow([70]);
        setEqMid([60]);
        setEqHigh([55]);
        break;
      case "pop":
        setFilter([3000]);
        setReverb([20]);
        setDelay([10]);
        setEqLow([45]);
        setEqMid([55]);
        setEqHigh([60]);
        break;
      case "techno":
        setFilter([5000]);
        setReverb([30]);
        setDelay([40]);
        setEqLow([80]);
        setEqMid([45]);
        setEqHigh([50]);
        break;
      case "house":
        setFilter([2000]);
        setReverb([35]);
        setDelay([20]);
        setEqLow([75]);
        setEqMid([50]);
        setEqHigh([45]);
        break;
      case "hiphop":
        setFilter([1500]);
        setReverb([15]);
        setDelay([30]);
        setEqLow([85]);
        setEqMid([55]);
        setEqHigh([35]);
        break;
      case "rock":
        setFilter([4000]);
        setReverb([25]);
        setDelay([15]);
        setEqLow([60]);
        setEqMid([65]);
        setEqHigh([70]);
        break;
      default: // original
        setFilter([22000]);
        setReverb([0]);
        setDelay([0]);
        setEqLow([50]);
        setEqMid([50]);
        setEqHigh([50]);
    }
    
    if (deck === 'A') {
      setStyleA(style);
    } else {
      setStyleB(style);
    }
    
    toast.success(`${style.charAt(0).toUpperCase() + style.slice(1)} štýl aplikovaný na Deck ${deck}`);
  };

  const loadTrack = (track: any, deck: 'A' | 'B') => {
    if (deck === 'A') {
      // Reset source if exists
      if (sourceNodeA.current) {
        sourceNodeA.current.disconnect();
        sourceNodeA.current = null;
      }
      setDeckA(track);
      setPlayingA(false);
      // Load the audio file after setting the track
      setTimeout(() => {
        if (audioRefA.current) {
          audioRefA.current.load();
          console.log("Deck A loaded:", track.title, track.audio_url);
        }
      }, 100);
      toast.success(`${track.title} nahraný do Deck A`);
    } else {
      // Reset source if exists
      if (sourceNodeB.current) {
        sourceNodeB.current.disconnect();
        sourceNodeB.current = null;
      }
      setDeckB(track);
      setPlayingB(false);
      // Load the audio file after setting the track
      setTimeout(() => {
        if (audioRefB.current) {
          audioRefB.current.load();
          console.log("Deck B loaded:", track.title, track.audio_url);
        }
      }, 100);
      toast.success(`${track.title} nahraný do Deck B`);
    }
  };

  const togglePlay = async (deck: 'A' | 'B') => {
    const audio = deck === 'A' ? audioRefA.current : audioRefB.current;
    const isPlaying = deck === 'A' ? playingA : playingB;
    const setPlaying = deck === 'A' ? setPlayingA : setPlayingB;

    console.log(`Toggle play ${deck}:`, { audio: !!audio, isPlaying, audioContext: audioContextRef.current?.state });

    if (!audio) {
      toast.error("Najprv nahraj skladbu");
      return;
    }

    // Resume AudioContext if it's suspended
    if (audioContextRef.current?.state === 'suspended') {
      console.log("Resuming AudioContext");
      await audioContextRef.current.resume();
    }

    try {
      if (isPlaying) {
        audio.pause();
        setPlaying(false);
        console.log(`${deck} paused`);
      } else {
        await audio.play();
        setPlaying(true);
        console.log(`${deck} playing`, audio.currentTime, audio.duration);
      }
    } catch (error) {
      console.error("Playback error:", error);
      toast.error("Chyba pri prehrávaní: " + error);
    }
  };

  const startRecording = () => {
    if (!streamDestinationRef.current) {
      toast.error("Audio systém nie je pripravený");
      return;
    }

    try {
      const stream = streamDestinationRef.current.stream;
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        setRecordedChunks(chunks);
      };

      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
      toast.success("Nahrávanie spustené!");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Chyba pri spustení nahrávania");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stop();
      setIsRecording(false);
      toast.success("Nahrávanie ukončené!");
    }
  };

  const downloadRecording = async () => {
    if (recordedChunks.length === 0) {
      toast.error("Žiadna nahrávka na stiahnutie");
      return;
    }

    try {
      toast.loading("Konvertujem do MP3...");
      
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const { data, error } = await supabase.functions.invoke('convert-to-mp3', {
        body: formData,
      });

      if (error) throw error;

      // Create download link for MP3
      const mp3Blob = new Blob([data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(mp3Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dj-mix-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Mix stiahnutý v MP3 formáte!");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Chyba pri konverzii do MP3");
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

                  <div>
                    <label className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4" />
                      Štýl
                    </label>
                    <Select value={styleA} onValueChange={(value) => applyStyle(value, 'A')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Originál</SelectItem>
                        <SelectItem value="disko">🕺 Disko</SelectItem>
                        <SelectItem value="pop">🎤 Pop</SelectItem>
                        <SelectItem value="techno">🔊 Techno</SelectItem>
                        <SelectItem value="house">🏠 House</SelectItem>
                        <SelectItem value="hiphop">🎧 Hip-Hop</SelectItem>
                        <SelectItem value="rock">🎸 Rock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium mb-2 block">Filter: {filterA[0]} Hz</label>
                      <Slider
                        value={filterA}
                        onValueChange={setFilterA}
                        min={200}
                        max={22000}
                        step={100}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-2 block">Reverb: {reverbA[0]}%</label>
                      <Slider
                        value={reverbA}
                        onValueChange={setReverbA}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-2 block">Delay: {delayA[0]}%</label>
                      <Slider
                        value={delayA}
                        onValueChange={setDelayA}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
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

                  <div>
                    <label className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4" />
                      Štýl
                    </label>
                    <Select value={styleB} onValueChange={(value) => applyStyle(value, 'B')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Originál</SelectItem>
                        <SelectItem value="disko">🕺 Disko</SelectItem>
                        <SelectItem value="pop">🎤 Pop</SelectItem>
                        <SelectItem value="techno">🔊 Techno</SelectItem>
                        <SelectItem value="house">🏠 House</SelectItem>
                        <SelectItem value="hiphop">🎧 Hip-Hop</SelectItem>
                        <SelectItem value="rock">🎸 Rock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium mb-2 block">Filter: {filterB[0]} Hz</label>
                      <Slider
                        value={filterB}
                        onValueChange={setFilterB}
                        min={200}
                        max={22000}
                        step={100}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-2 block">Reverb: {reverbB[0]}%</label>
                      <Slider
                        value={reverbB}
                        onValueChange={setReverbB}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-2 block">Delay: {delayB[0]}%</label>
                      <Slider
                        value={delayB}
                        onValueChange={setDelayB}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
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

        {/* Recording Controls */}
        <Card className="mb-6 bg-gradient-to-r from-pink-950/30 to-purple-950/30 border-pink-500/30">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Music className="h-5 w-5" />
              Nahrávanie Mixu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={!deckA && !deckB}
                >
                  <Circle className="h-5 w-5 mr-2 fill-white" />
                  Spustiť nahrávanie
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="destructive"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Zastaviť nahrávanie
                </Button>
              )}
              
              {recordedChunks.length > 0 && (
                <Button
                  onClick={downloadRecording}
                  size="lg"
                  variant="outline"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Stiahnuť Mix
                </Button>
              )}
            </div>
            {isRecording && (
              <p className="text-center text-sm text-muted-foreground mt-4 animate-pulse">
                🔴 Nahrávam...
              </p>
            )}
          </CardContent>
        </Card>

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
