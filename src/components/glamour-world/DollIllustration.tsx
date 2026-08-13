import { cn } from "@/lib/utils";

export interface DollLook {
  skinColor: string;
  hairColor: string;
  hairStyle: string;
  dressColor: string;
  dressStyle: string;
  shoeColor: string;
  accessory: string;
}

/** Lighten / darken a hex color by amount (-1..1) */
function shade(hex: string, amount: number) {
  const h = hex.replace("#", "");
  const num = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((num >> 16) & 255) + 255 * amount);
  const g = clamp(((num >> 8) & 255) + 255 * amount);
  const b = clamp((num & 255) + 255 * amount);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Hand-drawn fashion-illustration doll (SVG).
 * Smooth, editorial proportions — no blocky 3D mannequin.
 */
export function DollIllustration({ look, className }: { look: DollLook; className?: string }) {
  const skin = look.skinColor;
  const skinShade = shade(skin, -0.09);
  const hair = look.hairColor;
  const hairLight = shade(hair, 0.12);
  const hairDark = shade(hair, -0.12);
  const dress = look.dressColor;
  const dressLight = shade(dress, 0.16);
  const dressDark = shade(dress, -0.14);
  const shoe = look.shoeColor;

  const isDarkDress = dress.toLowerCase() === "#1b1b22";
  const lipColor = shade("#E5175F", 0.02);

  /* ---------------- HAIR ---------------- */
  const backHair = () => {
    switch (look.hairStyle) {
      case "Short":
        return <path d="M118 96c0-26 14-44 32-44s32 18 32 44c0 16-4 26-8 30-2-16-10-24-24-24s-22 8-24 24c-4-4-8-14-8-30z" fill="url(#hairGrad)" />;
      case "Bun":
        return (
          <>
            <ellipse cx="150" cy="44" rx="19" ry="17" fill="url(#hairGrad)" />
            <path d="M118 98c0-28 14-46 32-46s32 18 32 46c0 14-4 24-8 28-2-16-10-24-24-24s-22 8-24 24c-4-4-8-14-8-28z" fill="url(#hairGrad)" />
          </>
        );
      case "Ponytail":
        return (
          <>
            <path d="M182 92c14 10 20 34 16 62-3 21-14 38-24 44 12-26 14-52 6-78-3-11-4-20 2-28z" fill="url(#hairGrad)" />
            <path d="M118 98c0-28 14-46 32-46s32 18 32 46c0 14-4 24-8 28-2-16-10-24-24-24s-22 8-24 24c-4-4-8-14-8-28z" fill="url(#hairGrad)" />
          </>
        );
      case "Pigtails":
        return (
          <>
            <ellipse cx="110" cy="112" rx="15" ry="30" fill="url(#hairGrad)" />
            <ellipse cx="190" cy="112" rx="15" ry="30" fill="url(#hairGrad)" />
            <path d="M118 98c0-28 14-46 32-46s32 18 32 46c0 14-4 24-8 28-2-16-10-24-24-24s-22 8-24 24c-4-4-8-14-8-28z" fill="url(#hairGrad)" />
          </>
        );
      case "Curly":
        return (
          <>
            {[
              [116, 70], [184, 70], [108, 96], [192, 96], [114, 122], [186, 122], [126, 52], [174, 52], [150, 40],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={17} fill={i % 2 ? hairLight : hair} opacity={0.95} />
            ))}
            <path d="M118 98c0-28 14-46 32-46s32 18 32 46c0 14-4 24-8 28-2-16-10-24-24-24s-22 8-24 24c-4-4-8-14-8-28z" fill="url(#hairGrad)" />
          </>
        );
      default: // Long
        return (
          <path
            d="M150 46c-22 0-36 20-36 48 0 12 1 22-4 44-4 20-6 44-2 62 8-10 16-16 22-18-6-30-6-58 0-78 4 16 10 22 20 22s16-6 20-22c6 20 6 48 0 78 6 2 14 8 22 18 4-18 2-42-2-62-5-22-4-32-4-44 0-28-14-48-36-48z"
            fill="url(#hairGrad)"
          />
        );
    }
  };

  const fringe = () => (
    <path
      d="M120 88c2-22 14-34 30-34s28 12 30 34c-6-12-16-18-30-18-12 0-24 6-30 18z"
      fill={hairDark}
      opacity={0.9}
    />
  );

  /* ---------------- DRESS ---------------- */
  const dressShape = () => {
    switch (look.dressStyle) {
      case "Mini Dress":
        return <path d="M126 146c8 6 40 6 48 0 6 22 14 44 18 62-28 8-56 8-84 0 4-18 12-40 18-62z" fill="url(#dressGrad)" />;
      case "Mermaid":
        return (
          <path
            d="M126 146c8 6 40 6 48 0 8 30 10 56 6 78-4 18-4 36 4 62 12 6 26 14 34 24-40 8-76 8-116 0 8-10 22-18 34-24 8-26 8-44 4-62-4-22-2-48 6-78z"
            fill="url(#dressGrad)"
          />
        );
      case "A-Line":
        return <path d="M126 146c8 6 40 6 48 0 12 44 22 82 32 112-42 10-78 10-120 0 10-30 20-68 40-112z" fill="url(#dressGrad)" />;
      case "Jumpsuit":
        return (
          <>
            <path d="M126 146c8 6 40 6 48 0 6 26 8 48 6 66h-60c-2-18 0-40 6-66z" fill="url(#dressGrad)" />
            <path d="M120 212h27l-3 122h-24c-4-42-3-84 0-122z" fill="url(#dressGrad)" />
            <path d="M180 212h-27l3 122h24c4-42 3-84 0-122z" fill="url(#dressGrad)" />
          </>
        );
      default: // Ball Gown
        return (
          <>
            <path d="M126 146c8 6 40 6 48 0 4 18 6 36 6 52h-60c0-16 2-34 6-52z" fill="url(#dressGrad)" />
            <path
              d="M120 196h60c22 42 38 88 46 130-52 16-100 16-152 0 8-42 24-88 46-130z"
              fill="url(#dressGrad)"
            />
            <path d="M120 196h60c4 8 8 17 12 26-28 10-56 10-84 0 4-9 8-18 12-26z" fill={dressLight} opacity={0.55} />
          </>
        );
    }
  };

  const showLegs = look.dressStyle !== "Mermaid" && look.dressStyle !== "Jumpsuit";
  const legTop = look.dressStyle === "Mini Dress" ? 200 : look.dressStyle === "A-Line" ? 250 : 320;

  /* ---------------- ACCESSORY ---------------- */
  const accessory = () => {
    switch (look.accessory) {
      case "Tiara":
        return (
          <g>
            <path d="M130 58l6-14 7 10 7-14 7 14 7-10 6 14z" fill="#F3D07A" stroke="#C9A227" strokeWidth="1.5" />
            <circle cx="150" cy="46" r="3" fill="#FFF6D0" />
          </g>
        );
      case "Necklace":
        return (
          <g>
            <path d="M138 134c4 10 20 10 24 0" stroke="#F3D07A" strokeWidth="2.5" fill="none" />
            <circle cx="150" cy="142" r="4.5" fill="#7FE7E0" stroke="#F3D07A" strokeWidth="1.5" />
          </g>
        );
      case "Sunglasses":
        return (
          <g>
            <rect x="132" y="88" width="15" height="11" rx="5" fill="#241E2B" />
            <rect x="153" y="88" width="15" height="11" rx="5" fill="#241E2B" />
            <path d="M147 93h6" stroke="#241E2B" strokeWidth="2.5" />
          </g>
        );
      case "Handbag":
        return (
          <g>
            <rect x="188" y="228" width="28" height="22" rx="6" fill="#E5175F" />
            <path d="M194 228c0-8 4-12 8-12s8 4 8 12" stroke="#F3D07A" strokeWidth="2.5" fill="none" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      viewBox="0 0 300 400"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="Illustration of your custom fashion doll"
    >
      <defs>
        <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={hairLight} />
          <stop offset="60%" stopColor={hair} />
          <stop offset="100%" stopColor={hairDark} />
        </linearGradient>
        <linearGradient id="dressGrad" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor={dressLight} />
          <stop offset="55%" stopColor={dress} />
          <stop offset="100%" stopColor={dressDark} />
        </linearGradient>
        <linearGradient id="skinGrad" x1="0.1" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={shade(skin, 0.06)} />
          <stop offset="70%" stopColor={skin} />
          <stop offset="100%" stopColor={skinShade} />
        </linearGradient>
        <radialGradient id="floorGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* soft floor */}
      <ellipse cx="150" cy="352" rx="105" ry="24" fill="url(#floorGlow)" />
      <ellipse cx="150" cy="352" rx="66" ry="12" fill="rgba(120,60,110,0.14)" />

      {/* back hair */}
      {backHair()}

      {/* neck + shoulders */}
      <path d="M142 112h16v22c0 6-16 6-16 0z" fill="url(#skinGrad)" />
      <path d="M126 146c-2-10 8-16 24-16s26 6 24 16c-8 6-40 6-48 0z" fill="url(#skinGrad)" />

      {/* arms */}
      <path d="M128 148c-10 16-16 40-14 66" stroke="url(#skinGrad)" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M172 148c10 16 16 40 14 66" stroke="url(#skinGrad)" strokeWidth="10" strokeLinecap="round" fill="none" />

      {/* legs */}
      {showLegs && (
        <>
          <path d={`M142 ${legTop}c-2 30-2 60 0 ${336 - legTop}`} stroke="url(#skinGrad)" strokeWidth="11" strokeLinecap="round" fill="none" />
          <path d={`M158 ${legTop}c2 30 2 60 0 ${336 - legTop}`} stroke="url(#skinGrad)" strokeWidth="11" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* dress */}
      {dressShape()}

      {/* shoes */}
      <path d="M132 340c0-6 5-9 11-9s10 3 10 9c0 4-4 6-10 6s-11-2-11-6z" fill={shoe} />
      <path d="M147 340c0-6 5-9 11-9s10 3 10 9c0 4-4 6-10 6s-11-2-11-6z" fill={shoe} />

      {/* head */}
      <ellipse cx="150" cy="88" rx="27" ry="32" fill="url(#skinGrad)" />
      {/* cheeks */}
      <ellipse cx="136" cy="96" rx="6" ry="4" fill={lipColor} opacity="0.18" />
      <ellipse cx="164" cy="96" rx="6" ry="4" fill={lipColor} opacity="0.18" />
      {/* brows */}
      <path d="M136 80c3-3 8-3 11-1" stroke={hairDark} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M153 79c3-2 8-2 11 1" stroke={hairDark} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* eyes */}
      {look.accessory !== "Sunglasses" && (
        <>
          <ellipse cx="141" cy="90" rx="4.6" ry="5.4" fill="#FFFFFF" />
          <ellipse cx="159" cy="90" rx="4.6" ry="5.4" fill="#FFFFFF" />
          <circle cx="141.5" cy="90.5" r="3" fill="#3C2A20" />
          <circle cx="159.5" cy="90.5" r="3" fill="#3C2A20" />
          <circle cx="140.4" cy="89.2" r="1" fill="#FFFFFF" />
          <circle cx="158.4" cy="89.2" r="1" fill="#FFFFFF" />
          <path d="M136 85.5c3-3 8-3.4 11-1.4" stroke="#3C2A20" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M153 84.1c3-2 8-1.6 11 1.4" stroke="#3C2A20" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* nose + lips */}
      <path d="M150 96c1.5 2 1 3.5-1.5 4" stroke={skinShade} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M144 105c2-2.4 10-2.4 12 0-2 3.6-10 3.6-12 0z" fill={lipColor} />
      <path d="M144 105c2 1 10 1 12 0" stroke={shade("#E5175F", -0.12)} strokeWidth="0.9" fill="none" />

      {/* fringe over forehead */}
      {look.hairStyle !== "Curly" && fringe()}

      {accessory()}

      {isDarkDress && <ellipse cx="150" cy="270" rx="90" ry="70" fill="#ffffff" opacity="0.03" />}
    </svg>
  );
}
