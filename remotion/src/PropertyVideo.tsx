import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });

const SCENES = [
  { emoji: "⚔️", title: "Brand Battle Arena", sub: "Vote for your favorite brands" },
  { emoji: "🏆", title: "Head-to-Head Matchups", sub: "Real-time competitive voting" },
  { emoji: "🔥", title: "Win Streak Rewards", sub: "Earn credits & climb the leaderboard" },
  { emoji: "👑", title: "Join the Battle!", sub: "Daily prizes • Live rankings" },
];

const Scene = ({ emoji, title, sub, index }: { emoji: string; title: string; sub: string; index: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 8, fps, config: { damping: 15, stiffness: 120 } });
  const subSpring = spring({ frame: frame - 20, fps, config: { damping: 20 } });
  const emojiScale = spring({ frame: frame - 2, fps, config: { damping: 8, stiffness: 150 } });

  const bgX = interpolate(frame, [0, 75], [10, -10]);
  const titleY = interpolate(titleSpring, [0, 1], [60, 0]);
  const titleOp = interpolate(titleSpring, [0, 1], [0, 1]);
  const subOp = interpolate(subSpring, [0, 1], [0, 1]);
  const subY = interpolate(subSpring, [0, 1], [30, 0]);

  const exitOp = interpolate(frame, [55, 70], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const colors = [
    "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
    "linear-gradient(135deg, #dc2626, #f97316, #eab308)",
    "linear-gradient(135deg, #0369a1, #0ea5e9, #6366f1)",
    "linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef)",
  ];

  return (
    <AbsoluteFill style={{ fontFamily, opacity: exitOp }}>
      <AbsoluteFill style={{ background: colors[index], transform: `translateX(${bgX}px) scale(1.05)` }} />
      {[0, 1, 2, 3, 4].map(i => {
        const floatY = interpolate(frame, [0, 75], [0, -20 - i * 5]);
        const floatX = interpolate(frame, [0, 75], [0, (i % 2 === 0 ? 15 : -15)]);
        return (
          <div key={i} style={{
            position: "absolute",
            width: 60 + i * 30,
            height: 60 + i * 30,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            left: `${15 + i * 18}%`,
            top: `${20 + (i % 3) * 25}%`,
            transform: `translate(${floatX}px, ${floatY}px)`,
          }} />
        );
      })}
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 80, transform: `scale(${emojiScale})`, marginBottom: 8 }}>{emoji}</div>
        <div style={{
          fontSize: 64,
          fontWeight: 900,
          color: "white",
          textShadow: "0 4px 30px rgba(0,0,0,0.3)",
          transform: `translateY(${titleY}px)`,
          opacity: titleOp,
          letterSpacing: -1,
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 28,
          color: "rgba(255,255,255,0.85)",
          transform: `translateY(${subY}px)`,
          opacity: subOp,
          fontWeight: 400,
        }}>
          {sub}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const PropertyVideo = () => {
  return (
    <AbsoluteFill>
      {SCENES.map((scene, i) => (
        <Sequence key={i} from={i * 75} durationInFrames={75}>
          <Scene {...scene} index={i} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
