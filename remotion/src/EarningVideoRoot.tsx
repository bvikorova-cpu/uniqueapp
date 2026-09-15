import React from "react";
import { Composition } from "remotion";
import { EarningOpportunitiesVideo, EARNING_DURATION, EARNING_FPS } from "./EarningOpportunitiesVideo";
import type { EarningLang } from "./earningVideoText";

export const EarningVideoRoot: React.FC = () => (
  <>
    {(["en", "sk", "hu"] as EarningLang[]).map((lang) => (
      <Composition key={lang} id={`earning-${lang}`} component={EarningOpportunitiesVideo} durationInFrames={EARNING_DURATION} fps={EARNING_FPS} width={1080} height={1920} defaultProps={{ lang }} />
    ))}
  </>
);