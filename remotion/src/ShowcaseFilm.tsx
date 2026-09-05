import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadLobster } from "@remotion/google-fonts/LobsterTwo";
import { SHOWCASE, COPY, type ShowLang, type ShowSection } from "./showcaseData";

const ANTON = loadAnton().fontFamily;
const INTER = loadInter("normal", { weights: ["500", "700", "900"] }).fontFamily;
const LOBSTER = loadLobster("normal", { weights: ["700"] }).fontFamily;

const INK = "#07030d";
const CREAM = "#fff5fb";

const TITLE_LEN = 34; // section title card
const SHOT_LEN = 66; // per screenshot
const INTRO_LEN = 78;
const OUTRO_LEN = 84;

export const buildTimeline = (ids: string[]) => {
  const sections = SHOWCASE.filter((s) => ids.includes(s.id));
  let cursor = INTRO_LEN;
  const blocks = sections.map((section, si) => {
    const titleFrom = cursor;
    cursor += TITLE_LEN;
    const shots = section.shots.map((shot, i) => {
      const from = cursor;
      cursor += SHOT_LEN;
      return { shot, from, index: i };
    });
    return { section, titleFrom, shots, si };
  });
  return { blocks, total: cursor + OUTRO_LEN, sections };
};

const pop = (frame: number, fps: number, delay = 0, damping = 14) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness: 200 } });

/* ------------------------------- backdrop ------------------------------- */

const Backdrop: React.FC<{ tint: string; seed: number }> = ({ tint, seed }) => {
  const frame = useCurrentFrame();
  const drift = (m: number) => Math.sin((frame + seed * 40) / (70 + m * 25)) * (30 + m * 18);
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 70% at 50% -10%, ${tint}55 0%, transparent 60%), radial-gradient(90% 60% at 10% 110%, ${tint}33 0%, transparent 65%)`,
        }}
      />
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 520 + i * 160,
            height: 520 + i * 160,
            borderRadius: "50%",
            border: `3px solid ${tint}22`,
            left: `${-15 + i * 22}%`,
            top: `${5 + ((i * 27) % 70)}%`,
            transform: `translate(${drift(i)}px, ${drift(i + 1) * 0.6}px)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Watermark: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 46,
      left: 48,
      display: "flex",
      alignItems: "center",
      gap: 14,
      zIndex: 40,
    }}
  >
    <Img src={staticFile("home/logo.png")} style={{ width: 66, height: 66, borderRadius: 18 }} />
    <span style={{ fontFamily: LOBSTER, fontSize: 46, color: CREAM, textShadow: "0 3px 14px rgba(0,0,0,.6)" }}>
      Unique
    </span>
  </div>
);

/* ------------------------------- intro ------------------------------- */

const Intro: React.FC<{ lang: ShowLang; sectionCount: number }> = ({ lang, sectionCount }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = COPY[lang];
  const a = pop(frame, fps, 2, 16);
  const b = pop(frame, fps, 10, 16);
  const s = pop(frame, fps, 22, 20);
  const out = interpolate(frame, [INTRO_LEN - 12, INTRO_LEN], [1, 0], { extrapolateLeft: "clamp" });
  const logoScale = pop(frame, fps, 0, 9);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop tint="#ff2d94" seed={0} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 70,
          textAlign: "center",
        }}
      >
        <Img
          src={staticFile("home/logo.png")}
          style={{ width: 240, height: 240, borderRadius: 60, transform: `scale(${logoScale})`, boxShadow: "0 14px 34px rgba(255,45,148,.5)" }}
        />
        <div
          style={{
            fontFamily: LOBSTER,
            fontSize: 108,
            color: CREAM,
            marginTop: 18,
            transform: `scale(${logoScale})`,
          }}
        >
          Unique
        </div>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 132,
            lineHeight: 1,
            color: CREAM,
            marginTop: 40,
            opacity: a,
            transform: `translateY(${interpolate(a, [0, 1], [70, 0])}px)`,
          }}
        >
          {c.intro1}
        </div>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 132,
            lineHeight: 1,
            color: "#c8ff2f",
            opacity: b,
            transform: `translateY(${interpolate(b, [0, 1], [70, 0])}px)`,
          }}
        >
          {c.intro2}
        </div>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: 44,
            color: "#ffffffcc",
            marginTop: 36,
            opacity: s,
          }}
        >
          {c.introSub}
        </div>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 58,
            color: "#ff2d94",
            background: CREAM,
            padding: "10px 34px",
            borderRadius: 999,
            marginTop: 34,
            opacity: s,
            transform: `scale(${s})`,
          }}
        >
          {sectionCount} {c.sectionsWord}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------------------- section title ---------------------------- */

const SectionTitle: React.FC<{ section: ShowSection; lang: ShowLang; num: number; of: number }> = ({
  section,
  lang,
  num,
  of,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = section[lang];
  const a = pop(frame, fps, 0, 13);
  const b = pop(frame, fps, 6, 16);
  const out = interpolate(frame, [TITLE_LEN - 8, TITLE_LEN], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop tint={section.tint} seed={num} />
      <Watermark />
      <AbsoluteFill style={{ justifyContent: "center", padding: 80 }}>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 900,
            fontSize: 40,
            letterSpacing: 6,
            color: section.tint,
            opacity: a,
          }}
        >
          {String(num).padStart(2, "0")} / {String(of).padStart(2, "0")}
        </div>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 150,
            lineHeight: 0.95,
            color: CREAM,
            marginTop: 12,
            transform: `translateX(${interpolate(a, [0, 1], [-160, 0])}px)`,
            opacity: a,
          }}
        >
          {t.title.toUpperCase()}
        </div>
        <div
          style={{
            height: 12,
            width: interpolate(b, [0, 1], [0, 460]),
            background: section.tint,
            borderRadius: 8,
            marginTop: 26,
          }}
        />
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: 54,
            color: "#ffffffdd",
            marginTop: 26,
            opacity: b,
          }}
        >
          {t.tag}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------- shot -------------------------------- */

const Shot: React.FC<{
  section: ShowSection;
  lang: ShowLang;
  img: string;
  caption: string;
  idx: number;
  count: number;
  seed: number;
}> = ({ section, lang, img, caption, idx, count, seed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = pop(frame, fps, 0, 17);
  const out = interpolate(frame, [SHOT_LEN - 9, SHOT_LEN], [1, 0], { extrapolateLeft: "clamp" });
  const zoom = interpolate(frame, [0, SHOT_LEN], [1.02, 1.12]);
  const pan = interpolate(frame, [0, SHOT_LEN], [0, seed % 2 === 0 ? -34 : 34]);
  const tilt = interpolate(enter, [0, 1], [seed % 2 === 0 ? 6 : -6, 0]);
  const capA = pop(frame, fps, 7, 18);
  const t = section[lang];

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop tint={section.tint} seed={seed} />
      <Watermark />

      {/* phone frame */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 760,
            height: 1330,
            borderRadius: 62,
            padding: 12,
            background: "linear-gradient(160deg, #ffffff33, #ffffff0d)",
            border: `3px solid ${section.tint}88`,
            boxShadow: `0 18px 40px ${section.tint}44`,
            overflow: "hidden",
            transform: `translateY(${interpolate(enter, [0, 1], [140, 0])}px) rotate(${tilt}deg) scale(${interpolate(
              enter,
              [0, 1],
              [0.9, 1],
            )})`,
          }}
        >
          <div style={{ width: "100%", height: "100%", borderRadius: 52, overflow: "hidden", background: "#000" }}>
            <Img
              src={staticFile(img)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top center",
                transform: `scale(${zoom}) translateY(${pan}px)`,
              }}
            />
          </div>
        </div>
      </AbsoluteFill>

      {/* top chip: section name */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 48,
          right: 48,
          display: "flex",
          alignItems: "center",
          gap: 16,
          zIndex: 40,
        }}
      >
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 56,
            color: INK,
            background: section.tint,
            padding: "6px 26px",
            borderRadius: 999,
            transform: `scale(${enter})`,
          }}
        >
          {t.title.toUpperCase()}
        </div>
        <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 34, color: "#ffffff99" }}>
          {idx + 1}/{count}
        </div>
      </div>

      {/* bottom caption */}
      <div
        style={{
          position: "absolute",
          bottom: 90,
          left: 44,
          right: 44,
          zIndex: 40,
          opacity: capA,
          transform: `translateY(${interpolate(capA, [0, 1], [60, 0])}px)`,
        }}
      >
        <div
          style={{
            background: "rgba(7,3,13,0.78)",
            border: `3px solid ${section.tint}aa`,
            borderRadius: 34,
            padding: "26px 32px",
            backdropFilter: undefined,
          }}
        >
          <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 46, lineHeight: 1.18, color: CREAM }}>
            {caption}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------- outro -------------------------------- */

const Outro: React.FC<{ lang: ShowLang }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = COPY[lang];
  const a = pop(frame, fps, 0, 10);
  const b = pop(frame, fps, 12, 16);
  const s = pop(frame, fps, 24, 20);
  return (
    <AbsoluteFill>
      <Backdrop tint="#c8ff2f" seed={3} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: 70 }}>
        <Img
          src={staticFile("home/logo.png")}
          style={{ width: 260, height: 260, borderRadius: 66, transform: `scale(${a})` }}
        />
        <div style={{ fontFamily: LOBSTER, fontSize: 110, color: CREAM, marginTop: 14, transform: `scale(${a})` }}>
          Unique
        </div>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 128,
            color: "#c8ff2f",
            marginTop: 34,
            opacity: b,
            transform: `translateY(${interpolate(b, [0, 1], [60, 0])}px)`,
          }}
        >
          {c.outro1}
        </div>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 74,
            color: CREAM,
            background: "#ff2d94",
            padding: "12px 40px",
            borderRadius: 999,
            marginTop: 24,
            opacity: s,
            transform: `scale(${s})`,
          }}
        >
          {c.outro2}
        </div>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 42, color: "#ffffffcc", marginTop: 30, opacity: s }}>
          {c.outroSub}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------- the film ------------------------------- */

export const ShowcaseFilm: React.FC<{ lang: ShowLang; ids: string[] }> = ({ lang, ids }) => {
  const { blocks, total, sections } = buildTimeline(ids);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Sequence durationInFrames={INTRO_LEN}>
        <Intro lang={lang} sectionCount={sections.length} />
      </Sequence>

      {blocks.map(({ section, titleFrom, shots, si }) => (
        <React.Fragment key={section.id}>
          <Sequence from={titleFrom} durationInFrames={TITLE_LEN}>
            <SectionTitle section={section} lang={lang} num={si + 1} of={sections.length} />
          </Sequence>
          {shots.map(({ shot, from, index }) => (
            <Sequence key={shot.img + index} from={from} durationInFrames={SHOT_LEN}>
              <Shot
                section={section}
                lang={lang}
                img={shot.img}
                caption={shot[lang]}
                idx={index}
                count={shots.length}
                seed={si + index}
              />
            </Sequence>
          ))}
        </React.Fragment>
      ))}

      <Sequence from={total - OUTRO_LEN} durationInFrames={OUTRO_LEN}>
        <Outro lang={lang} />
      </Sequence>

      {/* progress bar */}
      <ProgressBar total={total} />
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [0, total], [0, 100], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 12, background: "#ffffff20", zIndex: 60 }}>
      <div style={{ width: `${w}%`, height: "100%", background: "linear-gradient(90deg,#ff2d94,#c8ff2f)" }} />
    </div>
  );
};
