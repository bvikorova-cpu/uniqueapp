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
import { loadFont as loadBody } from "@remotion/google-fonts/Manrope";
import { TV_COPY, TvLang } from "./tvSpotText";

const display = loadDisplay("normal", { weights: ["700"] }).fontFamily;
const body = loadBody("normal", { weights: ["500", "700", "800"] }).fontFamily;

const FPS = 30;
const INTRO = 96;
const SCENE = 126;
const OUTRO = 174;
export const TV_SPOT_DURATION = INTRO + SCENE * 5 + OUTRO; // 900 = 30s

const IMAGES = ["02.jpg", "03.jpg", "04.jpg", "05.jpg", "06.jpg"];
const ACCENTS = ["#e83ad3", "#8b5cf6", "#f0b90b", "#12bfc4", "#ff5d8f"];

/** Soft brand glow that keeps every frame alive. */
const Glow: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const pulse = 0.5 + Math.sin(frame / 11) * 0.22;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 22% 18%, ${accent}55 0%, transparent 62%)`,
        opacity: pulse,
      }}
    />
  );
};

const Corner: React.FC<{ accent: string }> = ({ accent }) => (
  <div
    style={{
      position: "absolute",
      top: 54,
      left: 62,
      display: "flex",
      alignItems: "center",
      gap: 18,
      zIndex: 12,
    }}
  >
    <Img
      src={staticFile("home/logo.png")}
      style={{ width: 86, height: 86, borderRadius: 24, boxShadow: `0 14px 44px ${accent}aa` }}
    />
    <span style={{ fontFamily: display, fontSize: 66, color: "white", textShadow: "0 8px 28px rgba(0,0,0,.7)" }}>
      Unique
    </span>
  </div>
);

const UrlChip: React.FC<{ accent: string; size?: number }> = ({ accent, size = 34 }) => (
  <div
    style={{
      padding: `${size * 0.36}px ${size * 0.95}px`,
      borderRadius: 60,
      background: `linear-gradient(90deg,${accent},#f4c43c)`,
      boxShadow: `0 18px 54px ${accent}80`,
    }}
  >
    <span style={{ fontFamily: body, fontWeight: 800, fontSize: size, color: "white", letterSpacing: 0.5 }}>
      uniqueapp.fun
    </span>
  </div>
);

const IntroScene: React.FC<{ tagline: string }> = ({ tagline }) => {
  const frame = useCurrentFrame();
  const pop = spring({ frame, fps: FPS, config: { damping: 14, stiffness: 120 } });
  const fade = interpolate(frame, [INTRO - 14, INTRO], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const drift = interpolate(frame, [0, INTRO], [1.06, 1.0]);
  return (
    <AbsoluteFill style={{ opacity: fade, background: "linear-gradient(150deg,#0a0311,#2a0a3d 58%,#0a0311)" }}>
      <Img
        src={staticFile("tvspot/01.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.45, transform: `scale(${drift})` }}
      />
      <Glow accent="#e83ad3" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Img
          src={staticFile("home/logo.png")}
          style={{
            width: 250,
            height: 250,
            borderRadius: 70,
            transform: `scale(${interpolate(pop, [0, 1], [0.55, 1])})`,
            boxShadow: "0 40px 130px #e83ad3cc",
          }}
        />
        <div
          style={{
            marginTop: 30,
            fontFamily: display,
            fontSize: 150,
            color: "white",
            transform: `translateY(${interpolate(pop, [0, 1], [40, 0])}px)`,
            textShadow: "0 16px 70px #e83ad3aa",
          }}
        >
          Unique
        </div>
        <div
          style={{
            marginTop: 16,
            fontFamily: body,
            fontWeight: 700,
            fontSize: 52,
            color: "rgba(255,255,255,.92)",
            opacity: interpolate(frame, [22, 44], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {tagline}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const StoryScene: React.FC<{
  image: string;
  accent: string;
  title: string;
  line: string;
  flip: boolean;
}> = ({ image, accent, title, line, flip }) => {
  const frame = useCurrentFrame();
  const enter = spring({ frame, fps: FPS, config: { damping: 18, stiffness: 130 } });
  const fade = interpolate(frame, [SCENE - 12, SCENE], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const zoom = interpolate(frame, [0, SCENE], [1.04, 1.13]);
  const pan = interpolate(frame, [0, SCENE], flip ? [-24, 12] : [22, -14]);
  return (
    <AbsoluteFill style={{ opacity: fade, backgroundColor: "#07030d" }}>
      <Img
        src={staticFile(`tvspot/${image}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${zoom}) translateX(${pan}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: flip
            ? "linear-gradient(90deg,rgba(6,2,12,.15) 0%,rgba(6,2,12,.55) 45%,rgba(6,2,12,.94) 100%)"
            : "linear-gradient(90deg,rgba(6,2,12,.94) 0%,rgba(6,2,12,.55) 55%,rgba(6,2,12,.15) 100%)",
        }}
      />
      <Glow accent={accent} />
      <Corner accent={accent} />
      <div
        style={{
          position: "absolute",
          bottom: 150,
          left: flip ? "auto" : 84,
          right: flip ? 84 : "auto",
          maxWidth: 940,
          textAlign: flip ? "right" : "left",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 120,
            height: 8,
            marginLeft: flip ? "auto" : 0,
            borderRadius: 8,
            background: `linear-gradient(90deg,${accent},#f4c43c)`,
            transform: `scaleX(${interpolate(enter, [0, 1], [0.1, 1])})`,
            transformOrigin: flip ? "right" : "left",
          }}
        />
        <div
          style={{
            marginTop: 24,
            fontFamily: body,
            fontWeight: 800,
            fontSize: 108,
            lineHeight: 1.02,
            color: "white",
            transform: `translateY(${interpolate(enter, [0, 1], [46, 0])}px)`,
            textShadow: `0 16px 60px rgba(0,0,0,.9), 0 0 80px ${accent}55`,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: body,
            fontWeight: 600,
            fontSize: 46,
            lineHeight: 1.25,
            color: "rgba(255,255,255,.93)",
            opacity: interpolate(frame, [14, 34], [0, 1], { extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(frame, [14, 34], [26, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}px)`,
            textShadow: "0 10px 40px rgba(0,0,0,.9)",
          }}
        >
          {line}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 62, left: flip ? "auto" : 84, right: flip ? 84 : "auto", zIndex: 10 }}>
        <UrlChip accent={accent} size={32} />
      </div>
    </AbsoluteFill>
  );
};

const OutroScene: React.FC<{ cta: string; ctaSub: string; tagline: string }> = ({ ctaSub, tagline }) => {
  const frame = useCurrentFrame();
  const pop = spring({ frame, fps: FPS, config: { damping: 15, stiffness: 120 } });
  const breathe = 1 + Math.sin(frame / 16) * 0.012;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(150deg,#0a0311,#3b0b46 55%,#0a0311)" }}>
      <Img
        src={staticFile("tvspot/03.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.32, transform: `scale(${breathe})` }}
      />
      <Glow accent="#f0b90b" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Img
          src={staticFile("home/logo.png")}
          style={{
            width: 230,
            height: 230,
            borderRadius: 64,
            transform: `scale(${interpolate(pop, [0, 1], [0.6, 1]) * breathe})`,
            boxShadow: "0 40px 120px #e83ad3cc",
          }}
        />
        <div style={{ marginTop: 26, fontFamily: display, fontSize: 132, color: "white" }}>Unique</div>
        <div
          style={{
            marginTop: 10,
            fontFamily: body,
            fontWeight: 700,
            fontSize: 44,
            color: "rgba(255,255,255,.9)",
            opacity: interpolate(frame, [10, 28], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {tagline}
        </div>
        <div
          style={{
            marginTop: 30,
            opacity: interpolate(frame, [18, 38], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          <UrlChip accent="#e83ad3" size={56} />
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: body,
            fontWeight: 600,
            fontSize: 40,
            color: "rgba(255,255,255,.85)",
            opacity: interpolate(frame, [30, 52], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {ctaSub}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const TvSpot: React.FC<{ lang?: TvLang }> = ({ lang = "sk" }) => {
  const copy = TV_COPY[lang];
  return (
    <AbsoluteFill style={{ backgroundColor: "#07030d" }}>
      <Audio src={staticFile("wallguide/music.mp3")} volume={0.1} loop />
      <Audio src={staticFile(copy.voice)} volume={1} />
      <Sequence from={0} durationInFrames={INTRO}>
        <IntroScene tagline={copy.tagline} />
      </Sequence>
      {copy.scenes.map((scene, i) => (
        <Sequence key={scene.title} from={INTRO + i * SCENE} durationInFrames={SCENE}>
          <StoryScene
            image={IMAGES[i]}
            accent={ACCENTS[i]}
            title={scene.title}
            line={scene.line}
            flip={i % 2 === 1}
          />
        </Sequence>
      ))}
      <Sequence from={INTRO + SCENE * 5} durationInFrames={OUTRO}>
        <OutroScene cta={copy.cta} ctaSub={copy.ctaSub} tagline={copy.tagline} />
      </Sequence>
    </AbsoluteFill>
  );
};

export default TvSpot;
