import React from "react";
import { AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig } from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadBungee } from "@remotion/google-fonts/Bungee";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";
import { loadFont as loadDMSerif } from "@remotion/google-fonts/DMSerifDisplay";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadRighteous } from "@remotion/google-fonts/Righteous";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadLobster } from "@remotion/google-fonts/Lobster";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

import type { Version, VScene } from "./versions";

// Pre-load all display fonts once at module scope so any version can use them.
const FONTS: Record<Version["display"], string> = { "Playfair Display": loadPlayfair().fontFamily,
  "Bebas Neue": loadBebas().fontFamily,
  Bungee: loadBungee().fontFamily,
  Fredoka: loadFredoka().fontFamily,
  "DM Serif Display": loadDMSerif().fontFamily,
  Anton: loadAnton().fontFamily,
  Righteous: loadRighteous().fontFamily,
  "Cormorant Garamond": loadCormorant().fontFamily,
  "Space Grotesk": loadSpaceGrotesk().fontFamily,
  Lobster: loadLobster().fontFamily };
const INTER = loadInter("normal", { weights: ["500", "700", "900"] }).fontFamily;

const SCENE_DURATION = 112; // frames — 8 × 112 = 896

const KenBurns: React.FC<{ src: string; duration: number }> = ({ src, duration }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, duration], [1.08, 1.22], { extrapolateRight: "clamp" });
  const tx = interpolate(frame, [0, duration], [-10, 10], { extrapolateRight: "clamp" });
  const ty = interpolate(frame, [0, duration], [-8, 8], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
          filter: "saturate(1.3) brightness(1.12) contrast(1.05)" }}
      />
    </AbsoluteFill>
  );
};

const SceneCard: React.FC<{
  scene: VScene;
  version: Version;
  duration: number;
}> = ({ scene, version, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 130 } });
  const exit = interpolate(frame, [duration - 14, duration], [0, 1], { extrapolateLeft: "clamp",
    extrapolateRight: "clamp" });
  const opacity = enter * (1 - exit);
  const y = interpolate(enter, [0, 1], [40, 0]);

  const lines = scene.caption.split("\n");
  const fontFamily = FONTS[version.display];

  return (
    <AbsoluteFill>
      <KenBurns src={staticFile(`images/marketing/${version.id}/${scene.image}`)} duration={duration} />
      <AbsoluteFill
        style={ {
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)" }}
      />
      <AbsoluteFill
        style={ {
          alignItems: "center",
          justifyContent: "flex-end",
          padding: 80,
          paddingBottom: 240 }}
      >
        <div
          style={{
            opacity,
            transform: `translateY(${y}px)`,
            textAlign: "center",
            fontFamily,
            fontWeight: version.captionWeight,
            fontSize: version.captionSize,
            lineHeight: 1.05,
            color: version.palette.textColor,
            letterSpacing: version.display === "Bebas Neue" || version.display === "Anton" ? "0.02em" : "-0.02em",
            textShadow: version.palette.captionShadow }}
        >
          {lines.map((l, i) => {
            const d = i * 4;
            const op = interpolate(frame - d, [0, 14], [0, 1], { extrapolateRight: "clamp" });
            const ly = interpolate(frame - d, [0, 14], [30, 0], { extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ opacity: op, transform: `translateY(${ly}px)` }}>
                {l}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ version: Version; duration: number }> = ({ version, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const urlOp = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: "clamp" });
  const lobster = FONTS["Lobster"];
  return (
    <AbsoluteFill>
      <KenBurns src={staticFile(`images/marketing/${version.id}/08.jpg`)} duration={duration} />
      <AbsoluteFill style={{ backgroundColor: version.palette.outroTint }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: lobster,
            fontSize: 380,
            transform: `scale(${scale})`,
            background: `linear-gradient(180deg, ${version.palette.accent2} 0%, ${version.palette.accent} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: `0 0 80px ${version.palette.accent}80`,
            lineHeight: 1 }}
        >
          Unique
        </div>
        <div
          style={ {
            marginTop: 30,
            opacity: urlOp,
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: 68,
            color: version.palette.textColor,
            letterSpacing: "0.05em" }}
        >
          uniqueapp.fun
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const UniqueMarketingV: React.FC<{ version: Version }> = ({ version }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: version.palette.bg }}>
      {version.scenes.map((s, i) => {
        const isLast = i === version.scenes.length - 1;
        return (
          <Sequence key={i} from={i * SCENE_DURATION} durationInFrames={SCENE_DURATION + (isLast ? 4 : 0)}>
            {isLast ? (
              <Outro version={version} duration={SCENE_DURATION + 4} />
            ) : (
              <SceneCard scene={s} version={version} duration={SCENE_DURATION} />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
