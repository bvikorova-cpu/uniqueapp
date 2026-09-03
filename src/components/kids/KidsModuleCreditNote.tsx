import { Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export type KidsModuleKey =
  | "homework"
  | "science"
  | "story"
  | "drawing"
  | "reading"
  | "coloring"
  | "characterChat"
  | "academy";

/** Per-module credit breakdown (server-side enforced costs). */
export const KIDS_MODULE_CREDITS: Record<
  KidsModuleKey,
  { title: string; items: { label: string; cost: string }[] }
> = {
  homework: {
    title: "Homework Helper — credit costs",
    items: [
      { label: "Ask a homework question (AI answer)", cost: "3 credits" },
      { label: "Comprehension quiz from the answer", cost: "3 credits" },
      { label: "Math games & practice", cost: "Free" },
    ],
  },
  science: {
    title: "Science Lab — credit costs",
    items: [
      { label: "Generate an experiment", cost: "3 credits" },
      { label: "Ask the Scientist (question)", cost: "3 credits" },
      { label: "Deep experiment analysis", cost: "4 credits" },
      { label: "Safety check & templates", cost: "Free" },
    ],
  },
  story: {
    title: "Story Creator — credit costs",
    items: [
      { label: "Generate a full story", cost: "8 credits" },
      { label: "Illustrate a page", cost: "3 credits / page" },
      { label: "Read-aloud (AI voice)", cost: "2 credits / page" },
      { label: "Browse your story library", cost: "Free" },
    ],
  },
  drawing: {
    title: "Drawing Buddy — credit costs",
    items: [
      { label: "AI polish of your drawing", cost: "5 credits" },
      { label: "Sketch enhancer", cost: "5 credits" },
      { label: "Drawing canvas, templates, gallery", cost: "Free" },
    ],
  },
  reading: {
    title: "Reading Companion — credit costs",
    items: [
      { label: "Text analysis", cost: "3 credits" },
      { label: "Reading quiz", cost: "3 credits" },
      { label: "Word definition", cost: "1 credit" },
      { label: "Read-aloud (browser voice)", cost: "Free" },
    ],
  },
  coloring: {
    title: "Coloring Pages — credit costs",
    items: [
      { label: "Generate a coloring page (AI)", cost: "3 credits" },
      { label: "Create from image / style transfer", cost: "3 credits" },
      { label: "Ready-made pages & printing", cost: "Free" },
    ],
  },
  characterChat: {
    title: "Character Chat — credit costs",
    items: [
      { label: "Each message to a character", cost: "1 credit" },
      { label: "Choosing a character", cost: "Free" },
    ],
  },
  academy: {
    title: "Kids Collectibles — credit costs",
    items: [
      { label: "Draw a collectible card", cost: "1 credit" },
      { label: "Collect a puzzle piece", cost: "1 credit" },
      { label: "Browsing sets & albums", cost: "Free" },
    ],
  },
};

interface Props {
  module: KidsModuleKey;
  className?: string;
}

/** Compact, always-visible per-module credit breakdown. */
export function KidsModuleCreditNote({ module, className = "" }: Props) {
  const navigate = useNavigate();
  const data = KIDS_MODULE_CREDITS[module];
  return (
    <div className={`rounded-xl border bg-card/80 backdrop-blur p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
        <Coins className="h-4 w-4 text-primary" /> {data.title}
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {data.items.map((i) => (
          <li
            key={i.label}
            className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2"
          >
            <span className="text-muted-foreground">{i.label}</span>
            <span className="font-semibold text-primary whitespace-nowrap">{i.cost}</span>
          </li>
        ))}
      </ul>
      <Button
        size="sm"
        variant="outline"
        className="mt-3"
        onClick={() => navigate("/ai-credits")}
      >
        <Sparkles className="h-4 w-4 mr-2" /> Buy AI credits
      </Button>
    </div>
  );
}

export default KidsModuleCreditNote;
