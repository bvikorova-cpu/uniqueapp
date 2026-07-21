import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/LobsterTwo";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const display = loadDisplay("normal", { weights: ["700"] });
const body = loadBody("normal", { weights: ["500", "600", "700", "900"] });

const FPS = 30;

const BRAND = {
  white: "#ffffff",
  bgDeep: "#0a0316",
  purple: "#8b5cf6",
  purpleDeep: "#6d28d9",
  pink: "#ec4899",
  gold: "#fbbf24",
  goldDeep: "#f59e0b",
};

const Crown: React.FC<{ size: number; glow: string }> = ({ size, glow }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={BRAND.gold}
    style={{ filter: `drop-shadow(0 0 40px ${glow})` }}
  >
    <path d="M2 20h20v2H2zM2 8l5 4 5-7 5 7 5-4-2 10H4L2 8z" />
  </svg>
);

const Heart: React.FC<{ size: number; color: string; glow: string }> = ({ size, color, glow }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color}
    style={{ filter: `drop-shadow(0 0 40px ${glow})` }}>
    <path d="M12 21s-7-4.5-9.5-9C.8 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 5 23.2 8.5 21.5 12 19 16.5 12 21 12 21z"/>
  </svg>
);

/* ---------------- INTRO ---------------- */
const SceneIntro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const logoScale = spring({ frame, fps: FPS, config: { damping: 10, stiffness: 110 } });
  const logoRot = interpolate(logoScale, [0, 1], [-25, 0]);
  const wordOp = interpolate(frame, [18, 42], [0, 1], { extrapolateRight: "clamp" });
  const wordY = interpolate(frame, [18, 42], [40, 0], { extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [50, 78], [0, 1], { extrapolateRight: "clamp" });
  const kb = interpolate(frame, [0, duration], [1.08, 1.22], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [duration - 20, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = Math.sin(frame / 6) * 0.05 + 1;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${kb})` }}>
        <Img src={staticFile("club/00-intro.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <AbsoluteFill style={{ backgroundColor: "rgba(6,2,18,0.62)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: 1 - exit }}>
        <div style={{
          transform: `scale(${logoScale * pulse}) rotate(${logoRot}deg)`,
          filter: "drop-shadow(0 20px 80px rgba(251,191,36,0.7))",
        }}>
          <Img src={staticFile("home/logo.png")} style={{ width: 340, height: 340, borderRadius: 84 }} />
        </div>
        <div style={{
          marginTop: 50, opacity: wordOp, transform: `translateY(${wordY}px)`,
          fontFamily: display.fontFamily, fontSize: 260, lineHeight: 1,
          background: `linear-gradient(180deg, ${BRAND.white} 0%, #fde68a 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          textShadow: "0 0 80px rgba(251,191,36,0.55)", letterSpacing: "-0.02em",
        }}>
          Unique
        </div>
        <div style={{
          marginTop: 24, opacity: tagOp,
          fontFamily: body.fontFamily, fontWeight: 900, fontSize: 72,
          color: BRAND.gold, letterSpacing: "0.24em", textTransform: "uppercase", textAlign: "center",
          textShadow: "0 4px 30px rgba(251,191,36,0.6)",
        }}>
          Club
        </div>
        <div style={{
          marginTop: 30, opacity: tagOp,
          fontFamily: body.fontFamily, fontWeight: 700, fontSize: 40,
          color: "rgba(255,255,255,0.9)", textAlign: "center", maxWidth: 900,
        }}>
          Join the movement that supports good.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- GENERIC HERO SCENE ---------------- */
type SceneCfg = {
  image: string;
  eyebrow: string;
  title: string;
  price?: string;
  subtitle: string;
  bullets: string[];
  color: string;
  color2: string;
};

const HeroScene: React.FC<{ duration: number; cfg: SceneCfg }> = ({ duration, cfg }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [duration - 18, duration], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const shellOp = enter * (1 - exit);
  const kbScale = interpolate(frame, [0, duration], [1.1, 1.28], { extrapolateRight: "clamp" });
  const kbX = interpolate(frame, [0, duration], [-20, 20]);
  const kbY = interpolate(frame, [0, duration], [-14, 14]);

  const titleOp = interpolate(frame, [18, 40], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [18, 40], [60, 0], { extrapolateRight: "clamp" });
  const priceScale = spring({ frame: frame - 32, fps: FPS, config: { damping: 10, stiffness: 140 } });
  const subOp = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep, opacity: shellOp }}>
      <AbsoluteFill>
        <Img src={staticFile(cfg.image)} style={{
          width: "100%", height: "100%", objectFit: "cover",
          transform: `scale(${kbScale}) translate(${kbX}px, ${kbY}px)`,
          filter: "saturate(1.18) contrast(1.05)",
        }} />
      </AbsoluteFill>
      <AbsoluteFill style={{
        background: `linear-gradient(160deg, ${cfg.color}55 0%, transparent 40%, ${cfg.color2}66 100%)`,
        mixBlendMode: "screen",
      }} />
      <AbsoluteFill style={{
        background:
          "linear-gradient(180deg, rgba(10,3,22,0.85) 0%, rgba(10,3,22,0.18) 24%, rgba(10,3,22,0) 46%, rgba(10,3,22,0.5) 64%, rgba(10,3,22,0.96) 100%)",
      }} />
      <AbsoluteFill style={{
        alignItems: "center", justifyContent: "space-between",
        flexDirection: "column", padding: 80, paddingTop: 130, paddingBottom: 160,
      }}>
        {/* eyebrow chip */}
        <div style={{
          padding: "18px 44px", borderRadius: 999,
          background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color2})`,
          fontFamily: body.fontFamily, fontWeight: 900, fontSize: 32,
          color: BRAND.white, letterSpacing: "0.22em", textTransform: "uppercase",
          boxShadow: `0 15px 50px -15px ${cfg.color}cc`,
          opacity: enter, transform: `translateY(${(1 - enter) * -30}px)`,
        }}>
          {cfg.eyebrow}
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{
            opacity: titleOp, transform: `translateY(${titleY}px)`,
            fontFamily: body.fontFamily, fontWeight: 900, fontSize: 140, lineHeight: 1,
            background: `linear-gradient(180deg, ${BRAND.white} 0%, ${cfg.color} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: "-0.035em", textShadow: "0 8px 40px rgba(0,0,0,0.75)", textAlign: "center",
          }}>
            {cfg.title}
          </div>
          {cfg.price && (
            <div style={{
              marginTop: 18, transform: `scale(${priceScale})`, opacity: priceScale,
              padding: "16px 44px", borderRadius: 999,
              background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color2})`,
              fontFamily: body.fontFamily, fontWeight: 900, fontSize: 58,
              color: BRAND.white, letterSpacing: "-0.02em",
              boxShadow: `0 20px 60px -15px ${cfg.color}cc`,
            }}>
              {cfg.price}
            </div>
          )}
          <div style={{
            marginTop: 26, opacity: subOp,
            fontFamily: body.fontFamily, fontWeight: 600, fontSize: 40,
            color: "rgba(255,255,255,0.94)", textAlign: "center", maxWidth: 1000,
            lineHeight: 1.25, textShadow: "0 4px 20px rgba(0,0,0,0.85)",
          }}>
            {cfg.subtitle}
          </div>
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14, width: "88%" }}>
            {cfg.bullets.map((p, i) => {
              const s = spring({ frame: frame - (54 + i * 10), fps: FPS, config: { damping: 15, stiffness: 130 } });
              const x = interpolate(s, [0, 1], [-60, 0]);
              return (
                <div key={p} style={{
                  opacity: s, transform: `translateX(${x}px)`,
                  display: "flex", alignItems: "center", gap: 20,
                  padding: "16px 26px", borderRadius: 22,
                  background: "rgba(10,3,22,0.62)",
                  border: `1px solid ${cfg.color}66`,
                  boxShadow: `0 10px 40px -20px ${cfg.color}aa`,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color2})`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div style={{
                    fontFamily: body.fontFamily, fontWeight: 700, fontSize: 32,
                    color: BRAND.white, letterSpacing: "-0.01em",
                  }}>
                    {p}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- OUTRO ---------------- */
const SceneOutro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const logoS = spring({ frame, fps: FPS, config: { damping: 12, stiffness: 100 } });
  const wordS = spring({ frame: frame - 12, fps: FPS, config: { damping: 14, stiffness: 110 } });
  const urlOp = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [45, 70], [0, 1], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [duration - 15, duration], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const kb = interpolate(frame, [0, duration], [1.05, 1.18], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep, opacity: 1 - exit }}>
      <AbsoluteFill style={{ transform: `scale(${kb})` }}>
        <Img src={staticFile("club/04-outro.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <AbsoluteFill style={{ backgroundColor: "rgba(10,3,22,0.55)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 60, marginBottom: 40 }}>
          {[{c:BRAND.gold, d:6},{c:BRAND.pink, d:12},{c:BRAND.purple, d:18}].map((b, i) => {
            const s = spring({ frame: frame - b.d, fps: FPS, config: { damping: 10, stiffness: 130 } });
            const float = Math.sin((frame + i * 20) / 10) * 8;
            return (
              <div key={i} style={{ transform: `scale(${s}) translateY(${float}px)` }}>
                {i === 0 ? <Crown size={140} glow={b.c} /> : <Heart size={140} color={b.c} glow={b.c} />}
              </div>
            );
          })}
        </div>
        <Img src={staticFile("home/logo.png")} style={{
          width: 220, height: 220, borderRadius: 60,
          transform: `scale(${logoS})`,
          filter: "drop-shadow(0 15px 50px rgba(251,191,36,0.75))",
        }} />
        <div style={{
          marginTop: 24, fontFamily: display.fontFamily, fontSize: 200, lineHeight: 1,
          opacity: wordS, transform: `translateY(${(1 - wordS) * 30}px)`,
          background: `linear-gradient(180deg, ${BRAND.white} 0%, #fde68a 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          textShadow: "0 0 60px rgba(251,191,36,0.55)",
        }}>
          Unique
        </div>
        <div style={{
          marginTop: 24, opacity: urlOp,
          fontFamily: body.fontFamily, fontWeight: 700, fontSize: 60,
          color: BRAND.white, letterSpacing: "0.05em",
        }}>
          uniqueapp.fun/club
        </div>
        <div style={{
          marginTop: 22, opacity: tagOp,
          fontFamily: body.fontFamily, fontWeight: 700, fontSize: 38,
          color: BRAND.gold, letterSpacing: "0.22em", textTransform: "uppercase",
          textAlign: "center", maxWidth: 1000,
        }}>
          Join · Belong · Give back
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SCENES: SceneCfg[] = [
  {
    image: "club/01-card.jpg",
    eyebrow: "The Card",
    title: "One card. Every perk.",
    price: "€20 · then €1.50/mo",
    subtitle: "Digital VIP card €20 · Physical NFC card €30. Then just €1.50 per month.",
    bullets: ["Golden Club ring on your avatar", "Founding member number", "Cancel any time"],
    color: BRAND.gold, color2: BRAND.goldDeep,
  },
  {
    image: "club/02-goodfund.jpg",
    eyebrow: "Unique Good Fund",
    title: "10% goes to good.",
    subtitle: "Every euro you spend as a Club member helps real people in real need.",
    bullets: ["Transparent live counter", "Real charitable impact", "Belong to something bigger"],
    color: BRAND.pink, color2: "#db2777",
  },
  {
    image: "club/00-intro.jpg",
    eyebrow: "Members Only",
    title: "Perks that matter.",
    subtitle: "Save on everything. Earn credits every month. Get first access to what's new.",
    bullets: ["-15% platform-wide, forever", "+50 AI credits every month", "7-day early access to new modules"],
    color: BRAND.purple, color2: BRAND.purpleDeep,
  },
  {
    image: "club/03-founding.jpg",
    eyebrow: "Founding 1,000",
    title: "Be first. Forever.",
    subtitle: "First 1,000 members keep a lifetime badge and 2× voting power in Megatalent.",
    bullets: ["Lifetime Founding badge", "2× Megatalent vote weight", "Limited to 1,000 seats"],
    color: BRAND.gold, color2: BRAND.pink,
  },
];

const INTRO = 130;
const SCENE_DUR = 150;
const OUTRO = 140;

export const CLUB_DURATION = INTRO + SCENES.length * SCENE_DUR + OUTRO;

export const ClubFilm: React.FC = () => {
  let cursor = 0;
  const seq: React.ReactNode[] = [];
  seq.push(
    <Sequence key="i" from={cursor} durationInFrames={INTRO}>
      <SceneIntro duration={INTRO} />
    </Sequence>
  );
  cursor += INTRO;
  SCENES.forEach((s, i) => {
    seq.push(
      <Sequence key={`s${i}`} from={cursor} durationInFrames={SCENE_DUR}>
        <HeroScene duration={SCENE_DUR} cfg={s} />
      </Sequence>
    );
    cursor += SCENE_DUR;
  });
  seq.push(
    <Sequence key="o" from={cursor} durationInFrames={OUTRO}>
      <SceneOutro duration={OUTRO} />
    </Sequence>
  );
  return <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep }}>{seq}</AbsoluteFill>;
};
