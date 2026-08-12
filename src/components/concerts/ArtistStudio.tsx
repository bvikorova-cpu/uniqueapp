import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BadgeCheck, Loader2, Mic2, Music, Plus, Radio, ShieldCheck, Ticket } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

interface MusicianProfile {
  id: string;
  stage_name: string;
  bio: string | null;
  genre: string | null;
  verified: boolean;
  verification_status: string;
  suspended: boolean;
  total_concerts: number | null;
}

export const ArtistStudio = ({ onBack }: Props) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<MusicianProfile | null>(null);
  const [concerts, setConcerts] = useState<any[]>([]);

  // profile form
  const [stageName, setStageName] = useState("");
  const [genre, setGenre] = useState("");
  const [bio, setBio] = useState("");

  // concert form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [ticketPrice, setTicketPrice] = useState("5");

  const load = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: mp } = await supabase
        .from("musician_profiles")
        .select("id, stage_name, bio, genre, verified, verification_status, suspended, total_concerts")
        .eq("user_id", session.user.id)
        .maybeSingle();
      setProfile(mp as MusicianProfile | null);
      if (mp) {
        setStageName(mp.stage_name || "");
        setGenre(mp.genre || "");
        setBio(mp.bio || "");
        const { data: cs } = await supabase
          .from("live_concert_streams")
          .select("*, concert_ticket_types(*)")
          .eq("musician_id", mp.id)
          .order("scheduled_at", { ascending: false });
        setConcerts(cs || []);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load artist studio");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const saveProfile = async () => {
    if (stageName.trim().length < 2) { toast.error("Stage name is too short"); return; }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }
      if (profile) {
        const { error } = await supabase.from("musician_profiles")
          .update({ stage_name: stageName.trim(), genre: genre.trim() || null, bio: bio.trim() || null })
          .eq("id", profile.id);
        if (error) throw error;
        toast.success("Artist profile updated");
      } else {
        const { error } = await supabase.from("musician_profiles").insert({
          user_id: session.user.id,
          stage_name: stageName.trim(),
          genre: genre.trim() || null,
          bio: bio.trim() || null });
        if (error) throw error;
        toast.success("Artist profile created — you can now schedule concerts");
      }
      await load();
    } catch (e: any) {
      toast.error(e.message || "Failed to save profile");
    } finally { setSaving(false); }
  };

  const requestVerification = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("musician_profiles")
        .update({ verification_status: "pending", verification_requested_at: new Date().toISOString() })
        .eq("id", profile.id);
      if (error) throw error;
      toast.success("Verification requested — our team will review it");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Failed to request verification");
    } finally { setSaving(false); }
  };

  const createConcert = async () => {
    if (!profile) { toast.error("Create your artist profile first"); return; }
    if (title.trim().length < 3) { toast.error("Enter a concert title"); return; }
    if (!scheduledAt) { toast.error("Pick a date and time"); return; }
    const price = Number(ticketPrice);
    if (!Number.isFinite(price) || price < 0) { toast.error("Invalid ticket price"); return; }
    setSaving(true);
    try {
      const { data: concert, error } = await supabase.from("live_concert_streams").insert({
        musician_id: profile.id,
        title: title.trim(),
        description: description.trim() || null,
        scheduled_at: new Date(scheduledAt).toISOString(),
        status: "scheduled" }).select("id").single();
      if (error) throw error;
      const { error: ttErr } = await supabase.from("concert_ticket_types").insert({
        concert_id: concert.id,
        name: "standard",
        price,
        description: "General admission to the live stream" });
      if (ttErr) throw ttErr;
      toast.success("Concert scheduled — fans can now buy tickets");
      setTitle(""); setDescription(""); setScheduledAt("");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Failed to schedule concert");
    } finally { setSaving(false); }
  };

  const setStatus = async (id: string, status: "live" | "ended") => {
    try {
      const patch: any = { status };
      if (status === "live") patch.started_at = new Date().toISOString();
      if (status === "ended") patch.ended_at = new Date().toISOString();
      const { error } = await supabase.from("live_concert_streams").update(patch).eq("id", id);
      if (error) throw error;
      toast.success(status === "live" ? "You are live!" : "Concert ended");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Failed to update concert");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <FloatingHowItWorks title="How Artist Studio works" steps={[
        { title: "Create your artist profile", desc: "Stage name, genre and bio — this is your public artist page." },
        { title: "Request verification", desc: "Our team reviews artists; verified artists get a badge." },
        { title: "Schedule a concert", desc: "Set title, date/time and ticket price in EUR." },
        { title: "Go live & get paid", desc: "Start the stream when ready. Ticket and gift revenue lands in your artist balance." },
      ]} />
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Artist Studio
          </h2>
          <p className="text-sm text-muted-foreground">Sign up as a performer and schedule your own live concerts.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mic2 className="h-4 w-4 text-primary" />
              {profile ? "Your artist profile" : "Become an artist"}
              {profile?.verified && <BadgeCheck className="h-4 w-4 text-sky-500" />}
              {profile && !profile.verified && (
                <Badge variant="secondary" className="capitalize">{profile.verification_status}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stage-name">Stage name</Label>
                <Input id="stage-name" value={stageName} onChange={(e) => setStageName(e.target.value)} placeholder="e.g. Nova Echo" maxLength={60} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Pop, Rock, Electronic…" maxLength={40} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={800} placeholder="Tell fans who you are" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={saveProfile} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Music className="h-4 w-4" />}
                {profile ? "Save profile" : "Create artist profile"}
              </Button>
              {profile && !profile.verified && profile.verification_status !== "pending" && (
                <Button variant="outline" onClick={requestVerification} disabled={saving} className="gap-2">
                  <ShieldCheck className="h-4 w-4" /> Request verification
                </Button>
              )}
            </div>
            {profile?.suspended && (
              <p className="text-sm text-destructive">Your artist account is suspended. Contact support.</p>
            )}
          </CardContent>
        </Card>

        {profile && !profile.suspended && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Plus className="h-4 w-4 text-primary" /> Schedule a concert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="concert-title">Title</Label>
                  <Input id="concert-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Live from the studio" maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="concert-date">Date & time</Label>
                  <Input id="concert-date" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="concert-desc">Description</Label>
                <Textarea id="concert-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={1000} placeholder="What can fans expect?" />
              </div>
              <div className="space-y-2 sm:max-w-[200px]">
                <Label htmlFor="ticket-price">Ticket price (€)</Label>
                <Input id="ticket-price" type="number" min="0" step="0.5" value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)} />
              </div>
              <Button onClick={createConcert} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />} Schedule concert
              </Button>
            </CardContent>
          </Card>
        )}

        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Radio className="h-4 w-4 text-primary" /> My concerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {concerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No concerts yet — schedule your first show above.</p>
              ) : concerts.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(c.scheduled_at), "d MMM yyyy HH:mm")}
                      {c.concert_ticket_types?.[0] && ` · €${Number(c.concert_ticket_types[0].price).toFixed(2)}`}
                      {` · ${c.viewer_count || 0} viewers`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.status === "live" ? "default" : "secondary"} className="capitalize">{c.status}</Badge>
                    {c.status === "scheduled" && (
                      <Button size="sm" onClick={() => setStatus(c.id, "live")} className="gap-1"><Radio className="h-3 w-3" /> Go live</Button>
                    )}
                    {c.status === "live" && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(c.id, "ended")}>End</Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};
