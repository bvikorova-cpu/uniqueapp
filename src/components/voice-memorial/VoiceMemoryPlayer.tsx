import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Play, Pause, Volume2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VoiceClone {
  id: string;
  voice_id: string;
  name: string;
  description: string;
}

interface VoiceMemoryPlayerProps {}

export const VoiceMemoryPlayer = ({}: VoiceMemoryPlayerProps = {}) => {
  const [text, setText] = useState('');
  const [voiceClones, setVoiceClones] = useState<VoiceClone[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadVoiceClones();
  }, []);

  const loadVoiceClones = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('list-voice-clones');
      
      if (error) throw error;
      
      if (data?.voiceClones) {
        setVoiceClones(data.voiceClones);
        if (data.voiceClones.length > 0) {
          setSelectedVoiceId(data.voiceClones[0].voice_id);
        }
      }
    } catch (error: any) {
      console.error('Load voice clones error:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodarilo sa načítať hlasové klony',
        variant: 'destructive',
      });
    }
  };

  const handleGenerate = async () => {
    if (!text || !selectedVoiceId) {
      toast({
        title: 'Chýbajúce údaje',
        description: 'Prosím vyplňte text a vyberte hlas',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-voice-memory', {
        body: { 
          text, 
          voiceId: selectedVoiceId
        },
      });

      if (error) throw error;

      if (data.audioContent) {
        const audioBlob = base64ToBlob(data.audioContent, 'audio/mpeg');
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      } else if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
      }

      toast({
        title: 'Úspech!',
        description: 'Audio spomienka bola vygenerovaná',
      });
    } catch (error: any) {
      console.error('Generate voice memory error:', error);
      toast({
        title: 'Chyba',
        description: error.message || 'Nepodarilo sa vygenerovať audio',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const base64ToBlob = (base64: string, contentType: string) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  }, []);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Volume2 className="h-6 w-6" />
            Vytvorte hlasovú spomienku
          </h3>
          <p className="text-muted-foreground">
            Napíšte text a vyberte hlasový klon pre vytvorenie spomienky
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voice-select">Vyberte hlas</Label>
            <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
              <SelectTrigger id="voice-select">
                <SelectValue placeholder="Vyberte hlasový klon" />
              </SelectTrigger>
              <SelectContent>
                {voiceClones.map((voice) => (
                  <SelectItem key={voice.id} value={voice.voice_id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="memory-text">Text spomienky</Label>
            <Textarea
              id="memory-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Napíšte vašu spomienku..."
              rows={6}
            />
          </div>
        </div>

        <Button 
          onClick={handleGenerate} 
          className="w-full" 
          disabled={isGenerating || !selectedVoiceId || !text}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generujem audio...
            </>
          ) : (
            'Vytvoriť hlasovú spomienku'
          )}
        </Button>

        {audioUrl && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Náhľad:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
            <audio ref={audioRef} src={audioUrl} className="hidden" />
          </div>
        )}
      </div>
    </Card>
  );
};
