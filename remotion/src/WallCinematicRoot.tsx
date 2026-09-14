import React from "react";
import { Composition } from "remotion";
import { WallCinematic, WALL_CINEMATIC_DURATION } from "./WallCinematic";

export const WallCinematicRoot: React.FC = () => (
  <Composition
    id="wall-cinematic"
    component={WallCinematic}
    durationInFrames={WALL_CINEMATIC_DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
);
