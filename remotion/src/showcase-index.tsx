import { Composition, registerRoot } from "remotion";
import { ShowcaseFilm, buildTimeline } from "./ShowcaseFilm";
import { CUT_20, CUT_35, CUT_ALL } from "./showcaseData";

const CUTS = [
  { key: "20", ids: CUT_20 },
  { key: "35", ids: CUT_35 },
  { key: "all", ids: CUT_ALL },
] as const;

const ShowcaseRoot = () => (
  <>
    {CUTS.flatMap((cut) =>
      (["en", "sk"] as const).map((lang) => (
        <Composition
          key={`showcase-${cut.key}-${lang}`}
          id={`showcase-${cut.key}-${lang}`}
          component={ShowcaseFilm}
          durationInFrames={buildTimeline(cut.ids).total}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ lang, ids: cut.ids as unknown as string[] }}
        />
      )),
    )}
  </>
);

registerRoot(ShowcaseRoot);