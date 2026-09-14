import React from "react";
import { Composition } from "remotion";
import { UniqueTeaser, UNIQUE_TEASER_DURATION } from "./UniqueTeaser";

export const TeaserRoot: React.FC = () => (
  <Composition
    id="unique-teaser"
    component={UniqueTeaser}
    durationInFrames={UNIQUE_TEASER_DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
);
