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
  bgDeep: "#07030f",
  purple: "#8b5cf6",
  pink: "#ec4899",
  amber: "#fbbf24",
};

/* ---------- Intro ---------- */

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
        <Img
          src={staticFile("challenges/intro-backdrop.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <AbsoluteFill style={{ backgroundColor: "rgba(5,0,20,0.35)" }} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          opacity: 1 - exit,
        }}
      >
        <div
          style={{
            transform: `scale(${logoScale}) rotate(${logoRot}deg)`,
            filter: "drop-shadow(0 20px 60px rgba(236,72,153,0.55))",
          }}
        >
          <Img
            src={staticFile("home/logo.png")}
            style={{ width: 340, height: 340, borderRadius: 84 }}
          />
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
            textShadow: "0 0 80px rgba(236,72,153,0.5)",
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
            fontWeight: 700,
            fontSize: 44,
            color: "rgba(255,255,255,0.92)",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
          }}
        >
          Discover
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Promise ---------- */

const ScenePromise: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 12, duration - 20, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
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
            "radial-gradient(circle at 30% 30%, rgba(139,92,246,0.4), transparent 55%), radial-gradient(circle at 70% 70%, rgba(236,72,153,0.4), transparent 55%)",
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
        <div
          style={{
            opacity: l1o,
            transform: `translateY(${l1y}px)`,
            fontFamily: body.fontFamily,
            fontWeight: 500,
            fontSize: 72,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          Eight worlds.
        </div>
        <div
          style={{
            opacity: l2o,
            transform: `translateY(${l2y}px)`,
            marginTop: 30,
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 170,
            lineHeight: 0.98,
            letterSpacing: "-0.04em",
            background: `linear-gradient(90deg, ${BRAND.purple} 0%, ${BRAND.pink} 50%, ${BRAND.amber} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          One app.
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
          Discover everything Unique has to offer.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Module Scene ---------- */

type Module = {
  badge: string;
  title: string;
  subtitle: string;
  perks: string[];
  iconPath: string;
  accent: string;
  accent2: string;
};

const ModuleScene: React.FC<{ duration: number; mod: Module }> = ({ duration, mod }) => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [duration - 20, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeOp = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });
  const badgeY = interpolate(frame, [4, 22], [-40, 0], { extrapolateRight: "clamp" });
  const iconS = spring({ frame: frame - 6, fps: FPS, config: { damping: 12, stiffness: 130 } });
  const titleOp = interpolate(frame, [16, 38], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [16, 38], [50, 0], { extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [30, 52], [0, 1], { extrapolateRight: "clamp" });
  const subY = interpolate(frame, [30, 52], [30, 0], { extrapolateRight: "clamp" });

  // Slow pan on background gradient
  const px = interpolate(frame, [0, duration], [0, 40]);
  const py = interpolate(frame, [0, duration], [0, -30]);

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep, opacity: 1 - exit }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${30 + px * 0.1}% ${30 + py * 0.1}%, ${mod.accent}55, transparent 55%), radial-gradient(circle at ${70 - px * 0.1}% ${75 + py * 0.1}%, ${mod.accent2}55, transparent 55%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 100%, rgba(0,0,0,0.6), transparent 60%)",
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
          flexDirection: "column",
          padding: 80,
          paddingTop: 200,
        }}
      >
        {/* Badge */}
        <div
          style={{
            opacity: badgeOp,
            transform: `translateY(${badgeY}px)`,
            padding: "18px 44px",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${mod.accent}, ${mod.accent2})`,
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 34,
            color: BRAND.white,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            boxShadow: `0 20px 60px -15px ${mod.accent}cc`,
          }}
        >
          {mod.badge}
        </div>

        {/* Icon medallion */}
        <div
          style={{
            marginTop: 70,
            width: 280,
            height: 280,
            borderRadius: 86,
            background: `linear-gradient(135deg, ${mod.accent} 0%, ${mod.accent2} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${iconS}) rotate(${(1 - iconS) * -25}deg)`,
            boxShadow: `0 30px 80px -20px ${mod.accent}dd, inset 0 4px 20px rgba(255,255,255,0.25)`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="160"
            height="160"
            fill="none"
            stroke="white"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={mod.iconPath} />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            marginTop: 70,
            opacity: titleOp,
            transform: `translateY(${titleY}px)`,
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 170,
            lineHeight: 1,
            color: BRAND.white,
            letterSpacing: "-0.035em",
            textShadow: "0 8px 40px rgba(0,0,0,0.55)",
            textAlign: "center",
          }}
        >
          {mod.title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: 30,
            opacity: subOp,
            transform: `translateY(${subY}px)`,
            fontFamily: body.fontFamily,
            fontWeight: 600,
            fontSize: 44,
            color: "rgba(255,255,255,0.92)",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.25,
            textShadow: "0 4px 20px rgba(0,0,0,0.7)",
          }}
        >
          {mod.subtitle}
        </div>

        {/* Perks list */}
        <div
          style={{
            marginTop: 60,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            width: "88%",
          }}
        >
          {mod.perks.map((p, i) => {
            const delay = 46 + i * 12;
            const s = spring({
              frame: frame - delay,
              fps: FPS,
              config: { damping: 15, stiffness: 130 },
            });
            const x = interpolate(s, [0, 1], [-80, 0]);
            return (
              <div
                key={p}
                style={{
                  opacity: s,
                  transform: `translateX(${x}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "22px 32px",
                  borderRadius: 28,
                  background: "rgba(255,255,255,0.1)",
                  border: `1px solid ${mod.accent}66`,
                  boxShadow: `0 10px 40px -20px ${mod.accent}aa`,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${mod.accent}, ${mod.accent2})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="30"
                    height="30"
                    fill="none"
                    stroke="white"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </div>
                <div
                  style={{
                    fontFamily: body.fontFamily,
                    fontWeight: 700,
                    fontSize: 40,
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
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Outro ---------- */

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
            "radial-gradient(circle at 50% 45%, rgba(139,92,246,0.55), transparent 60%), radial-gradient(circle at 50% 90%, rgba(236,72,153,0.4), transparent 60%)",
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Img
          src={staticFile("home/logo.png")}
          style={{
            width: 280,
            height: 280,
            borderRadius: 72,
            transform: `scale(${logoS})`,
            filter: "drop-shadow(0 15px 50px rgba(236,72,153,0.55))",
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
            background: `linear-gradient(180deg, ${BRAND.white} 0%, #fbcfe8 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 60px rgba(236,72,153,0.45)",
          }}
        >
          Unique
        </div>
        <div
          style={{
            marginTop: 40,
            opacity: urlOp,
            fontFamily: body.fontFamily,
            fontWeight: 700,
            fontSize: 68,
            color: BRAND.white,
            letterSpacing: "0.05em",
          }}
        >
          uniqueapp.fun
        </div>
        <div
          style={{
            marginTop: 26,
            opacity: tagOp,
            fontFamily: body.fontFamily,
            fontWeight: 600,
            fontSize: 40,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Discover · Connect · Thrive
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Modules ---------- */

const MODULES: Module[] = [
  {
    badge: "Wall",
    title: "Your Feed.",
    subtitle: "Share moments. Follow the people you love.",
    perks: ["Posts, photos & videos", "Likes, comments & shares", "Real-time global feed"],
    iconPath: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    accent: "#8b5cf6",
    accent2: "#ec4899",
  },
  {
    badge: "Games",
    title: "Play & Win.",
    subtitle: "Hundreds of arcade, puzzle and brain games.",
    perks: ["Solo & multiplayer", "Daily tournaments", "Earn XP and prizes"],
    iconPath:
      "M6 12h4M8 10v4M15 13h.01M18 11h.01M17 5H7a5 5 0 0 0-5 5v4a5 5 0 0 0 5 5c1.5 0 2.5-.7 3.2-1.6l1.3-1.7a1 1 0 0 1 1.6 0l1.3 1.7C15.5 18.3 16.5 19 18 19a4 4 0 0 0 4-4v-4a5 5 0 0 0-5-5z",
    accent: "#22d3ee",
    accent2: "#8b5cf6",
  },
  {
    badge: "Work",
    title: "Find a Job.",
    subtitle: "Local & remote gigs. Hire top talent fast.",
    perks: ["Post jobs in minutes", "Verified applicants", "Chat & hire in-app"],
    iconPath:
      "M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M10 5h4v2h-4z",
    accent: "#a78bfa",
    accent2: "#7c3aed",
  },
  {
    badge: "Promotions",
    title: "Get Noticed.",
    subtitle: "Boost your business to thousands in seconds.",
    perks: ["Targeted geo-ads", "Smart budget control", "Live performance stats"],
    iconPath:
      "M3 11l14-6v14L3 13v-2z M3 11v2 M8 20l-1-4 M17 9a3 3 0 0 1 0 6",
    accent: "#f59e0b",
    accent2: "#ef4444",
  },
  {
    badge: "Booking",
    title: "Book Anything.",
    subtitle: "Salons, doctors, tables, rides — all in one tap.",
    perks: ["Instant reservations", "Smart reminders", "Cancel or reschedule anytime"],
    iconPath:
      "M8 2v4 M16 2v4 M3 8h18 M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",
    accent: "#10b981",
    accent2: "#14b8a6",
  },
  {
    badge: "Services",
    title: "Get Help.",
    subtitle: "Trusted pros for every job, big or small.",
    perks: ["Rated professionals", "Secure escrow payments", "Reviews you can trust"],
    iconPath:
      "M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M20 4L8.12 15.88 M14.47 14.48L20 20 M8.12 8.12L12 12",
    accent: "#ec4899",
    accent2: "#f43f5e",
  },
  {
    badge: "Rewards",
    title: "Earn Perks.",
    subtitle: "Turn everyday moments into real rewards.",
    perks: ["Daily streaks & bonuses", "Level up your profile", "Redeem for real prizes"],
    iconPath:
      "M8 21h8 M12 17v4 M7 4h10v4a5 5 0 0 1-10 0V4z M17 4h3v2a3 3 0 0 1-3 3 M7 4H4v2a3 3 0 0 0 3 3",
    accent: "#fbbf24",
    accent2: "#f59e0b",
  },
  {
    badge: "Megatalent",
    title: "Become a Star.",
    subtitle: "Global talent contest. €10,000 prize pool every quarter.",
    perks: ["Compete across 30+ categories", "Live voting & watch parties", "Real cash payouts"],
    iconPath:
      "M2 20h20 M3 8l4 4 5-8 5 8 4-4-2 10H5L3 8z",
    accent: "#c084fc",
    accent2: "#ec4899",
  },
];

/* ---------- Composition ---------- */

const INTRO = 130;
const PROMISE = 90;
const MODULE_DUR = 110;
const OUTRO = 130;

export const DISCOVER_DURATION =
  INTRO + PROMISE + MODULES.length * MODULE_DUR + OUTRO; // 130+90+880+130 = 1230

export const DiscoverFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const total = DISCOVER_DURATION;
  const musicVolume = (f: number) => {
    const fadeIn = interpolate(f, [0, 20], [0, 0.7], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const fadeOut = interpolate(f, [total - 40, total - 5], [0.7, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
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
  MODULES.forEach((mod, i) => {
    sequences.push(
      <Sequence key={`m${i}`} from={cursor} durationInFrames={MODULE_DUR}>
        <ModuleScene duration={MODULE_DUR} mod={mod} />
      </Sequence>
    );
    cursor += MODULE_DUR;
  });
  sequences.push(
    <Sequence key="outro" from={cursor} durationInFrames={OUTRO}>
      <SceneOutro duration={OUTRO} />
    </Sequence>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep }}>
      <Audio
        src={staticFile("challenges/audio/bg.mp3")}
        volume={(f) => musicVolume(f)}
      />
      {sequences}
      <span style={{ display: "none" }}>{frame}</span>
    </AbsoluteFill>
  );
};
