import React from "react";
import { Composition } from "remotion";
import { SocialWallPromo, SOCIAL_WALL_PROMO_DURATION } from "./SocialWallPromo";

export const SocialWallRoot: React.FC = () => (
  <Composition
    id="social-wall-promo"
    component={SocialWallPromo}
    durationInFrames={SOCIAL_WALL_PROMO_DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
);