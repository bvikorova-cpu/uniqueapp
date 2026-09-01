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

export const VIRAL_DURATION = 570; // 19s @30fps

const PURPLE = "#7c1fd6";
const PINK = "#ff2d94";
const INK = "#0b0512";
const CREAM = "#fff4fb";

/* ---------- shared layers ---------- */

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.09, mixBlendMode: "overlay" }}>
      {new Array(40).fill(0).map((_, i) => {
        const seed = i + Math.floor(frame / 3) * 100;
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

const Blobs: React.FC<{ hue?: number }> = ({ hue = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      {[0, 1, 2].map((i) => {
        const t = frame / 30 + i * 2;
        const x = Math.sin(t * 0.6 + i) * 180;
        const y = Math.cos(t * 0.45 + i * 1.7) * 220;
        const size = 820 + i * 220;
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
              filter: "blur(120px)",
              opacity: 0.55,
              background:
                i % 2 === 0
                  ? `radial-gradient(circle, hsl(${282 + hue} 90% 55%), transparent 70%)`
                  : `radial-gradient(circle, hsl(${330 + hue} 100% 60%), transparent 70%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Bars: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.13 }}>
      {new Array(9).fill(0).map((_, i) => {
        const y = ((frame * (3 + i * 0.4) + i * 240) % 2200) - 200;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: y,
              height: 3,
              background: CREAM,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const pop = (frame: number, fps: number, delay: number, damping = 12) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness: 170 } });

/* ---------- scene 1: hook ---------- */

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 0, 9);
  const shake = frame < 20 ? Math.sin(frame * 2.4) * (20 - frame) * 0.8 : 0;
  const flash = frame < 4 ? 1 : 0;
  const out = interpolate(frame, [36, 45], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Blobs />
      <Bars />
      <AbsoluteFill style={{ background: CREAM, opacity: flash }} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translateX(${shake}px)`,
        }}
      >
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 190,
            lineHeight: 0.85,
            color: CREAM,
            textAlign: "center",
            letterSpacing: -4,
            transform: `scale(${interpolate(s, [0, 1], [0.5, 1])}) rotate(-4deg)`,
            textShadow: `12px 12px 0 ${PINK}`,
          }}
        >
          STOP
          <br />
          SCROLLING
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- scene 2: one app, word cycle ---------- */

const WORDS = ["TALENT", "MUSIC", "DATING", "AI", "GAMES", "MONEY"];

const OneApp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const idx = Math.min(WORDS.length - 1, Math.floor(frame / 12));
  const local = frame % 12;
  const wSpring = pop(local, fps, 0, 10);
  const head = pop(frame, fps, 0, 16);
  return (
    <AbsoluteFill>
      <Blobs hue={10} />
      <Bars />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 10 }}>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 130,
            color: CREAM,
            letterSpacing: -2,
            opacity: head,
            transform: `translateY(${interpolate(head, [0, 1], [50, 0])}px)`,
          }}
        >
          ONE APP.
        </div>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 175,
            color: "transparent",
            WebkitTextStroke: `4px ${CREAM}`,
            letterSpacing: -3,
            transform: `scale(${interpolate(wSpring, [0, 1], [1.5, 1])}) rotate(${interpolate(
              wSpring,
              [0, 1],
              [6, 0],
            )}deg)`,
            opacity: wSpring,
          }}
        >
          {WORDS[idx]}
        </div>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: 44,
            color: CREAM,
            opacity: 0.75,
            marginTop: 24,
            letterSpacing: 6,
          }}
        >
          ALL IN ONE PLACE
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- scene 3: module chips ---------- */

const CHIPS = [
  "Megatalent",
  "Wall",
  "Dating",
  "AI Video",
  "Kids",
  "Bazaar",
  "Brain Duel",
  "Music",
  "Skills",
  "Fitness",
  "Coffee",
  "Auctions",
  "Coloring",
  "Jobs",
  "Rewards",
  "Gifts",
];

const Chips: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = pop(frame, fps, 0, 16);
  return (
    <AbsoluteFill>
      <Blobs hue={-15} />
      <AbsoluteFill style={{ padding: 90, justifyContent: "center" }}>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 108,
            color: CREAM,
            lineHeight: 0.92,
            marginBottom: 50,
            opacity: title,
            transform: `translateX(${interpolate(title, [0, 1], [-80, 0])}px)`,
          }}
        >
          30+ WORLDS.
          <br />
          <span style={{ color: PINK }}>ZERO BOREDOM.</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
          {CHIPS.map((c, i) => {
            const s = pop(frame, fps, 8 + i * 3, 11);
            return (
              <div
                key={c}
                style={{
                  fontFamily: INTER,
                  fontWeight: 900,
                  fontSize: 40,
                  padding: "18px 30px",
                  borderRadius: 999,
                  color: i % 3 === 0 ? INK : CREAM,
                  background:
                    i % 3 === 0 ? CREAM : i % 3 === 1 ? "rgba(255,255,255,0.10)" : PINK,
                  border: "2px solid rgba(255,255,255,0.35)",
                  opacity: s,
                  transform: `scale(${interpolate(s, [0, 1], [0.4, 1])}) rotate(${
                    (i % 2 ? 1 : -1) * interpolate(s, [0, 1], [8, 0])
                  }deg)`,
                }}
              >
                {c}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- scene 4: get paid ---------- */

const GetPaid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 0, 13);
  const count = Math.round(interpolate(frame, [10, 70], [0, 10000], { extrapolateRight: "clamp" }));
  const pulse = 1 + Math.sin(frame / 5) * 0.02;
  return (
    <AbsoluteFill>
      <Blobs hue={25} />
      <Bars />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 6 }}>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 900,
            fontSize: 52,
            color: CREAM,
            letterSpacing: 8,
            opacity: s,
          }}
        >
          GET PAID FOR BEING YOU
        </div>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 230,
            color: CREAM,
            letterSpacing: -6,
            transform: `scale(${pulse * interpolate(s, [0, 1], [0.6, 1])})`,
            textShadow: `0 0 60px ${PINK}`,
          }}
        >
          €{count.toLocaleString("en-US")}
        </div>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: 44,
            color: CREAM,
            opacity: 0.8,
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.25,
          }}
        >
          quarterly Megatalent prize · gifts · tips · payouts
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- scene 5: AI burst ---------- */

const AI_LINES = ["AI VIDEO", "AI PHOTO", "AI STORIES", "AI COACH"];

const AIBurst: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Blobs hue={-30} />
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 80, gap: 4 }}>
        {AI_LINES.map((l, i) => {
          const s = pop(frame, fps, i * 8, 14);
          return (
            <div
              key={l}
              style={{
                fontFamily: ANTON,
                fontSize: 150,
                lineHeight: 0.95,
                letterSpacing: -3,
                color: i % 2 ? "transparent" : CREAM,
                WebkitTextStroke: i % 2 ? `4px ${PINK}` : undefined,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-260, 0])}px) skewX(${interpolate(
                  s,
                  [0, 1],
                  [-14, 0],
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
            background: CREAM,
            alignSelf: "flex-start",
            padding: "16px 28px",
            borderRadius: 18,
            marginTop: 40,
            opacity: pop(frame, fps, 40, 14),
          }}
        >
          from 3 credits · no watermark
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- scene 6: social proof / vibe ---------- */

const Vibe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = ["POST IT.", "PLAY IT.", "WIN IT."];
  return (
    <AbsoluteFill>
      <Blobs hue={40} />
      <Bars />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {rows.map((r, i) => {
          const s = pop(frame, fps, i * 14, 10);
          return (
            <div
              key={r}
              style={{
                fontFamily: ANTON,
                fontSize: 200,
                lineHeight: 0.9,
                letterSpacing: -6,
                color: CREAM,
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [120, 0])}px) scale(${interpolate(
                  s,
                  [0, 1],
                  [0.7, 1],
                )})`,
                textShadow: i === 2 ? `0 0 70px ${PINK}` : undefined,
              }}
            >
              {r}
            </div>
          );
        })}
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- scene 7: CTA ---------- */

const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = pop(frame, fps, 0, 9);
  const url = pop(frame, fps, 18, 14);
  const glow = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <AbsoluteFill>
      <Blobs hue={5} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 28 }}>
        <div
          style={{
            fontFamily: LOBSTER,
            fontWeight: 700,
            fontSize: 210,
            color: CREAM,
            transform: `scale(${glow * interpolate(logo, [0, 1], [0.4, 1])})`,
            textShadow: `0 0 80px ${PURPLE}, 0 0 140px ${PINK}`,
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
            background: CREAM,
            padding: "24px 46px",
            borderRadius: 999,
            opacity: url,
            transform: `translateY(${interpolate(url, [0, 1], [50, 0])}px)`,
          }}
        >
          uniqueapp.fun
        </div>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: 40,
            color: CREAM,
            opacity: 0.85 * url,
            letterSpacing: 4,
          }}
        >
          INSTALL · CREATE · EARN
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- main ---------- */

const SCENES: Array<{ c: React.FC; d: number }> = [
  { c: Hook, d: 45 },
  { c: OneApp, d: 80 },
  { c: Chips, d: 95 },
  { c: GetPaid, d: 90 },
  { c: AIBurst, d: 80 },
  { c: Vibe, d: 80 },
  { c: CTA, d: 100 },
];

export const ViralFilm: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: INK }}>
      {SCENES.map(({ c: C, d }, i) => {
        const from = at;
        at += d;
        return (
          <Sequence key={i} from={from} durationInFrames={d + 2}>
            <C />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
