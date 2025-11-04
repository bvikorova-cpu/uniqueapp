import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Music, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const GENRES = [
  "Pop", "Rock", "Hip Hop", "R&B", "Electronic", "Jazz", "Classical",
  "Country", "Latin", "Reggae", "Blues", "Metal", "Folk", "Soul", "Indie"
];

export const MusicianRegistration = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    stage_name: "",
    genre: "",
    bio: "",
    avatar_url: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.stage_name || !formData.genre) {
      toast.error("Vyplňte povinné polia");
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Musíte byť prihlásený");
        return;
      }

      // Check if user already has a musician profile
      const { data: existing } = await supabase
        .from("musician_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (existing) {
        toast.error("Už máte vytvorený profil interpreta");
        setOpen(false);
        navigate("/musician-dashboard");
        return;
      }

      // Create musician profile
      const { error } = await supabase
        .from("musician_profiles")
        .insert({
          user_id: session.user.id,
          stage_name: formData.stage_name,
          genre: formData.genre,
          bio: formData.bio,
          avatar_url: formData.avatar_url || null,
        });

      if (error) throw error;

      toast.success("Váš profil interpreta bol vytvorený!");
      setOpen(false);
      navigate("/musician-dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Chyba pri vytváraní profilu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Music className="h-5 w-5" />
          Stať sa interpretom
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Registrácia Interpreta
          </DialogTitle>
          <DialogDescription>
            Vytvorte si profil a začnite streamovať svoje koncerty pre fanúšikov po celom svete!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="stage_name">
              Umelecké meno <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stage_name"
              placeholder="Napr. DJ Shadow"
              value={formData.stage_name}
              onChange={(e) => setFormData({ ...formData, stage_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">
              Žáner <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.genre}
              onValueChange={(value) => setFormData({ ...formData, genre: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Vyberte žáner" />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Povedzte niečo o sebe a vašej hudbe..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">URL avatara</Label>
            <Input
              id="avatar_url"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
            />
          </div>

          <div className="bg-primary/10 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Výhody pre interpretov:
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Zarábajte z predaja vstupeniek (až 90%)</li>
              <li>• Dostávajte dary od fanúšikov (80% vám)</li>
              <li>• Streamujte neobmedzene v HD kvalite</li>
              <li>• Získajte detailné štatistiky</li>
              <li>• Budujte si fanúšikovskú základňu</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Zrušiť
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Vytváram..." : "Vytvoriť profil"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
