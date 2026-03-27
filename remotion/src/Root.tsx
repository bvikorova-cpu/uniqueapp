import { Composition } from "remotion";
import { PropertyVideo } from "./PropertyVideo";

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={PropertyVideo}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={540}
  />
);
