import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Mic } from 'lucide-react';

interface VoiceCloneUploadProps {
  onSuccess?: (voiceId: string) => void;
}

export const VoiceCloneUpload = ({ onSuccess }: VoiceCloneUploadProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
      } else {
        toast({
          title: 'Nesprávny formát',
          description: 'Prosím nahrajte audio súbor',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !audioFile) {
      toast({
        title: 'Chýbajúce údaje',
        description: 'Prosím vyplňte meno a nahrajte audio súbor',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('audio', audioFile);

      const { data, error } = await supabase.functions.invoke('clone-voice', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: 'Úspech!',
        description: 'Hlas bol úspešne naklonovaný',
      });

      setName('');
      setDescription('');
      setAudioFile(null);
      
      if (onSuccess && data.voiceId) {
        onSuccess(data.voiceId);
      }
    } catch (error: any) {
      console.error('Clone voice error:', error);
      toast({
        title: 'Chyba',
        description: error.message || 'Nepodarilo sa naklonovať hlas',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Mic className="h-6 w-6" />
            Vytvorte hlasový klon
          </h3>
          <p className="text-muted-foreground">
            Nahrajte audio nahrávku pre vytvorenie digitálneho klonu hlasu
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Meno hlasu *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Napr. Babička Mária"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Popis (voliteľný)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Krátky popis o hlase..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio">Audio súbor *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="flex-1"
                required
              />
              {audioFile && (
                <span className="text-sm text-muted-foreground">
                  {audioFile.name}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Minimálne 30 sekúnd čistého zvuku pre najlepšie výsledky
            </p>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Vytváram klon...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Vytvoriť hlasový klon
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};
