import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/LobsterTwo";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const display = loadDisplay("normal", { weights: ["700"] });
const body = loadBody("normal", { weights: ["400", "600", "700", "900"] });

const FPS = 30;

const C = {
  bg: "#0b0616",
  bg2: "#160a2b",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gold: "#fbbf24",
  white: "#ffffff",
  soft: "rgba(255,255,255,0.72)",
};

/* ---------------- shared layers ---------------- */

/** rotating vivid palettes — one per chapter beat */
const PALETTES: [string, string, string][] = [
  ["#8b5cf6", "#ec4899", "#fbbf24"],
  ["#06b6d4", "#8b5cf6", "#f472b6"],
  ["#f97316", "#ec4899", "#facc15"],
  ["#22c55e", "#06b6d4", "#a3e635"],
  ["#6366f1", "#d946ef", "#38bdf8"],
  ["#ef4444", "#f59e0b", "#ec4899"],
  ["#14b8a6", "#3b82f6", "#c084fc"],
];

const paletteFor = (i: number): [string, string, string] =>
  PALETTES[i % PALETTES.length] as [string, string, string];

const hexToRgb = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a: string, b: string, t: number) => {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + ((B[i] as number) - v) * t)).join(",")})`;
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 40;
  const drift2 = Math.cos(frame / 70) * 30;
  // smoothly travel through the palettes across the whole film
  const cycle = frame / 150;
  const idx = Math.floor(cycle);
  const t = cycle - idx;
  const p1 = paletteFor(idx);
  const p2 = paletteFor(idx + 1);
  const c1 = mix(p1[0], p2[0], t);
  const c2 = mix(p1[1], p2[1], t);
  const c3 = mix(p1[2], p2[2], t);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1300px 900px at ${18 + drift / 5}% ${16 + drift2 / 7}%, ${c1}, transparent 62%),
                       radial-gradient(1100px 800px at ${84 - drift / 7}% ${80 + drift / 9}%, ${c2}, transparent 64%),
                       radial-gradient(900px 700px at ${52 + drift2 / 5}% ${50 - drift / 9}%, ${c3}, transparent 58%),
                       linear-gradient(160deg, ${C.bg} 0%, ${C.bg2} 55%, ${C.bg} 100%)`,
          opacity: 0.62,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(200deg, rgba(11,6,22,0.55) 0%, rgba(11,6,22,0.2) 45%, rgba(11,6,22,0.7) 100%)`,
        }}
      />
      {/* floating logo confetti */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const speed = 0.5 + i * 0.17;
        const x = (i * 17 + 6 + ((frame * speed) / 8) % 110) % 110 - 5;
        const y = 12 + Math.sin(frame / (50 + i * 12) + i) * 34 + i * 9;
        return (
          <Img
            key={i}
            src={staticFile("home/logo.png")}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: 70 + i * 14,
              height: 70 + i * 14,
              borderRadius: 22,
              opacity: 0.1,
              transform: `rotate(${Math.sin(frame / 70 + i) * 16}deg)`,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          opacity: 0.1,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          transform: `translate(${drift / 4}px, ${drift2 / 4}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** persistent brand badge */
const LogoBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.55 + Math.sin(frame / 18) * 0.25;
  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        right: 52,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 24px 12px 12px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.22)",
        boxShadow: `0 0 ${40 * pulse}px rgba(236,72,153,${0.4 * pulse})`,
      }}
    >
      <Img
        src={staticFile("home/logo.png")}
        style={{ width: 56, height: 56, borderRadius: 16 }}
      />
      <div style={{ lineHeight: 1 }} translate="no">
        <div
          style={{
            fontFamily: display.fontFamily,
            fontSize: 34,
            color: C.white,
          }}
        >
          Unique
        </div>
        <div
          style={{
            marginTop: 4,
            fontFamily: body.fontFamily,
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: 2.5,
            color: C.gold,
          }}
        >
          WALL GUIDE
        </div>
      </div>
    </div>
  );
};


const ProgressBar: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [0, total], [0, 100], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 8,
        background: "rgba(255,255,255,0.1)",
      }}
    >
      <div
        style={{
          width: `${w}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${C.purple}, ${C.pink}, ${C.gold})`,
        }}
      />
    </div>
  );
};

/* ---------------- screenshot viewport ---------------- */

type Focus = { x: number; y: number; zoom: number; zoomTo?: number };

const Shot: React.FC<{
  src: string;
  focus: Focus;
  duration: number;
  width?: number;
  height?: number;
  glow?: string;
}> = ({ src, focus, duration, width = 1000, height = 860, glow = C.pink }) => {
  const frame = useCurrentFrame();
  const enter = spring({ frame, fps: FPS, config: { damping: 200 }, durationInFrames: 26 });
  const zoom = interpolate(frame, [0, duration], [focus.zoom, focus.zoomTo ?? focus.zoom + 0.07], {
    extrapolateRight: "clamp",
  });
  const op = interpolate(frame, [duration - 12, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 28,
        overflow: "hidden",
        border: `4px solid ${glow}aa`,
        boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 70px ${glow}55`,
        background: "#fff",
        opacity: op,
        transform: `translateY(${interpolate(enter, [0, 1], [50, 0])}px) scale(${interpolate(
          enter,
          [0, 1],
          [0.94, 1],
        )})`,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${focus.x}% ${focus.y}%`,
          transform: `scale(${zoom})`,
          transformOrigin: `${focus.x}% ${focus.y}%`,
        }}
      />
    </div>
  );
};

/* ---------------- chapter template ---------------- */

const Chapter: React.FC<{
  no: string;
  title: string;
  lead: string;
  bullets: string[];
  src: string;
  focus: Focus;
  duration: number;
  flip?: boolean;
  idx?: number;
}> = ({ no, title, lead, bullets, src, focus, duration, flip, idx = 0 }) => {
  const frame = useCurrentFrame();
  const [a1, a2, a3] = paletteFor(idx);
  const titleSp = spring({ frame, fps: FPS, config: { damping: 18, stiffness: 130 } });
  const leadOp = interpolate(frame, [12, 34], [0, 1], { extrapolateRight: "clamp" });
  const out = interpolate(frame, [duration - 12, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bob = Math.sin(frame / 40) * 5;

  return (
    <AbsoluteFill
      style={{
        flexDirection: flip ? "row-reverse" : "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 70,
        padding: "0 90px",
        opacity: out,
      }}
    >
      {/* text column */}
      <div style={{ width: 720, transform: `translateY(${bob}px)` }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 22px 8px 10px",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${a1}, ${a2})`,
            fontFamily: body.fontFamily,
            fontWeight: 900,
            fontSize: 24,
            letterSpacing: 3,
            color: C.white,
            opacity: leadOp,
            boxShadow: `0 12px 40px ${a2}66`,
          }}
        >
          <Img
            src={staticFile("home/logo.png")}
            style={{ width: 34, height: 34, borderRadius: 10 }}
          />
          {no}
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: display.fontFamily,
            fontSize: 88,
            lineHeight: 1.02,
            backgroundImage: `linear-gradient(100deg, #ffffff 10%, ${a3} 55%, ${a2} 95%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            transform: `translateX(${interpolate(titleSp, [0, 1], [flip ? 60 : -60, 0])}px)`,
            opacity: titleSp,
            filter: "drop-shadow(0 14px 46px rgba(0,0,0,0.55))",
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 18,
            fontFamily: body.fontFamily,
            fontWeight: 600,
            fontSize: 34,
            lineHeight: 1.32,
            color: C.soft,
            opacity: leadOp,
          }}
        >
          {lead}
        </div>
        <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 16 }}>
          {bullets.map((b, i) => {
            const start = 30 + i * 14;
            const sp = spring({
              frame: frame - start,
              fps: FPS,
              config: { damping: 16, stiffness: 140 },
            });
            const dot = [a1, a2, a3, C.gold][i % 4];
            return (
              <div
                key={b}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "16px 22px",
                  borderRadius: 18,
                  background: `linear-gradient(90deg, ${dot}33, rgba(255,255,255,0.06))`,
                  border: `1px solid ${dot}66`,
                  borderLeft: `6px solid ${dot}`,
                  opacity: sp,
                  transform: `translateX(${interpolate(sp, [0, 1], [flip ? 40 : -40, 0])}px)`,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    flexShrink: 0,
                    background: dot,
                    boxShadow: `0 0 24px ${dot}`,
                  }}
                />
                <div
                  style={{
                    fontFamily: body.fontFamily,
                    fontWeight: 700,
                    fontSize: 30,
                    color: C.white,
                    lineHeight: 1.22,
                  }}
                >
                  {b}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* screenshot */}
      <Shot src={src} focus={focus} duration={duration} glow={a2} />

    </AbsoluteFill>
  );
};

/* ---------------- intro / outro ---------------- */

const Intro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const logo = spring({ frame, fps: FPS, config: { damping: 11, stiffness: 110 } });
  const t1 = interpolate(frame, [16, 40], [0, 1], { extrapolateRight: "clamp" });
  const t2 = interpolate(frame, [34, 58], [0, 1], { extrapolateRight: "clamp" });
  const out = interpolate(frame, [duration - 14, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: out }}
    >
      <Img
        src={staticFile("home/logo.png")}
        style={{
          width: 250,
          height: 250,
          borderRadius: 62,
          transform: `scale(${logo}) rotate(${interpolate(logo, [0, 1], [-18, 0])}deg)`,
          filter: "drop-shadow(0 24px 70px rgba(236,72,153,0.6))",
        }}
      />
      <div
        style={{
          marginTop: 40,
          fontFamily: display.fontFamily,
          fontSize: 150,
          color: C.white,
          opacity: t1,
          transform: `translateY(${interpolate(t1, [0, 1], [40, 0])}px)`,
        }}
      >
        The Wall
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: body.fontFamily,
          fontWeight: 900,
          fontSize: 44,
          letterSpacing: 6,
          color: C.gold,
          opacity: t2,
        }}
      >
        COMPLETE STEP-BY-STEP GUIDE
      </div>
      <div
        style={{
          marginTop: 26,
          fontFamily: body.fontFamily,
          fontWeight: 600,
          fontSize: 34,
          color: C.soft,
          opacity: t2,
        }}
      >
        Post, react, earn XP — everything the Wall can do
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const sp = spring({ frame, fps: FPS, config: { damping: 14, stiffness: 120 } });
  const t2 = interpolate(frame, [24, 50], [0, 1], { extrapolateRight: "clamp" });
  const glow = 0.6 + Math.sin(frame / 14) * 0.25;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div
        style={{
          fontFamily: display.fontFamily,
          fontSize: 120,
          color: C.white,
          opacity: sp,
          transform: `scale(${interpolate(sp, [0, 1], [0.85, 1])})`,
          textAlign: "center",
        }}
      >
        Your Wall is waiting
      </div>
      <div
        style={{
          marginTop: 24,
          fontFamily: body.fontFamily,
          fontWeight: 700,
          fontSize: 38,
          color: C.soft,
          opacity: t2,
          textAlign: "center",
          maxWidth: 1200,
        }}
      >
        Share a post (+20 XP) · Comment (+10 XP) · Add a story (+15 XP) · Build your streak every day
      </div>
      <div
        style={{
          marginTop: 54,
          padding: "22px 54px",
          borderRadius: 999,
          background: `linear-gradient(90deg, ${C.purple}, ${C.pink})`,
          fontFamily: body.fontFamily,
          fontWeight: 900,
          fontSize: 46,
          color: C.white,
          opacity: t2,
          boxShadow: `0 0 ${60 * glow}px rgba(236,72,153,${glow})`,
        }}
        translate="no"
      >
        www.uniqueapp.fun
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- timeline ---------------- */

type Item = { d: number; render: (d: number) => React.ReactNode };

const CHAPTERS: Omit<React.ComponentProps<typeof Chapter>, "duration">[] = [
  {
    no: "01 · LAYOUT",
    title: "Three columns, one feed",
    lead: "Open the Wall from the top menu. The screen is split into three working areas.",
    bullets: [
      "Left: your profile card, composer, privacy & Creator Studio",
      "Middle: hero, search, stories, filters and the post feed",
      "Right: theme colors, Watch & Earn XP, friends, streak, trending",
    ],
    src: "wallguide/s1-overview.png",
    focus: { x: 50, y: 22, zoom: 1.02, zoomTo: 1.1 },
  },
  {
    no: "02 · CREATE A POST",
    title: "Share your first post",
    lead: "Type in “What’s on your mind?”, attach media, choose who can see it, then hit Share Post.",
    bullets: [
      "Add to post: photo, video, feeling, location, tag friends",
      "Extras: AI helper, 24h expiry, poll, event, background",
      "Audience selector: Public, Friends or Close Friends",
      "Share Post gives you +20 XP",
    ],
    src: "wallguide/s2-composer.png",
    focus: { x: 22, y: 45, zoom: 1.25, zoomTo: 1.34 },
    flip: true,
  },
  {
    no: "03 · STORIES & NOTES",
    title: "Stories and 24h notes",
    lead: "Above the feed you have two fast formats that disappear after 24 hours.",
    bullets: [
      "Your Story: photo or video, text sits at the bottom, likes + comments",
      "24h notes: a short thought your friends see for one day",
      "Selected background is highlighted while you create",
      "Stories give +15 XP",
    ],
    src: "wallguide/s1-overview.png",
    focus: { x: 50, y: 60, zoom: 1.35, zoomTo: 1.45 },
  },
  {
    no: "04 · FILTERS",
    title: "Choose what you see",
    lead: "The filter row rebuilds the feed instantly — no reload needed.",
    bullets: [
      "For You: personalised by the interests you picked in onboarding",
      "Follow / Friends: only people you follow or your friends",
      "Trending & Latest: hottest posts vs. newest posts",
      "Verified only: posts from verified members",
    ],
    src: "wallguide/s3-tabs-stories.png",
    focus: { x: 50, y: 82, zoom: 1.3, zoomTo: 1.4 },
    flip: true,
  },
  {
    no: "05 · POST ACTIONS",
    title: "React, comment, gift, save",
    lead: "Every post carries the same action bar under the content.",
    bullets: [
      "React: hold for the full emoji reaction picker",
      "Comment: your comments can be edited or deleted anytime",
      "Gift: send a paid Unique gift — the creator keeps 50%",
      "Bookmark: save the post to read later",
    ],
    src: "wallguide/s4-post.png",
    focus: { x: 50, y: 56, zoom: 1.3, zoomTo: 1.4 },
  },
  {
    no: "06 · LONG POSTS",
    title: "Show more, follow, report",
    lead: "Long texts are collapsed — Show more opens the full post, Show less closes it again.",
    bullets: [
      "Gold ring = Verified Founder or VIP member",
      "Follow / Unfollow right from the post",
      "Report sends the post to moderation",
      "Names always show the real profile name",
    ],
    src: "wallguide/s4-post.png",
    focus: { x: 50, y: 84, zoom: 1.28, zoomTo: 1.38 },
    flip: true,
  },
  {
    no: "07 · VIDEOS",
    title: "Wall videos & stories tab",
    lead: "The Videos tab is the short-video side of the Wall — upload from the same page.",
    bullets: [
      "Open Videos from the Wall tab row",
      "Upload Video for your own short clip",
      "Feeds load 10 videos at a time for speed",
      "Nudity and adult content is removed automatically",
    ],
    src: "wallguide/s1-overview.png",
    focus: { x: 50, y: 10, zoom: 1.3, zoomTo: 1.4 },
  },
  {
    no: "08 · SAVED",
    title: "Everything you bookmarked",
    lead: "Saved collects every post you bookmarked, so nothing good gets lost in the feed.",
    bullets: [
      "Open from More → Saved",
      "Remove a bookmark to clear the list",
      "Works for text, photo and video posts",
    ],
    src: "wallguide/s7-saved.png",
    focus: { x: 50, y: 25, zoom: 1.15, zoomTo: 1.25 },
    flip: true,
  },
  {
    no: "09 · FRIENDS",
    title: "Friends & requests",
    lead: "The Friends tab manages your whole network in one place.",
    bullets: [
      "All friends, incoming and outgoing requests",
      "Search: type one letter and suggestions appear",
      "Close Friends is a private circle for sensitive posts",
      "Accepted requests land in your bell notifications",
    ],
    src: "wallguide/s8-friends.png",
    focus: { x: 50, y: 30, zoom: 1.12, zoomTo: 1.22 },
  },
  {
    no: "10 · MESSAGES",
    title: "Direct messages",
    lead: "Messages opens the messenger — private chats with your friends.",
    bullets: [
      "Text, media and gift messages",
      "Mute a conversation whenever you need quiet",
      "Unread counter sits in the top bar",
    ],
    src: "wallguide/s9-messenger.png",
    focus: { x: 50, y: 28, zoom: 1.12, zoomTo: 1.22 },
    flip: true,
  },
  {
    no: "11 · XP & REWARDS",
    title: "Earn while you scroll",
    lead: "The right column turns activity into XP, levels and streaks.",
    bullets: [
      "Watch & Earn XP: 15s ad = +1 XP, unlimited",
      "Post +20 · Comment +10 · Story +15",
      "Daily streak resets if you skip a day",
      "Theme colors instantly restyle your whole Wall",
    ],
    src: "wallguide/s1-overview.png",
    focus: { x: 92, y: 45, zoom: 1.45, zoomTo: 1.55 },
  },
];

const CH_D = 132;

const ITEMS: Item[] = [
  { d: 96, render: (d) => <Intro duration={d} /> },
  ...CHAPTERS.map((c, i) => ({
    d: CH_D,
    render: (d: number) => <Chapter {...c} duration={d} idx={i} />,
  })),
  { d: 110, render: (d) => <Outro duration={d} /> },
];

export const WALLGUIDE_DURATION = ITEMS.reduce((a, b) => a + b.d, 0);

export const WallGuideFilm: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Backdrop />
      {ITEMS.map((it, i) => {
        const from = at;
        at += it.d;
        return (
          <Sequence key={i} from={from} durationInFrames={it.d}>
            {it.render(it.d)}
          </Sequence>
        );
      })}
      <LogoBadge />
      <ProgressBar total={WALLGUIDE_DURATION} />
    </AbsoluteFill>
  );
};
