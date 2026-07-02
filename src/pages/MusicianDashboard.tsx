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
import { TicketPricingManager } from "@/components/musician/TicketPricingManager";
import { EarningsDashboard } from "@/components/musician/EarningsDashboard";
import { MyConcertsManager } from "@/components/musician/MyConcertsManager";
import { MusicianVerificationCard } from "@/components/musician/MusicianVerificationCard";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const MusicianDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [concertDialogOpen, setConcertDialogOpen] = useState(false);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [selectedConcertId, setSelectedConcertId] = useState<string | null>(null);
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
        toast.error("Musician profile required — please register first");
        navigate("/live-concerts?view=musician");
        return;
      }

      setProfile(musicianProfile);
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConcert = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!concertForm.title || !concertForm.scheduled_at) {
      toast.error("Fill in required fields");
      return;
    }

    try {
      setLoading(true);
      
      const { data: newConcert, error } = await supabase
        .from("live_concert_streams")
        .insert({
          musician_id: profile.id,
          title: concertForm.title,
          description: concertForm.description,
          scheduled_at: concertForm.scheduled_at,
          stream_key: concertForm.stream_key || `stream-${Date.now()}`,
          status: "scheduled",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Concert scheduled! Now set ticket prices.");
      setConcertDialogOpen(false);
      setSelectedConcertId(newConcert.id);
      setPricingDialogOpen(true);
      setConcertForm({
        title: "",
        description: "",
        scheduled_at: "",
        stream_key: "",
      });
      window.location.reload();
    } catch (error: any) {
      console.error("Error creating concert:", error);
      toast.error("Error creating concert");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How Musician Dashboard works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
        <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
      </>
      );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Musician Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.stage_name}!</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{profile?.pending_balance?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground mt-1">Lifetime: €{profile?.lifetime_earnings?.toFixed(2) || "0.00"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Concerts</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.total_concerts || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.followers_count || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
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
                Schedule New Concert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Concert</DialogTitle>
                <DialogDescription>
                  Schedule your next live concert for fans
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateConcert} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Concert Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g. Summer Open Air"
                    value={concertForm.title}
                    onChange={(e) => setConcertForm({ ...concertForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What fans can expect..."
                    value={concertForm.description}
                    onChange={(e) => setConcertForm({ ...concertForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_at">
                    Date & Time <span className="text-destructive">*</span>
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
                  <Label htmlFor="stream_key">Stream Key (auto-generated)</Label>
                  <Input
                    id="stream_key"
                    placeholder="Auto-generated if left empty"
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
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Creating..." : "Schedule Concert"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Verification */}
            <MusicianVerificationCard profile={profile} onUpdated={loadProfile} />

            {/* My concerts with Go Live */}
            <MyConcertsManager musicianId={profile.id} />

            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Stage Name</Label>
                    <p className="text-lg font-medium">{profile?.stage_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Genre</Label>
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
          </TabsContent>

          <TabsContent value="earnings">
            {profile && (
              <EarningsDashboard
                musicianId={profile.id}
                pendingBalance={profile.pending_balance || 0}
                lifetimeEarnings={profile.lifetime_earnings || 0}
                totalWithdrawn={profile.total_withdrawn || 0}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MusicianDashboard;
