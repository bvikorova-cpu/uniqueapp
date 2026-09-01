import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadLobster } from "@remotion/google-fonts/LobsterTwo";

const ANTON = loadAnton().fontFamily;
const INTER = loadInter("normal", { weights: ["500", "700", "900"] }).fontFamily;
const LOBSTER = loadLobster("normal", { weights: ["700"] }).fontFamily;

const PINK = "#ff2d94";
const PURPLE = "#7c1fd6";
const LIME = "#c8ff2f";
const INK = "#08030f";
const CREAM = "#fff4fb";

const IMG = {
  talent: "images/talent.jpg",
  dating: "images/dating.jpg",
  ai: "images/ai.jpg",
  earn: "images/earn.jpg",
  friends: "images/friends.jpg",
  fitness: "images/fitness.jpg",
  kids: "images/kids.jpg",
  market: "images/market.jpg",
};

const pop = (frame: number, fps: number, delay = 0, damping = 14) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness: 200 } });

/* ---------------- shared pieces ---------------- */

/** Full-bleed photo with Ken Burns move + graded overlay */
const Photo: React.FC<{
  src: string;
  dur: number;
  zoom?: [number, number];
  pan?: [number, number];
  tint?: string;
  dark?: number;
}> = ({ src, dur, zoom = [1.12, 1.28], pan = [0, -40], tint = PURPLE, dark = 0.45 }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, dur], zoom, { extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, dur], [pan[0], pan[1]], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${s}) translateY(${y}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(8,3,15,${dark * 0.9}) 0%, rgba(8,3,15,0.05) 38%, rgba(8,3,15,0.55) 72%, rgba(8,3,15,0.96) 100%)`,
        }}
      />
      <AbsoluteFill style={{ background: tint, opacity: 0.16, mixBlendMode: "color" }} />
    </AbsoluteFill>
  );
};

/** Section badge — makes the "sekcie" explicit */
const SectionBadge: React.FC<{ label: string; index: string; color?: string; delay?: number }> = ({
  label,
  index,
  color = PINK,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, delay, 16);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity: s,
        transform: `translateX(${interpolate(s, [0, 1], [-70, 0])}px)`,
      }}
    >
      <div
        style={{
          fontFamily: INTER,
          fontWeight: 900,
          fontSize: 30,
          color: INK,
          background: color,
          padding: "10px 18px",
          borderRadius: 12,
          letterSpacing: 2,
        }}
      >
        {index}
      </div>
      <div
        style={{
          fontFamily: INTER,
          fontWeight: 900,
          fontSize: 34,
          color: CREAM,
          letterSpacing: 8,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
};

const BigLine: React.FC<{
  text: string;
  size?: number;
  color?: string;
  delay?: number;
  stroke?: string;
}> = ({ text, size = 128, color = CREAM, delay = 0, stroke }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, delay, 13);
  return (
    <div
      style={{
        fontFamily: ANTON,
        fontSize: size,
        lineHeight: 0.92,
        letterSpacing: -3,
        color: stroke ? "transparent" : color,
        WebkitTextStroke: stroke ? `4px ${stroke}` : undefined,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [70, 0])}px) scale(${interpolate(
          s,
          [0, 1],
          [0.86, 1],
        )})`,
        textShadow: stroke ? undefined : "0 18px 50px rgba(0,0,0,0.55)",
      }}
    >
      {text}
    </div>
  );
};

/** Money pill: the "you can earn" proof */
const EarnPill: React.FC<{ text: string; delay?: number; color?: string }> = ({
  text,
  delay = 0,
  color = LIME,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, delay, 11);
  return (
    <div
      style={{
        alignSelf: "flex-start",
        fontFamily: INTER,
        fontWeight: 900,
        fontSize: 40,
        color: INK,
        background: color,
        padding: "16px 26px",
        borderRadius: 999,
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.6, 1])}) rotate(-2deg)`,
        boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
      }}
    >
      {text}
    </div>
  );
};

const Content: React.FC<{ children: React.ReactNode; align?: "flex-end" | "center" }> = ({
  children,
  align = "flex-end",
}) => (
  <AbsoluteFill
    style={{
      padding: 76,
      paddingBottom: 150,
      justifyContent: align,
      alignItems: "flex-start",
      gap: 22,
    }}
  >
    {children}
  </AbsoluteFill>
);

/* ---------------- scene builders ---------------- */

type SceneProps = { dur: number };

const makeSection = (opts: {
  src: string;
  index: string;
  label: string;
  head: string;
  sub?: string;
  earn: string;
  color?: string;
  tint?: string;
}): React.FC<SceneProps> => {
  const C: React.FC<SceneProps> = ({ dur }) => (
    <AbsoluteFill>
      <Photo src={opts.src} dur={dur} tint={opts.tint ?? PURPLE} />
      <Content>
        <SectionBadge index={opts.index} label={opts.label} color={opts.color ?? PINK} />
        <BigLine text={opts.head} size={116} delay={5} />
        {opts.sub ? (
          <div
            style={{
              fontFamily: INTER,
              fontWeight: 700,
              fontSize: 40,
              color: CREAM,
              opacity: 0.86,
              maxWidth: 860,
              lineHeight: 1.2,
            }}
          >
            {opts.sub}
          </div>
        ) : null}
        <EarnPill text={opts.earn} delay={16} color={opts.color === LIME ? LIME : LIME} />
      </Content>
    </AbsoluteFill>
  );
  return C;
};

/* ---- hook scenes (one per variant) ---- */

const HookHype: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 0, 8);
  const shake = frame < 16 ? Math.sin(frame * 3) * (16 - frame) * 0.9 : 0;
  return (
    <AbsoluteFill>
      <Photo src={IMG.friends} dur={dur} zoom={[1.35, 1.1]} tint={PINK} dark={0.5} />
      <AbsoluteFill style={{ background: CREAM, opacity: frame < 3 ? 1 : 0 }} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translateX(${shake}px) scale(${interpolate(s, [0, 1], [1.4, 1])})`,
        }}
      >
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 168,
            lineHeight: 0.85,
            color: CREAM,
            textAlign: "center",
            textShadow: `10px 10px 0 ${PINK}, 0 30px 70px rgba(0,0,0,0.6)`,
            transform: "rotate(-3deg)",
          }}
        >
          ONE APP.
          <br />
          <span style={{ color: LIME }}>REAL MONEY.</span>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150 }}>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 900,
            fontSize: 40,
            letterSpacing: 6,
            color: CREAM,
            opacity: pop(frame, fps, 14, 16),
          }}
        >
          UNIQUE · uniqueapp.fun
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const HookStory: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Photo src={IMG.talent} dur={dur} zoom={[1.3, 1.08]} tint={PURPLE} dark={0.55} />
      <Content align="center">
        <BigLine text="SHE POSTED" size={132} />
        <BigLine text="ONE VIDEO." size={132} delay={8} />
        <BigLine text="€240 LATER…" size={132} delay={18} stroke={LIME} />
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: 38,
            color: CREAM,
            opacity: 0.85 * pop(frame, fps, 28, 18),
            marginTop: 16,
          }}
        >
          this is Unique.
        </div>
      </Content>
    </AbsoluteFill>
  );
};

const HookMoney: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = Math.round(
    interpolate(frame, [4, 44], [0, 1280], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  const beat = frame % 15;
  const kick = beat < 5 ? interpolate(beat, [0, 5], [1.08, 1]) : 1;
  return (
    <AbsoluteFill>
      <Photo src={IMG.earn} dur={dur} zoom={[1.25, 1.05]} tint={PINK} dark={0.5} />
      <Content align="center">
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 900,
            fontSize: 44,
            letterSpacing: 6,
            color: LIME,
            opacity: pop(frame, fps, 0, 16),
          }}
        >
          YOUR PAYOUT THIS MONTH
        </div>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 230,
            color: CREAM,
            letterSpacing: -8,
            transform: `scale(${kick})`,
            textShadow: `0 0 70px ${PINK}`,
          }}
        >
          €{count.toLocaleString("en-US")}
        </div>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 38, color: CREAM, opacity: 0.85 }}>
          gifts · tips · sales · prizes
        </div>
      </Content>
    </AbsoluteFill>
  );
};

/* ---- section index card (grid of all sections) ---- */

const SECTION_LIST = [
  "Megatalent",
  "Dating",
  "AI Studio",
  "Marketplace",
  "Fitness",
  "Kids",
  "Brain Duel",
  "Music",
  "Skills",
  "Bazaar",
  "Coffee",
  "Rewards",
];

const SectionIndex: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Photo src={IMG.friends} dur={dur} zoom={[1.2, 1.35]} tint={PURPLE} dark={0.75} />
      <AbsoluteFill style={{ background: "rgba(8,3,15,0.62)" }} />
      <AbsoluteFill style={{ padding: 76, justifyContent: "center", gap: 34 }}>
        <BigLine text="12+ SEKCIÍ." size={118} />
        <BigLine text="JEDEN ÚČET." size={118} delay={6} stroke={LIME} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 14 }}>
          {SECTION_LIST.map((s, i) => {
            const sp = pop(frame, fps, 12 + i * 2, 11);
            const bg = i % 3 === 0 ? CREAM : i % 3 === 1 ? PINK : "rgba(255,255,255,0.12)";
            const fg = i % 3 === 0 ? INK : CREAM;
            return (
              <div
                key={s}
                style={{
                  fontFamily: INTER,
                  fontWeight: 900,
                  fontSize: 38,
                  padding: "14px 24px",
                  borderRadius: 999,
                  background: bg,
                  color: fg,
                  border: "2px solid rgba(255,255,255,0.28)",
                  opacity: sp,
                  transform: `scale(${interpolate(sp, [0, 1], [0.4, 1])})`,
                }}
              >
                {s}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---- payout proof scene ---- */

const PAYOUTS = [
  { who: "Lucia", what: "gifts", amount: "€128" },
  { who: "Marek", what: "skills", amount: "€340" },
  { who: "Nina", what: "bazaar", amount: "€96" },
  { who: "Tomáš", what: "megatalent", amount: "€10 000" },
];

const PayoutProof: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Photo src={IMG.earn} dur={dur} zoom={[1.1, 1.3]} tint={PINK} dark={0.72} />
      <AbsoluteFill style={{ background: "rgba(8,3,15,0.55)" }} />
      <AbsoluteFill style={{ padding: 76, justifyContent: "center", gap: 20 }}>
        <BigLine text="REÁLNE VÝPLATY." size={104} />
        {PAYOUTS.map((p, i) => {
          const s = pop(frame, fps, 8 + i * 8, 12);
          return (
            <div
              key={p.who}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(255,255,255,0.10)",
                border: "2px solid rgba(255,255,255,0.25)",
                borderRadius: 26,
                padding: "22px 28px",
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [140, 0])}px)`,
              }}
            >
              <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 42, color: CREAM }}>
                {p.who} · <span style={{ opacity: 0.6 }}>{p.what}</span>
              </div>
              <div style={{ fontFamily: ANTON, fontSize: 56, color: LIME }}>{p.amount}</div>
            </div>
          );
        })}
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: 34,
            color: CREAM,
            opacity: 0.75,
            marginTop: 8,
          }}
        >
          výplata od 20 € · v eurách · priamo na účet
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---- CTA ---- */

const CTA: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = pop(frame, fps, 0, 9);
  const url = pop(frame, fps, 14, 12);
  const glow = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <AbsoluteFill>
      <Photo src={IMG.friends} dur={dur} zoom={[1.15, 1.3]} tint={PURPLE} dark={0.8} />
      <AbsoluteFill style={{ background: "rgba(8,3,15,0.7)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26 }}>
        <div
          style={{
            fontFamily: LOBSTER,
            fontWeight: 700,
            fontSize: 200,
            color: CREAM,
            transform: `scale(${glow * interpolate(logo, [0, 1], [0.4, 1])})`,
            textShadow: `0 0 80px ${PURPLE}, 0 0 150px ${PINK}`,
          }}
        >
          Unique
        </div>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 900,
            fontSize: 56,
            color: INK,
            background: LIME,
            padding: "22px 44px",
            borderRadius: 999,
            opacity: url,
            transform: `translateY(${interpolate(url, [0, 1], [60, 0])}px) rotate(-2deg)`,
          }}
        >
          uniqueapp.fun
        </div>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 900,
            fontSize: 38,
            letterSpacing: 6,
            color: CREAM,
            opacity: 0.9 * url,
          }}
        >
          INŠTALUJ · TVOR · ZARÁBAJ
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- sections ---------------- */

const SecTalent = makeSection({
  src: IMG.talent,
  index: "01",
  label: "Megatalent",
  head: "UKÁŽ SVOJ TALENT.",
  sub: "Hlasovanie, súboje, štvrťročná cena.",
  earn: "€10 000 pre víťaza",
  tint: PINK,
});

const SecDating = makeSection({
  src: IMG.dating,
  index: "02",
  label: "Dating & Social",
  head: "NÁJDI SVOJICH ĽUDÍ.",
  sub: "Swipe, chat, Wall, príbehy, darčeky.",
  earn: "darček = €0,25 pre teba",
  tint: PURPLE,
});

const SecAI = makeSection({
  src: IMG.ai,
  index: "03",
  label: "AI Studio",
  head: "AI VIDEO. AI FOTO.",
  sub: "Bez vodoznaku. Od 3 kreditov.",
  earn: "tvor za sekundy",
  tint: PURPLE,
});

const SecMarket = makeSection({
  src: IMG.market,
  index: "04",
  label: "Marketplace",
  head: "PREDÁVAJ ČOKOĽVEK.",
  sub: "Bazaar, aukcie, skills, reality, práca.",
  earn: "platba mimo platformu",
  tint: PINK,
});

const SecFitness = makeSection({
  src: IMG.fitness,
  index: "05",
  label: "Fitness & Wellness",
  head: "PLÁN NA MIERU.",
  sub: "30/60/90 dní, výzvy, tracking.",
  earn: "AI coach v kreditoch",
  tint: PURPLE,
});

const SecKids = makeSection({
  src: IMG.kids,
  index: "06",
  label: "Kids Channel",
  head: "BEZPEČNE PRE DETI.",
  sub: "Omaľovánky, príbehy, učenie 6–12.",
  earn: "rodičovská brána",
  tint: PINK,
});

/* ---------------- variants ---------------- */

type Cue = { c: React.FC<SceneProps>; d: number };

const VARIANTS: Record<string, Cue[]> = {
  hype: [
    { c: HookHype, d: 55 },
    { c: SecTalent, d: 66 },
    { c: SecAI, d: 62 },
    { c: SecDating, d: 62 },
    { c: SecMarket, d: 62 },
    { c: SectionIndex, d: 78 },
    { c: PayoutProof, d: 86 },
    { c: CTA, d: 84 },
  ],
  story: [
    { c: HookStory, d: 78 },
    { c: SecTalent, d: 72 },
    { c: SecDating, d: 68 },
    { c: SecKids, d: 66 },
    { c: SecFitness, d: 66 },
    { c: SectionIndex, d: 80 },
    { c: PayoutProof, d: 92 },
    { c: CTA, d: 88 },
  ],
  money: [
    { c: HookMoney, d: 72 },
    { c: PayoutProof, d: 92 },
    { c: SecMarket, d: 66 },
    { c: SecTalent, d: 62 },
    { c: SecAI, d: 62 },
    { c: SectionIndex, d: 78 },
    { c: CTA, d: 86 },
  ],
};

export const photoFilmDuration = (variant: string) =>
  (VARIANTS[variant] ?? VARIANTS.hype).reduce((a, s) => a + s.d, 0);

const Cut: React.FC<{ children: React.ReactNode; dir: number }> = ({ children, dir }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 24, stiffness: 260 } });
  const x = interpolate(s, [0, 1], [dir * 300, 0]);
  const scale = interpolate(s, [0, 1], [1.22, 1]);
  const fade = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px) scale(${scale})`, opacity: fade }}>
      {children}
    </AbsoluteFill>
  );
};

export const PhotoFilm: React.FC<{ variant?: string }> = ({ variant = "hype" }) => {
  const cues = VARIANTS[variant] ?? VARIANTS.hype;
  let at = 0;
  return (
    <AbsoluteFill style={{ background: INK }}>
      {cues.map(({ c: C, d }, i) => {
        const from = at;
        at += d;
        return (
          <Sequence key={i} from={from} durationInFrames={d + 2}>
            <Cut dir={i === 0 ? 0 : i % 2 ? 1 : -1}>
              <C dur={d} />
            </Cut>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
