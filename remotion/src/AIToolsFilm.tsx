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
  cyan: "#22d3ee",
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
        <Img
          src={staticFile("aitools/03-ai-generation.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <AbsoluteFill style={{ backgroundColor: "rgba(5,0,20,0.65)" }} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          opacity: 1 - exit,
        }}
      >
        <div style={{ transform: `scale(${logoScale}) rotate(${logoRot}deg)`, filter: "drop-shadow(0 20px 60px rgba(139,92,246,0.6))" }}>
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
            background: `linear-gradient(180deg, ${BRAND.white} 0%, #e9d5ff 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 80px rgba(139,92,246,0.55)",
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
            color: "rgba(255,255,255,0.94)",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          AI Tools & Studios
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
            "radial-gradient(circle at 30% 30%, rgba(139,92,246,0.45), transparent 55%), radial-gradient(circle at 70% 70%, rgba(236,72,153,0.4), transparent 55%)",
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
          Imagine it.
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
            background: `linear-gradient(90deg, ${BRAND.cyan} 0%, ${BRAND.purple} 50%, ${BRAND.pink} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          AI makes it.
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
          20 studios. One creative universe. Powered by AI.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

type Module = {
  badge: string;
  title: string;
  subtitle: string;
  perks: string[];
  image: string;
  accent: string;
  accent2: string;
};

const ModuleScene: React.FC<{ duration: number; mod: Module }> = ({ duration, mod }) => {
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
            "linear-gradient(180deg, rgba(7,3,15,0.75) 0%, rgba(7,3,15,0.15) 22%, rgba(7,3,15,0) 45%, rgba(7,3,15,0.35) 62%, rgba(7,3,15,0.92) 100%)",
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
            fontSize: 32,
            color: BRAND.white,
            letterSpacing: "0.28em",
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
                    background: "rgba(7,3,15,0.55)",
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
                      <path d="M5 12l5 5L20 7" />
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
            "radial-gradient(circle at 50% 45%, rgba(139,92,246,0.55), transparent 60%), radial-gradient(circle at 50% 90%, rgba(236,72,153,0.4), transparent 60%)",
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
            filter: "drop-shadow(0 15px 50px rgba(139,92,246,0.6))",
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
            background: `linear-gradient(180deg, ${BRAND.white} 0%, #e9d5ff 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 60px rgba(139,92,246,0.5)",
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
            color: "rgba(255,255,255,0.88)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Create · Generate · Amaze
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const MODULES: Module[] = [
  {
    badge: "CreativeForge",
    title: "Words that sell.",
    subtitle: "AI writing studio for blogs, ads, scripts and every voice you need.",
    perks: ["Brainstorm · rewrite · expand", "SEO & plagiarism built-in", "12 languages, one prompt"],
    image: "aitools/01-creativeforge.jpg",
    accent: "#8b5cf6",
    accent2: "#ec4899",
  },
  {
    badge: "Content Studio",
    title: "Social, on tap.",
    subtitle: "Posts, captions, hashtags and hooks for every platform.",
    perks: ["Multi-platform templates", "Tone & style presets", "Schedule-ready output"],
    image: "aitools/02-content-studio.jpg",
    accent: "#ec4899",
    accent2: "#f97316",
  },
  {
    badge: "AI Generation",
    title: "Pixels from thin air.",
    subtitle: "Turn any idea into stunning original images in seconds.",
    perks: ["Photo · art · concept styles", "High-resolution downloads", "Commercial-safe outputs"],
    image: "aitools/03-ai-generation.jpg",
    accent: "#a855f7",
    accent2: "#22d3ee",
  },
  {
    badge: "Universal Analyzer",
    title: "Understand anything.",
    subtitle: "Drop a doc, image, audio or link — get instant insights.",
    perks: ["Text · image · audio · video", "Summaries & sentiment", "One tool, endless inputs"],
    image: "aitools/04-analyzer.jpg",
    accent: "#22d3ee",
    accent2: "#8b5cf6",
  },
  {
    badge: "Video Ad Generator",
    title: "Ads that hit.",
    subtitle: "Scroll-stopping video ads from a single product link.",
    perks: ["Auto script & voiceover", "Vertical · square · wide", "Ready-to-post exports"],
    image: "aitools/05-video-ad.jpg",
    accent: "#ec4899",
    accent2: "#fbbf24",
  },
  {
    badge: "AI Tattoo Designer",
    title: "Ink your story.",
    subtitle: "Personal tattoo concepts from your idea, style and placement.",
    perks: ["100+ tattoo styles", "Body-placement preview", "Print-ready stencils"],
    image: "aitools/06-tattoo.jpg",
    accent: "#fbbf24",
    accent2: "#f97316",
  },
  {
    badge: "AI Personality Clone",
    title: "Your voice, on-demand.",
    subtitle: "Train an AI twin that thinks and answers like you.",
    perks: ["Private personality model", "Chat 24/7 in your style", "Shareable with fans"],
    image: "aitools/07-personality.jpg",
    accent: "#22d3ee",
    accent2: "#8b5cf6",
  },
  {
    badge: "AI Pet Translator",
    title: "What is Rex saying?",
    subtitle: "Upload a bark, meow or photo — get a fun playful translation.",
    perks: ["Dog · cat · exotic pets", "Mood & body language", "Share cards for social"],
    image: "aitools/08-pet-translator.jpg",
    accent: "#f97316",
    accent2: "#ec4899",
  },
  {
    badge: "Handwriting Analyzer",
    title: "Read between the lines.",
    subtitle: "AI graphology reveals personality from a single handwriting sample.",
    perks: ["Personality traits map", "Strengths & habits report", "Beautiful PDF export"],
    image: "aitools/09-handwriting.jpg",
    accent: "#fbbf24",
    accent2: "#8b5cf6",
  },
  {
    badge: "Future Face",
    title: "Meet your future self.",
    subtitle: "See yourself aged 10, 20 or 50 years from now — realistically.",
    perks: ["+10 / +20 / +50 predictions", "Family lineage previews", "Save & share reveals"],
    image: "aitools/10-future-face.jpg",
    accent: "#a855f7",
    accent2: "#ec4899",
  },
  {
    badge: "Photo Restoration",
    title: "Bring memories back.",
    subtitle: "Repair scratches, colorize and enhance old family photos.",
    perks: ["Damage & scratch repair", "AI colorization", "Studio-grade upscaling"],
    image: "aitools/11-photo-restoration.jpg",
    accent: "#fbbf24",
    accent2: "#f97316",
  },
  {
    badge: "Stock Content Library",
    title: "Millions of assets.",
    subtitle: "Photos, video, audio and vectors — all license-clear.",
    perks: ["4K · 8K · vector · audio", "Instant download", "Creator revenue share"],
    image: "aitools/12-stock-library.jpg",
    accent: "#22d3ee",
    accent2: "#3b82f6",
  },
  {
    badge: "Virtual Influencer",
    title: "Build a persona.",
    subtitle: "Design AI influencers that post, grow and earn brand deals.",
    perks: ["Custom look & niche", "Auto-posting schedule", "Brand deals marketplace"],
    image: "aitools/13-virtual-influencer.jpg",
    accent: "#ec4899",
    accent2: "#a855f7",
  },
  {
    badge: "Brand Builder",
    title: "A brand in minutes.",
    subtitle: "Logo, colors, fonts and voice — a full identity from one prompt.",
    perks: ["Logo variants & SVG", "Palette & typography", "Downloadable brand book"],
    image: "aitools/14-brand-builder.jpg",
    accent: "#fbbf24",
    accent2: "#ec4899",
  },
  {
    badge: "Home Designer",
    title: "Redesign any room.",
    subtitle: "Snap a photo and see it restyled in dozens of interiors.",
    perks: ["100+ interior styles", "Furniture & material swaps", "Save & share moodboards"],
    image: "aitools/15-home-designer.jpg",
    accent: "#a855f7",
    accent2: "#fbbf24",
  },
  {
    badge: "Beauty Studio",
    title: "Try before you buy.",
    subtitle: "Virtual makeup, hair and skincare on your live selfie.",
    perks: ["Live AR try-on", "Real product catalog", "Save & shop your looks"],
    image: "aitools/16-beauty.jpg",
    accent: "#ec4899",
    accent2: "#f472b6",
  },
  {
    badge: "Fashion Studio",
    title: "Wear tomorrow, today.",
    subtitle: "Try on outfits, plan looks and get AI styling for any occasion.",
    perks: ["Virtual full-body fitting", "AI outfit stylist", "Wardrobe calendar"],
    image: "aitools/17-fashion.jpg",
    accent: "#ec4899",
    accent2: "#8b5cf6",
  },
  {
    badge: "Graphic Design",
    title: "Design without limits.",
    subtitle: "Posters, social kits, thumbnails and print — all AI-assisted.",
    perks: ["Smart templates", "Vector & raster export", "Brand-locked assets"],
    image: "aitools/18-graphic-design.jpg",
    accent: "#f97316",
    accent2: "#22d3ee",
  },
  {
    badge: "Photography",
    title: "Studio in your pocket.",
    subtitle: "AI retouching, background swaps and cinematic color grading.",
    perks: ["Skin & light retouching", "Background remove & swap", "Cinema-grade LUTs"],
    image: "aitools/19-photography.jpg",
    accent: "#fbbf24",
    accent2: "#a855f7",
  },
  {
    badge: "Music Production",
    title: "Sound that moves.",
    subtitle: "Generate beats, hooks and full tracks in any genre.",
    perks: ["Genre & mood presets", "Royalty-free stems", "Export WAV / MP3"],
    image: "aitools/20-music.jpg",
    accent: "#8b5cf6",
    accent2: "#ec4899",
  },
];

const INTRO = 130;
const PROMISE = 90;
const MODULE_DUR = 100;
const OUTRO = 130;

export const AITOOLS_DURATION = INTRO + PROMISE + MODULES.length * MODULE_DUR + OUTRO;

export const AIToolsFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const total = AITOOLS_DURATION;
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
      <Audio src={staticFile("challenges/audio/bg.mp3")} volume={(f) => musicVolume(f)} />
      {sequences}
      <span style={{ display: "none" }}>{frame}</span>
    </AbsoluteFill>
  );
};
