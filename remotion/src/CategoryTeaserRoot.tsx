import React from "react";
import { Composition } from "remotion";
import { CategoryTeaser, CATEGORY_TEASER_DURATION } from "./CategoryTeaser";
import { CATEGORY_TEASERS, CategoryTeaserId } from "./categoryTeaserData";

export const CategoryTeaserRoot: React.FC = () => (
  <>
    {(Object.keys(CATEGORY_TEASERS) as CategoryTeaserId[]).map((id) => (
      <Composition key={id} id={`category-${id}`} component={CategoryTeaser} durationInFrames={CATEGORY_TEASER_DURATION} fps={30} width={1080} height={1920} defaultProps={{ id }} />
    ))}
  </>
);
