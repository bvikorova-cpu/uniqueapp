import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Crown, Newspaper, MessagesSquare, Handshake, Lock, Sparkles, Loader2, ArrowRight, Gavel } from "lucide-react";
import CouncilTab from "@/components/exclusive/CouncilTab";

const CARDS = [
  {
    key: "feed",
    icon: Newspaper,
    title: "Feed",
    tagline: "Insider signal, curated daily.",
    desc: "A private stream of market moves, off-market opportunities and cultural intel — hand-picked, never algorithmic.",
    href: "/exclusive/feed",
  },
  {
    key: "forum",
    icon: MessagesSquare,
    title: "Forum",
    tagline: "Mastermind, behind closed doors.",
    desc: "A silent room of peers. Ask anything, share anything. Encrypted, moderated, off the record.",
    href: "/exclusive/forum",
  },
  {
    key: "connection",
    icon: Handshake,
    title: "Connection",
    tagline: "Double-blind introductions.",
    desc: "Matched by intent, not by name. Identities revealed only when both sides agree.",
    href: "/exclusive/connection",
  },
] as const;

export default function Exclusive() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [tab, setTab] = useState<"rooms" | "council">("rooms");

  const success = params.get("success") === "true";
  const canceled = params.get("canceled") === "true";

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) { setIsMember(false); return; }
      const { data } = await supabase
        .from("exclusive_members")
        .select("id, status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) setIsMember(!!data && data.status === "active");
    };
    load();
    return () => { cancelled = true; };
  }, [user, success]);

  useEffect(() => {
    if (success) toast.success("Welcome to Unique Exclusive.");
    if (canceled) toast("Checkout canceled.");
    if (success || canceled) {
      const t = setTimeout(() => setParams({}), 3000);
      return () => clearTimeout(t);
    }
  }, [success, canceled, setParams]);

  const priceLabel = useMemo(() => "€100,000", []);

  const startCheckout = async () => {
    if (!user) { navigate("/auth?redirect=/exclusive"); return; }
    if (!acceptedTerms) {
      toast.error("Please accept the Terms of Use first.");
      return;
    }
    setLoading(true);
    const tab = window.open("about:blank", "_blank");
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          product: "exclusive",
          productName: "Unique Exclusive — €100,000 / month",
          amount: 10000000,
          mode: "subscription",
          interval: "month",
        },
      });
      const url = (data as any)?.url;
      if (url) {
        if (tab) tab.location.href = url;
        else window.location.href = url;
        return;
      }
      if (tab) tab.close();
      const msg = (error as any)?.message || (data as any)?.error || "No checkout URL returned";
      throw new Error(msg);
    } catch (e) {
      if (tab && !tab.closed) tab.close();
      toast.error((e as Error).message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f5e9c9]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 20% -10%, rgba(212,175,55,0.15), transparent 60%), radial-gradient(1000px 500px at 90% 10%, rgba(120,80,20,0.18), transparent 60%), linear-gradient(180deg, #050505 0%, #0a0806 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-5 pt-20 pb-24">
        {/* Header */}
        <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.5em] text-[#d4af37]">
          <Sparkles className="h-3 w-3" /> By invitation. By initiation.
        </div>
        <h1
          className="font-serif text-5xl leading-[0.95] tracking-tight md:text-7xl"
          style={{
            background: "linear-gradient(180deg, #f7e7b0 0%, #d4af37 55%, #8a6a1c 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Unique Exclusive
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[#c9bfa4]/90">
          A private circle inside Unique. Three rooms. Nothing else.
        </p>

        {/* Member status pill */}
        <div className="mt-8">
          {isMember === null ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 px-5 py-2 text-xs text-[#c9bfa4]">
              <Loader2 className="h-3 w-3 animate-spin" /> Verifying status…
            </div>
          ) : isMember ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/50 bg-[#d4af37]/10 px-5 py-2 text-xs font-medium text-[#f7e7b0]">
              <Crown className="h-3.5 w-3.5" /> You are a member
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/20 px-5 py-2 text-xs text-[#c9bfa4]/70">
              <Lock className="h-3.5 w-3.5" /> Locked · {priceLabel} / month
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-8 inline-flex rounded-full border border-[#d4af37]/25 bg-black/30 p-1 text-xs uppercase tracking-[0.25em]">
          <button
            onClick={() => setTab("rooms")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${tab === "rooms" ? "bg-[#d4af37]/20 text-[#f7e7b0]" : "text-[#c9bfa4]/70 hover:text-[#f7e7b0]"}`}
          >
            <Crown className="h-3.5 w-3.5" /> Rooms
          </button>
          <button
            onClick={() => setTab("council")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${tab === "council" ? "bg-[#d4af37]/20 text-[#f7e7b0]" : "text-[#c9bfa4]/70 hover:text-[#f7e7b0]"}`}
          >
            <Gavel className="h-3.5 w-3.5" /> Council
          </button>
        </div>

        {tab === "council" ? (
          <CouncilTab isMember={!!isMember} />
        ) : (
        <>
        {/* 3 cards */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {CARDS.map(({ key, icon: Icon, title, tagline, desc, href }) => {
            const locked = !isMember;
            return (
              <button
                key={key}
                onClick={() => (locked ? toast("Membership required to enter.") : navigate(href))}
                className="group relative overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-gradient-to-b from-[#0e0b06] to-[#050403] p-6 text-left transition-all hover:border-[#d4af37]/50"
                style={{
                  boxShadow: "0 20px 60px -30px rgba(212,175,55,0.35)",
                }}
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10">
                  <Icon className="h-5 w-5 text-[#f7e7b0]" />
                </div>
                <div className="font-serif text-2xl text-[#f5e9c9]">{title}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[#d4af37]/80">{tagline}</div>
                <p className="mt-4 text-sm leading-relaxed text-[#c9bfa4]/80">{desc}</p>

                <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#f7e7b0] opacity-70 transition-opacity group-hover:opacity-100">
                  {locked ? (<><Lock className="h-3 w-3" /> Locked</>) : (<>Enter <ArrowRight className="h-3 w-3" /></>)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Checkout gate for non-members */}
        {!isMember && isMember !== null && (
          <div
            className="mt-12 overflow-hidden rounded-2xl border p-8"
            style={{
              borderColor: "rgba(212,175,55,0.35)",
              background: "linear-gradient(160deg, rgba(20,15,8,0.9) 0%, rgba(10,8,4,0.95) 100%)",
            }}
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.4em] text-[#d4af37]">Membership</div>
                <div className="mt-2 flex items-baseline gap-2 font-serif text-5xl text-[#f7e7b0] md:text-6xl">
                  {priceLabel}
                  <span className="text-base font-normal tracking-widest text-[#c9bfa4]/70">/ month</span>
                </div>
                <div className="mt-1 text-sm text-[#c9bfa4]/70">Cancel anytime · Non-transferable</div>
              </div>
            </div>

            {/* Terms of Use */}
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-[#d4af37]/15 bg-black/30 p-4 text-sm text-[#c9bfa4]/85">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[#d4af37]"
              />
              <span>
                I understand that Unique Exclusive grants access to a private network, tools, and curated
                introductions — <span className="text-[#f7e7b0]">not a guarantee of any specific financial, business,
                or personal outcome</span>. Membership is non-refundable for the current billing period.
              </span>
            </label>

            <button
              onClick={startCheckout}
              disabled={loading || !acceptedTerms}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-medium uppercase tracking-[0.25em] text-[#0a0806] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
              style={{
                background: "linear-gradient(180deg, #f7e7b0 0%, #d4af37 60%, #8a6a1c 100%)",
                boxShadow: "0 10px 40px -10px rgba(212,175,55,0.6)",
              }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {loading ? "Opening vault…" : "Request initiation"}
            </button>
          </div>
        )}
        </>
        )}



        <div className="mt-12 text-center text-[10px] uppercase tracking-[0.5em] text-[#d4af37]/60">
          Unique · Exclusive · MMXXVI
        </div>
      </div>
    </div>
  );
}
