import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Plus, ThumbsUp, ThumbsDown, Gavel, ShieldCheck, Ban, CheckCircle2 } from "lucide-react";

type Proposal = {
  id: string;
  author_id: string;
  title: string;
  description: string;
  status: "open" | "approved" | "vetoed" | "implemented";
  owner_note: string | null;
  created_at: string;
};

type VoteRow = { proposal_id: string; voter_id: string; vote: number };

const STATUS_META: Record<Proposal["status"], { label: string; className: string }> = {
  open: { label: "Open · advisory", className: "border-[#d4af37]/40 text-[#f7e7b0]" },
  approved: { label: "Approved by Owner", className: "border-emerald-500/50 text-emerald-300" },
  vetoed: { label: "Vetoed by Owner", className: "border-red-500/50 text-red-300" },
  implemented: { label: "Implemented", className: "border-sky-500/50 text-sky-300" },
};

export default function CouncilTab({ isMember }: { isMember: boolean }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [votes, setVotes] = useState<VoteRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const load = async () => {
    setLoading(true);
    const [{ data: props }, { data: v }] = await Promise.all([
      supabase.from("exclusive_proposals").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("exclusive_proposal_votes").select("proposal_id, voter_id, vote"),
    ]);
    setProposals((props ?? []) as Proposal[]);
    setVotes((v ?? []) as VoteRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!isMember && !isAdmin) { setLoading(false); return; }
    load();
    const ch = supabase
      .channel("exclusive-council")
      .on("postgres_changes", { event: "*", schema: "public", table: "exclusive_proposals" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "exclusive_proposal_votes" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isMember, isAdmin]);

  const tallies = useMemo(() => {
    const map = new Map<string, { up: number; down: number; mine: number | null }>();
    for (const p of proposals) map.set(p.id, { up: 0, down: 0, mine: null });
    for (const v of votes) {
      const t = map.get(v.proposal_id);
      if (!t) continue;
      if (v.vote > 0) t.up += 1; else t.down += 1;
      if (user && v.voter_id === user.id) t.mine = v.vote;
    }
    return map;
  }, [proposals, votes, user]);

  const submitProposal = async () => {
    if (!user) return;
    if (title.trim().length < 3 || desc.trim().length < 10) {
      toast.error("Title min 3 chars, description min 10 chars.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("exclusive_proposals").insert({
      author_id: user.id, title: title.trim(), description: desc.trim(),
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Proposal submitted to the Council.");
    setTitle(""); setDesc(""); setShowForm(false);
  };

  const castVote = async (proposalId: string, vote: 1 | -1) => {
    if (!user) return;
    const existing = tallies.get(proposalId)?.mine;
    if (existing === vote) {
      const { error } = await supabase.from("exclusive_proposal_votes")
        .delete().eq("proposal_id", proposalId).eq("voter_id", user.id);
      if (error) toast.error(error.message);
      return;
    }
    const { error } = await supabase.from("exclusive_proposal_votes")
      .upsert({ proposal_id: proposalId, voter_id: user.id, vote }, { onConflict: "proposal_id,voter_id" });
    if (error) toast.error(error.message);
  };

  const ownerDecide = async (p: Proposal, status: Proposal["status"]) => {
    const note = window.prompt(`Owner note for "${p.title}" (optional):`, p.owner_note ?? "") ?? p.owner_note;
    const { error } = await supabase.from("exclusive_proposals").update({
      status, owner_note: note, decided_at: new Date().toISOString(), decided_by: user?.id ?? null,
    }).eq("id", p.id);
    if (error) toast.error(error.message);
    else toast.success(`Marked ${status}.`);
  };

  if (!isMember && !isAdmin) {
    return (
      <div className="mt-10 rounded-2xl border border-[#d4af37]/20 bg-black/30 p-6 text-sm text-[#c9bfa4]/70">
        The Council is reserved for active Exclusive members.
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.5em] text-[#d4af37]">
            <Gavel className="h-3 w-3" /> The Council
          </div>
          <h2 className="mt-2 font-serif text-3xl text-[#f5e9c9] md:text-4xl">Propose. Vote. Owner decides.</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#c9bfa4]/80">
            Members carry <span className="text-[#f7e7b0]">30%</span> advisory weight.
            The Owner holds <span className="text-[#f7e7b0]">70%</span> and the final veto.
          </p>
        </div>
        {isMember && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-[#f7e7b0] hover:bg-[#d4af37]/20"
          >
            <Plus className="h-3.5 w-3.5" /> {showForm ? "Close" : "New proposal"}
          </button>
        )}
      </div>

      {showForm && isMember && (
        <div className="mt-6 rounded-2xl border border-[#d4af37]/30 bg-black/40 p-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Proposal title"
            maxLength={140}
            className="w-full rounded-lg border border-[#d4af37]/20 bg-black/60 px-4 py-3 text-sm text-[#f5e9c9] placeholder:text-[#c9bfa4]/40 focus:border-[#d4af37]/60 focus:outline-none"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe your idea, its value, and any references (10–4000 chars)."
            maxLength={4000}
            rows={5}
            className="mt-3 w-full rounded-lg border border-[#d4af37]/20 bg-black/60 px-4 py-3 text-sm text-[#f5e9c9] placeholder:text-[#c9bfa4]/40 focus:border-[#d4af37]/60 focus:outline-none"
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={submitProposal}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full px-6 py-2 text-xs uppercase tracking-[0.25em] text-[#0a0806] disabled:opacity-50"
              style={{ background: "linear-gradient(180deg,#f7e7b0 0%,#d4af37 60%,#8a6a1c 100%)" }}
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              Submit to Council
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[#c9bfa4]/60"><Loader2 className="h-4 w-4 animate-spin" /> Loading Council…</div>
        ) : proposals.length === 0 ? (
          <div className="rounded-2xl border border-[#d4af37]/15 bg-black/20 p-8 text-center text-sm text-[#c9bfa4]/60">
            No proposals yet. Be the first voice.
          </div>
        ) : (
          proposals.map((p) => {
            const t = tallies.get(p.id) ?? { up: 0, down: 0, mine: null };
            const memberScore = t.up - t.down;
            const totalVotes = t.up + t.down;
            // Weighted display: members 30%, owner 70% (owner decision reflected in status)
            const memberPct = totalVotes > 0 ? Math.round((t.up / totalVotes) * 100) : 0;
            const weightedAdvisory = totalVotes > 0 ? Math.round(memberPct * 0.3) : 0;
            const meta = STATUS_META[p.status];
            return (
              <div key={p.id} className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-b from-[#0e0b06] to-[#050403] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.25em] ${meta.className}`}>
                      {meta.label}
                    </div>
                    <h3 className="mt-2 font-serif text-xl text-[#f5e9c9]">{p.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[#c9bfa4]/85">{p.description}</p>
                    {p.owner_note && (
                      <div className="mt-3 rounded-lg border border-[#d4af37]/20 bg-black/30 p-3 text-xs text-[#f7e7b0]">
                        <span className="uppercase tracking-[0.25em] text-[#d4af37]/80">Owner note · </span>
                        {p.owner_note}
                      </div>
                    )}
                  </div>

                  {isMember && p.status === "open" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => castVote(p.id, 1)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs ${t.mine === 1 ? "border-[#d4af37] bg-[#d4af37]/20 text-[#f7e7b0]" : "border-[#d4af37]/25 text-[#c9bfa4] hover:border-[#d4af37]/60"}`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" /> {t.up}
                      </button>
                      <button
                        onClick={() => castVote(p.id, -1)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs ${t.mine === -1 ? "border-red-400 bg-red-500/15 text-red-200" : "border-[#d4af37]/25 text-[#c9bfa4] hover:border-red-400/60"}`}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" /> {t.down}
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] uppercase tracking-[0.2em] text-[#c9bfa4]/70">
                  <div className="rounded-lg border border-[#d4af37]/10 bg-black/30 px-3 py-2">
                    Members · <span className="text-[#f7e7b0]">{memberPct}%</span> approve
                  </div>
                  <div className="rounded-lg border border-[#d4af37]/10 bg-black/30 px-3 py-2">
                    Weighted · <span className="text-[#f7e7b0]">{weightedAdvisory}% / 30%</span>
                  </div>
                  <div className="rounded-lg border border-[#d4af37]/10 bg-black/30 px-3 py-2">
                    Owner · <span className="text-[#f7e7b0]">70%</span> final
                  </div>
                </div>

                {isAdmin && p.status === "open" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => ownerDecide(p, "approved")}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-emerald-200 hover:bg-emerald-500/20"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => ownerDecide(p, "vetoed")}
                      className="inline-flex items-center gap-1 rounded-full border border-red-500/50 bg-red-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-red-200 hover:bg-red-500/20"
                    >
                      <Ban className="h-3.5 w-3.5" /> Veto
                    </button>
                    <button
                      onClick={() => ownerDecide(p, "implemented")}
                      className="inline-flex items-center gap-1 rounded-full border border-sky-500/50 bg-sky-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-sky-200 hover:bg-sky-500/20"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" /> Implemented
                    </button>
                  </div>
                )}
                {isAdmin && p.status !== "open" && (
                  <div className="mt-4">
                    <button
                      onClick={() => ownerDecide(p, "open")}
                      className="text-[10px] uppercase tracking-[0.3em] text-[#c9bfa4]/60 hover:text-[#f7e7b0]"
                    >
                      Reopen
                    </button>
                  </div>
                )}

                <div className="mt-3 text-[10px] uppercase tracking-[0.3em] text-[#c9bfa4]/40">
                  {new Date(p.created_at).toLocaleDateString()} · Score {memberScore >= 0 ? `+${memberScore}` : memberScore}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
