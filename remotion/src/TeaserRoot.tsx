import React from "react";
import { Composition } from "remotion";
import { UniqueTeaser, teaserDuration } from "./UniqueTeaser";

export const TeaserRoot: React.FC = () => (
  <>
    <Composition
      id="unique-teaser"
      component={UniqueTeaser}
      durationInFrames={teaserDuration("en")}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ lang: "en" as const }}
    />
    <Composition
      id="unique-teaser-sk"
      component={UniqueTeaser}
      durationInFrames={teaserDuration("sk")}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ lang: "sk" as const }}
    />
    <Composition
      id="unique-teaser-hu"
      component={UniqueTeaser}
      durationInFrames={teaserDuration("hu")}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ lang: "hu" as const }}
    />
  </>
);
