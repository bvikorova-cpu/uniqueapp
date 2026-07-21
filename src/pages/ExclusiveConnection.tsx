import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Lock,
  Heart,
  HeartOff,
  Sparkles,
  Eye,
  EyeOff,
  Save,
  UserCircle2,
  Flag,
  Ban,
  ShieldCheck,
  X,
} from "lucide-react";

type Profile = {
  id: string;
  user_id: string;
  pseudonym: string;
  region: string | null;
  interests: string[];
  expertise: string[];
  seeking: string[];
  bio: string | null;
  is_active: boolean;
};

type Interest = {
  id: string;
  from_user: string;
  to_user: string;
  note: string | null;
  created_at: string;
};

const REGIONS = ["Europe", "North America", "LATAM", "MENA", "APAC", "Africa", "Global"];
const TAG_POOL = [
  "Private Equity",
  "Venture",
  "Real Estate",
  "Art",
  "Yachting",
  "Aviation",
  "Philanthropy",
  "Crypto",
  "Family Office",
  "Wine",
  "Motorsport",
  "Longevity",
  "Space",
  "AI",
  "Biotech",
];

const PSEUDO_ADJ = ["Onyx", "Golden", "Silver", "Obsidian", "Velvet", "Crimson", "Ivory", "Midnight"];
const PSEUDO_NOUN = ["Fox", "Owl", "Falcon", "Panther", "Wolf", "Heron", "Lynx", "Raven"];

function randomPseudonym() {
  const a = PSEUDO_ADJ[Math.floor(Math.random() * PSEUDO_ADJ.length)];
  const n = PSEUDO_NOUN[Math.floor(Math.random() * PSEUDO_NOUN.length)];
  return `${a} ${n}`;
}

function TagPicker({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (t: string) => {
    if (values.includes(t)) onChange(values.filter((x) => x !== t));
    else onChange([...values, t]);
  };
  return (
    <div className="space-y-2">
      <div className="text-xs uppercase tracking-[0.2em] text-amber-200/60">{label}</div>
      <div className="flex flex-wrap gap-2">
        {TAG_POOL.map((t) => {
          const on = values.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggle(t)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                on
                  ? "bg-amber-400/20 border-amber-400/60 text-amber-100"
                  : "border-white/10 text-white/60 hover:border-amber-400/30"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ExclusiveConnection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useIsAdmin();

  const [checkingMember, setCheckingMember] = useState(true);
  const [isMember, setIsMember] = useState(false);

  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [sent, setSent] = useState<Interest[]>([]);
  const [received, setReceived] = useState<Interest[]>([]);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [blockedByIds, setBlockedByIds] = useState<Set<string>>(new Set()); // admin-only
  const [loading, setLoading] = useState(true);
  const initialTab = (searchParams.get("tab") as "discover" | "matches" | "profile") || "discover";
  const [tab, setTab] = useState<"discover" | "matches" | "profile">(initialTab);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "discover" || t === "matches" || t === "profile") setTab(t);
  }, [searchParams]);

  // profile form state
  const [pseudonym, setPseudonym] = useState("");
  const [region, setRegion] = useState<string>("Global");
  const [interests, setInterests] = useState<string[]>([]);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [seeking, setSeeking] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // report modal state
  const [reportTarget, setReportTarget] = useState<{ userId: string; kind: "profile" | "interest"; interestId?: string; pseudonym?: string } | null>(null);
  const [reportReason, setReportReason] = useState("Harassment");
  const [reportNote, setReportNote] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // admin moderation
  const [moderationOpen, setModerationOpen] = useState(false);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      if (!user) {
        setCheckingMember(false);
        return;
      }
      const { data } = await (supabase as any).rpc("is_exclusive_member", { _uid: user.id });
      setIsMember(!!data || isAdmin);
      setCheckingMember(false);
    })();
  }, [user, isAdmin]);

  const load = async () => {
    if (!user || !isMember) return;
    setLoading(true);
    const [{ data: mine }, { data: all }, { data: outgoing }, { data: incoming }, { data: myBlocks }] =
      await Promise.all([
        supabase
          .from("exclusive_connection_profiles" as any)
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("exclusive_connection_profiles" as any)
          .select("*")
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(200),
        supabase
          .from("exclusive_connection_interests" as any)
          .select("*")
          .eq("from_user", user.id),
        supabase
          .from("exclusive_connection_interests" as any)
          .select("*")
          .eq("to_user", user.id),
        supabase
          .from("exclusive_connection_blocks" as any)
          .select("blocked_user")
          .eq("blocker_user", user.id),
      ]);
    setMyProfile((mine as any) ?? null);
    setProfiles(((all as any) ?? []).filter((p: Profile) => p.user_id !== user.id));
    setSent(((outgoing as any) ?? []) as Interest[]);
    setReceived(((incoming as any) ?? []) as Interest[]);
    setBlockedIds(new Set(((myBlocks as any) ?? []).map((r: any) => r.blocked_user)));

    // best-effort: fetch who blocked me (only readable to admins under RLS)
    const { data: blockedByRows } = await supabase
      .from("exclusive_connection_blocks" as any)
      .select("blocker_user")
      .eq("blocked_user", user.id);
    setBlockedByIds(new Set(((blockedByRows as any) ?? []).map((r: any) => r.blocker_user)));

    if (mine) {
      const p = mine as any;
      setPseudonym(p.pseudonym);
      setRegion(p.region ?? "Global");
      setInterests(p.interests ?? []);
      setExpertise(p.expertise ?? []);
      setSeeking(p.seeking ?? []);
      setBio(p.bio ?? "");
      setIsActive(p.is_active);
    } else {
      setPseudonym(randomPseudonym());
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isMember) load();
  }, [isMember, user?.id]);

  const loadReports = async () => {
    if (!isAdmin) return;
    const { data } = await supabase
      .from("exclusive_connection_reports" as any)
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(100);
    setReports((data as any) ?? []);
  };

  useEffect(() => {
    if (isAdmin && moderationOpen) loadReports();
  }, [isAdmin, moderationOpen]);

  const sentSet = useMemo(() => new Set(sent.map((s) => s.to_user)), [sent]);
  const receivedSet = useMemo(() => new Set(received.map((r) => r.from_user)), [received]);
  const visibleProfiles = useMemo(
    () => profiles.filter((p) => !blockedIds.has(p.user_id) && !blockedByIds.has(p.user_id)),
    [profiles, blockedIds, blockedByIds],
  );
  const matches = useMemo(
    () => visibleProfiles.filter((p) => sentSet.has(p.user_id) && receivedSet.has(p.user_id)),
    [visibleProfiles, sentSet, receivedSet],
  );

  const saveProfile = async () => {
    if (!user) return;
    if (!pseudonym.trim()) {
      toast.error("Pseudonym required");
      return;
    }
    setSaving(true);
    const payload = {
      user_id: user.id,
      pseudonym: pseudonym.trim().slice(0, 40),
      region,
      interests,
      expertise,
      seeking,
      bio: bio.trim().slice(0, 500) || null,
      is_active: isActive,
    };
    const { error } = await (supabase as any)
      .from("exclusive_connection_profiles")
      .upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved");
    await load();
  };

  const expressInterest = async (toUser: string) => {
    if (!user) return;
    const { error } = await (supabase as any)
      .from("exclusive_connection_interests")
      .insert({ from_user: user.id, to_user: toUser });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Interest sent — anonymous until mutual");
    await load();
  };

  const withdraw = async (toUser: string) => {
    if (!user) return;
    const row = sent.find((s) => s.to_user === toUser);
    if (!row) return;
    const { error } = await (supabase as any)
      .from("exclusive_connection_interests")
      .delete()
      .eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await load();
  };

  const blockUser = async (targetUserId: string) => {
    if (!user) return;
    if (!window.confirm("Block this member? They will disappear from Discover and cannot exchange interest with you.")) return;
    // Remove any existing interest either direction so the match dissolves.
    await (supabase as any)
      .from("exclusive_connection_interests")
      .delete()
      .or(`and(from_user.eq.${user.id},to_user.eq.${targetUserId}),and(from_user.eq.${targetUserId},to_user.eq.${user.id})`);
    const { error } = await (supabase as any)
      .from("exclusive_connection_blocks")
      .insert({ blocker_user: user.id, blocked_user: targetUserId });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Member blocked");
    await load();
  };

  const unblockUser = async (targetUserId: string) => {
    if (!user) return;
    const { error } = await (supabase as any)
      .from("exclusive_connection_blocks")
      .delete()
      .eq("blocker_user", user.id)
      .eq("blocked_user", targetUserId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Unblocked");
    await load();
  };

  const submitReport = async () => {
    if (!user || !reportTarget) return;
    setReportSubmitting(true);
    const { error } = await (supabase as any).from("exclusive_connection_reports").insert({
      reporter_user: user.id,
      target_user: reportTarget.userId,
      kind: reportTarget.kind,
      interest_id: reportTarget.interestId ?? null,
      reason: reportReason,
      note: reportNote.trim().slice(0, 500) || null,
    });
    setReportSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Report submitted for admin review");
    setReportTarget(null);
    setReportReason("Harassment");
    setReportNote("");
  };

  const resolveReport = async (reportId: string, status: "resolved" | "dismissed") => {
    if (!user) return;
    const { error } = await (supabase as any)
      .from("exclusive_connection_reports")
      .update({ status, resolved_by: user.id, resolved_at: new Date().toISOString() })
      .eq("id", reportId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "resolved" ? "Resolved" : "Dismissed");
    await loadReports();
  };

  const adminDeleteProfile = async (targetUserId: string) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this member's connection profile? They can create a new one.")) return;
    const { error } = await (supabase as any)
      .from("exclusive_connection_profiles")
      .delete()
      .eq("user_id", targetUserId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile removed");
    await load();
  };


  if (checkingMember) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-amber-300 animate-spin" />
      </div>
    );
  }

  if (!user || !isMember) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-6 border border-amber-500/20 rounded-2xl p-10 bg-gradient-to-b from-neutral-950 to-black">
          <Lock className="w-10 h-10 text-amber-300 mx-auto" />
          <h1 className="text-2xl font-serif text-amber-100">Exclusive members only</h1>
          <p className="text-white/60 text-sm">
            Double-blind Connection is reserved for active Exclusive members.
          </p>
          <button
            onClick={() => navigate("/exclusive")}
            className="px-6 py-2.5 bg-amber-400 text-black rounded-full text-sm font-medium hover:bg-amber-300"
          >
            Return to Exclusive
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <Link
          to="/exclusive"
          className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-amber-200 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Exclusive
        </Link>

        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-amber-100 tracking-wide">
              Connection
            </h1>
            <p className="text-white/50 text-sm mt-2 max-w-xl">
              Double-blind: only your pseudonym and tags are visible. Identity is revealed only when
              two members express mutual interest.
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {(["discover", "matches", "profile"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-xs uppercase tracking-widest rounded-full border transition ${
                  tab === t
                    ? "bg-amber-400/15 border-amber-400/60 text-amber-100"
                    : "border-white/10 text-white/50 hover:border-amber-400/30"
                }`}
              >
                {t === "matches" ? `Matches (${matches.length})` : t}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => setModerationOpen((v) => !v)}
                className="px-3 py-2 text-xs uppercase tracking-widest rounded-full border border-red-400/40 text-red-200 hover:bg-red-400/10 flex items-center gap-1.5"
                title="Admin moderation"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Moderate
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-6 h-6 text-amber-300 animate-spin" />
          </div>
        )}

        {!loading && tab === "discover" && (
          <>
            {!myProfile && (
              <div className="border border-amber-500/30 rounded-xl p-5 mb-6 bg-amber-500/5 text-sm text-amber-100/90">
                Create your Connection profile first to send and receive interest.
                <button
                  className="ml-3 underline underline-offset-4"
                  onClick={() => setTab("profile")}
                >
                  Set up profile
                </button>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              {visibleProfiles.length === 0 && (
                <div className="col-span-full text-center py-20 text-white/40 text-sm">
                  No active profiles yet.
                </div>
              )}
              {visibleProfiles.map((p) => {
                const isMatched = sentSet.has(p.user_id) && receivedSet.has(p.user_id);
                const iSent = sentSet.has(p.user_id);
                const theySent = receivedSet.has(p.user_id);
                return (
                  <div
                    key={p.id}
                    className="border border-white/10 rounded-xl p-5 bg-gradient-to-b from-neutral-950 to-black hover:border-amber-400/40 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-700/20 flex items-center justify-center">
                          <UserCircle2 className="w-6 h-6 text-amber-200/70" />
                        </div>
                        <div>
                          <div className="font-serif text-amber-100">{p.pseudonym}</div>
                          <div className="text-[11px] uppercase tracking-widest text-white/40">
                            {p.region ?? "Global"}
                          </div>
                        </div>
                      </div>
                      {isMatched && (
                        <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          Matched
                        </span>
                      )}
                      {!isMatched && theySent && (
                        <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/30">
                          Interested in you
                        </span>
                      )}
                    </div>

                    {p.bio && <p className="text-sm text-white/70 mb-3 line-clamp-3">{p.bio}</p>}

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {[...p.expertise, ...p.seeking].slice(0, 6).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {iSent ? (
                      <button
                        onClick={() => withdraw(p.user_id)}
                        className="w-full text-xs py-2 rounded-full border border-white/10 text-white/60 hover:border-red-400/40 hover:text-red-300 flex items-center justify-center gap-2"
                      >
                        <HeartOff className="w-3.5 h-3.5" /> Withdraw interest
                      </button>
                    ) : (
                      <button
                        onClick={() => expressInterest(p.user_id)}
                        disabled={!myProfile}
                        className="w-full text-xs py-2 rounded-full bg-amber-400 text-black font-medium hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Heart className="w-3.5 h-3.5" /> Express interest
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!loading && tab === "matches" && (
          <div className="grid md:grid-cols-2 gap-4">
            {matches.length === 0 && (
              <div className="col-span-full text-center py-20 text-white/40 text-sm">
                No mutual matches yet. Express interest in Discover — when both sides confirm, you
                appear here.
              </div>
            )}
            {matches.map((p) => (
              <div
                key={p.id}
                className="border border-emerald-500/30 rounded-xl p-5 bg-gradient-to-b from-emerald-950/20 to-black"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-emerald-300" />
                  <div>
                    <div className="font-serif text-emerald-100">{p.pseudonym}</div>
                    <div className="text-[11px] uppercase tracking-widest text-emerald-300/60">
                      Mutual match · {p.region ?? "Global"}
                    </div>
                  </div>
                </div>
                {p.bio && <p className="text-sm text-white/70 mb-3">{p.bio}</p>}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {[...p.expertise, ...p.seeking].slice(0, 8).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 text-emerald-100/70"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  onClick={async () => {
                    try {
                      await (supabase as any).rpc("notify_exclusive_channel_opened", { _other_user: p.user_id });
                    } catch { /* non-blocking */ }
                    navigate(`/messenger?to=${p.user_id}`);
                  }}
                  className="w-full text-xs py-2 rounded-full bg-emerald-400 text-black font-medium hover:bg-emerald-300"
                >
                  Open private channel
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === "profile" && (
          <div className="border border-white/10 rounded-xl p-6 bg-gradient-to-b from-neutral-950 to-black max-w-2xl space-y-6">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-amber-200/60">
                Pseudonym
              </label>
              <div className="flex gap-2 mt-2">
                <input
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                  maxLength={40}
                  className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-amber-400/60 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setPseudonym(randomPseudonym())}
                  className="text-xs px-3 rounded-lg border border-white/10 text-white/60 hover:border-amber-400/40"
                >
                  Randomize
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-amber-200/60">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="mt-2 w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-amber-400/60 outline-none"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <TagPicker label="Expertise (what you offer)" values={expertise} onChange={setExpertise} />
            <TagPicker label="Seeking (what you want)" values={seeking} onChange={setSeeking} />
            <TagPicker label="Interests" values={interests} onChange={setInterests} />

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-amber-200/60">
                Bio (max 500)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={4}
                className="mt-2 w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-amber-400/60 outline-none"
                placeholder="Say something without saying who you are."
              />
            </div>

            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className="flex items-center gap-2 text-xs text-white/60 hover:text-amber-200"
            >
              {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isActive ? "Visible in Discover" : "Hidden from Discover"}
            </button>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full py-3 rounded-full bg-amber-400 text-black font-medium hover:bg-amber-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
