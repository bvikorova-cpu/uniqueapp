import { Crown, Shield, Handshake, Globe2, Gem, Gavel, Eye, Plane, Briefcase, Sparkles, Lock, Phone, TrendingUp, Users, Heart, Scale, Clock, Key, MessagesSquare } from "lucide-react";

const PILLARS = [
  {
    icon: Key,
    title: "Access, not content",
    desc: "You aren't buying posts. You're buying the key to a room the internet cannot enter.",
  },
  {
    icon: Users,
    title: "A peer group of ~100",
    desc: "Membership is capped. Every seat is vetted. No influencers, no tourists, no noise.",
  },
  {
    icon: Gavel,
    title: "Council vote (30%)",
    desc: "You shape what gets built next. Members hold a 30% advisory vote on every proposal.",
  },
  {
    icon: Shield,
    title: "Ghost mode by default",
    desc: "No public profile. No search indexing. No screenshots. Identity revealed only on mutual consent.",
  },
];

const BENEFITS = [
  { icon: Sparkles, title: "Insider Feed", desc: "Off-market deals, pre-IPO whispers, cultural intel — curated by humans, never by an algorithm." },
  { icon: Handshake, title: "Double-blind Introductions", desc: "Matched by intent and capital, not by name. Both sides consent before identities unlock." },
  { icon: MessagesSquare, title: "Silent Forum", desc: "Encrypted mastermind room. Ask anything under a pseudonym. Nothing leaves." },
  { icon: Phone, title: "24/7 AI Concierge", desc: "Instant answers on travel, legal, tax, art, real estate — trained on private wealth playbooks." },
  { icon: Plane, title: "Global Doors Open", desc: "Priority access to closed events, private clubs, yachts, chalets and hard-to-book restaurants." },
  { icon: Briefcase, title: "Deal Flow", desc: "Members-only pipeline of ventures, real estate and collectibles. Co-invest with peers." },
  { icon: Gem, title: "Collector Circle", desc: "Access to art, watches, wine and rare assets before they hit the public market." },
  { icon: Scale, title: "Discreet Advisory", desc: "Warm intros to top-tier lawyers, family offices, private bankers and security specialists." },
  { icon: Heart, title: "Philanthropy Table", desc: "Pool capital with peers on high-impact causes. Full transparency, zero platform fee." },
  { icon: TrendingUp, title: "Founder's Ear", desc: "Directly influence the roadmap. Your proposal can become a product within weeks." },
  { icon: Eye, title: "Zero Advertising", desc: "No ads. No tracking. No monetization of your attention. Ever." },
  { icon: Clock, title: "White-glove Onboarding", desc: "A dedicated human walks you through your first 30 days. Concierge on day one." },
];


export default function WhyJoin() {
  return (
    <section className="mt-16">
      <div className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.5em] text-[#d4af37]">
        <Crown className="h-3 w-3" /> Why €100,000 / month
      </div>
      <h2
        className="font-serif text-4xl leading-tight md:text-5xl"
        style={{
          background: "linear-gradient(180deg, #f7e7b0 0%, #d4af37 55%, #8a6a1c 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        What you actually get
      </h2>
      <p className="mt-4 max-w-2xl text-[#c9bfa4]/85">
        Membership is priced to keep the room small. Everything below is included from day one — no upsells,
        no add-ons, no hidden tiers.
      </p>

      {/* 4 pillars */}
      <div className="mt-10 grid gap-3 md:grid-cols-2">
        {PILLARS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-[#d4af37]/25 bg-gradient-to-b from-[#0e0b06] to-[#050403] p-6"
            style={{ boxShadow: "0 20px 60px -30px rgba(212,175,55,0.35)" }}
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10">
              <Icon className="h-4 w-4 text-[#f7e7b0]" />
            </div>
            <div className="font-serif text-xl text-[#f5e9c9]">{title}</div>
            <p className="mt-2 text-sm leading-relaxed text-[#c9bfa4]/80">{desc}</p>
          </div>
        ))}
      </div>

      {/* 12 benefits grid */}
      <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 md:grid-cols-3">
        {BENEFITS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-[#0a0806] p-6">
            <div className="mb-3 flex items-center gap-2">
              <Icon className="h-4 w-4 text-[#d4af37]" />
              <div className="text-sm font-medium tracking-wide text-[#f7e7b0]">{title}</div>
            </div>
            <p className="text-sm leading-relaxed text-[#c9bfa4]/75">{desc}</p>
          </div>
        ))}
      </div>

      {/* Value math */}
      <div className="mt-10 rounded-2xl border border-[#d4af37]/25 bg-black/40 p-8">
        <div className="text-[10px] uppercase tracking-[0.4em] text-[#d4af37]">The math</div>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="space-y-3 text-sm text-[#c9bfa4]/85">
            {[
              ["Family-office style advisory", "€ 25,000 / mo elsewhere"],
              ["Private members' club dues", "€ 8,000 / mo elsewhere"],
              ["Deal flow curation", "€ 15,000 / mo elsewhere"],
              ["24/7 concierge", "€ 12,000 / mo elsewhere"],
              ["Encrypted peer network", "priceless"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-[#d4af37]/10 pb-2">
                <span>{k}</span>
                <span className="text-[#f7e7b0]">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/5 p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-[#c9bfa4]/70">All-in inside Unique</div>
            <div
              className="mt-2 font-serif text-5xl"
              style={{
                background: "linear-gradient(180deg, #f7e7b0 0%, #d4af37 55%, #8a6a1c 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              €100,000 / mo
            </div>
            <p className="mt-3 text-sm text-[#c9bfa4]/75">
              One membership. One private circle. Everything above included — with the Council vote on top.
            </p>
          </div>
        </div>
      </div>

      {/* Guarantees */}
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {[
          { icon: Lock, t: "Cancel anytime", d: "Stop next month with one click. Never a phone call." },
          { icon: Shield, t: "Discretion clause", d: "Legally binding NDA on every member. Leaks = removal." },
          { icon: Globe2, t: "Portable worldwide", d: "Your key works from Monaco, Singapore, NYC — everywhere." },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="flex items-start gap-3 rounded-xl border border-[#d4af37]/15 bg-black/30 p-4">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#d4af37]" />
            <div>
              <div className="text-sm font-medium text-[#f7e7b0]">{t}</div>
              <div className="text-xs text-[#c9bfa4]/70">{d}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
