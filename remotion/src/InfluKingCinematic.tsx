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

/* -------------------------------------------------------------
 * Slow, cinematic reveal — brand + tag.
 * ------------------------------------------------------------*/
const SceneIntro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const logoScale = spring({ frame, fps: FPS, config: { damping: 14, stiffness: 90 } });
  const logoRot = interpolate(logoScale, [0, 1], [-18, 0]);
  const wordOp = interpolate(frame, [30, 70], [0, 1], { extrapolateRight: "clamp" });
  const wordY = interpolate(frame, [30, 70], [50, 0], { extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [80, 120], [0, 1], { extrapolateRight: "clamp" });
  const tagY = interpolate(frame, [80, 120], [30, 0], { extrapolateRight: "clamp" });
  const kb = interpolate(frame, [0, duration], [1.05, 1.22]);
  const exit = interpolate(frame, [duration - 24, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${kb})` }}>
        <Img
          src={staticFile("influking/03-crown.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(1.15)" }}
        />
        <AbsoluteFill style={{ backgroundColor: "rgba(4,2,14,0.72)" }} />
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 50% 42%, rgba(251,191,36,0.35), transparent 55%), radial-gradient(circle at 50% 92%, rgba(236,72,153,0.35), transparent 55%)",
          }}
        />
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
            filter: "drop-shadow(0 25px 70px rgba(251,191,36,0.55))",
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
            background: `linear-gradient(180deg, ${BRAND.white} 0%, #fde68a 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 80px rgba(251,191,36,0.5)",
            letterSpacing: "-0.02em",
          }}
        >
          Unique
        </div>
        <div
          style={{
            marginTop: 30,
            opacity: tagOp,
            transform: `translateY(${tagY}px)`,
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 62,
            color: BRAND.gold,
            letterSpacing: "0.22em",
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

/* -------------------------------------------------------------
 * Hook — big, slow, one line at a time.
 * ------------------------------------------------------------*/
const SceneHook: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18, duration - 24, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const kb = interpolate(frame, [0, duration], [1.06, 1.18]);
  const line = (fromF: number, toF: number) => ({
    opacity: interpolate(frame, [fromF, toF], [0, 1], { extrapolateRight: "clamp" }),
    y: interpolate(frame, [fromF, toF], [40, 0], { extrapolateRight: "clamp" }),
  });
  const l1 = line(0, 30);
  const l2 = line(30, 65);
  const l3 = line(85, 120);
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep }}>
      <AbsoluteFill style={{ transform: `scale(${kb})` }}>
        <Img
          src={staticFile("influking/01-creator.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <AbsoluteFill style={{ backgroundColor: "rgba(7,4,15,0.78)" }} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: 90,
          textAlign: "center",
          opacity,
        }}
      >
        <div
          style={{
            opacity: l1.opacity,
            transform: `translateY(${l1.y}px)`,
            fontFamily: body.fontFamily,
            fontWeight: 500,
            fontSize: 68,
            color: "rgba(255,255,255,0.86)",
            letterSpacing: "-0.01em",
          }}
        >
          You have the talent.
        </div>
        <div
          style={{
            opacity: l2.opacity,
            transform: `translateY(${l2.y}px)`,
            marginTop: 34,
            fontFamily: body.fontFamily,
            fontWeight: 500,
            fontSize: 68,
            color: "rgba(255,255,255,0.86)",
            letterSpacing: "-0.01em",
          }}
        >
          The algorithm doesn't care.
        </div>
        <div
          style={{
            opacity: l3.opacity,
            transform: `translateY(${l3.y}px)`,
            marginTop: 60,
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 168,
            lineHeight: 0.98,
            letterSpacing: "-0.045em",
            background: `linear-gradient(90deg, ${BRAND.pink} 0%, ${BRAND.gold} 55%, ${BRAND.purple} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          We do.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------
 * Pillar — one cinematic frame per idea, slow reveal.
 * ------------------------------------------------------------*/
type Pillar = {
  chapter: string;
  headline: string;
  body: string;
  perks: string[];
  image: string;
  accent: string;
  accent2: string;
};

const PILLARS: Pillar[] = [
  {
    chapter: "Chapter 1 · Post",
    headline: "Every post is a step toward the crown.",
    body: "Reels, photos, stories, lives — everything counts on your Influ-King score.",
    perks: [
      "Any format, any length",
      "Daily streaks add up fast",
      "AI helps you post smarter",
    ],
    image: "influking/01-creator.jpg",
    accent: "#ec4899",
    accent2: "#a855f7",
  },
  {
    chapter: "Chapter 2 · Fan Club",
    headline: "Turn followers into monthly income.",
    body: "Following is free. Fans upgrade to your Fan Club — three tiers, monthly billing, 85% to you.",
    perks: [
      "Bronze  €4.99 / month",
      "Silver  €9.99 / month",
      "Gold  €19.99 / month",
    ],
    image: "influking/06-fanclub.jpg",
    accent: "#ec4899",
    accent2: "#f472b6",
  },
  {
    chapter: "Chapter 3 · Deals",
    headline: "Real brand campaigns. Paid in EUR.",
    body: "New weekly challenges from real brands. AI matches you with briefs that fit.",
    perks: [
      "New brief every Monday",
      "Cash and credit prizes",
      "Direct chat with the brand",
    ],
    image: "influking/05-deals.jpg",
    accent: "#f97316",
    accent2: "#fbbf24",
  },
  {
    chapter: "Chapter 4 · Monetize",
    headline: "Every format earns.",
    body: "PPV drops, paid DMs, live super-chats, gifts — one tap to unlock, 85% to you.",
    perks: [
      "PPV posts & videos",
      "Paid DMs and shoutouts",
      "Live tips + gift wall",
    ],
    image: "influking/09-live.jpg",
    accent: "#ef4444",
    accent2: "#ec4899",
  },
  {
    chapter: "Chapter 5 · AI Studio",
    headline: "Your creative team, built in.",
    body: "Trend Analyzer, Content Planner, Auto Calendar — a week of posts in seconds.",
    perks: [
      "Trend Analyzer",
      "Content Planner",
      "Auto Content Calendar",
    ],
    image: "influking/12-ai.jpg",
    accent: "#a855f7",
    accent2: "#22d3ee",
  },
  {
    chapter: "Chapter 6 · Reign",
    headline: "The crown is monthly. So is the payout.",
    body: "Rise on live leaderboards. Cash out via Stripe — bank in 2 days, or instant.",
    perks: [
      "Live global & category boards",
      "Standard payout — free",
      "Instant to card — 1% fee",
    ],
    image: "influking/03-crown.jpg",
    accent: "#fbbf24",
    accent2: "#ec4899",
  },
];

const PillarScene: React.FC<{ duration: number; p: Pillar }> = ({ duration, p }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 24], [0, 1], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [duration - 24, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shellOp = enter * (1 - exit);
  // Slow ken burns — pan + zoom.
  const kbScale = interpolate(frame, [0, duration], [1.08, 1.24]);
  const kbX = interpolate(frame, [0, duration], [-24, 24]);
  const kbY = interpolate(frame, [0, duration], [-12, 12]);

  const chOp = interpolate(frame, [10, 34], [0, 1], { extrapolateRight: "clamp" });
  const chY = interpolate(frame, [10, 34], [-30, 0], { extrapolateRight: "clamp" });
  const hOp = interpolate(frame, [30, 62], [0, 1], { extrapolateRight: "clamp" });
  const hY = interpolate(frame, [30, 62], [55, 0], { extrapolateRight: "clamp" });
  const bOp = interpolate(frame, [60, 90], [0, 1], { extrapolateRight: "clamp" });
  const bY = interpolate(frame, [60, 90], [30, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep, opacity: shellOp }}>
      <AbsoluteFill>
        <Img
          src={staticFile(p.image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${kbScale}) translate(${kbX}px, ${kbY}px)`,
            filter: "saturate(1.18) contrast(1.06)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(155deg, ${p.accent}33 0%, transparent 42%, ${p.accent2}44 100%)`,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(7,4,15,0.85) 0%, rgba(7,4,15,0.15) 26%, rgba(7,4,15,0) 46%, rgba(7,4,15,0.55) 66%, rgba(7,4,15,0.97) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "column",
          padding: 90,
          paddingTop: 160,
          paddingBottom: 170,
        }}
      >
        <div
          style={{
            opacity: chOp,
            transform: `translateY(${chY}px)`,
            padding: "18px 44px",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${p.accent}, ${p.accent2})`,
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 30,
            color: BRAND.white,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            boxShadow: `0 20px 60px -15px ${p.accent}cc`,
          }}
        >
          {p.chapter}
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              opacity: hOp,
              transform: `translateY(${hY}px)`,
              fontFamily: body.fontFamily,
              fontWeight: 900,
              fontSize: 108,
              lineHeight: 1.02,
              color: BRAND.white,
              letterSpacing: "-0.035em",
              textAlign: "center",
              textShadow: "0 10px 40px rgba(0,0,0,0.8)",
              maxWidth: 960,
            }}
          >
            {p.headline}
          </div>
          <div
            style={{
              marginTop: 30,
              opacity: bOp,
              transform: `translateY(${bY}px)`,
              fontFamily: body.fontFamily,
              fontWeight: 500,
              fontSize: 42,
              color: "rgba(255,255,255,0.94)",
              textAlign: "center",
              maxWidth: 920,
              lineHeight: 1.32,
              textShadow: "0 4px 20px rgba(0,0,0,0.85)",
            }}
          >
            {p.body}
          </div>
          <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 18, width: "90%" }}>
            {p.perks.map((perk, i) => {
              const delay = 90 + i * 16;
              const s = spring({ frame: frame - delay, fps: FPS, config: { damping: 18, stiffness: 110 } });
              const x = interpolate(s, [0, 1], [-80, 0]);
              return (
                <div
                  key={perk}
                  style={{
                    opacity: s,
                    transform: `translateX(${x}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                    padding: "20px 30px",
                    borderRadius: 24,
                    background: "rgba(7,4,15,0.62)",
                    border: `1px solid ${p.accent}66`,
                    boxShadow: `0 12px 44px -22px ${p.accent}aa`,
                    backdropFilter: "blur(2px)",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      background: `linear-gradient(135deg, ${p.accent}, ${p.accent2})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div
                    style={{
                      fontFamily: body.fontFamily,
                      fontWeight: 700,
                      fontSize: 36,
                      color: BRAND.white,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {perk}
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

/* -------------------------------------------------------------
 * Proof — money, split, trust.
 * ------------------------------------------------------------*/
const SceneProof: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20, duration - 24, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const kb = interpolate(frame, [0, duration], [1.05, 1.18]);
  const stats = [
    { big: "85%", label: "Creator revenue" },
    { big: "€EUR", label: "Real payouts" },
    { big: "24h", label: "New brand briefs" },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep }}>
      <AbsoluteFill style={{ transform: `scale(${kb})` }}>
        <Img
          src={staticFile("influking/11-payout.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <AbsoluteFill style={{ backgroundColor: "rgba(7,4,15,0.76)" }} />
      </AbsoluteFill>
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
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 60,
            color: BRAND.gold,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            textShadow: "0 4px 30px rgba(251,191,36,0.5)",
          }}
        >
          Built to pay
        </div>
        <div style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 40 }}>
          {stats.map((s, i) => {
            const sp = spring({ frame: frame - (24 + i * 22), fps: FPS, config: { damping: 16, stiffness: 100 } });
            return (
              <div
                key={s.label}
                style={{ opacity: sp, transform: `translateY(${(1 - sp) * 40}px)` }}
              >
                <div
                  style={{
                    fontFamily: body.fontFamily,
                    fontWeight: 900,
                    fontSize: 190,
                    lineHeight: 1,
                    letterSpacing: "-0.045em",
                    background: `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.gold})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {s.big}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontFamily: body.fontFamily,
                    fontWeight: 600,
                    fontSize: 44,
                    color: "rgba(255,255,255,0.92)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------
 * Breakdown — For fans / For creators (mirrors chat rundown).
 * ------------------------------------------------------------*/
const SceneBreakdown: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const shell = interpolate(frame, [0, 24, duration - 24, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fans = [
    { k: "View profiles", v: "Free" },
    { k: "Follow / Unfollow", v: "Free" },
    { k: "Likes & comments", v: "Free" },
    { k: "Fan Club subscription", v: "€4.99 / €9.99 / €19.99" },
    { k: "PPV posts", v: "Creator-set" },
    { k: "Paid DMs", v: "Creator-set" },
    { k: "Gift wall / tips", v: "Any amount" },
  ];
  const creators = [
    { k: "Sign up + post", v: "Free" },
    { k: "Fan Club revenue", v: "85% to you" },
    { k: "PPV, DMs, gifts, lives", v: "85% to you" },
    { k: "Brand deals (weekly briefs)", v: "AI Deal Finder" },
    { k: "Payouts", v: "Stripe Connect · KYC" },
  ];
  const Section = ({
    title,
    rows,
    accent,
    baseDelay,
  }: {
    title: string;
    rows: { k: string; v: string }[];
    accent: string;
    baseDelay: number;
  }) => (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          fontFamily: body.fontFamily,
          fontWeight: 900,
          fontSize: 44,
          color: accent,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      {rows.map((r, i) => {
        const s = spring({
          frame: frame - (baseDelay + i * 10),
          fps: FPS,
          config: { damping: 18, stiffness: 110 },
        });
        return (
          <div
            key={r.k}
            style={{
              opacity: s,
              transform: `translateX(${(1 - s) * -60}px)`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
              padding: "18px 26px",
              borderRadius: 20,
              background: "rgba(7,4,15,0.6)",
              border: `1px solid ${accent}55`,
            }}
          >
            <div
              style={{
                fontFamily: body.fontFamily,
                fontWeight: 600,
                fontSize: 32,
                color: "rgba(255,255,255,0.94)",
              }}
            >
              {r.k}
            </div>
            <div
              style={{
                fontFamily: body.fontFamily,
                fontWeight: 900,
                fontSize: 30,
                color: accent,
                textAlign: "right",
              }}
            >
              {r.v}
            </div>
          </div>
        );
      })}
    </div>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep, opacity: shell }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(168,85,247,0.35), transparent 55%), radial-gradient(circle at 85% 90%, rgba(251,191,36,0.28), transparent 55%)",
        }}
      />
      <AbsoluteFill
        style={{
          padding: 80,
          paddingTop: 130,
          flexDirection: "column",
          gap: 44,
        }}
      >
        <div
          style={{
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 66,
            color: BRAND.white,
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          How Influ-King works
        </div>
        <Section title="For fans" rows={fans} accent={BRAND.pink} baseDelay={20} />
        <Section title="For creators" rows={creators} accent={BRAND.gold} baseDelay={110} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------
 * Outro — logo + Unique + URL + CTA.
 * ------------------------------------------------------------*/

const SceneOutro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const logoS = spring({ frame, fps: FPS, config: { damping: 14, stiffness: 90 } });
  const wordS = spring({ frame: frame - 16, fps: FPS, config: { damping: 16, stiffness: 90 } });
  const urlOp = interpolate(frame, [50, 90], [0, 1], { extrapolateRight: "clamp" });
  const ctaOp = interpolate(frame, [80, 120], [0, 1], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [duration - 18, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep, opacity: 1 - exit }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(251,191,36,0.5), transparent 60%), radial-gradient(circle at 50% 92%, rgba(236,72,153,0.42), transparent 60%)",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <Img
          src={staticFile("home/logo.png")}
          style={{
            width: 300,
            height: 300,
            borderRadius: 76,
            transform: `scale(${logoS})`,
            filter: "drop-shadow(0 18px 60px rgba(251,191,36,0.6))",
          }}
        />
        <div
          style={{
            marginTop: 34,
            fontFamily: display.fontFamily,
            fontSize: 250,
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
        <div
          style={{
            marginTop: 40,
            opacity: urlOp,
            fontFamily: body.fontFamily,
            fontWeight: 700,
            fontSize: 72,
            color: BRAND.white,
            letterSpacing: "0.04em",
          }}
        >
          uniqueapp.fun
        </div>
        <div
          style={{
            marginTop: 30,
            opacity: ctaOp,
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 44,
            color: BRAND.gold,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Your throne is waiting
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const INTRO = 165;
const HOOK = 165;
const PILLAR_DUR = 195;
const BREAKDOWN = 300;
const PROOF = 180;
const OUTRO = 180;

export const INFLUKING_CINEMATIC_DURATION =
  INTRO + HOOK + PILLARS.length * PILLAR_DUR + BREAKDOWN + PROOF + OUTRO;

export const InfluKingCinematic: React.FC = () => {
  const total = INFLUKING_CINEMATIC_DURATION;
  const musicVolume = (f: number) => {
    const fadeIn = interpolate(f, [0, 30], [0, 0.72], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeOut = interpolate(f, [total - 45, total - 5], [0.72, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return Math.min(fadeIn, fadeOut);
  };

  let cursor = 0;
  const seq: React.ReactNode[] = [];
  seq.push(
    <Sequence key="intro" from={cursor} durationInFrames={INTRO}>
      <SceneIntro duration={INTRO} />
    </Sequence>
  );
  cursor += INTRO;
  seq.push(
    <Sequence key="hook" from={cursor} durationInFrames={HOOK}>
      <SceneHook duration={HOOK} />
    </Sequence>
  );
  cursor += HOOK;
  PILLARS.forEach((p, i) => {
    seq.push(
      <Sequence key={`p${i}`} from={cursor} durationInFrames={PILLAR_DUR}>
        <PillarScene duration={PILLAR_DUR} p={p} />
      </Sequence>
    );
    cursor += PILLAR_DUR;
  });
  seq.push(
    <Sequence key="breakdown" from={cursor} durationInFrames={BREAKDOWN}>
      <SceneBreakdown duration={BREAKDOWN} />
    </Sequence>
  );
  cursor += BREAKDOWN;
  seq.push(
    <Sequence key="proof" from={cursor} durationInFrames={PROOF}>
      <SceneProof duration={PROOF} />
    </Sequence>
  );
  cursor += PROOF;
  seq.push(
    <Sequence key="outro" from={cursor} durationInFrames={OUTRO}>
      <SceneOutro duration={OUTRO} />
    </Sequence>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDeep }}>
      <Audio src={staticFile("challenges/audio/bg.mp3")} volume={(f) => musicVolume(f)} />
      {seq}
    </AbsoluteFill>
  );
};
