import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sparkles, Image as ImageIcon, PenTool, Dumbbell, Heart, Brain,
  Eye, Clock, Swords, Baby, Search, Zap,
} from "lucide-react";

interface CostItem {
  label: string;
  cost: string;
}
interface Category {
  id: string;
  title: string;
  icon: typeof Sparkles;
  color: string;
  items: CostItem[];
}

const CATEGORIES: Category[] = [
  {
    id: "image",
    title: "AI Image & Visual",
    icon: ImageIcon,
    color: "text-pink-500",
    items: [
      { label: "Image Generation", cost: "5 cr" },
      { label: "Image Editing / Style Transfer", cost: "3 cr" },
      { label: "AI Upscaler", cost: "2 cr" },
      { label: "Future Face (age projection)", cost: "5 cr" },
      { label: "Photo Restoration", cost: "1–8 cr" },
      { label: "Beauty Studio (skin analysis)", cost: "3 cr" },
      { label: "Fashion Studio tools", cost: "2–25 cr" },
      { label: "Home / Room Designer", cost: "30 cr" },
      { label: "Brand Builder (full kit)", cost: "15 cr" },
      { label: "Tattoo AI", cost: "4–10 cr" },
      { label: "Pet Translator", cost: "5–8 cr" },
    ],
  },
  {
    id: "text",
    title: "AI Writing & Text",
    icon: PenTool,
    color: "text-indigo-500",
    items: [
      { label: "Content Studio (post/script)", cost: "3–8 cr" },
      { label: "CreativeForge (co-writer)", cost: "5 cr/session" },
      { label: "CreativeForge (content scoring)", cost: "3 cr/chapter" },
      { label: "AI Personal Mentor (deep session)", cost: "5 cr" },
      { label: "AI Mentor — daily check-in", cost: "Free" },
      { label: "Career Mentor (question)", cost: "2 cr" },
    ],
  },
  {
    id: "companions",
    title: "AI Companions & Chat",
    icon: Sparkles,
    color: "text-violet-500",
    items: [
      { label: "AI Companion message", cost: "2 cr/msg" },
      { label: "Premium companion message", cost: "4 cr/msg" },
      { label: "Voice reply", cost: "+2 cr" },
      { label: "Image gen in chat", cost: "+3 cr" },
    ],
  },
  {
    id: "nutrition",
    title: "Nutrition & Meal Planning",
    icon: Dumbbell,
    color: "text-orange-500",
    items: [
      { label: "AI Meal Planner", cost: "50 cr" },
      { label: "Smart Food Scanner", cost: "10 cr" },
      { label: "Restaurant Intelligence", cost: "25 cr" },
      { label: "Workout Planner (nutrition match)", cost: "30 cr" },
      { label: "Body Composition Predictor", cost: "10 cr" },
      { label: "Allergy Scanner", cost: "5 cr" },
      { label: "Supplement Advisor", cost: "8 cr" },
      { label: "Grocery Budget Optimizer", cost: "6 cr" },
      { label: "Weekly Progress Dashboard", cost: "6 cr" },
      { label: "Hydration Coach", cost: "3 cr" },
      { label: "Nutrition Coach chat", cost: "2 cr/msg" },
    ],
  },
  {
    id: "fitness",
    title: "Fitness & Health",
    icon: Heart,
    color: "text-red-500",
    items: [
      { label: "Personalized workout plan", cost: "10 cr" },
      { label: "Meal plan (fitness)", cost: "8 cr" },
      { label: "Food scanner (fitness)", cost: "2 cr" },
      { label: "Wellness / therapy session", cost: "5–10 cr" },
      { label: "Crisis routing", cost: "Free" },
      { label: "Phobia detection", cost: "3 cr" },
      { label: "Phobia cure plan", cost: "3 cr" },
      { label: "Therapist session", cost: "3 cr" },
      { label: "Exposure therapy step", cost: "2 cr" },
    ],
  },
  {
    id: "mystical",
    title: "Mystical & Divination",
    icon: Eye,
    color: "text-purple-500",
    items: [
      { label: "Tarot reading (3 cards)", cost: "3 cr" },
      { label: "Tarot (5 / 10 cards)", cost: "5–10 cr" },
      { label: "Astrology — birth / natal chart", cost: "20 cr" },
      { label: "Astrology — compatibility", cost: "7 cr" },
      { label: "Daily horoscope", cost: "1 cr" },
      { label: "Numerology reading", cost: "1–3 cr" },
      { label: "Dream interpretation", cost: "3 cr" },
      { label: "Dream pattern report", cost: "1 cr" },
      { label: "Lottery AI (dream decoder)", cost: "5 cr" },
      { label: "Crystal energy reading", cost: "3 cr" },
      { label: "Yes / No oracle", cost: "2 cr" },
      { label: "Palmistry reading", cost: "10 cr" },
      { label: "Past-life regression", cost: "5–20 cr" },
    ],
  },
  {
    id: "dating",
    title: "Dating & Social",
    icon: Heart,
    color: "text-rose-500",
    items: [
      { label: "Anonymous Dating — daily entry", cost: "2 cr" },
      { label: "Lock in a match", cost: "5 cr" },
      { label: "Reveal photo early", cost: "5 cr" },
      { label: "Super-like", cost: "1 cr" },
      { label: "Profile boost", cost: "10 cr/hr" },
      { label: "Chemistry report", cost: "5 cr" },
      { label: "Text DM", cost: "1 cr" },
      { label: "Voice DM", cost: "3 cr" },
    ],
  },
  {
    id: "time",
    title: "Time & Avatars",
    icon: Clock,
    color: "text-cyan-500",
    items: [
      { label: "Time Reversal — future glimpse", cost: "8 cr" },
      { label: "Time Capsule (up to 5)", cost: "Free" },
      { label: "Holographic Avatar creation", cost: "15 cr" },
      { label: "Avatar battle entry", cost: "3 cr" },
      { label: "Clone voice training", cost: "15 cr" },
      { label: "Voice clone", cost: "20 cr" },
      { label: "Clone battle", cost: "3 cr" },
    ],
  },
  {
    id: "games",
    title: "Games & Battles",
    icon: Swords,
    color: "text-amber-500",
    items: [
      { label: "Brain Duel entry", cost: "3 cr" },
      { label: "Character creation", cost: "Free" },
      { label: "IQ challenge bet", cost: "varies" },
      { label: "Fairytale Book Generator", cost: "10 cr" },
      { label: "Guess My Age", cost: "3 cr" },
      { label: "Face Insight — Basic report", cost: "5 cr" },
      { label: "Face Insight — Deep report + PDF", cost: "15 cr" },
      { label: "Face Insight — Compare two faces", cost: "12 cr" },
      { label: "Video Ad Studio (full ad)", cost: "25 cr" },
      { label: "Property listing", cost: "25 cr" },
    ],
  },
  {
    id: "kids",
    title: "Kids & Education",
    icon: Baby,
    color: "text-emerald-500",
    items: [
      { label: "Kids Voice Chat (per msg)", cost: "1 cr" },
      { label: "Kids Story Creator", cost: "3 cr" },
      { label: "Kids Drawing", cost: "3 cr" },
      { label: "Kids Science", cost: "3 cr" },
      { label: "Math Solver", cost: "3 cr" },
      { label: "Universal Analyzer", cost: "5–10 cr" },
      { label: "Education courses (per course)", cost: "varies" },
      { label: "PDF certificate", cost: "Free" },
    ],
  },
];

export const CreditCostGuide = () => {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filtered = q
    ? CATEGORIES.map((c) => ({
        ...c,
        items: c.items.filter(
          (i) =>
            i.label.toLowerCase().includes(q) || i.cost.toLowerCase().includes(q)
        ),
      })).filter((c) => c.items.length > 0)
    : CATEGORIES;

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Zap className="h-5 w-5 text-primary" />
          Full Credit Cost Guide
          <Badge variant="secondary" className="ml-auto text-xs">
            {CATEGORIES.reduce((n, c) => n + c.items.length, 0)} tools
          </Badge>
        </CardTitle>
        <Input
          placeholder="Search a tool or feature…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-2"
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="rounded-xl border border-border/60 bg-muted/30 p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`h-4 w-4 ${cat.color}`} />
                  <h3 className="font-bold text-sm">{cat.title}</h3>
                </div>
                <ul className="space-y-1.5">
                  {cat.items.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="text-muted-foreground">{item.label}</span>
                      <span
                        className={`shrink-0 font-bold tabular-nums ${
                          item.cost.toLowerCase().includes("free")
                            ? "text-emerald-500"
                            : "text-primary"
                        }`}
                      >
                        {item.cost}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No tools match “{query}”.
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          “cr” = credits · 1 credit ≈ €0.27–€0.50 depending on pack · Free monthly
          top-up of +10 credits on the 1st · Credits never expire
        </p>
      </CardContent>
    </Card>
  );
};
