import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Leaf, Trophy, Heart, Upload, Sparkles, Calendar, Video, Image as ImageIcon, AlertCircle, History, Share2, Timer } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { SectionVideoPreview } from "@/components/SectionVideoPreview";
import { sectionVideos } from "@/components/sectionVideos";
import { Link } from "react-router-dom";
import { EcoComments } from "@/components/eco/EcoComments";
import { ChallengeProUpsell } from "@/components/challenges/ChallengeProUpsell";
import { ChallengeProBadge } from "@/components/challenges/ChallengeProBadge";
import { useChallengeProSet } from "@/hooks/useChallengePro";

interface Challenge {
  id: string;
  challenge_date: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  xp_reward: number;
  sponsor_name: string | null;
  sponsor_logo_url: string | null;
  sponsor_url: string | null;
}

interface Submission {
  id: string;
  user_id: string;
  challenge_date: string;
  description: string;
  image_urls: string[];
  video_url: string | null;
  votes_count: number;
  boosted_until: string | null;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null; username: string | null } | null;
  hasVoted?: boolean;
}

interface LeaderRow {
  user_id: string;
  days_completed: number;
  total_votes: number;
  rank: number;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const currentMonthKey = () => new Date().toISOString().slice(0, 7);

const HIW_STEPS = [
  { title: "1. See today's challenge", desc: "Every day a new eco good deed appears — plant, clean, recycle, save water, reduce waste." },
  { title: "2. Do the deed in real life", desc: "Complete the action offline. Take photos or a short clip as proof." },
  { title: "3. Submit your proof", desc: "Add a description (min 10 chars), upload up to 4 photos or 1 video (≤50 MB). Strict limit: 1 submission per user per day (enforced by the database)." },
  { title: "4. Earn XP for each valid day", desc: "Every accepted submission credits +XP shown on today's card (default +50 XP). A day only counts once — extra attempts the same day are blocked." },
  { title: "5. Vote & comment", desc: "Only registered users can vote and comment. You can't vote for yourself. One vote per submission. Comments follow the same registered-only rule and can be deleted by their author." },
  { title: "6. Climb the leaderboard", desc: "Monthly ranking = number of days completed this calendar month (UTC). Ties are broken by total votes received on your submissions that month." },
  { title: "7. Win 100,000 XP each month", desc: "On the 1st of the next month, the top eco hero of the previous month automatically receives 100,000 XP + a champion badge (pg_cron job). Only one winner per month. Winners are archived in Monthly History." },
  { title: "8. Boost your submission", desc: "Optional: spend 5 credits to pin your submission for 24 hours at the top of the feed. Boost does not add votes — only visibility." },
  { title: "9. Fair play & moderation", desc: "Duplicate accounts, fake proof, offensive content or spam get hidden by admins and disqualified from the monthly prize." },
  { title: "10. Sponsors welcome", desc: "Eco brands can sponsor a daily challenge — logo appears on the daily card and in the feed." },
];

const msUntilMonthEnd = () => {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  return end.getTime() - now.getTime();
};
const fmtCountdown = (ms: number) => {
  if (ms <= 0) return "0d 0h 0m";
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${d}d ${h}h ${m}m`;
};

export default function EcoChallenge() {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [mySubmissionToday, setMySubmissionToday] = useState<Submission | null>(null);
  const [myMonthDays, setMyMonthDays] = useState(0);
  const [loading, setLoading] = useState(true);

  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const loadAll = async () => {
    setLoading(true);
    const today = todayISO();
    // Today's challenge (auto-create default if none)
    let { data: ch } = await supabase.from("eco_challenges").select("*").eq("challenge_date", today).maybeSingle();
    if (!ch) {
      // seed a fallback challenge locally (not persisted — admin must create real one)
      ch = {
        id: "fallback",
        challenge_date: today,
        title: "Pick up 5 pieces of litter",
        description: "Find any litter outdoors, put it in the correct bin (recycling if possible). Every piece counts!",
        category: "cleanup",
        icon: "🗑️",
        xp_reward: 50,
        sponsor_name: null, sponsor_logo_url: null, sponsor_url: null,
      } as any;
    }
    setChallenge(ch as Challenge);

    // Submissions for today + boosted
    const { data: subs } = await supabase
      .from("eco_submissions")
      .select("*")
      .eq("challenge_date", today)
      .eq("is_hidden", false)
      .order("boosted_until", { ascending: false, nullsFirst: false })
      .order("votes_count", { ascending: false })
      .limit(100);

    const userIds = Array.from(new Set((subs || []).map((s: any) => s.user_id)));
    let profiles: any[] = [];
    if (userIds.length) {
      const { data: p } = await (supabase as any)
        .from("profiles_public")
        .select("id, full_name, avatar_url, username")
        .in("id", userIds);
      profiles = p || [];
    }
    const pmap = new Map(profiles.map((p: any) => [p.id, p]));

    let voteSet = new Set<string>();
    if (user && subs?.length) {
      const { data: myVotes } = await supabase
        .from("eco_votes")
        .select("submission_id")
        .eq("voter_id", user.id)
        .in("submission_id", subs.map((s: any) => s.id));
      voteSet = new Set((myVotes || []).map((v: any) => v.submission_id));
    }

    const enriched = (subs || []).map((s: any) => ({
      ...s,
      profile: pmap.get(s.user_id) || null,
      hasVoted: voteSet.has(s.id),
    }));
    setSubmissions(enriched);

    if (user) {
      const mine = enriched.find((s) => s.user_id === user.id) || null;
      setMySubmissionToday(mine);
      const { data: monthSubs } = await supabase
        .from("eco_submissions")
        .select("challenge_date")
        .eq("user_id", user.id)
        .gte("challenge_date", currentMonthKey() + "-01");
      setMyMonthDays(new Set((monthSubs || []).map((s: any) => s.challenge_date)).size);
    }

    // Leaderboard
    const { data: lb } = await supabase.rpc("get_eco_leaderboard", { _month_key: currentMonthKey(), _limit: 20 });
    const lbIds = Array.from(new Set((lb || []).map((r: any) => r.user_id)));
    let lbProfiles: any[] = [];
    if (lbIds.length) {
      const { data: p2 } = await (supabase as any)
        .from("profiles_public").select("id, full_name, avatar_url").in("id", lbIds);
      lbProfiles = p2 || [];
    }
    const lbmap = new Map(lbProfiles.map((p: any) => [p.id, p]));
    setLeaderboard((lb || []).map((r: any) => ({ ...r, profile: lbmap.get(r.user_id) })));

    // Past winners
    const { data: w } = await supabase.from("eco_monthly_winners").select("*").order("month_key", { ascending: false }).limit(12);
    setWinners(w || []);

    setLoading(false);
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [user?.id]);

  const uploadMedia = async (): Promise<{ images: string[]; video: string | null }> => {
    if (!user) return { images: [], video: null };
    const images: string[] = [];
    for (const f of files.slice(0, 4)) {
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}-${f.name.replace(/[^a-zA-Z0-9.\-]/g, "_")}`;
      const { error } = await supabase.storage.from("eco-media").upload(path, f, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("eco-media").getPublicUrl(path);
      images.push(data.publicUrl);
    }
    let video: string | null = null;
    if (videoFile) {
      if (videoFile.size > 50 * 1024 * 1024) throw new Error("Video must be under 50 MB");
      const path = `${user.id}/${Date.now()}-video-${videoFile.name.replace(/[^a-zA-Z0-9.\-]/g, "_")}`;
      const { error } = await supabase.storage.from("eco-media").upload(path, videoFile, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("eco-media").getPublicUrl(path);
      video = data.publicUrl;
    }
    return { images, video };
  };

  const submit = async () => {
    if (!user) { toast({ title: "Sign in required", variant: "destructive" }); return; }
    if (!challenge || challenge.id === "fallback") { toast({ title: "No active challenge yet", description: "Admin has not created today's challenge.", variant: "destructive" }); return; }
    if (description.trim().length < 10) { toast({ title: "Describe your good deed (min 10 chars)", variant: "destructive" }); return; }
    if (mySubmissionToday) {
      toast({
        title: "⚠️ Daily limit reached",
        description: "You have already submitted your proof for today. Only 1 submission per day is allowed. Come back tomorrow for a new challenge!",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    try {
      const { images, video } = await uploadMedia();
      const { error } = await supabase.from("eco_submissions").insert({
        user_id: user.id,
        challenge_id: challenge.id,
        challenge_date: challenge.challenge_date,
        description: description.trim(),
        image_urls: images,
        video_url: video,
      });
      if (error) {
        if ((error as any).code === "23505") {
          toast({
            title: "⚠️ Daily limit reached",
            description: "You have already submitted your proof for today. Only 1 submission per day is allowed.",
            variant: "destructive",
          });
          await loadAll();
          return;
        }
        throw error;
      }
      // TOP subscribers get their submission auto-pinned at the top of the feed
      // for the rest of the day (leverages existing boosted_until ordering).
      try {
        const { data: sub } = await supabase
          .from("challenge_pro_subscribers" as any)
          .select("tier, active_until")
          .eq("user_id", user.id)
          .maybeSingle();
        const active = (sub as any)?.active_until && new Date((sub as any).active_until).getTime() > Date.now();
        if (active && (sub as any)?.tier === "top") {
          const endOfDay = new Date();
          endOfDay.setUTCHours(23, 59, 59, 999);
          await supabase
            .from("eco_submissions")
            .update({ boosted_until: endOfDay.toISOString() })
            .eq("user_id", user.id)
            .eq("challenge_date", challenge.challenge_date);
        }
      } catch (pinErr) {
        console.warn("TOP auto-pin failed", pinErr);
      }
      toast({ title: "🌱 Submitted!", description: `Day ${myMonthDays + 1} of this month completed.` });
      setDescription(""); setFiles([]); setVideoFile(null);
      await loadAll();
    } catch (e: any) {
      toast({ title: "Submission failed", description: e.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const toggleVote = async (sub: Submission) => {
    if (!user) { toast({ title: "Sign in to vote", variant: "destructive" }); return; }
    if (sub.user_id === user.id) { toast({ title: "You cannot vote for yourself" }); return; }
    if (sub.hasVoted) {
      await supabase.from("eco_votes").delete().eq("submission_id", sub.id).eq("voter_id", user.id);
    } else {
      const { error } = await supabase.from("eco_votes").insert({ submission_id: sub.id, voter_id: user.id });
      if (error) { toast({ title: "Vote failed", description: error.message, variant: "destructive" }); return; }
    }
    setSubmissions((prev) => prev.map((s) => s.id === sub.id
      ? { ...s, hasVoted: !sub.hasVoted, votes_count: s.votes_count + (sub.hasVoted ? -1 : 1) } : s));
  };

  const boostMine = async () => {
    if (!mySubmissionToday || !user) return;
    // Deduct 5 credits via ai_credits (reuse existing table)
    const { data: credits } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!credits || (credits.credits_remaining ?? 0) < 5) {
      toast({ title: "Need 5 credits", description: "Buy credits to boost your submission." });
      return;
    }
    const until = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const { error } = await supabase.from("eco_submissions").update({ boosted_until: until }).eq("id", mySubmissionToday.id);
    if (error) { toast({ title: "Boost failed", description: error.message, variant: "destructive" }); return; }
    await supabase.from("ai_credits").update({ credits_remaining: (credits.credits_remaining ?? 0) - 5 }).eq("user_id", user.id);
    toast({ title: "🚀 Boosted for 24h!" });
    loadAll();
  };

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  const proUserIds = useMemo(
    () => [...submissions.map((s) => s.user_id), ...leaderboard.map((r) => r.user_id)],
    [submissions, leaderboard],
  );
  const proSet = useChallengeProSet(proUserIds);

  const [countdown, setCountdown] = useState<string>(fmtCountdown(msUntilMonthEnd()));
  useEffect(() => {
    const t = setInterval(() => setCountdown(fmtCountdown(msUntilMonthEnd())), 60000);
    return () => clearInterval(t);
  }, []);

  const shareSubmission = async (s: Submission) => {
    const url = `${window.location.origin}/eco-challenge`;
    const text = `🌱 Eco Challenge — ${s.description.slice(0, 80)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Eco Challenge", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast({ title: "Link copied to clipboard" });
      }
    } catch { /* user cancelled */ }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/40 dark:via-emerald-950/40 dark:to-teal-950/40">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Video banner */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl mb-4 aspect-video">
          <video
            src={sectionVideos.ecoChallenge}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.9) saturate(1.15)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent" />
        </div>

        {/* Title card under video */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-300/30 bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900 p-5 sm:p-6 shadow-xl mb-6">
          <Badge className="bg-emerald-500/90 text-white border-emerald-300/50 shadow-lg w-fit mb-3">
            🌍 Global Eco Challenge
          </Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white drop-shadow-lg">
            🌱 ECO <span className="text-emerald-300">CHALLENGE</span>
          </h1>
          <p className="text-sm sm:text-base text-white/85 font-semibold mt-2 drop-shadow max-w-xl">
            One good deed a day. Post proof. Get votes. Monthly champion wins <b className="text-emerald-300">100,000 XP</b> — <b className="text-yellow-300">200,000 XP</b> with PRO — or <b className="text-pink-300">500,000 XP</b> with TOP.
          </p>
          <p className="text-xs sm:text-sm text-white/70 font-medium mt-1.5 italic max-w-xl">
            🌍 A global fight against climate change and pollution — one green deed at a time.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-2.5 py-1 text-white/90"><Trophy className="w-3.5 h-3.5" /> 100k · PRO 200k · TOP 500k</div>
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-2.5 py-1 text-white/90"><Calendar className="w-3.5 h-3.5" /> Daily challenge</div>
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-2.5 py-1 text-white/90"><Heart className="w-3.5 h-3.5" /> Community voted</div>
            <div className="flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-300/40 rounded-full px-2.5 py-1 text-yellow-100" title="Time left until this month's champion is auto-crowned"><Timer className="w-3.5 h-3.5" /> Month ends in {countdown}</div>
          </div>
        </div>

        <ChallengeProUpsell accent="emerald" />

        <FloatingHowItWorks title="How Eco Challenge works" intro="Turn small daily actions into a global movement." steps={HIW_STEPS} />

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaders</TabsTrigger>
            <TabsTrigger value="winners">Winners</TabsTrigger>
          </TabsList>

          {/* ========== TODAY ========== */}
          <TabsContent value="today" className="space-y-4">
            {challenge && (
              <Card className="border-green-200 dark:border-green-900">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-4xl mb-2">{challenge.icon}</div>
                      <CardTitle className="text-2xl">{challenge.title}</CardTitle>
                      <p className="text-muted-foreground mt-2">{challenge.description}</p>
                    </div>
                    <Badge className="bg-green-600">+{challenge.xp_reward} XP</Badge>
                  </div>
                  {challenge.sponsor_name && (
                    <a href={challenge.sponsor_url || "#"} target="_blank" rel="noopener" className="flex items-center gap-2 mt-3 text-sm bg-muted rounded-lg px-3 py-2 w-fit">
                      {challenge.sponsor_logo_url && <img src={challenge.sponsor_logo_url} alt="" className="h-6" />}
                      <span>Sponsored by <b>{challenge.sponsor_name}</b></span>
                    </a>
                  )}
                </CardHeader>
              </Card>
            )}

            {user ? (
              mySubmissionToday ? (
                <Card className="bg-green-100/50 dark:bg-green-900/20 border-green-300">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-green-600" />
                      <div className="flex-1">
                        <p className="font-semibold">✅ Submitted for today</p>
                        <p className="text-sm text-muted-foreground">{mySubmissionToday.votes_count} votes · Day {myMonthDays} of {daysInMonth} this month</p>
                      </div>
                      {!mySubmissionToday.boosted_until && (
                        <Button size="sm" variant="outline" onClick={boostMine}>🚀 Boost 24h (5 credits)</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader><CardTitle>Submit your proof</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2 rounded-lg border border-emerald-300/60 bg-emerald-100/60 dark:border-emerald-800 dark:bg-emerald-900/20 p-3 text-xs">
                      <AlertCircle className="w-4 h-4 mt-0.5 text-emerald-700 shrink-0" />
                      <p><b>Daily limit:</b> only <b>1 submission per user per day</b> is allowed. This is enforced by the database — extra attempts today will be automatically rejected. A new challenge unlocks tomorrow.</p>
                    </div>
                    <Textarea placeholder="Describe your good deed — what, where, how..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500} />
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                        <ImageIcon className="w-4 h-4 mr-2" />Photos ({files.length}/4)
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => videoRef.current?.click()}>
                        <Video className="w-4 h-4 mr-2" />{videoFile ? "1 video" : "Add video"}
                      </Button>
                      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 4))} />
                      <input ref={videoRef} type="file" accept="video/*" hidden onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                    </div>
                    {files.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {files.map((f, i) => <img key={i} src={URL.createObjectURL(f)} alt="" className="rounded aspect-square object-cover" />)}
                      </div>
                    )}
                    <Button onClick={submit} disabled={uploading} className="w-full bg-green-600 hover:bg-green-700">
                      <Upload className="w-4 h-4 mr-2" />{uploading ? "Uploading..." : "Submit proof"}
                    </Button>
                  </CardContent>
                </Card>
              )
            ) : (
              <Card><CardContent className="pt-6 text-center">
                <Leaf className="w-10 h-10 mx-auto mb-2 text-green-600" />
                <p className="mb-3">Sign in to submit your eco good deed.</p>
                <Link to="/auth"><Button>Sign in</Button></Link>
              </CardContent></Card>
            )}
          </TabsContent>

          {/* ========== FEED ========== */}
          <TabsContent value="feed" className="space-y-3">
            {loading && <p className="text-center text-muted-foreground">Loading…</p>}
            {!loading && submissions.length === 0 && <p className="text-center text-muted-foreground py-8">No submissions yet today. Be the first!</p>}
            {submissions.map((s) => (
              <Card key={s.id} className={s.boosted_until && new Date(s.boosted_until) > new Date() ? "ring-2 ring-yellow-400" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    {s.profile?.avatar_url && <img src={s.profile.avatar_url} className="w-8 h-8 rounded-full" alt="" />}
                    <span className="font-semibold">{s.profile?.full_name || s.profile?.username || "Anonymous"}</span>
                    {proSet.has(s.user_id) && <ChallengeProBadge />}
                    {s.boosted_until && new Date(s.boosted_until) > new Date() && <Badge variant="secondary">🚀 Boosted</Badge>}
                  </div>
                  <p className="mb-3">{s.description}</p>
                  {s.image_urls.length > 0 && (
                    <div className={`grid gap-2 mb-3 ${s.image_urls.length === 1 ? "" : "grid-cols-2"}`}>
                      {s.image_urls.map((u, i) => <img key={i} src={u} alt="" loading="lazy" className="rounded-lg w-full object-cover max-h-80" />)}
                    </div>
                  )}
                  {s.video_url && <video src={s.video_url} controls className="w-full rounded-lg mb-3 max-h-96" />}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant={s.hasVoted ? "default" : "outline"} onClick={() => toggleVote(s)} disabled={s.user_id === user?.id}>
                        <Heart className={`w-4 h-4 mr-1 ${s.hasVoted ? "fill-current" : ""}`} />
                        {s.votes_count}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => shareSubmission(s)} aria-label="Share">
                        <Share2 className="w-4 h-4 mr-1" /> Share
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleTimeString()}</span>
                  </div>
                  <EcoComments submissionId={s.id} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ========== LEADERBOARD ========== */}
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader><CardTitle>🏆 {new Date().toLocaleString("en", { month: "long", year: "numeric" })} Leaderboard</CardTitle></CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? <p className="text-muted-foreground text-center py-4">No entries this month yet.</p> : (
                  <ol className="space-y-2">
                    {leaderboard.map((r) => (
                      <li key={r.user_id} className={`flex items-center gap-3 p-3 rounded-lg ${r.rank <= 3 ? "bg-gradient-to-r from-yellow-100 to-transparent dark:from-yellow-900/30" : "bg-muted/50"}`}>
                        <span className="text-2xl w-8 text-center">{r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : `#${r.rank}`}</span>
                        {r.profile?.avatar_url && <img src={r.profile.avatar_url} className="w-10 h-10 rounded-full" alt="" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold truncate">{r.profile?.full_name || "User"}</p>
                            {proSet.has(r.user_id) && <ChallengeProBadge compact />}
                          </div>
                          <p className="text-xs text-muted-foreground">{r.days_completed} days · {r.total_votes} votes</p>
                        </div>
                        {r.rank === 1 && <Badge className="bg-yellow-500">{proSet.has(r.user_id) ? "200k XP" : "100k XP"}</Badge>}
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== WINNERS ========== */}
          <TabsContent value="winners">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Past Eco Champions</CardTitle>
                <Link to="/eco-challenge/history">
                  <Button size="sm" variant="outline"><History className="w-4 h-4 mr-1" /> Full history</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {winners.length === 0 ? <p className="text-muted-foreground">No champions crowned yet — could be you next month!</p> : (
                  <div className="space-y-2">
                    {winners.map((w) => (
                      <Link key={w.id} to="/eco-challenge/history" className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <div className="flex-1">
                          <p className="font-semibold">{w.month_key}</p>
                          <p className="text-xs text-muted-foreground">{w.days_completed} days · {w.total_votes} votes · +{w.xp_awarded.toLocaleString()} XP</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
