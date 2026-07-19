import { Composition } from "remotion";
import { PropertyVideo } from "./PropertyVideo";
import { UniqueMarketing } from "./UniqueMarketing";
import { UniqueMarketingV } from "./UniqueMarketingV";
import { HomeMarketing, HOME_DURATION } from "./HomeMarketing";
import { VERSIONS } from "./versions";



const TOTAL = 8 * 112 + 4; // 900

export const RemotionRoot = () => (
  <>
    <Composition
      id="main"
      component={PropertyVideo}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={540}
    />
    <Composition
      id="unique-marketing"
      component={UniqueMarketing}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
    {VERSIONS.map((v) => (
      <Composition
        key={v.id}
        id={v.id}
        component={UniqueMarketingV}
        durationInFrames={TOTAL}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ version: v }}
      />
    ))}
  </>
);
