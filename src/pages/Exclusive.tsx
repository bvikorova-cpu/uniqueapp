import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Crown, Diamond, Gem, Plane, Wine, Shield, Lock, Sparkles, Loader2 } from "lucide-react";

const PERKS = [
  { icon: Crown, title: "Private Concierge", desc: "24/7 white-glove concierge, dedicated account manager, and priority handling on every request." },
  { icon: Plane, title: "Private Events", desc: "Invitation-only gatherings, yacht weekends, and closed-door dinners with the Unique inner circle." },
  { icon: Diamond, title: "Onyx Profile", desc: "A one-of-one obsidian badge, hidden Exclusive-only profile theme, and top-of-feed sovereignty." },
  { icon: Gem, title: "Deal Flow", desc: "First look at partnerships, off-market opportunities, and Unique Ventures co-invests." },
  { icon: Wine, title: "Members Lounge", desc: "Encrypted lounge for members only. No feeds, no noise. Just signal." },
  { icon: Shield, title: "Privacy by Design", desc: "Anonymous handles, hardened moderation, and legal cover for public appearances." },
];

export default function Exclusive() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isMember, setIsMember] = useState<boolean | null>(null);

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
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product: "exclusive" },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error("No checkout URL returned");
    } catch (e) {
      toast.error((e as Error).message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f5e9c9]">
      {/* Ambient obsidian + gold background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 20% -10%, rgba(212,175,55,0.15), transparent 60%), radial-gradient(1000px 500px at 90% 10%, rgba(120,80,20,0.18), transparent 60%), linear-gradient(180deg, #050505 0%, #0a0806 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-screen"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(212,175,55,0.4) 0 1px, transparent 1px 22px)",
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
          The private circle inside Unique. No categories. No noise. A single room for the few who move markets, taste, and culture.
        </p>

        {/* Price card */}
        <div
          className="mt-10 overflow-hidden rounded-2xl border p-8 md:p-10"
          style={{
            borderColor: "rgba(212,175,55,0.35)",
            background:
              "linear-gradient(160deg, rgba(20,15,8,0.9) 0%, rgba(10,8,4,0.95) 100%)",
            boxShadow:
              "0 0 0 1px rgba(212,175,55,0.15) inset, 0 30px 80px -20px rgba(212,175,55,0.25)",
          }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.4em] text-[#d4af37]">Initiation</div>
              <div className="mt-2 font-serif text-6xl text-[#f7e7b0] md:text-7xl">{priceLabel}</div>
              <div className="mt-1 text-sm text-[#c9bfa4]/70">One-time · Lifetime membership · Non-transferable</div>
            </div>

            {isMember === null ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 px-6 py-3 text-sm text-[#c9bfa4]">
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying status…
              </div>
            ) : isMember ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/50 bg-[#d4af37]/10 px-6 py-3 text-sm font-medium text-[#f7e7b0]">
                <Crown className="h-4 w-4" /> You are a member
              </div>
            ) : (
              <button
                onClick={startCheckout}
                disabled={loading}
                className="group relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-medium uppercase tracking-[0.25em] text-[#0a0806] transition-transform hover:scale-[1.02] disabled:opacity-60"
                style={{
                  background: "linear-gradient(180deg, #f7e7b0 0%, #d4af37 60%, #8a6a1c 100%)",
                  boxShadow: "0 10px 40px -10px rgba(212,175,55,0.6)",
                }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {loading ? "Opening vault…" : "Request initiation"}
              </button>
            )}
          </div>

          <div className="mt-8 grid gap-4 border-t border-[#d4af37]/15 pt-6 md:grid-cols-3">
            {[
              ["Membership", "Lifetime"],
              ["Seats", "Strictly limited"],
              ["Vetting", "Manual review"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-[10px] uppercase tracking-[0.4em] text-[#d4af37]/80">{k}</div>
                <div className="mt-1 font-serif text-xl text-[#f5e9c9]">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Perks */}
        <div className="mt-14">
          <div className="mb-6 text-[10px] uppercase tracking-[0.5em] text-[#d4af37]">Inside the room</div>
          <div className="grid gap-4 md:grid-cols-2">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-[#d4af37]/15 bg-gradient-to-b from-[#0e0b06] to-[#050403] p-6 transition-colors hover:border-[#d4af37]/40"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10">
                  <Icon className="h-5 w-5 text-[#f7e7b0]" />
                </div>
                <div className="font-serif text-xl text-[#f5e9c9]">{title}</div>
                <p className="mt-2 text-sm leading-relaxed text-[#c9bfa4]/80">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-14 rounded-xl border border-[#d4af37]/15 bg-black/40 p-6">
          <div className="mb-3 text-[10px] uppercase tracking-[0.5em] text-[#d4af37]">How it works</div>
          <ol className="space-y-3 text-sm text-[#c9bfa4]/85">
            <li><span className="text-[#f7e7b0]">1. Request initiation.</span> Pay the €100,000 initiation via secure Stripe checkout.</li>
            <li><span className="text-[#f7e7b0]">2. Instant activation.</span> On payment confirmation your account is upgraded to Exclusive — Onyx badge, private routes, and lounge access unlock immediately.</li>
            <li><span className="text-[#f7e7b0]">3. Concierge intake.</span> Your dedicated concierge reaches out within 24 hours to tailor your access, invitations, and privacy settings.</li>
            <li><span className="text-[#f7e7b0]">4. Lifetime.</span> Membership never expires. It is non-transferable and can be revoked only for violations of the members' code.</li>
          </ol>
        </div>

        <div className="mt-10 text-center text-[10px] uppercase tracking-[0.5em] text-[#d4af37]/60">
          Unique · Exclusive · MMXXVI
        </div>
      </div>
    </div>
  );
}
