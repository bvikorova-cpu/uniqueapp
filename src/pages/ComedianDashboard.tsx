import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useComedianProfile, useComedianEarnings, useComedianShows } from "@/hooks/useComedy";
import { Mic2, DollarSign, Video, Trophy, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function ComedianDashboard() {
  const { profile } = useComedianProfile();
  const { earnings } = useComedianEarnings();
  const { shows } = useComedianShows();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [showDialog, setShowDialog] = useState(false);
  const [clipDialog, setClipDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Create Show form
  const [showForm, setShowForm] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    duration: 60,
    ticketPrice: 50,
  });

  // Upload Clip form
  const [clipForm, setClipForm] = useState({
    title: "",
    description: "",
    price: 10,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Not a Comedian Yet</h2>
          <p className="text-muted-foreground mb-6">
            You need to create a comedian profile first to access the dashboard.
          </p>
          <Button onClick={() => navigate("/comedy-club")}>
            Go to Comedy Club
          </Button>
        </Card>
      </div>
    );
  }

  const handleCreateShow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("comedy_shows").insert({
        comedian_id: profile.id,
        title: showForm.title,
        description: showForm.description,
        scheduled_at: showForm.scheduledAt,
        duration_minutes: showForm.duration,
        ticket_price_coins: showForm.ticketPrice,
        status: "scheduled",
      });

      if (error) throw error;

      toast({ title: "Show Created!", description: "Your show is now scheduled" });
      setShowDialog(false);
      setShowForm({ title: "", description: "", scheduledAt: "", duration: 60, ticketPrice: 50 });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to create show", variant: "destructive" });
    }
  };

  const handleUploadClip = async () => {
    if (!videoFile) {
      toast({ title: "Error", description: "Please select a video file", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload video to storage
      const fileExt = videoFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, videoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(fileName);

      // Create clip record
      const { error } = await supabase.from("comedy_clips").insert({
        comedian_id: profile.id,
        title: clipForm.title,
        description: clipForm.description || "",
        video_url: publicUrl,
        thumbnail_url: publicUrl,
        price_coins: clipForm.price,
        duration_seconds: 60,
      });

      if (error) throw error;

      toast({ title: "Clip Uploaded!", description: "Your clip is now available for purchase" });
      setClipDialog(false);
      setClipForm({ title: "", description: "", price: 10 });
      setVideoFile(null);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to upload clip", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const totalEarnings = earnings?.reduce((sum, e) => sum + e.amount_coins, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">🎤 Comedian Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {profile.stage_name}!
            </p>
          </div>
          <Button onClick={() => navigate("/comedy-club")}>
            Back to Comedy Club
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">{totalEarnings} coins</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Mic2 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Shows</p>
                <p className="text-2xl font-bold">{shows?.length || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Followers</p>
                <p className="text-2xl font-bold">{profile.follower_count}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Video className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{profile.total_shows || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create New Show
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Show</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Show Title</Label>
                  <Input
                    value={showForm.title}
                    onChange={(e) => setShowForm({ ...showForm, title: e.target.value })}
                    placeholder="Friday Night Comedy"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={showForm.description}
                    onChange={(e) => setShowForm({ ...showForm, description: e.target.value })}
                    placeholder="Describe your show..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Scheduled Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={showForm.scheduledAt}
                    onChange={(e) => setShowForm({ ...showForm, scheduledAt: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={showForm.duration}
                      onChange={(e) => setShowForm({ ...showForm, duration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Ticket Price (coins)</Label>
                    <Input
                      type="number"
                      value={showForm.ticketPrice}
                      onChange={(e) => setShowForm({ ...showForm, ticketPrice: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateShow} className="w-full">
                  Create Show
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={clipDialog} onOpenChange={setClipDialog}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline">
                <Video className="mr-2 h-5 w-5" />
                Upload Clip
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Comedy Clip</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Clip Title</Label>
                  <Input
                    value={clipForm.title}
                    onChange={(e) => setClipForm({ ...clipForm, title: e.target.value })}
                    placeholder="My Best Joke"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={clipForm.description}
                    onChange={(e) => setClipForm({ ...clipForm, description: e.target.value })}
                    placeholder="Describe your clip..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Price (coins)</Label>
                  <Input
                    type="number"
                    value={clipForm.price}
                    onChange={(e) => setClipForm({ ...clipForm, price: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Video File</Label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button onClick={handleUploadClip} className="w-full" disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload Clip"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="shows" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="shows">My Shows</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="clips">My Clips</TabsTrigger>
          </TabsList>

          <TabsContent value="shows" className="space-y-4">
            {shows?.map((show: any) => (
              <Card key={show.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{show.title}</h3>
                    <p className="text-sm text-muted-foreground">{show.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(show.scheduled_at), "PPP p")} • {show.duration_minutes} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-bold capitalize">{show.status}</p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            {earnings?.map((earning: any) => (
              <Card key={earning.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{earning.source_type}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(earning.earned_at), "PPP")}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-green-500">
                    +{earning.amount_coins} coins
                  </p>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="clips">
            <Card className="p-6">
              <p className="text-muted-foreground">Your uploaded clips will appear here.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
