import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadLobster } from "@remotion/google-fonts/LobsterTwo";

const ANTON = loadAnton().fontFamily;
const INTER = loadInter("normal", { weights: ["500", "700", "900"] }).fontFamily;
const LOBSTER = loadLobster("normal", { weights: ["700"] }).fontFamily;

const PURPLE = "#7c1fd6";
const PINK = "#ff2d94";
const LIME = "#c8ff2f";
const CYAN = "#22e6ff";
const INK = "#08030f";
const CREAM = "#fff4fb";

const BEAT = 15; // frames per beat @30fps = 120bpm

const pop = (frame: number, fps: number, delay: number, damping = 11) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness: 220 } });

/* ---------- background system ---------- */

const Blobs: React.FC<{ hue?: number; speed?: number }> = ({ hue = 0, speed = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      {[0, 1, 2, 3].map((i) => {
        const t = (frame / 22) * speed + i * 1.6;
        const x = Math.sin(t * 0.9 + i) * 260;
        const y = Math.cos(t * 0.7 + i * 1.7) * 300;
        const size = 700 + i * 200;
        const colors = [282 + hue, 330 + hue, 195 + hue, 312 + hue];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              left: 540 - size / 2 + x,
              top: 960 - size / 2 + y,
              borderRadius: "50%",
              filter: "blur(110px)",
              opacity: 0.5,
              background: `radial-gradient(circle, hsl(${colors[i]} 95% 58%), transparent 70%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Hard scan-line strobe that pulses on every beat */
const Strobe: React.FC = () => {
  const frame = useCurrentFrame();
  const b = frame % BEAT;
  const hit = b < 3 ? interpolate(b, [0, 3], [0.22, 0]) : 0;
  return <AbsoluteFill style={{ background: CREAM, opacity: hit }} />;
};

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.12, mixBlendMode: "overlay" }}>
      {new Array(70).fill(0).map((_, i) => {
        const seed = i + Math.floor(frame / 2) * 100;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 3,
              height: 3,
              background: "#fff",
              left: `${random(seed) * 100}%`,
              top: `${random(seed + 7) * 100}%`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Ticker tape that flies across, keeps the frame alive */
const Ticker: React.FC<{ y: number; text: string; dir?: number; color?: string }> = ({
  y,
  text,
  dir = 1,
  color = CREAM,
}) => {
  const frame = useCurrentFrame();
  const x = ((frame * 14 * dir) % 2400) - (dir > 0 ? 1200 : 0);
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 0,
        right: 0,
        whiteSpace: "nowrap",
        transform: `translateX(${-x}px) rotate(${dir > 0 ? -3 : 3}deg)`,
        fontFamily: ANTON,
        fontSize: 62,
        letterSpacing: 2,
        color,
        opacity: 0.25,
      }}
    >
      {new Array(6).fill(text).join("  •  ")}
    </div>
  );
};

/** Chromatic-aberration text: RGB offset for a hard glitch feel */
const GlitchText: React.FC<{
  children: string;
  size: number;
  amount: number;
  style?: React.CSSProperties;
}> = ({ children, size, amount, style }) => {
  const base: React.CSSProperties = {
    fontFamily: ANTON,
    fontSize: size,
    lineHeight: 0.85,
    letterSpacing: -4,
    position: "absolute",
    textAlign: "center",
    width: "100%",
  };
  return (
    <div style={{ position: "relative", width: "100%", height: size, ...style }}>
      <div style={{ ...base, color: CYAN, transform: `translate(${-amount}px, ${amount * 0.4}px)` }}>
        {children}
      </div>
      <div style={{ ...base, color: PINK, transform: `translate(${amount}px, ${-amount * 0.4}px)` }}>
        {children}
      </div>
      <div style={{ ...base, color: CREAM }}>{children}</div>
    </div>
  );
};

/* ---------- scene 1: hook (0.9s, brutal) ---------- */

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 0, 7);
  const shake = frame < 18 ? Math.sin(frame * 3.1) * (18 - frame) * 1.4 : Math.sin(frame * 0.9) * 4;
  const glitch = frame % 7 < 2 ? 16 : 5;
  const flash = frame < 3 ? 1 : 0;
  return (
    <AbsoluteFill>
      <Blobs speed={2} />
      <Ticker y={220} text="UNIQUE" dir={1} color={LIME} />
      <Ticker y={1620} text="uniqueapp.fun" dir={-1} color={CYAN} />
      <AbsoluteFill style={{ background: CREAM, opacity: flash }} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translateX(${shake}px) scale(${interpolate(s, [0, 1], [1.6, 1])}) rotate(-4deg)`,
        }}
      >
        <GlitchText size={200} amount={glitch}>
          STOP
        </GlitchText>
        <div style={{ height: 200 }} />
        <GlitchText size={200} amount={glitch}>
          SCROLLING
        </GlitchText>
      </AbsoluteFill>
      <Strobe />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- scene 2: rapid word slam (1 word per 6 frames) ---------- */

const WORDS = [
  { t: "TALENT", c: PINK },
  { t: "MUSIC", c: LIME },
  { t: "DATING", c: CYAN },
  { t: "AI", c: CREAM },
  { t: "GAMES", c: PINK },
  { t: "MONEY", c: LIME },
  { t: "FAME", c: CYAN },
];

const WordSlam: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const step = 7;
  const idx = Math.min(WORDS.length - 1, Math.floor(frame / step));
  const local = frame % step;
  const s = pop(local, fps, 0, 8);
  const w = WORDS[idx];
  const zoom = interpolate(s, [0, 1], [1.9, 1]);
  const rot = (idx % 2 ? 1 : -1) * interpolate(s, [0, 1], [10, 0]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: idx % 2 ? INK : "#150626" }} />
      <Blobs hue={idx * 20} speed={2.4} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 230,
            color: w.c,
            letterSpacing: -8,
            transform: `scale(${zoom}) rotate(${rot}deg)`,
            textShadow: `14px 14px 0 rgba(0,0,0,0.45)`,
          }}
        >
          {w.t}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 220 }}>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 900,
            fontSize: 54,
            color: CREAM,
            letterSpacing: 10,
            opacity: 0.9,
          }}
        >
          ONE APP.
        </div>
      </AbsoluteFill>
      <Strobe />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- scene 3: chip storm ---------- */

const CHIPS = [
  "Megatalent", "Wall", "Dating", "AI Video", "Kids", "Bazaar", "Brain Duel",
  "Music", "Skills", "Fitness", "Coffee", "Auctions", "Coloring", "Jobs",
  "Rewards", "Gifts", "Property", "Wellness",
];

const Chips: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = pop(frame, fps, 0, 12);
  const drift = interpolate(frame, [0, 80], [0, -70]);
  const camera = 1 + Math.sin(frame / 9) * 0.02;
  return (
    <AbsoluteFill>
      <Blobs hue={-15} speed={1.6} />
      <AbsoluteFill
        style={{ padding: 80, justifyContent: "center", transform: `scale(${camera})` }}
      >
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 112,
            color: CREAM,
            lineHeight: 0.9,
            marginBottom: 44,
            opacity: title,
            transform: `translateX(${interpolate(title, [0, 1], [-140, 0])}px) skewX(${interpolate(
              title,
              [0, 1],
              [-12, 0],
            )}deg)`,
          }}
        >
          30+ WORLDS.
          <br />
          <span style={{ color: LIME }}>ZERO BOREDOM.</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, transform: `translateY(${drift}px)` }}>
          {CHIPS.map((c, i) => {
            const s = pop(frame, fps, 6 + i * 2, 9);
            const bg = i % 4 === 0 ? CREAM : i % 4 === 1 ? PINK : i % 4 === 2 ? LIME : "rgba(255,255,255,0.10)";
            const fg = i % 4 === 0 || i % 4 === 2 ? INK : CREAM;
            return (
              <div
                key={c}
                style={{
                  fontFamily: INTER,
                  fontWeight: 900,
                  fontSize: 40,
                  padding: "16px 28px",
                  borderRadius: 999,
                  color: fg,
                  background: bg,
                  border: "2px solid rgba(255,255,255,0.3)",
                  opacity: s,
                  transform: `scale(${interpolate(s, [0, 1], [0.2, 1])}) rotate(${
                    (i % 2 ? 1 : -1) * interpolate(s, [0, 1], [14, 0])
                  }deg)`,
                }}
              >
                {c}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Strobe />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- scene 4: money counter ---------- */

const GetPaid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 0, 10);
  const count = Math.round(
    interpolate(frame, [4, 55], [0, 10000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  const beat = frame % BEAT;
  const kick = beat < 5 ? interpolate(beat, [0, 5], [1.1, 1]) : 1;
  return (
    <AbsoluteFill>
      <Blobs hue={25} speed={2} />
      <Ticker y={330} text="PAYOUT" dir={-1} color={LIME} />
      <Ticker y={1520} text="CASH OUT" dir={1} color={PINK} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 10 }}>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 900,
            fontSize: 52,
            color: LIME,
            letterSpacing: 8,
            opacity: s,
          }}
        >
          GET PAID FOR BEING YOU
        </div>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 250,
            color: CREAM,
            letterSpacing: -8,
            transform: `scale(${kick * interpolate(s, [0, 1], [0.4, 1])})`,
            textShadow: `0 0 70px ${PINK}, 10px 10px 0 ${PURPLE}`,
          }}
        >
          €{count.toLocaleString("en-US")}
        </div>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: 42,
            color: CREAM,
            opacity: 0.85,
            textAlign: "center",
            maxWidth: 820,
            lineHeight: 1.25,
          }}
        >
          Megatalent prize · gifts · tips · real payouts
        </div>
      </AbsoluteFill>
      <Strobe />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- scene 5: AI burst ---------- */

const AI_LINES = ["AI VIDEO", "AI PHOTO", "AI STORIES", "AI COACH"];

const AIBurst: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const push = interpolate(frame, [0, 70], [0, -60]);
  return (
    <AbsoluteFill>
      <Blobs hue={-30} speed={2.2} />
      <AbsoluteFill
        style={{ justifyContent: "center", paddingLeft: 70, gap: 0, transform: `translateY(${push}px)` }}
      >
        {AI_LINES.map((l, i) => {
          const s = pop(frame, fps, i * 6, 10);
          return (
            <div
              key={l}
              style={{
                fontFamily: ANTON,
                fontSize: 158,
                lineHeight: 0.92,
                letterSpacing: -4,
                color: i % 2 ? "transparent" : CREAM,
                WebkitTextStroke: i % 2 ? `5px ${LIME}` : undefined,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-460, 0])}px) skewX(${interpolate(
                  s,
                  [0, 1],
                  [-22, 0],
                )}deg)`,
              }}
            >
              {l}
            </div>
          );
        })}
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 900,
            fontSize: 46,
            color: INK,
            background: LIME,
            alignSelf: "flex-start",
            padding: "16px 28px",
            borderRadius: 18,
            marginTop: 36,
            opacity: pop(frame, fps, 30, 12),
            transform: `rotate(-2deg)`,
          }}
        >
          from 3 credits · NO WATERMARK
        </div>
      </AbsoluteFill>
      <Strobe />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- scene 6: post it / play it / win it ---------- */

const Vibe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = [
    { t: "POST IT.", c: CREAM },
    { t: "PLAY IT.", c: CYAN },
    { t: "WIN IT.", c: LIME },
  ];
  return (
    <AbsoluteFill>
      <Blobs hue={40} speed={2.6} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {rows.map((r, i) => {
          const s = pop(frame, fps, i * 9, 8);
          return (
            <div
              key={r.t}
              style={{
                fontFamily: ANTON,
                fontSize: 210,
                lineHeight: 0.88,
                letterSpacing: -8,
                color: r.c,
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [200, 0])}px) scale(${interpolate(
                  s,
                  [0, 1],
                  [0.5, 1],
                )}) rotate(${(i % 2 ? 1 : -1) * interpolate(s, [0, 1], [6, 0])}deg)`,
                textShadow: `10px 10px 0 rgba(0,0,0,0.4)`,
              }}
            >
              {r.t}
            </div>
          );
        })}
      </AbsoluteFill>
      <Strobe />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- scene 7: CTA ---------- */

const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = pop(frame, fps, 0, 8);
  const url = pop(frame, fps, 14, 11);
  const glow = 1 + Math.sin(frame / 5) * 0.035;
  const rings = [0, 1, 2];
  return (
    <AbsoluteFill>
      <Blobs hue={5} speed={1.8} />
      {rings.map((i) => {
        const t = (frame + i * 18) % 54;
        const scale = interpolate(t, [0, 54], [0.3, 2.2]);
        const op = interpolate(t, [0, 54], [0.45, 0]);
        return (
          <AbsoluteFill key={i} style={{ justifyContent: "center", alignItems: "center" }}>
            <div
              style={{
                width: 800,
                height: 800,
                borderRadius: "50%",
                border: `6px solid ${PINK}`,
                transform: `scale(${scale})`,
                opacity: op,
              }}
            />
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26 }}>
        <div
          style={{
            fontFamily: LOBSTER,
            fontWeight: 700,
            fontSize: 220,
            color: CREAM,
            transform: `scale(${glow * interpolate(logo, [0, 1], [0.3, 1])})`,
            textShadow: `0 0 80px ${PURPLE}, 0 0 150px ${PINK}`,
          }}
        >
          Unique
        </div>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 900,
            fontSize: 58,
            color: INK,
            background: LIME,
            padding: "24px 46px",
            borderRadius: 999,
            opacity: url,
            transform: `translateY(${interpolate(url, [0, 1], [70, 0])}px) rotate(-2deg)`,
          }}
        >
          uniqueapp.fun
        </div>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 900,
            fontSize: 42,
            color: CREAM,
            opacity: 0.9 * url,
            letterSpacing: 6,
          }}
        >
          INSTALL · CREATE · EARN
        </div>
      </AbsoluteFill>
      <Strobe />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- main: whip-pan cuts + camera punch ---------- */

const SCENES: Array<{ c: React.FC; d: number }> = [
  { c: Hook, d: 38 },
  { c: WordSlam, d: 49 },
  { c: Chips, d: 72 },
  { c: GetPaid, d: 70 },
  { c: AIBurst, d: 64 },
  { c: Vibe, d: 58 },
  { c: CTA, d: 84 },
];

export const VIRAL_DURATION = SCENES.reduce((a, s) => a + s.d, 0);

/** Wraps a scene with an entry whip-pan + scale punch so cuts never feel static */
const Cut: React.FC<{ children: React.ReactNode; dir: number }> = ({ children, dir }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 22, stiffness: 320 } });
  const x = interpolate(s, [0, 1], [dir * 380, 0]);
  const scale = interpolate(s, [0, 1], [1.35, 1]);
  const blur = interpolate(s, [0, 0.45], [22, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${x}px) scale(${scale})`,
        filter: blur > 0.4 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const ViralFilm: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: INK }}>
      {SCENES.map(({ c: C, d }, i) => {
        const from = at;
        at += d;
        return (
          <Sequence key={i} from={from} durationInFrames={d + 2}>
            <Cut dir={i === 0 ? 0 : i % 2 ? 1 : -1}>
              <C />
            </Cut>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
