import React from "react";
import { Composition } from "remotion";
import { WallCinematic, wallCinematicDuration } from "./WallCinematic";

const LANGS = ["en", "sk", "hu"] as const;

export const WallCinematicRoot: React.FC = () => (
  <>
    {LANGS.map((lang) => (
      <Composition
        key={lang}
        id={lang === "en" ? "wall-cinematic" : `wall-cinematic-${lang}`}
        component={WallCinematic}
        durationInFrames={wallCinematicDuration(lang)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ lang }}
      />
    ))}
  </>
);
