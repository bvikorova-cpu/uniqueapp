import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

const SLIDES: { title: string; render: () => JSX.Element }[] = [
  {
    title: "Unique — Title",
    render: () => (
      <div className="h-full flex flex-col items-center justify-center text-center px-16">
        <div className="text-[22px] tracking-[0.4em] uppercase text-white/60 mb-8">Investor Pitch · 2026</div>
        <h1 className="font-['Lobster_Two'] text-[180px] leading-none bg-gradient-to-br from-purple-300 via-pink-300 to-fuchsia-200 bg-clip-text text-transparent mb-6">Unique</h1>
        <p className="text-[40px] text-white/90 font-light max-w-4xl">The pay-only social super-app that pays creators what FB, IG and TikTok won't.</p>
        <div className="mt-16 text-white/50 text-[20px]">Seeking €5M Seed · €40M post-money</div>
      </div>
    ),
  },
  {
    title: "Problem",
    render: () => (
      <SlideShell kicker="01 · Problem">
        <h2 className="text-[88px] leading-[0.95] font-bold mb-12">Creators carry the platforms.<br/><span className="text-pink-300">Platforms keep the money.</span></h2>
        <div className="grid grid-cols-3 gap-8 text-[28px]">
          <Stat big="55%" label="of TikTok creators earn under €100/mo" />
          <Stat big="0.04€" label="Meta pays per 1,000 views" />
          <Stat big="30%" label="App Store cut on every purchase" />
        </div>
      </SlideShell>
    ),
  },
  {
    title: "Solution",
    render: () => (
      <SlideShell kicker="02 · Solution">
        <h2 className="text-[88px] leading-[0.95] font-bold mb-10">One paid platform.<br/><span className="text-purple-300">15 monetization streams.</span></h2>
        <div className="grid grid-cols-2 gap-6 text-[26px]">
          {["Creator subs 85/15", "Bazaar 80/20", "AI credits", "Megatalent €10k/Q", "Brand Arena enterprise", "Dating premium", "Music streaming", "Jobs marketplace"].map((s) => (
            <div key={s} className="bg-white/5 backdrop-blur rounded-2xl px-6 py-4 border border-white/10">{s}</div>
          ))}
        </div>
      </SlideShell>
    ),
  },
  {
    title: "Why now",
    render: () => (
      <SlideShell kicker="03 · Why now">
        <h2 className="text-[88px] font-bold mb-10">Creator exodus is real.</h2>
        <ul className="space-y-6 text-[32px] text-white/90">
          <li>→ Creators publicly leaving Meta over algorithmic suppression</li>
          <li>→ EU DSA forces transparent revenue models</li>
          <li>→ Gen Z pays for ad-free experiences (Spotify, YouTube Premium)</li>
          <li>→ AI tools commoditize content — distribution is the moat</li>
        </ul>
      </SlideShell>
    ),
  },
  {
    title: "Market",
    render: () => (
      <SlideShell kicker="04 · Market">
        <h2 className="text-[88px] font-bold mb-12">€500B+ TAM</h2>
        <div className="grid grid-cols-3 gap-10">
          <MarketCard label="TAM" value="€520B" sub="Global social + creator econ. 2026" />
          <MarketCard label="SAM" value="€85B" sub="Paying social users (EU + US)" />
          <MarketCard label="SOM (Y5)" value="€2.4B" sub="200M MAU × €12/yr" />
        </div>
      </SlideShell>
    ),
  },
  {
    title: "Product",
    render: () => (
      <SlideShell kicker="05 · Product">
        <h2 className="text-[88px] font-bold mb-10">15 verticals. One identity.</h2>
        <div className="grid grid-cols-5 gap-4 text-[22px]">
          {["Wall","Shorts","Megatalent","Bazaar","Jobs","Dating","Music","Kids","Education","Wellness","Brand Arena","Crystal Energy","Creators","Fundraising","AI Studio"].map((v) => (
            <div key={v} className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl py-5 text-center border border-white/10 backdrop-blur">{v}</div>
          ))}
        </div>
      </SlideShell>
    ),
  },
  {
    title: "Business model",
    render: () => (
      <SlideShell kicker="06 · Business model">
        <h2 className="text-[88px] font-bold mb-12">Revenue mix</h2>
        <div className="space-y-4 text-[28px]">
          <Bar label="Creator subs (15%)" pct={22} />
          <Bar label="Bazaar fees (20%)" pct={28} />
          <Bar label="AI credits" pct={18} />
          <Bar label="Megatalent + voting" pct={12} />
          <Bar label="Brand Arena enterprise" pct={14} />
          <Bar label="Dating + Music + Other" pct={6} />
        </div>
      </SlideShell>
    ),
  },
  {
    title: "Traction",
    render: () => (
      <SlideShell kicker="07 · Traction">
        <h2 className="text-[88px] font-bold mb-12">Platform live in EU</h2>
        <div className="grid grid-cols-4 gap-6">
          <Stat big="MVP" label="Live: uniqueapp.fun" />
          <Stat big="12" label="Languages supported" />
          <Stat big="100%" label="EUR enforced, RLS hardened" />
          <Stat big="Soft-Go" label="Audit status (50 PDF)" />
        </div>
      </SlideShell>
    ),
  },
  {
    title: "Projections",
    render: () => (
      <SlideShell kicker="08 · 5-year plan">
        <h2 className="text-[88px] font-bold mb-10">€324M net profit by Y5</h2>
        <table className="w-full text-[26px]">
          <thead className="text-purple-300 border-b border-white/20">
            <tr><th className="text-left py-3">Year</th><th>MAU</th><th>ARPU/yr</th><th>Gross</th><th className="text-right">Net</th></tr>
          </thead>
          <tbody className="[&_td]:py-4 [&_td]:text-center [&_td:first-child]:text-left">
            <tr className="border-b border-white/5"><td>Y1</td><td>50K</td><td>€144</td><td>€576K</td><td className="text-right">€216K</td></tr>
            <tr className="border-b border-white/5"><td>Y2</td><td>500K</td><td>€120</td><td>€3.6M</td><td className="text-right">€1.7M</td></tr>
            <tr className="border-b border-white/5"><td>Y3</td><td>5M</td><td>€96</td><td>€24M</td><td className="text-right">€13M</td></tr>
            <tr className="border-b border-white/5"><td>Y4</td><td>50M</td><td>€84</td><td>€168M</td><td className="text-right">€102M</td></tr>
            <tr className="text-pink-300 font-bold"><td>Y5</td><td>200M</td><td>€72</td><td>€504M</td><td className="text-right">€324M</td></tr>
          </tbody>
        </table>
      </SlideShell>
    ),
  },
  {
    title: "Competition",
    render: () => (
      <SlideShell kicker="09 · Competition">
        <h2 className="text-[88px] font-bold mb-10">We pay. They don't.</h2>
        <div className="grid grid-cols-4 gap-4 text-[24px]">
          {[
            { n: "Meta", rev: "€44/MAU", split: "0–5%" },
            { n: "TikTok", rev: "€13/MAU", split: "5%" },
            { n: "Snap", rev: "€6/MAU", split: "0%" },
            { n: "Unique", rev: "€30/MAU", split: "80–85%", hi: true },
          ].map((c) => (
            <div key={c.n} className={`rounded-2xl p-6 border ${c.hi ? "bg-gradient-to-br from-purple-500 to-pink-500 border-pink-300" : "bg-white/5 border-white/10"}`}>
              <div className="font-bold text-[32px] mb-4">{c.n}</div>
              <div className="opacity-70">ARPU</div><div className="text-[28px] mb-3">{c.rev}</div>
              <div className="opacity-70">Creator split</div><div className="text-[28px]">{c.split}</div>
            </div>
          ))}
        </div>
      </SlideShell>
    ),
  },
  {
    title: "Team",
    render: () => (
      <SlideShell kicker="10 · Team">
        <h2 className="text-[88px] font-bold mb-12">Founding team</h2>
        <p className="text-[32px] text-white/80 max-w-4xl">Beata Vikorova — Founder & CEO. Vision-driven, operator. Building Unique with AI-accelerated dev velocity equivalent to 30+ engineer team.</p>
        <p className="text-[24px] text-white/50 mt-12">Hiring with seed: CTO, Head of Growth, Trust & Safety lead, 6× full-stack.</p>
      </SlideShell>
    ),
  },
  {
    title: "Ask",
    render: () => (
      <div className="h-full flex flex-col items-center justify-center text-center px-16 bg-gradient-to-br from-purple-900 via-fuchsia-900 to-pink-900">
        <div className="text-[22px] tracking-[0.4em] uppercase text-white/60 mb-8">The ask</div>
        <h1 className="font-['Lobster_Two'] text-[160px] leading-none bg-gradient-to-br from-white via-pink-200 to-purple-200 bg-clip-text text-transparent mb-10">€5M Seed</h1>
        <div className="grid grid-cols-3 gap-12 text-[26px] text-white/90 max-w-5xl">
          <div><div className="text-pink-300 font-bold text-[40px]">40%</div>Engineering + AI infra</div>
          <div><div className="text-pink-300 font-bold text-[40px]">35%</div>Growth + creator acquisition</div>
          <div><div className="text-pink-300 font-bold text-[40px]">25%</div>Trust, safety, compliance</div>
        </div>
        <div className="mt-16 text-[28px] text-white/80">beata.vikorova@unique.fun · uniqueapp.fun</div>
      </div>
    ),
  },
];

function SlideShell({ kicker, children }: { kicker: string; children: React.ReactNode }) {
  return (
    <div className="h-full p-20 flex flex-col">
      <div className="text-[22px] tracking-[0.3em] uppercase text-purple-300 mb-8">{kicker}</div>
      <div className="flex-1 flex flex-col justify-center">{children}</div>
      <div className="text-[18px] text-white/30 mt-8">Unique · Investor Pitch · 2026</div>
    </div>
  );
}
function Stat({ big, label }: { big: string; label: string }) {
  return (
    <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10">
      <div className="text-[64px] font-bold text-pink-300 leading-none mb-3">{big}</div>
      <div className="text-white/80 text-[24px]">{label}</div>
    </div>
  );
}
function MarketCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl p-10 border border-white/10 backdrop-blur">
      <div className="text-purple-300 uppercase tracking-widest text-[20px] mb-4">{label}</div>
      <div className="text-[80px] font-bold mb-2">{value}</div>
      <div className="text-white/60 text-[22px]">{sub}</div>
    </div>
  );
}
function Bar({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1"><span>{label}</span><span className="text-pink-300">{pct}%</span></div>
      <div className="h-4 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" style={{ width: `${pct * 3}%` }} />
      </div>
    </div>
  );
}

export default function Pitch() {
  const [idx, setIdx] = useState(0);
  const [scale, setScale] = useState(1);

  const next = useCallback(() => setIdx((i) => Math.min(SLIDES.length - 1, i + 1)), []);
  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const recalc = () => {
      const sx = window.innerWidth / 1920;
      const sy = window.innerHeight / 1080;
      setScale(Math.min(sx, sy));
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "f") document.documentElement.requestFullscreen?.();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [next, prev]);

  const slide = SLIDES[idx];

  return (
    <>
      <Helmet>
        <title>Unique — Investor Pitch Deck</title>
        <meta name="description" content="Unique pay-only social super-app investor pitch deck." />
      </Helmet>
      <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
        <div
          className="relative bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white shadow-2xl"
          style={{
            width: 1920, height: 1080,
            transform: `scale(${scale})`, transformOrigin: "center center",
          }}
        >
          {slide.render()}
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur rounded-full px-4 py-2 border border-white/10">
          <Button size="icon" variant="ghost" onClick={prev} disabled={idx === 0}><ChevronLeft className="w-5 h-5 text-white"/></Button>
          <span className="text-white text-sm px-3 tabular-nums">{idx + 1} / {SLIDES.length}</span>
          <Button size="icon" variant="ghost" onClick={next} disabled={idx === SLIDES.length - 1}><ChevronRight className="w-5 h-5 text-white"/></Button>
          <Button size="icon" variant="ghost" onClick={() => document.documentElement.requestFullscreen?.()}><Maximize2 className="w-4 h-4 text-white"/></Button>
          <Button size="icon" variant="ghost" onClick={() => window.print()}><Download className="w-4 h-4 text-white"/></Button>
        </div>

        {/* Slide picker */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-pink-400" : "w-2 bg-white/30"}`} />
          ))}
        </div>
      </div>
    </>
  );
}
