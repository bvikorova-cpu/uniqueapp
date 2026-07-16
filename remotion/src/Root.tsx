import { Composition } from "remotion";
import { PropertyVideo } from "./PropertyVideo";
import { UniqueMarketing } from "./UniqueMarketing";

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
  </>
);
