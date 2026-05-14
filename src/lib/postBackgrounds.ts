export interface PostBackground {
  key: string;
  label: string;
  className: string; // tailwind classes for the card
  textClassName: string; // overrides for text color/size
}

export const POST_BACKGROUNDS: PostBackground[] = [
  {
    key: "gradient-purple",
    label: "Purple Haze",
    className: "bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600",
    textClassName: "text-white text-2xl font-bold text-center",
  },
  {
    key: "gradient-sunset",
    label: "Sunset",
    className: "bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600",
    textClassName: "text-white text-2xl font-bold text-center",
  },
  {
    key: "gradient-ocean",
    label: "Ocean",
    className: "bg-gradient-to-br from-cyan-500 via-sky-600 to-indigo-700",
    textClassName: "text-white text-2xl font-bold text-center",
  },
  {
    key: "gradient-forest",
    label: "Forest",
    className: "bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700",
    textClassName: "text-white text-2xl font-bold text-center",
  },
  {
    key: "solid-rose",
    label: "Rose",
    className: "bg-rose-500",
    textClassName: "text-white text-2xl font-bold text-center",
  },
  {
    key: "solid-noir",
    label: "Noir",
    className: "bg-zinc-900",
    textClassName: "text-amber-100 text-2xl font-bold text-center",
  },
  {
    key: "gradient-aurora",
    label: "Aurora",
    className: "bg-gradient-to-br from-violet-600 via-emerald-500 to-cyan-500",
    textClassName: "text-white text-2xl font-bold text-center",
  },
  {
    key: "gradient-candy",
    label: "Candy",
    className: "bg-gradient-to-br from-pink-400 via-yellow-300 to-purple-400",
    textClassName: "text-zinc-900 text-2xl font-bold text-center",
  },
];

export function getPostBackground(key: string | null | undefined): PostBackground | null {
  if (!key) return null;
  return POST_BACKGROUNDS.find((b) => b.key === key) ?? null;
}
