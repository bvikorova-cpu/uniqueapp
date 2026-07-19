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
const body = loadBody("normal", { weights: ["500", "700", "900"] });

const FPS = 30;
export const CHALLENGES_DURATION = 900; // 30s

const BRAND = {
  purple: "#8b5cf6",
  pink: "#ec4899",
  amber: "#fbbf24",
  green: "#10b981",
  lime: "#84cc16",
  red: "#ef4444",
  bgDeep: "#07030f",
  white: "#ffffff",
};

/* ---------- Shared visuals ---------- */

const KenBurns: React.FC<{ src: string; duration: number; darken?: number }> = ({
  src,
  duration,
  darken = 0.35,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, duration], [1.1, 1.28], {
    extrapolateRight: "clamp",
  });
  const ty = interpolate(frame, [0, duration], [-25, 25], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translateY(${ty}px)`,
          filter: "saturate(1.2) brightness(1.05)",
        }}
      />
      <AbsoluteFill style={{ backgroundColor: `rgba(5,0,15,${darken})` }} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const useEnterExit = (duration: number, exitLen = 20) => {
  const frame = useCurrentFrame();
  const enter = spring({
    frame,
    fps: FPS,
    config: { damping: 18, stiffness: 130 },
  });
  const exit = interpolate(frame, [duration - exitLen, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { enter, exit, opacity: enter * (1 - exit), frame };
};

/* ---------- Scene 1: Signature Intro (matches Home) ---------- */

const SceneIntro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const logoScale = spring({
    frame,
    fps: FPS,
    config: { damping: 10, stiffness: 110 },
  });
  const logoRot = interpolate(logoScale, [0, 1], [-25, 0]);
  const wordOp = interpolate(frame, [18, 42], [0, 1], {
    extrapolateRight: "clamp",
  });
  const wordY = interpolate(frame, [18, 42], [40, 0], {
    extrapolateRight: "clamp",
  });
  const tagOp = interpolate(frame, [50, 78], [0, 1], {
    extrapolateRight: "clamp",
  });
  const tagY = interpolate(frame, [50, 78], [20, 0], {
    extrapolateRight: "clamp",
  });
  const exit = interpolate(frame, [duration - 20, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <KenBurns
        src={staticFile("challenges/intro-backdrop.jpg")}
        duration={duration}
        darken={0.2}
      />
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
          Challenges
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Scene 2: The Promise ---------- */

const ScenePromise: React.FC<{ duration: number }> = ({ duration }) => {
  const { frame, opacity } = useEnterExit(duration);
  const l1o = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const l1y = interpolate(frame, [0, 18], [40, 0], { extrapolateRight: "clamp" });
  const l2o = interpolate(frame, [16, 34], [0, 1], { extrapolateRight: "clamp" });
  const l2y = interpolate(frame, [16, 34], [40, 0], { extrapolateRight: "clamp" });
  const l3o = interpolate(frame, [34, 54], [0, 1], { extrapolateRight: "clamp" });
  const l3y = interpolate(frame, [34, 54], [40, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(16,185,129,0.35), transparent 55%), radial-gradient(circle at 70% 75%, rgba(236,72,153,0.4), transparent 55%)",
          filter: "blur(20px)",
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
            letterSpacing: "-0.01em",
          }}
        >
          Two challenges.
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
            background: `linear-gradient(90deg, ${BRAND.green} 0%, ${BRAND.amber} 50%, ${BRAND.pink} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          One mission.
        </div>
        <div
          style={{
            opacity: l3o,
            transform: `translateY(${l3y}px)`,
            marginTop: 40,
            fontFamily: body.fontFamily,
            fontWeight: 600,
            fontSize: 52,
            color: "rgba(255,255,255,0.9)",
            maxWidth: 900,
          }}
        >
          Live better. Earn real rewards.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Reusable Challenge Scene ---------- */

type Perk = { label: string };

const ChallengeScene: React.FC<{
  duration: number;
  backdrop: string;
  accent: string;
  accent2: string;
  badge: string;
  title: string;
  subtitle: string;
  tagline: string;
  perks: Perk[];
  iconPath: string; // svg path d
}> = ({
  duration,
  backdrop,
  accent,
  accent2,
  badge,
  title,
  subtitle,
  tagline,
  perks,
  iconPath,
}) => {

  const frame = useCurrentFrame();
  const exit = interpolate(frame, [duration - 22, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const badgeOp = interpolate(frame, [4, 24], [0, 1], {
    extrapolateRight: "clamp",
  });
  const badgeY = interpolate(frame, [4, 24], [-40, 0], {
    extrapolateRight: "clamp",
  });

  const iconS = spring({
    frame: frame - 8,
    fps: FPS,
    config: { damping: 12, stiffness: 130 },
  });

  const titleOp = interpolate(frame, [18, 40], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [18, 40], [50, 0], {
    extrapolateRight: "clamp",
  });

  const subOp = interpolate(frame, [32, 55], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [32, 55], [30, 0], {
    extrapolateRight: "clamp",
  });

  const tagOp = interpolate(frame, [46, 70], [0, 1], {
    extrapolateRight: "clamp",
  });
  const tagY = interpolate(frame, [46, 70], [24, 0], {
    extrapolateRight: "clamp",
  });


  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      <KenBurns src={staticFile(backdrop)} duration={duration} darken={0.4} />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
          flexDirection: "column",
          padding: 80,
          paddingTop: 160,
        }}
      >
        {/* Badge */}
        <div
          style={{
            opacity: badgeOp,
            transform: `translateY(${badgeY}px)`,
            padding: "18px 44px",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${accent}, ${accent2})`,
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 38,
            color: BRAND.white,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            boxShadow: `0 20px 60px -15px ${accent}cc`,
          }}
        >
          {badge}
        </div>

        {/* Icon medallion */}
        <div
          style={{
            marginTop: 60,
            width: 260,
            height: 260,
            borderRadius: 80,
            background: `linear-gradient(135deg, ${accent} 0%, ${accent2} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${iconS}) rotate(${(1 - iconS) * -30}deg)`,
            boxShadow: `0 30px 80px -20px ${accent}dd, inset 0 4px 20px rgba(255,255,255,0.25)`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="150"
            height="150"
            fill="none"
            stroke="white"
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={iconPath} />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            marginTop: 60,
            opacity: titleOp,
            transform: `translateY(${titleY}px)`,
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 150,
            lineHeight: 1,
            color: BRAND.white,
            letterSpacing: "-0.035em",
            textShadow: "0 8px 40px rgba(0,0,0,0.55)",
            textAlign: "center",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: 26,
            opacity: subOp,
            transform: `translateY(${subY}px)`,
            fontFamily: body.fontFamily,
            fontWeight: 600,
            fontSize: 46,
            color: "rgba(255,255,255,0.92)",
            textAlign: "center",
            maxWidth: 880,
            textShadow: "0 4px 20px rgba(0,0,0,0.7)",
          }}
        >
          {subtitle}
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 22,
            opacity: tagOp,
            transform: `translateY(${tagY}px)`,
            fontFamily: body.fontFamily,
            fontWeight: 500,
            fontStyle: "italic",
            fontSize: 34,
            color: "rgba(255,255,255,0.82)",
            textAlign: "center",
            maxWidth: 940,
            lineHeight: 1.3,
            textShadow: "0 4px 20px rgba(0,0,0,0.7)",
          }}
        >
          {tagline}
        </div>


        {/* Perks list */}
        <div
          style={{
            marginTop: 70,
            display: "flex",
            flexDirection: "column",
            gap: 22,
            width: "88%",
          }}
        >
          {perks.map((p, i) => {
            const delay = 55 + i * 12;
            const s = spring({
              frame: frame - delay,
              fps: FPS,
              config: { damping: 15, stiffness: 130 },
            });
            const x = interpolate(s, [0, 1], [-80, 0]);
            return (
              <div
                key={p.label}
                style={{
                  opacity: s,
                  transform: `translateX(${x}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "22px 32px",
                  borderRadius: 28,
                  background: "rgba(255,255,255,0.1)",
                  border: `1px solid ${accent}66`,
                  backdropFilter: undefined,
                  boxShadow: `0 10px 40px -20px ${accent}aa`,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${accent}, ${accent2})`,
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
                    fontSize: 42,
                    color: BRAND.white,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {p.label}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Scene 5: Prize ---------- */

const ScenePrize: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [duration - 22, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const s1 = spring({ frame, fps: FPS, config: { damping: 12, stiffness: 110 } });
  const s2 = spring({
    frame: frame - 18,
    fps: FPS,
    config: { damping: 14, stiffness: 120 },
  });
  const s3 = spring({
    frame: frame - 36,
    fps: FPS,
    config: { damping: 14, stiffness: 120 },
  });
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep, opacity: 1 - exit }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(251,191,36,0.4), transparent 55%), radial-gradient(circle at 50% 90%, rgba(236,72,153,0.35), transparent 60%)",
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: 80,
          textAlign: "center",
        }}
      >
        <div
          style={{
            opacity: s1,
            transform: `translateY(${(1 - s1) * 40}px)`,
            fontFamily: body.fontFamily,
            fontWeight: 700,
            fontSize: 56,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Monthly Prize
        </div>
        <div
          style={{
            marginTop: 30,
            opacity: s2,
            transform: `scale(${0.7 + s2 * 0.3})`,
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 380,
            lineHeight: 1,
            letterSpacing: "-0.05em",
            background: `linear-gradient(180deg, ${BRAND.amber} 0%, #fde68a 50%, ${BRAND.pink} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 100px rgba(251,191,36,0.5)",
          }}
        >
          €500
        </div>
        <div
          style={{
            marginTop: 20,
            opacity: s3,
            transform: `translateY(${(1 - s3) * 40}px)`,
            fontFamily: body.fontFamily,
            fontWeight: 700,
            fontSize: 54,
            color: BRAND.white,
            maxWidth: 920,
          }}
        >
          + XP · credits · winner spotlight
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Scene 6: Outro ---------- */

const SceneOutro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const logoS = spring({
    frame,
    fps: FPS,
    config: { damping: 12, stiffness: 100 },
  });
  const wordS = spring({
    frame: frame - 12,
    fps: FPS,
    config: { damping: 14, stiffness: 110 },
  });
  const urlOp = interpolate(frame, [30, 55], [0, 1], {
    extrapolateRight: "clamp",
  });
  const tagOp = interpolate(frame, [45, 70], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep }}>
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
          uniqueapp.fun/challenges
        </div>
        <div
          style={{
            marginTop: 26,
            opacity: tagOp,
            fontFamily: body.fontFamily,
            fontWeight: 600,
            fontSize: 42,
            color: "rgba(255,255,255,0.8)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Join · Compete · Win
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Composition ---------- */

type SceneDef = {
  from: number;
  duration: number;
  component: React.FC<{ duration: number }>;
};

const ECO_ICON =
  "M12 3c-5 4-7 7-7 11a7 7 0 0 0 14 0c0-4-2-7-7-11zM12 8v11";
const HEART_ICON =
  "M12 21s-7-4.5-7-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-7 10-7 10z";

const EcoScene: React.FC<{ duration: number }> = ({ duration }) => (
  <ChallengeScene
    duration={duration}
    backdrop="challenges/eco-backdrop.jpg"
    accent={BRAND.green}
    accent2={BRAND.lime}
    badge="Eco Challenge"
    title="Save the Planet."
    subtitle="Small daily actions. Real climate impact."
    iconPath={ECO_ICON}
    perks={[
      { label: "Daily eco missions" },
      { label: "Track your CO₂ saved" },
      { label: "Compete on the leaderboard" },
    ]}
  />
);

const HealthScene: React.FC<{ duration: number }> = ({ duration }) => (
  <ChallengeScene
    duration={duration}
    backdrop="challenges/health-backdrop.jpg"
    accent={BRAND.pink}
    accent2={BRAND.red}
    badge="Health Challenge"
    title="Move. Sleep. Thrive."
    subtitle="Fitness, mindfulness & nutrition — every single day."
    iconPath={HEART_ICON}
    perks={[
      { label: "Steps · workouts · streaks" },
      { label: "Mindful habits & sleep score" },
      { label: "Weekly wellness rewards" },
    ]}
  />
);

const SCENES: SceneDef[] = [
  { from: 0, duration: 130, component: SceneIntro },
  { from: 130, duration: 100, component: ScenePromise },
  { from: 230, duration: 220, component: EcoScene },
  { from: 450, duration: 220, component: HealthScene },
  { from: 670, duration: 110, component: ScenePrize },
  { from: 780, duration: 120, component: SceneOutro },
];

export const ChallengesFilm: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep }}>
      {SCENES.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.duration}>
          <s.component duration={s.duration} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
