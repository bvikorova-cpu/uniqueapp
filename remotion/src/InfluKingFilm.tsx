import React from "react";
import {
  AbsoluteFill,
  Audio,
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
  bgDeep: "#07040f",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gold: "#fbbf24",
};

const SceneIntro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const logoScale = spring({ frame, fps: FPS, config: { damping: 10, stiffness: 110 } });
  const logoRot = interpolate(logoScale, [0, 1], [-25, 0]);
  const wordOp = interpolate(frame, [18, 42], [0, 1], { extrapolateRight: "clamp" });
  const wordY = interpolate(frame, [18, 42], [40, 0], { extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [50, 78], [0, 1], { extrapolateRight: "clamp" });
  const tagY = interpolate(frame, [50, 78], [20, 0], { extrapolateRight: "clamp" });
  const kb = interpolate(frame, [0, duration], [1.08, 1.2], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [duration - 20, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${kb})` }}>
        <Img src={staticFile("influking/03-crown.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <AbsoluteFill style={{ backgroundColor: "rgba(4,2,14,0.72)" }} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: 1 - exit }}
      >
        <div style={{ transform: `scale(${logoScale}) rotate(${logoRot}deg)`, filter: "drop-shadow(0 20px 60px rgba(236,72,153,0.6))" }}>
          <Img src={staticFile("home/logo.png")} style={{ width: 340, height: 340, borderRadius: 84 }} />
        </div>
        <div
          style={{
            marginTop: 50,
            opacity: wordOp,
            transform: `translateY(${wordY}px)`,
            fontFamily: display.fontFamily,
            fontSize: 260,
            lineHeight: 1,
            background: `linear-gradient(180deg, ${BRAND.white} 0%, #fbcfe8 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 80px rgba(236,72,153,0.55)",
            letterSpacing: "-0.02em",
          }}
        >
          Unique
        </div>
        <div
          style={{
            marginTop: 24,
            opacity: tagOp,
            transform: `translateY(${tagY}px)`,
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 62,
            color: BRAND.gold,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textAlign: "center",
            textShadow: "0 4px 30px rgba(251,191,36,0.6)",
          }}
        >
          Influ-King
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ScenePromise: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12, duration - 20, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const l1o = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const l1y = interpolate(frame, [0, 18], [40, 0], { extrapolateRight: "clamp" });
  const l2o = interpolate(frame, [16, 34], [0, 1], { extrapolateRight: "clamp" });
  const l2y = interpolate(frame, [16, 34], [40, 0], { extrapolateRight: "clamp" });
  const l3o = interpolate(frame, [34, 54], [0, 1], { extrapolateRight: "clamp" });
  const l3y = interpolate(frame, [34, 54], [30, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(236,72,153,0.55), transparent 55%), radial-gradient(circle at 70% 70%, rgba(251,191,36,0.4), transparent 55%)",
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: 80,
          textAlign: "center",
          opacity,
        }}
      >
        <div style={{ opacity: l1o, transform: `translateY(${l1y}px)`, fontFamily: body.fontFamily, fontWeight: 500, fontSize: 72, color: "rgba(255,255,255,0.82)" }}>
          Anyone can post.
        </div>
        <div
          style={{
            opacity: l2o,
            transform: `translateY(${l2y}px)`,
            marginTop: 30,
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 160,
            lineHeight: 0.98,
            letterSpacing: "-0.04em",
            background: `linear-gradient(90deg, ${BRAND.pink} 0%, ${BRAND.gold} 50%, ${BRAND.purple} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          One rules.
        </div>
        <div
          style={{
            opacity: l3o,
            transform: `translateY(${l3y}px)`,
            marginTop: 40,
            fontFamily: body.fontFamily,
            fontWeight: 600,
            fontSize: 48,
            color: "rgba(255,255,255,0.9)",
            maxWidth: 900,
          }}
        >
          The Influ-King leaderboard rewards the boldest voice.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

type Beat = {
  badge: string;
  title: string;
  subtitle: string;
  perks: string[];
  image: string;
  accent: string;
  accent2: string;
};

const BeatScene: React.FC<{ duration: number; mod: Beat }> = ({ duration, mod }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [duration - 18, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shellOp = enter * (1 - exit);
  const kbScale = interpolate(frame, [0, duration], [1.1, 1.28], { extrapolateRight: "clamp" });
  const kbX = interpolate(frame, [0, duration], [-20, 20]);
  const kbY = interpolate(frame, [0, duration], [-14, 14]);
  const badgeOp = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });
  const badgeY = interpolate(frame, [4, 22], [-40, 0], { extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [14, 36], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [14, 36], [60, 0], { extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [28, 50], [0, 1], { extrapolateRight: "clamp" });
  const subY = interpolate(frame, [28, 50], [30, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep, opacity: shellOp }}>
      <AbsoluteFill>
        <Img
          src={staticFile(mod.image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${kbScale}) translate(${kbX}px, ${kbY}px)`,
            filter: "saturate(1.15) contrast(1.05)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, ${mod.accent}33 0%, transparent 40%, ${mod.accent2}55 100%)`,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(7,4,15,0.82) 0%, rgba(7,4,15,0.15) 22%, rgba(7,4,15,0) 45%, rgba(7,4,15,0.4) 62%, rgba(7,4,15,0.95) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "column",
          padding: 80,
          paddingTop: 160,
          paddingBottom: 180,
        }}
      >
        <div
          style={{
            opacity: badgeOp,
            transform: `translateY(${badgeY}px)`,
            padding: "18px 44px",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${mod.accent}, ${mod.accent2})`,
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 30,
            color: BRAND.white,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            boxShadow: `0 20px 60px -15px ${mod.accent}cc`,
            textAlign: "center",
          }}
        >
          {mod.badge}
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              opacity: titleOp,
              transform: `translateY(${titleY}px)`,
              fontFamily: body.fontFamily,
              fontWeight: 900,
              fontSize: 140,
              lineHeight: 1,
              color: BRAND.white,
              letterSpacing: "-0.035em",
              textShadow: "0 8px 40px rgba(0,0,0,0.75)",
              textAlign: "center",
            }}
          >
            {mod.title}
          </div>
          <div
            style={{
              marginTop: 28,
              opacity: subOp,
              transform: `translateY(${subY}px)`,
              fontFamily: body.fontFamily,
              fontWeight: 600,
              fontSize: 42,
              color: "rgba(255,255,255,0.94)",
              textAlign: "center",
              maxWidth: 900,
              lineHeight: 1.25,
              textShadow: "0 4px 20px rgba(0,0,0,0.85)",
            }}
          >
            {mod.subtitle}
          </div>
          <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 16, width: "88%" }}>
            {mod.perks.map((p, i) => {
              const delay = 44 + i * 10;
              const s = spring({ frame: frame - delay, fps: FPS, config: { damping: 15, stiffness: 130 } });
              const x = interpolate(s, [0, 1], [-60, 0]);
              return (
                <div
                  key={p}
                  style={{
                    opacity: s,
                    transform: `translateX(${x}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    padding: "18px 26px",
                    borderRadius: 22,
                    background: "rgba(7,4,15,0.6)",
                    border: `1px solid ${mod.accent}66`,
                    boxShadow: `0 10px 40px -20px ${mod.accent}aa`,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: `linear-gradient(135deg, ${mod.accent}, ${mod.accent2})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div
                    style={{
                      fontFamily: body.fontFamily,
                      fontWeight: 700,
                      fontSize: 34,
                      color: BRAND.white,
                      letterSpacing: "-0.01em",
                    }}
                  >
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

const SceneOutro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const logoS = spring({ frame, fps: FPS, config: { damping: 12, stiffness: 100 } });
  const wordS = spring({ frame: frame - 12, fps: FPS, config: { damping: 14, stiffness: 110 } });
  const urlOp = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [45, 70], [0, 1], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [duration - 15, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep, opacity: 1 - exit }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(251,191,36,0.5), transparent 60%), radial-gradient(circle at 50% 90%, rgba(236,72,153,0.4), transparent 60%)",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <Img
          src={staticFile("home/logo.png")}
          style={{
            width: 280,
            height: 280,
            borderRadius: 72,
            transform: `scale(${logoS})`,
            filter: "drop-shadow(0 15px 50px rgba(251,191,36,0.6))",
          }}
        />
        <div
          style={{
            marginTop: 30,
            fontFamily: display.fontFamily,
            fontSize: 240,
            lineHeight: 1,
            opacity: wordS,
            transform: `translateY(${(1 - wordS) * 30}px)`,
            background: `linear-gradient(180deg, ${BRAND.white} 0%, #fde68a 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 60px rgba(251,191,36,0.5)",
          }}
        >
          Unique
        </div>
        <div style={{ marginTop: 40, opacity: urlOp, fontFamily: body.fontFamily, fontWeight: 700, fontSize: 68, color: BRAND.white, letterSpacing: "0.05em" }}>
          uniqueapp.fun
        </div>
        <div
          style={{
            marginTop: 26,
            opacity: tagOp,
            fontFamily: body.fontFamily,
            fontWeight: 700,
            fontSize: 40,
            color: BRAND.gold,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Post · Rise · Reign
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const BEATS: Beat[] = [
  {
    badge: "Feature 1 · Create",
    title: "Show up. Post.",
    subtitle: "Reels, photos, stories, lives — every drop counts toward your Influ-King score.",
    perks: ["Any format · any length", "Daily streak bonuses", "AI content assist built in"],
    image: "influking/01-creator.jpg",
    accent: "#ec4899",
    accent2: "#a855f7",
  },
  {
    badge: "Feature 2 · AI Studio",
    title: "AI does the heavy lift.",
    subtitle: "Trend Analyzer, Content Planner and Calendar plan a week of posts in seconds.",
    perks: ["Trend Analyzer", "Content Planner", "Auto Content Calendar"],
    image: "influking/12-ai.jpg",
    accent: "#a855f7",
    accent2: "#22d3ee",
  },
  {
    badge: "Feature 3 · Weekly Challenges",
    title: "Brand-sponsored quests.",
    subtitle: "New paid challenges drop every week — submit, get judged, get paid in EUR.",
    perks: ["Fresh brief every Monday", "Cash + credit prizes", "Winners featured on Home"],
    image: "influking/02-viral.jpg",
    accent: "#f97316",
    accent2: "#fbbf24",
  },
  {
    badge: "Feature 4 · Brand Deals",
    title: "Marketplace for deals.",
    subtitle: "AI matches your audience with real brand campaigns. Apply in one tap.",
    perks: ["AI-matched briefs", "Transparent EUR budgets", "Direct chat with brand"],
    image: "influking/02-viral.jpg",
    accent: "#22d3ee",
    accent2: "#8b5cf6",
  },
  {
    badge: "Feature 5 · Fan Club",
    title: "Recurring fan income.",
    subtitle: "Three subscription tiers, monthly billing, 85% to you — Stripe-native.",
    perks: ["Bronze · Silver · Gold tiers", "85 / 15 revenue split", "Exclusive posts + perks"],
    image: "influking/06-fanclub.jpg",
    accent: "#ec4899",
    accent2: "#f472b6",
  },
  {
    badge: "Feature 6 · PPV",
    title: "Pay-per-view drops.",
    subtitle: "Lock a single post, video or photo behind a one-time unlock price.",
    perks: ["Set your own price", "Instant unlock after Stripe", "Idempotent — no double charges"],
    image: "influking/07-ppv.jpg",
    accent: "#fbbf24",
    accent2: "#ec4899",
  },
  {
    badge: "Feature 7 · Paid DMs",
    title: "Reply for a fee.",
    subtitle: "Fans pay to slide into your DMs. Video shoutouts unlock premium replies.",
    perks: ["Set price per message", "Video shoutout tier", "15% platform fee only"],
    image: "influking/06-fanclub.jpg",
    accent: "#a855f7",
    accent2: "#ec4899",
  },
  {
    badge: "Feature 8 · Go Live",
    title: "Stream in one tap.",
    subtitle: "Full lifecycle — go live, super-chats, tips, replay auto-saved to your channel.",
    perks: ["Real-time super-chats", "Live tips in EUR", "Auto-saved replays"],
    image: "influking/09-live.jpg",
    accent: "#ef4444",
    accent2: "#ec4899",
  },
  {
    badge: "Feature 9 · Gift Wall",
    title: "Fans send gifts.",
    subtitle: "Public wall of virtual gifts with Top Donors leaderboard — 90% goes to you.",
    perks: ["Top donors by 7d / 30d / all-time", "Realtime updates", "10% platform, 90% creator"],
    image: "influking/08-gifts.jpg",
    accent: "#ec4899",
    accent2: "#fbbf24",
  },
  {
    badge: "Feature 10 · Verified",
    title: "Wear the ring.",
    subtitle: "Gold €15 · Pink €40 · Purple €150 monthly — with perks that grow per tier.",
    perks: ["Auto-renew, cancel anytime", "Priority ranking", "Billing Portal built in"],
    image: "influking/10-verified.jpg",
    accent: "#fbbf24",
    accent2: "#a855f7",
  },
  {
    badge: "Feature 11 · Leaderboards",
    title: "Rise on live boards.",
    subtitle: "Global · country · category — refresh live, every hour changes the crown.",
    perks: ["Global & country ranks", "Category leaderboards", "Live position tracker"],
    image: "influking/04-leaderboard.jpg",
    accent: "#8b5cf6",
    accent2: "#22d3ee",
  },
  {
    badge: "Feature 12 · Payouts",
    title: "Cash out fast.",
    subtitle: "Stripe Connect. Standard bank in 2 days, or Instant to card for 1% fee.",
    perks: ["Standard bank payout (free)", "Instant to card (1% fee)", "Real-time available balance"],
    image: "influking/11-payout.jpg",
    accent: "#22c55e",
    accent2: "#fbbf24",
  },
  {
    badge: "Reward · The Crown",
    title: "Reign monthly.",
    subtitle: "Monthly winner gets the golden Influ-King crown, Home feature and Hall of Fame.",
    perks: ["Golden crown badge", "Featured on Home", "Hall of Fame forever"],
    image: "influking/03-crown.jpg",
    accent: "#fbbf24",
    accent2: "#ec4899",
  },
];

const INTRO = 120;
const PROMISE = 85;
const BEAT_DUR = 95;
const OUTRO = 130;

export const INFLUKING_DURATION = INTRO + PROMISE + BEATS.length * BEAT_DUR + OUTRO;

export const InfluKingFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const total = INFLUKING_DURATION;
  const musicVolume = (f: number) => {
    const fadeIn = interpolate(f, [0, 20], [0, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeOut = interpolate(f, [total - 40, total - 5], [0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return Math.min(fadeIn, fadeOut);
  };

  let cursor = 0;
  const sequences: React.ReactNode[] = [];
  sequences.push(
    <Sequence key="intro" from={cursor} durationInFrames={INTRO}>
      <SceneIntro duration={INTRO} />
    </Sequence>
  );
  cursor += INTRO;
  sequences.push(
    <Sequence key="promise" from={cursor} durationInFrames={PROMISE}>
      <ScenePromise duration={PROMISE} />
    </Sequence>
  );
  cursor += PROMISE;
  BEATS.forEach((mod, i) => {
    sequences.push(
      <Sequence key={`b${i}`} from={cursor} durationInFrames={BEAT_DUR}>
        <BeatScene duration={BEAT_DUR} mod={mod} />
      </Sequence>
    );
    cursor += BEAT_DUR;
  });
  sequences.push(
    <Sequence key="outro" from={cursor} durationInFrames={OUTRO}>
      <SceneOutro duration={OUTRO} />
    </Sequence>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep }}>
      <Audio src={staticFile("challenges/audio/bg.mp3")} volume={(f) => musicVolume(f)} />
      {sequences}
      <span style={{ display: "none" }}>{frame}</span>
    </AbsoluteFill>
  );
};
