import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft, Loader2, AlertCircle, RefreshCw, Mic, BadgeCheck, Calendar, Radio, Square,
} from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

interface ComedianProfile {
  id: string;
  stage_name: string;
  bio: string | null;
  experience_level: string;
  is_verified: boolean;
  total_shows: number;
  total_earnings: number;
  follower_count: number;
}

interface Show {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  status: string;
  ticket_price_coins: number;
  duration_minutes: number;
  viewer_count: number;
}

export const ComedianStudio = ({ onBack }: Props) => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ComedianProfile | null>(null);
  const [shows, setShows] = useState<Show[]>([]);

  const [stageName, setStageName] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("beginner");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [ticketPrice, setTicketPrice] = useState("3");
  const [duration, setDuration] = useState("60");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoadError("Please sign in to open Comedian Studio."); return; }

      const { data: prof, error: profErr } = await supabase
        .from("comedian_profiles")
        .select("id, stage_name, bio, experience_level, is_verified, total_shows, total_earnings, follower_count")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (profErr) throw profErr;

      setProfile((prof as ComedianProfile) || null);
      if (prof) {
        setStageName(prof.stage_name || "");
        setBio(prof.bio || "");
        setExperience(prof.experience_level || "beginner");

        const { data: showRows, error: showErr } = await supabase
          .from("comedy_shows")
          .select("id, title, description, scheduled_at, status, ticket_price_coins, duration_minutes, viewer_count")
          .eq("comedian_id", prof.id)
          .order("scheduled_at", { ascending: false });
        if (showErr) throw showErr;
        setShows((showRows as Show[]) || []);
      } else {
        setShows([]);
      }
    } catch (e: any) {
      setLoadError(e?.message || "Failed to load Comedian Studio");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const saveProfile = async () => {
    if (stageName.trim().length < 2) { toast.error("Enter your stage name"); return; }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }

      if (profile) {
        const { error } = await supabase
          .from("comedian_profiles")
          .update({ stage_name: stageName.trim(), bio: bio.trim() || null, experience_level: experience })
          .eq("id", profile.id);
        if (error) throw error;
        toast.success("Comedian profile updated");
      } else {
        const { error } = await supabase.from("comedian_profiles").insert({
          user_id: session.user.id,
          stage_name: stageName.trim(),
          bio: bio.trim() || null,
          experience_level: experience,
        });
        if (error) throw error;
        toast.success("Comedian profile created — you can schedule shows now");
      }
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save profile");
    } finally { setSaving(false); }
  };

  const createShow = async () => {
    if (!profile) { toast.error("Create your comedian profile first"); return; }
    if (title.trim().length < 3) { toast.error("Enter a show title"); return; }
    if (!scheduledAt) { toast.error("Pick a date and time"); return; }
    const price = Number(ticketPrice);
    if (!Number.isFinite(price) || price < 0) { toast.error("Invalid ticket price"); return; }
    const mins = Number(duration);
    if (!Number.isFinite(mins) || mins < 5) { toast.error("Invalid duration"); return; }

    setSaving(true);
    try {
      const { error } = await supabase.from("comedy_shows").insert({
        comedian_id: profile.id,
        title: title.trim(),
        description: description.trim() || null,
        scheduled_at: new Date(scheduledAt).toISOString(),
        ticket_price_coins: Math.round(price),
        duration_minutes: Math.round(mins),
        status: "scheduled",
      });
      if (error) throw error;
      toast.success("Show scheduled — fans can now buy tickets");
      setTitle(""); setDescription(""); setScheduledAt("");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to schedule show");
    } finally { setSaving(false); }
  };

  const setStatus = async (id: string, status: "live" | "ended") => {
    try {
      const now = new Date().toISOString();
      const patch = status === "live"
        ? { status, started_at: now }
        : { status, ended_at: now };
      const { error } = await supabase.from("comedy_shows").update(patch).eq("id", id);
      if (error) throw error;
      toast.success(status === "live" ? "You are live!" : "Show ended");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update show");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading Comedian Studio…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4 py-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
        <Card className="border-destructive/40">
          <CardContent className="flex min-h-[260px] flex-col items-center justify-center gap-4 p-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold">Comedian Studio could not load</h2>
              <p className="max-w-md text-sm text-destructive">{loadError}</p>
            </div>
            <Button onClick={() => void load()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <FloatingHowItWorks title="How Comedian Studio works" steps={[
        { title: "Create your comedian profile", desc: "Stage name, experience level and bio — this is your public comedian page." },
        { title: "Schedule a show", desc: "Set title, date/time, duration and ticket price in AI credits." },
        { title: "Go live", desc: "Start the stream when ready — ticket holders can watch instantly." },
        { title: "Get paid", desc: "Ticket credits and tips land in your comedian balance." },
      ]} />
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Comedian Studio
          </h2>
          <p className="text-sm text-muted-foreground">Sign up as a comedian and schedule your own live stand-up shows.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mic className="h-4 w-4 text-primary" />
              {profile ? "Your comedian profile" : "Become a comedian"}
              {profile?.is_verified && <BadgeCheck className="h-4 w-4 text-sky-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stage-name">Stage name</Label>
                <Input id="stage-name" value={stageName} onChange={(e) => setStageName(e.target.value)} placeholder="e.g. Max Punchline" maxLength={60} />
              </div>
              <div className="space-y-2">
                <Label>Experience level</Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Open mic / beginner</SelectItem>
                    <SelectItem value="intermediate">Semi-professional</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={800} placeholder="Tell fans about your comedy style" />
            </div>

            {profile && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-black">{profile.total_shows}</p>
                  <p className="text-[10px] text-muted-foreground">Shows</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-black">{profile.follower_count}</p>
                  <p className="text-[10px] text-muted-foreground">Followers</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-black">{profile.total_earnings}</p>
                  <p className="text-[10px] text-muted-foreground">Credits earned</p>
                </div>
              </div>
            )}

            <Button onClick={saveProfile} disabled={saving} className="w-full sm:w-auto">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : profile ? "Save profile" : "Create comedian profile"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" /> Schedule a show
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="show-title">Show title</Label>
              <Input id="show-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Late Night Laughs" maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="show-desc">Description</Label>
              <Textarea id="show-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={800} placeholder="What can fans expect?" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="show-when">Date & time</Label>
                <Input id="show-when" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="show-price">Ticket price (credits)</Label>
                <Input id="show-price" type="number" min={0} step={1} value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="show-dur">Duration (minutes)</Label>
                <Input id="show-dur" type="number" min={5} step={5} value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
            </div>
            <Button onClick={createShow} disabled={saving || !profile} className="w-full sm:w-auto">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Working…</> : "Schedule show"}
            </Button>
            {!profile && <p className="text-xs text-muted-foreground">Create your comedian profile first.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your shows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {shows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No shows yet — schedule your first one above.</p>
            ) : shows.map((s) => (
              <div key={s.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{s.title}</p>
                    <Badge variant={s.status === "live" ? "default" : "secondary"} className="capitalize">{s.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(s.scheduled_at), "MMM d, HH:mm")} · {s.duration_minutes} min · {s.ticket_price_coins} credits
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {s.status === "scheduled" && (
                    <Button size="sm" onClick={() => setStatus(s.id, "live")} className="gap-2">
                      <Radio className="h-4 w-4" /> Go live
                    </Button>
                  )}
                  {s.status === "live" && (
                    <Button size="sm" variant="destructive" onClick={() => setStatus(s.id, "ended")} className="gap-2">
                      <Square className="h-4 w-4" /> End show
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
