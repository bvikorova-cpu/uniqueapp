import { Composition } from "remotion";
import { TvSpot, TV_SPOT_DURATION } from "./TvSpot";

export const TvSpotRoot = () => (
  <>
    <Composition
      id="tv-spot-sk"
      component={TvSpot}
      durationInFrames={TV_SPOT_DURATION}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ lang: "sk" as const }}
    />
    <Composition
      id="tv-spot-en"
      component={TvSpot}
      durationInFrames={TV_SPOT_DURATION}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ lang: "en" as const }}
    />
  </>
);
