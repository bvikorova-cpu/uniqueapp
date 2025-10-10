import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Music } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const trackSchema = z.object({
  title: z.string().trim().min(1, "Názov je povinný").max(200, "Názov musí mať menej ako 200 znakov"),
  artist: z.string().trim().min(1, "Interpret je povinný").max(200, "Interpret musí mať menej ako 200 znakov"),
  genre: z.string().min(1, "Žáner je povinný"),
  bpm: z.number().min(40, "BPM musí byť minimálne 40").max(250, "BPM musí byť maximálne 250"),
  duration: z.string().regex(/^\d+:\d{2}$/, "Dĺžka musí byť vo formáte M:SS alebo MM:SS"),
});

export default function UploadAudioDialog({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [bpm, setBpm] = useState("");
  const [duration, setDuration] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const genres = ["Pop", "Rock", "R&B", "Disco", "Funk", "Hip Hop", "Electronic", "Jazz", "House", "Techno", "Dance", "Country", "Reggae", "Blues"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm"];
    if (!validTypes.includes(file.type)) {
      toast.error("Neplatný formát súboru. Podporované formáty: MP3, WAV, OGG, WEBM");
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Súbor je príliš veľký. Maximálna veľkosť je 50MB");
      return;
    }

    setAudioFile(file);

    // Auto-fill title from filename
    if (!title) {
      const filename = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      setTitle(filename);
    }

    // Get audio duration
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.addEventListener('loadedmetadata', () => {
      const minutes = Math.floor(audio.duration / 60);
      const seconds = Math.floor(audio.duration % 60);
      setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    });
  };

  const handleUpload = async () => {
    if (!audioFile) {
      toast.error("Prosím vyberte audio súbor");
      return;
    }

    try {
      // Validate form data
      const validationResult = trackSchema.safeParse({
        title,
        artist,
        genre,
        bpm: parseInt(bpm),
        duration,
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(", ");
        toast.error(errors);
        return;
      }

      setUploading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Musíte byť prihlásený na nahrávanie skladieb");
        return;
      }

      // Upload file to storage
      const fileExt = audioFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('user-tracks')
        .upload(fileName, audioFile, {
          contentType: audioFile.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-tracks')
        .getPublicUrl(fileName);

      // Insert track to database
      const { error: insertError } = await supabase
        .from('tracks')
        .insert({
          title: validationResult.data.title,
          artist: validationResult.data.artist,
          genre: validationResult.data.genre,
          bpm: validationResult.data.bpm,
          duration: validationResult.data.duration,
          audio_url: publicUrl,
          user_id: user.id
        });

      if (insertError) throw insertError;

      toast.success("Skladba bola úspešne nahraná!");
      setOpen(false);
      resetForm();
      onUploadComplete?.();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Chyba pri nahrávaní: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setArtist("");
    setGenre("");
    setBpm("");
    setDuration("");
    setAudioFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Upload className="h-4 w-4" />
          Nahrať vlastnú hudbu
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Nahrať vlastný audio súbor
          </DialogTitle>
          <DialogDescription>
            Nahrajte svoj vlastný audio súbor (MP3, WAV, OGG) a pridajte ho do DJ knižnice
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="audio-file">Audio súbor *</Label>
            <Input
              id="audio-file"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {audioFile && (
              <p className="text-xs text-muted-foreground mt-1">
                {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="title">Názov skladby *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Napr. My Awesome Track"
              disabled={uploading}
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="artist">Interpret *</Label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Napr. DJ Producer"
              disabled={uploading}
              maxLength={200}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="genre">Žáner *</Label>
              <Select value={genre} onValueChange={setGenre} disabled={uploading}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte žáner" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bpm">BPM *</Label>
              <Input
                id="bpm"
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="120"
                min="40"
                max="250"
                disabled={uploading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Dĺžka (M:SS) *</Label>
            <Input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="3:45"
              disabled={uploading}
              pattern="\d+:\d{2}"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Automaticky vyplnené pri nahraní súboru
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
            disabled={uploading}
          >
            Zrušiť
          </Button>
          <Button onClick={handleUpload} disabled={uploading || !audioFile}>
            {uploading ? "Nahráva sa..." : "Nahrať"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}