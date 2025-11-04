import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, DollarSign, Music, Users, Video, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const MusicianDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [concertDialogOpen, setConcertDialogOpen] = useState(false);
  const [concertForm, setConcertForm] = useState({
    title: "",
    description: "",
    scheduled_at: "",
    stream_key: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: musicianProfile, error } = await supabase
        .from("musician_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) throw error;

      if (!musicianProfile) {
        toast.error("Nemáte profil interpreta");
        navigate("/live-concerts");
        return;
      }

      setProfile(musicianProfile);
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Chyba pri načítaní profilu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConcert = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!concertForm.title || !concertForm.scheduled_at) {
      toast.error("Vyplňte povinné polia");
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("live_concert_streams")
        .insert({
          musician_id: profile.id,
          title: concertForm.title,
          description: concertForm.description,
          scheduled_at: concertForm.scheduled_at,
          stream_key: concertForm.stream_key || `stream-${Date.now()}`,
          status: "scheduled",
        });

      if (error) throw error;

      toast.success("Koncert bol naplánovaný!");
      setConcertDialogOpen(false);
      setConcertForm({
        title: "",
        description: "",
        scheduled_at: "",
        stream_key: "",
      });
      window.location.reload();
    } catch (error: any) {
      console.error("Error creating concert:", error);
      toast.error("Chyba pri vytváraní koncertu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Interpreta</h1>
          <p className="text-muted-foreground">Vitajte späť, {profile?.stage_name}!</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Celkové zisky</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{profile?.total_earnings?.toFixed(2) || "0.00"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Počet koncertov</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.total_concerts || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sledujúci</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.followers_count || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hodnotenie</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.rating?.toFixed(1) || "0.0"}</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <Dialog open={concertDialogOpen} onOpenChange={setConcertDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Video className="h-5 w-5" />
                Naplánovať nový koncert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nový koncert</DialogTitle>
                <DialogDescription>
                  Naplánujte si ďalší živý koncert pre vašich fanúšikov
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateConcert} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Názov koncertu <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Napr. Letný Open Air"
                    value={concertForm.title}
                    onChange={(e) => setConcertForm({ ...concertForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Popis</Label>
                  <Textarea
                    id="description"
                    placeholder="Čo môžu fanúšikovia očakávať..."
                    value={concertForm.description}
                    onChange={(e) => setConcertForm({ ...concertForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_at">
                    Dátum a čas <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={concertForm.scheduled_at}
                    onChange={(e) => setConcertForm({ ...concertForm, scheduled_at: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stream_key">Stream Key (voliteľné)</Label>
                  <Input
                    id="stream_key"
                    placeholder="Automaticky vygenerovaný"
                    value={concertForm.stream_key}
                    onChange={(e) => setConcertForm({ ...concertForm, stream_key: e.target.value })}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConcertDialogOpen(false)}
                    className="flex-1"
                  >
                    Zrušiť
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Vytváram..." : "Vytvoriť koncert"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Môj profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Umelecké meno</Label>
                <p className="text-lg font-medium">{profile?.stage_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Žáner</Label>
                <p className="text-lg font-medium">{profile?.genre}</p>
              </div>
            </div>
            {profile?.bio && (
              <div>
                <Label className="text-muted-foreground">Bio</Label>
                <p className="mt-1">{profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MusicianDashboard;
