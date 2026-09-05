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

const ANTON = loadAnton().fontFamily;
const INTER = loadInter("normal", { weights: ["500", "700", "900"] }).fontFamily;
const LOBSTER = loadLobster("normal", { weights: ["700"] }).fontFamily;

const PINK = "#ff2d94";
const PURPLE = "#7c1fd6";
const LIME = "#c8ff2f";
const INK = "#08030f";
const CREAM = "#fff4fb";

const pop = (frame: number, fps: number, delay = 0, damping = 14) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness: 200 } });

/* ---------------- copy ---------------- */

export type Lang = "sk" | "en";

type SectionCopy = {
  label: string;
  hook: string[]; // 2 lines
  bullets: string[]; // 3 short beats
  earn: string;
  outro: string;
};

export type SectionDef = {
  id: string;
  image: string;
  tint: string;
  accent: string;
  sk: SectionCopy;
  en: SectionCopy;
};

export const SECTIONS: SectionDef[] = [
  {
    id: "megatalent",
    image: "images/talent.jpg",
    tint: PINK,
    accent: PINK,
    sk: {
      label: "Megatalent",
      hook: ["UKÁŽ", "SVOJ TALENT."],
      bullets: ["Nahraj video za 3 kredity", "Ľudia hlasujú a komentujú", "Štvrťročná súťaž"],
      earn: "Víťaz berie 50 % zo zisku",
      outro: "TVOJA ŠANCA ZAČÍNA DNES",
    },
    en: {
      label: "Megatalent",
      hook: ["SHOW", "YOUR TALENT."],
      bullets: ["Upload a video for 3 credits", "Real people vote & comment", "Quarterly contest"],
      earn: "Winner takes 50% of profit",
      outro: "YOUR SHOT STARTS TODAY",
    },
  },
  {
    id: "dating",
    image: "images/dating.jpg",
    tint: PURPLE,
    accent: PURPLE,
    sk: {
      label: "Dating & Social",
      hook: ["NÁJDI", "SVOJICH ĽUDÍ."],
      bullets: ["Swipe ✓ alebo ✕", "Anonymné rande za 2 kredity", "Chat, Wall, príbehy"],
      earn: "Darček = €0,25 pre teba",
      outro: "16+ · bezpečne · bez reklám",
    },
    en: {
      label: "Dating & Social",
      hook: ["FIND", "YOUR PEOPLE."],
      bullets: ["Swipe ✓ or ✕", "Anonymous date for 2 credits", "Chat, Wall, stories"],
      earn: "Every gift = €0.25 for you",
      outro: "16+ · safe · no ads",
    },
  },
  {
    id: "ai-studio",
    image: "images/ai.jpg",
    tint: PURPLE,
    accent: LIME,
    sk: {
      label: "AI Studio",
      hook: ["AI VIDEO.", "AI FOTO."],
      bullets: ["Napíš čo chceš vidieť", "8–30 s klip, jeden príbeh", "Hlas aj hudba v cene"],
      earn: "Bez vodoznaku · od 25 kreditov",
      outro: "TVOR ZA SEKUNDY",
    },
    en: {
      label: "AI Studio",
      hook: ["AI VIDEO.", "AI PHOTO."],
      bullets: ["Just describe your idea", "8–30 s clip, one story", "Voice & music included"],
      earn: "No watermark · from 25 credits",
      outro: "CREATE IN SECONDS",
    },
  },
  {
    id: "marketplace",
    image: "images/market.jpg",
    tint: PINK,
    accent: PINK,
    sk: {
      label: "Marketplace",
      hook: ["PREDÁVAJ", "ČOKOĽVEK."],
      bullets: ["Bazaar, aukcie, reality", "Skills: otvor ponuku za 2 kredity", "Vlastné inzeráty spravuješ ty"],
      earn: "Platba priamo medzi vami",
      outro: "KÚP · PREDAJ · ZARÁBAJ",
    },
    en: {
      label: "Marketplace",
      hook: ["SELL", "ANYTHING."],
      bullets: ["Bazaar, auctions, property", "Skills: open an offer for 2 credits", "You control your listings"],
      earn: "Payment directly between people",
      outro: "BUY · SELL · EARN",
    },
  },
  {
    id: "fitness",
    image: "images/fitness.jpg",
    tint: PURPLE,
    accent: LIME,
    sk: {
      label: "Fitness & Wellness",
      hook: ["PLÁN", "NA MIERU."],
      bullets: ["30 / 60 / 90 dní", "Výzvy a denný tracking", "Wellness a myseľ"],
      earn: "AI coach za kredity",
      outro: "ZAČNI DNES",
    },
    en: {
      label: "Fitness & Wellness",
      hook: ["A PLAN", "MADE FOR YOU."],
      bullets: ["30 / 60 / 90 days", "Challenges & daily tracking", "Wellness for your mind"],
      earn: "AI coach with credits",
      outro: "START TODAY",
    },
  },
  {
    id: "kids",
    image: "images/kids.jpg",
    tint: PINK,
    accent: PINK,
    sk: {
      label: "Kids Channel",
      hook: ["BEZPEČNE", "PRE DETI."],
      bullets: ["Omaľovánky a rozprávky", "Učenie a AI kamarádi", "Rodičovská brána"],
      earn: "Bez predplatného · v kreditoch",
      outro: "VEK 6–12",
    },
    en: {
      label: "Kids Channel",
      hook: ["SAFE", "FOR KIDS."],
      bullets: ["Coloring pages & stories", "Learning & AI friends", "Parental gate"],
      earn: "No subscription · credits only",
      outro: "AGES 6–12",
    },
  },
  {
    id: "earnings",
    image: "images/earn.jpg",
    tint: PINK,
    accent: LIME,
    sk: {
      label: "Zárobky",
      hook: ["REÁLNE", "VÝPLATY."],
      bullets: ["Darčeky, tipy, predaje", "Zárobky v eurách", "Výplata od 20 €"],
      earn: "€0,25 z každého kreditu",
      outro: "PENIAZE NA TVOJ ÚČET",
    },
    en: {
      label: "Earnings",
      hook: ["REAL", "PAYOUTS."],
      bullets: ["Gifts, tips, sales", "Balance in euros", "Cash out from €20"],
      earn: "€0.25 from every credit",
      outro: "MONEY TO YOUR ACCOUNT",
    },
  },
  {
    id: "community",
    image: "images/friends.jpg",
    tint: PURPLE,
    accent: PINK,
    sk: {
      label: "Komunita",
      hook: ["JEDNA APKA.", "VŠETKO V NEJ."],
      bullets: ["30+ sekcií, jeden účet", "Bez reklám, bez dát na predaj", "12 jazykov"],
      earn: "+10 kreditov každý mesiac",
      outro: "PRIDAJ SA K NÁM",
    },
    en: {
      label: "Community",
      hook: ["ONE APP.", "EVERYTHING IN IT."],
      bullets: ["30+ sections, one account", "No ads, no data games", "12 languages"],
      earn: "+10 free credits monthly",
      outro: "JOIN US",
    },
  },
];

/* ---------------- pieces ---------------- */

const Photo: React.FC<{
  src: string;
  dur: number;
  zoom?: [number, number];
  pan?: [number, number];
  tint?: string;
  dark?: number;
}> = ({ src, dur, zoom = [1.12, 1.28], pan = [0, -40], tint = PURPLE, dark = 0.45 }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, dur], zoom, { extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, dur], [pan[0], pan[1]], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${s}) translateY(${y}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(8,3,15,${dark * 0.9}) 0%, rgba(8,3,15,0.05) 34%, rgba(8,3,15,0.6) 70%, rgba(8,3,15,0.96) 100%)`,
        }}
      />
      <AbsoluteFill style={{ background: tint, opacity: 0.16, mixBlendMode: "color" }} />
    </AbsoluteFill>
  );
};

const Badge: React.FC<{ label: string; color: string; delay?: number }> = ({
  label,
  color,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, delay, 16);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: s,
        transform: `translateX(${interpolate(s, [0, 1], [-70, 0])}px)`,
      }}
    >
      <div
        style={{
          fontFamily: INTER,
          fontWeight: 900,
          fontSize: 34,
          color: INK,
          background: color,
          padding: "12px 22px",
          borderRadius: 14,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
};

const BigLine: React.FC<{ text: string; size?: number; delay?: number; stroke?: string }> = ({
  text,
  size = 124,
  delay = 0,
  stroke,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, delay, 13);
  return (
    <div
      style={{
        fontFamily: ANTON,
        fontSize: size,
        lineHeight: 0.94,
        letterSpacing: -3,
        color: stroke ? "transparent" : CREAM,
        WebkitTextStroke: stroke ? `4px ${stroke}` : undefined,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [70, 0])}px) scale(${interpolate(s, [0, 1], [0.88, 1])})`,
        textShadow: stroke ? undefined : "0 18px 50px rgba(0,0,0,0.55)",
      }}
    >
      {text}
    </div>
  );
};

/* ---------------- scenes ---------------- */

type SP = { dur: number; def: SectionDef; c: SectionCopy };

const Hook: React.FC<SP> = ({ dur, def, c }) => {
  const frame = useCurrentFrame();
  const shake = frame < 14 ? Math.sin(frame * 3) * (14 - frame) * 0.7 : 0;
  return (
    <AbsoluteFill>
      <Photo src={def.image} dur={dur} zoom={[1.34, 1.12]} tint={def.tint} dark={0.5} />
      <AbsoluteFill style={{ background: CREAM, opacity: frame < 2 ? 1 : 0 }} />
      <AbsoluteFill
        style={{
          padding: 76,
          paddingBottom: 160,
          justifyContent: "flex-end",
          alignItems: "flex-start",
          gap: 22,
          transform: `translateX(${shake}px)`,
        }}
      >
        <Badge label={c.label} color={def.accent === LIME ? LIME : PINK} />
        <BigLine text={c.hook[0]} size={132} delay={4} />
        <BigLine text={c.hook[1]} size={132} delay={11} stroke={LIME} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Beats: React.FC<SP> = ({ dur, def, c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Photo src={def.image} dur={dur} zoom={[1.1, 1.3]} pan={[-30, 30]} tint={def.tint} dark={0.7} />
      <AbsoluteFill style={{ background: "rgba(8,3,15,0.5)" }} />
      <AbsoluteFill style={{ padding: 76, justifyContent: "center", gap: 24 }}>
        <Badge label={c.label} color={def.accent === LIME ? LIME : PINK} />
        {c.bullets.map((b, i) => {
          const s = pop(frame, fps, 8 + i * 10, 12);
          return (
            <div
              key={b}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                background: "rgba(255,255,255,0.10)",
                border: "2px solid rgba(255,255,255,0.25)",
                borderRadius: 28,
                padding: "26px 30px",
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [160, 0])}px)`,
              }}
            >
              <div style={{ fontFamily: ANTON, fontSize: 54, color: LIME, minWidth: 60 }}>
                0{i + 1}
              </div>
              <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 46, color: CREAM, lineHeight: 1.1 }}>
                {b}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const EarnBeat: React.FC<SP> = ({ dur, def, c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beat = frame % 15;
  const kick = beat < 5 ? interpolate(beat, [0, 5], [1.06, 1]) : 1;
  return (
    <AbsoluteFill>
      <Photo src={def.image} dur={dur} zoom={[1.22, 1.06]} pan={[20, -20]} tint={def.tint} dark={0.62} />
      <AbsoluteFill style={{ background: "rgba(8,3,15,0.45)" }} />
      <AbsoluteFill style={{ padding: 76, justifyContent: "center", alignItems: "flex-start", gap: 28 }}>
        <Badge label={c.label} color={LIME} />
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 104,
            lineHeight: 0.98,
            color: CREAM,
            transform: `scale(${kick})`,
            textShadow: `0 0 60px ${PINK}`,
            opacity: pop(frame, fps, 4, 13),
          }}
        >
          {c.earn}
        </div>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 900,
            fontSize: 40,
            color: INK,
            background: LIME,
            padding: "18px 30px",
            borderRadius: 999,
            opacity: pop(frame, fps, 16, 12),
            transform: "rotate(-2deg)",
          }}
        >
          uniqueapp.fun
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CTA: React.FC<SP> = ({ dur, def, c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = pop(frame, fps, 0, 9);
  const url = pop(frame, fps, 12, 12);
  const glow = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <AbsoluteFill>
      <Photo src={def.image} dur={dur} zoom={[1.16, 1.32]} tint={PURPLE} dark={0.85} />
      <AbsoluteFill style={{ background: "rgba(8,3,15,0.72)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 24, padding: 60 }}>
        <Img
          src={staticFile("images/unique-logo.png")}
          style={{
            width: 360,
            height: 360,
            borderRadius: 90,
            transform: `scale(${glow * interpolate(logo, [0, 1], [0.4, 1])})`,
            boxShadow: `0 0 80px ${PURPLE}, 0 0 150px ${PINK}`,
          }}
        />
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 62,
            color: LIME,
            textAlign: "center",
            opacity: url,
          }}
        >
          {c.label.toUpperCase()}
        </div>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 900,
            fontSize: 52,
            color: INK,
            background: LIME,
            padding: "20px 40px",
            borderRadius: 999,
            opacity: url,
            transform: `translateY(${interpolate(url, [0, 1], [60, 0])}px) rotate(-2deg)`,
          }}
        >
          uniqueapp.fun
        </div>
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 900,
            fontSize: 34,
            letterSpacing: 5,
            color: CREAM,
            opacity: 0.9 * url,
            textAlign: "center",
          }}
        >
          {c.outro}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- film ---------------- */

const CUES: { c: React.FC<SP>; d: number }[] = [
  { c: Hook, d: 62 },
  { c: Beats, d: 100 },
  { c: EarnBeat, d: 72 },
  { c: CTA, d: 76 },
];

export const SECTION_SPOT_DURATION = CUES.reduce((a, s) => a + s.d, 0); // 310 ≈ 10.3 s

const Cut: React.FC<{ children: React.ReactNode; dir: number }> = ({ children, dir }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 24, stiffness: 260 } });
  const x = interpolate(s, [0, 1], [dir * 300, 0]);
  const scale = interpolate(s, [0, 1], [1.2, 1]);
  const fade = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px) scale(${scale})`, opacity: fade }}>
      {children}
    </AbsoluteFill>
  );
};

export const SectionSpot: React.FC<{ sectionId?: string; lang?: Lang }> = ({
  sectionId = "megatalent",
  lang = "sk",
}) => {
  const def = SECTIONS.find((s) => s.id === sectionId) ?? SECTIONS[0];
  const c = lang === "en" ? def.en : def.sk;
  let at = 0;
  return (
    <AbsoluteFill style={{ background: INK }}>
      {CUES.map(({ c: C, d }, i) => {
        const from = at;
        at += d;
        return (
          <Sequence key={i} from={from} durationInFrames={d + 2}>
            <Cut dir={i === 0 ? 0 : i % 2 ? 1 : -1}>
              <C dur={d} def={def} c={c} />
            </Cut>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
