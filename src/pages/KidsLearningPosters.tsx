import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  Download,
  Sparkles,
  Loader2,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Wallet,
  Brain,
  Baby,
  ArrowLeft,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import heroVideo from "@/assets/kids-posters/posters-hero.mp4.asset.json";
import posterPartsOfSpeech from "@/assets/kids-posters/parts-of-speech.jpg";
import posterTimesTables from "@/assets/kids-posters/times-tables.jpg";
import posterAbcPhonics from "@/assets/kids-posters/abc-phonics.jpg";
import posterShapesColors from "@/assets/kids-posters/shapes-colors.jpg";
import posterSolarSystem from "@/assets/kids-posters/solar-system.jpg";
import posterWaterCycle from "@/assets/kids-posters/water-cycle.jpg";
import posterFeelings from "@/assets/kids-posters/feelings.jpg";
import posterDailyRoutine from "@/assets/kids-posters/daily-routine.jpg";
import posterOnlineSafety from "@/assets/kids-posters/online-safety.jpg";
import posterMoneyBasics from "@/assets/kids-posters/money-basics.jpg";
import posterStudySmart from "@/assets/kids-posters/study-smart.jpg";
import posterTeenLifeSkills from "@/assets/kids-posters/teen-life-skills.jpg";

export const KLP_AI_POSTER_CREDITS = 3;

type KlpCategory = "school" | "science" | "life" | "safety" | "money" | "teen";

type KlpPoster = {
  id: string;
  title: string;
  description: string;
  ages: string;
  minAge: number;
  category: KlpCategory;
  image: string;
  file: string;
};

const KLP_CATEGORIES: { id: KlpCategory | "all"; label: string; icon: typeof GraduationCap }[] = [
  { id: "all", label: "All posters", icon: Sparkles },
  { id: "school", label: "School basics", icon: GraduationCap },
  { id: "science", label: "Science & nature", icon: Brain },
  { id: "life", label: "Life & feelings", icon: HeartHandshake },
  { id: "safety", label: "Safety", icon: ShieldCheck },
  { id: "money", label: "Money skills", icon: Wallet },
  { id: "teen", label: "Teen advice", icon: Baby },
];

const KLP_AGE_BANDS = [
  { id: "all", label: "All ages" },
  { id: "3", label: "3-5 years" },
  { id: "6", label: "6-9 years" },
  { id: "10", label: "10-13 years" },
  { id: "14", label: "14-18 years" },
] as const;

const KLP_POSTERS: KlpPoster[] = [
  {
    id: "shapes-colors",
    title: "Shapes and Colors",
    description: "First shapes, colour names and friendly animal helpers for the very youngest learners.",
    ages: "3-6 years",
    minAge: 3,
    category: "school",
    image: posterShapesColors,
    file: "unique-shapes-and-colors-poster.jpg",
  },
  {
    id: "abc-phonics",
    title: "ABC Phonics",
    description: "The whole alphabet with one clear picture per letter — perfect for learning to read.",
    ages: "4-7 years",
    minAge: 3,
    category: "school",
    image: posterAbcPhonics,
    file: "unique-abc-phonics-poster.jpg",
  },
  {
    id: "times-tables",
    title: "Times Tables 1-10",
    description: "All ten tables on one sheet, colour coded so practice feels like a game.",
    ages: "6-10 years",
    minAge: 6,
    category: "school",
    image: posterTimesTables,
    file: "unique-times-tables-poster.jpg",
  },
  {
    id: "parts-of-speech",
    title: "Parts of Speech",
    description: "Nouns, verbs, adjectives and the rest — each with a simple rule and an example.",
    ages: "8-11 years",
    minAge: 6,
    category: "school",
    image: posterPartsOfSpeech,
    file: "unique-parts-of-speech-poster.jpg",
  },
  {
    id: "solar-system",
    title: "The Solar System",
    description: "The Sun and all eight planets in order, with names children can point to.",
    ages: "7-12 years",
    minAge: 6,
    category: "science",
    image: posterSolarSystem,
    file: "unique-solar-system-poster.jpg",
  },
  {
    id: "water-cycle",
    title: "The Water Cycle",
    description: "Evaporation, condensation, precipitation and collection explained in one friendly circle.",
    ages: "8-12 years",
    minAge: 6,
    category: "science",
    image: posterWaterCycle,
    file: "unique-water-cycle-poster.jpg",
  },
  {
    id: "feelings",
    title: "My Feelings",
    description: "Nine emotions with faces children recognise, so they can name how they feel out loud.",
    ages: "4-9 years",
    minAge: 3,
    category: "life",
    image: posterFeelings,
    file: "unique-my-feelings-poster.jpg",
  },
  {
    id: "daily-routine",
    title: "My Daily Routine",
    description: "A calm eight-step day from waking up to nine hours of sleep, with clock times.",
    ages: "4-9 years",
    minAge: 3,
    category: "life",
    image: posterDailyRoutine,
    file: "unique-daily-routine-poster.jpg",
  },
  {
    id: "online-safety",
    title: "Online Safety Rules",
    description: "Six short rules about passwords, strangers, posting and asking an adult for help.",
    ages: "8-14 years",
    minAge: 6,
    category: "safety",
    image: posterOnlineSafety,
    file: "unique-online-safety-poster.jpg",
  },
  {
    id: "money-basics",
    title: "Money Basics",
    description: "Earn, save, spend wisely and give — plus the 50-30-20 rule in a simple chart.",
    ages: "10-16 years",
    minAge: 10,
    category: "money",
    image: posterMoneyBasics,
    file: "unique-money-basics-poster.jpg",
  },
  {
    id: "study-smart",
    title: "Study Smart",
    description: "Six habits that really work: focus blocks, active recall, sleep and one task at a time.",
    ages: "12-18 years",
    minAge: 10,
    category: "teen",
    image: posterStudySmart,
    file: "unique-study-smart-poster.jpg",
  },
  {
    id: "teen-life-skills",
    title: "Life Skills for Teens",
    description: "Saying no, handling stress, asking for help and setting goals in small steps.",
    ages: "14-18 years",
    minAge: 14,
    category: "teen",
    image: posterTeenLifeSkills,
    file: "unique-life-skills-for-teens-poster.jpg",
  },
];

async function klpDownload(url: string, filename: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

/**
 * Kids Channel → Learning Posters.
 * Fully isolated page: printable educational poster library plus an optional
 * AI generator that costs 3 credits from the shared `ai_credits` wallet.
 * All styles are scoped with the unique `klp-` prefix.
 */
export default function KidsLearningPosters() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState<KlpCategory | "all">("all");
  const [ageBand, setAgeBand] = useState<(typeof KLP_AGE_BANDS)[number]["id"]>("all");

  const [balance, setBalance] = useState<number | null>(null);
  const [topic, setTopic] = useState("");
  const [ageGroup, setAgeGroup] = useState("6-10");
  const [style, setStyle] = useState<"playful" | "gentle" | "teen">("playful");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setBalance(null);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) setBalance(data?.credits_remaining ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, generated]);

  const posters = useMemo(
    () =>
      KLP_POSTERS.filter((p) => (category === "all" ? true : p.category === category)).filter((p) =>
        ageBand === "all" ? true : p.minAge === Number(ageBand),
      ),
    [category, ageBand],
  );

  const handleDownload = async (poster: KlpPoster) => {
    try {
      await klpDownload(poster.image, poster.file);
      toast({ title: "Download started", description: `${poster.title} is being saved to your device.` });
    } catch {
      toast({
        title: "Download failed",
        description: "Please try again, or long-press the image to save it.",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (topic.trim().length < 3) {
      toast({
        title: "Tell us the topic",
        description: "Describe what the poster should teach, for example: fractions for 9 year olds.",
        variant: "destructive",
      });
      return;
    }
    setGenerating(true);
    setGenerated(null);
    try {
      const { data, error } = await supabase.functions.invoke("kids-learning-poster", {
        body: { topic: topic.trim(), ageGroup, style },
      });
      const payload = (data ?? {}) as { imageUrl?: string; error?: string; creditsRemaining?: number };
      if (error || payload.error || !payload.imageUrl) {
        const message = payload.error ?? error?.message ?? "Could not generate the poster.";
        if (/insufficient/i.test(message)) {
          toast({
            title: "Not enough credits",
            description: `This poster costs ${KLP_AI_POSTER_CREDITS} credits. Top up and try again.`,
            variant: "destructive",
          });
          navigate("/ai-credits");
          return;
        }
        toast({ title: "Generation failed", description: message, variant: "destructive" });
        return;
      }
      setGenerated(payload.imageUrl);
      if (typeof payload.creditsRemaining === "number") setBalance(payload.creditsRemaining);
      toast({
        title: "Your poster is ready",
        description: `${KLP_AI_POSTER_CREDITS} credits used. You can download it now.`,
      });
    } catch (e) {
      toast({
        title: "Generation failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="klp-page min-h-screen bg-background">
      <Helmet>
        <title>Learning Posters for Kids & Teens | Unique Kids Channel</title>
        <meta
          name="description"
          content="Free printable learning posters for children and teenagers: school basics, science, feelings, online safety, money skills and teen life advice. Download instantly or create your own with AI."
        />
      </Helmet>

      <div className="klp-hero relative overflow-hidden">
        <video
          ref={videoRef}
          className="klp-hero-video absolute inset-0 h-full w-full object-cover"
          src={heroVideo.url}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="klp-hero-veil absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <Button variant="ghost" size="sm" asChild className="mb-6 gap-2">
            <Link to="/kids-channel">
              <ArrowLeft className="h-4 w-4" /> Kids Channel
            </Link>
          </Button>
          <Badge className="mb-4 bg-primary text-primary-foreground">Printable • Ages 3-18</Badge>
          <h1 className="klp-title text-3xl font-extrabold tracking-tight md:text-5xl">
            Learning Posters for kids and teens
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Beautiful, ready-to-print posters — school basics, science, feelings, safety, money and real-life
            advice for teenagers. See exactly how each one looks, then download it for free. Need something
            specific? Create your own with AI for {KLP_AI_POSTER_CREDITS} credits.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" className="gap-2" onClick={() => setDialogOpen(true)}>
              <Sparkles className="h-4 w-4" /> Create my own · {KLP_AI_POSTER_CREDITS} credits
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#klp-library">Browse the library</a>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20">
        <Card className="klp-how -mt-6 border-primary/30 bg-card/95 backdrop-blur">
          <CardContent className="space-y-2 p-5">
            <div className="flex items-center gap-2 font-semibold">
              <Info className="h-4 w-4 text-primary" /> How it works
            </div>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Pick an age group and a category — every poster shows a full preview first.</li>
              <li>Press Download to save the poster as a picture and print it at home or at school.</li>
              <li>
                Want your own topic? Press “Create my own”, describe it, and AI draws a fresh poster for{" "}
                {KLP_AI_POSTER_CREDITS} credits (only charged when the poster is created).
              </li>
            </ol>
          </CardContent>
        </Card>

        <div id="klp-library" className="klp-filters mt-10 space-y-4">
          <div className="flex flex-wrap gap-2">
            {KLP_CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <Button
                  key={c.id}
                  size="sm"
                  variant={category === c.id ? "default" : "outline"}
                  className="klp-filter-chip gap-2"
                  onClick={() => setCategory(c.id)}
                >
                  <Icon className="h-4 w-4" /> {c.label}
                </Button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {KLP_AGE_BANDS.map((a) => (
              <Button
                key={a.id}
                size="sm"
                variant={ageBand === a.id ? "secondary" : "ghost"}
                className="klp-age-chip"
                onClick={() => setAgeBand(a.id)}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="klp-grid mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posters.map((poster) => (
            <Card key={poster.id} className="klp-card overflow-hidden">
              <div className="klp-card-preview bg-muted">
                <img
                  src={poster.image}
                  alt={`${poster.title} printable learning poster for ages ${poster.ages}`}
                  loading="lazy"
                  width={768}
                  height={1024}
                  className="h-auto w-full"
                />
              </div>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold leading-tight">{poster.title}</h2>
                  <Badge variant="secondary" className="shrink-0">
                    {poster.ages}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{poster.description}</p>
                <Button className="w-full gap-2" onClick={() => handleDownload(poster)}>
                  <Download className="h-4 w-4" /> Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {posters.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            No poster matches this combination yet — try another age group or category.
          </p>
        )}

        <Card className="klp-cta mt-12 border-primary/40 bg-primary/5">
          <CardContent className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">Need a poster we do not have yet?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Describe any topic — fractions, the alphabet in another language, exam planning, kindness rules —
                and AI draws it in the same friendly style for {KLP_AI_POSTER_CREDITS} credits.
              </p>
            </div>
            <Button size="lg" className="gap-2" onClick={() => setDialogOpen(true)}>
              <Sparkles className="h-4 w-4" /> Create my own poster
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <span className="hidden" aria-hidden="true" />
        </DialogTrigger>
        <DialogContent className="klp-dialog max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Create your own learning poster
            </DialogTitle>
            <DialogDescription>
              One poster costs {KLP_AI_POSTER_CREDITS} credits. Your balance:{" "}
              {balance === null ? "—" : `${balance} credits`}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="klp-topic">
                What should the poster teach?
              </label>
              <Textarea
                id="klp-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="For example: fractions with pizza pictures, or good manners at the dinner table"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="klp-age">
                Age of the child
              </label>
              <Input
                id="klp-age"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                placeholder="6-10"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-sm font-medium">Look and feel</span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: "playful", label: "Playful & colourful" },
                    { id: "gentle", label: "Soft watercolour" },
                    { id: "teen", label: "Modern for teens" },
                  ] as const
                ).map((s) => (
                  <Button
                    key={s.id}
                    type="button"
                    size="sm"
                    variant={style === s.id ? "default" : "outline"}
                    onClick={() => setStyle(s.id)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>

            {generated && (
              <div className="klp-result space-y-3 rounded-xl border p-3">
                <img
                  src={generated}
                  alt="Your generated learning poster"
                  className="h-auto w-full rounded-lg"
                  loading="lazy"
                />
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => klpDownload(generated, "unique-my-learning-poster.png")}
                >
                  <Download className="h-4 w-4" /> Download my poster
                </Button>
              </div>
            )}

            <Button className="w-full gap-2" disabled={generating} onClick={handleGenerate}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating
                ? "Drawing your poster…"
                : `Generate poster · ${KLP_AI_POSTER_CREDITS} credits`}
            </Button>
            <p className="text-xs text-muted-foreground">
              Everything is kept child friendly. Credits are only charged when a poster is successfully created.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
