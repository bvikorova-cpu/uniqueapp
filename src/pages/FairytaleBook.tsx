import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Upload, Loader2, Sparkles, Gem, ImagePlus, Download } from "lucide-react";

type Page = { text: string; scene: string; image?: string };

const THEMES = [
  "Princess & unicorn kingdom",
  "Brave little astronaut",
  "Ocean mermaid adventure",
  "Dinosaur best friend",
  "Enchanted forest fairies",
  "Superhero saves the day",
];

const STYLES = [
  { id: "storybook", label: "Classic storybook" },
  { id: "watercolor", label: "Soft watercolor" },
  { id: "cartoon", label: "Bright cartoon" },
  { id: "pixar", label: "3D animated" },
  { id: "anime", label: "Anime / Ghibli" },
];

const FairytaleBook = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [childName, setChildName] = useState("");
  const [theme, setTheme] = useState(THEMES[0]);
  const [style, setStyle] = useState("storybook");
  const [loading, setLoading] = useState(false);
  const [illustrating, setIllustrating] = useState<number | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [bookId, setBookId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
  }, []);

  const pickPhoto = (file?: File | null) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Photo too large", description: "Please use an image under 8 MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleError = (e: unknown) => {
    const msg = e instanceof Error ? e.message : "Something went wrong";
    if (/insufficient credits/i.test(msg)) {
      toast({ title: "Not enough credits", description: "Top up to keep creating.", variant: "destructive" });
      navigate("/ai-credits-store");
      return;
    }
    toast({ title: "Failed", description: msg, variant: "destructive" });
  };

  const generate = async () => {
    if (!childName.trim()) {
      toast({ title: "Name needed", description: "Enter the child's name.", variant: "destructive" });
      return;
    }
    if (!photo) {
      toast({ title: "Photo needed", description: "Upload a clear face photo.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setPages([]);
    setCover(null);
    setTitle(null);
    try {
      const { data, error } = await supabase.functions.invoke("kids-router", {
        body: { action: "fairytale.generate", childName: childName.trim(), theme, style, photo },
      });
      if (error) throw new Error((data as { error?: string })?.error || error.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      const res = data as { bookId: string | null; title: string; pages: Page[]; cover: string | null };
      setBookId(res.bookId);
      setTitle(res.title);
      setPages(res.pages ?? []);
      setCover(res.cover);
      toast({ title: "Your book is ready!", description: "10 credits used." });
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  const illustrate = async (index: number) => {
    setIllustrating(index);
    try {
      const { data, error } = await supabase.functions.invoke("kids-router", {
        body: {
          action: "fairytale.illustrate",
          bookId,
          pageIndex: index,
          scene: pages[index]?.scene,
          childName: childName.trim(),
          style,
          photo,
        },
      });
      if (error) throw new Error((data as { error?: string })?.error || error.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      const image = (data as { image: string }).image;
      setPages((p) => p.map((pg, i) => (i === index ? { ...pg, image } : pg)));
      toast({ title: "Illustration added", description: "3 credits used." });
    } catch (e) {
      handleError(e);
    } finally {
      setIllustrating(null);
    }
  };

  const download = (src: string, name: string) => {
    const a = document.createElement("a");
    a.href = src;
    a.download = name;
    a.click();
  };

  if (authed === null) return null;

  if (!authed) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-6">
          <Badge className="bg-gradient-to-r from-primary to-accent text-white">Sign in required</Badge>
          <h1 className="text-3xl md:text-5xl font-black">Fairytale Book Generator</h1>
          <p className="text-muted-foreground">Log in to turn a photo into a personalized illustrated storybook.</p>
          <Button size="lg" onClick={() => navigate("/auth")}>Go to login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-16">
      <Helmet>
        <title>Fairytale Book Generator — Personalized Kids Story</title>
        <meta
          name="description"
          content="Turn a child's photo into a personalized illustrated fairytale book with AI. Pick a theme, an art style and get a 5-page storybook."
        />
      </Helmet>

      <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
        <FairytaleHero />


        <Card className="p-4 sm:p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-black text-lg">Create your book</h2>
            <Badge variant="secondary" className="ml-auto">10 credits</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative aspect-square w-full rounded-xl border-2 border-dashed border-primary/40 overflow-hidden flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground hover:border-primary transition"
            >
              {photo ? (
                <img src={photo} alt="Uploaded child photo" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  <span>Upload photo</span>
                </>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickPhoto(e.target.files?.[0])}
            />

            <div className="space-y-3">
              <Input
                placeholder="Child's name"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                maxLength={40}
              />
              <div>
                <p className="text-xs font-semibold mb-1.5">Story theme</p>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        theme === t ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1.5">Art style</p>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        style === s.id ? "bg-accent text-accent-foreground border-accent" : "hover:border-accent"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={generate} disabled={loading} className="flex-1 sm:flex-none">
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Writing your fairytale…</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Generate book</>
              )}
            </Button>
            <Button variant="outline" onClick={() => navigate("/ai-credits-store")}>
              <Gem className="w-4 h-4 mr-2" />Buy credits
            </Button>
          </div>
        </Card>

        {title && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-black">{title}</h2>
              <p className="text-sm text-muted-foreground">A fairytale for {childName}</p>
            </div>

            {cover && (
              <Card className="overflow-hidden">
                <img src={cover} alt={`Cover of ${title}`} className="w-full object-cover" loading="lazy" />
                <div className="p-3 flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => download(cover, "fairytale-cover.png")}>
                    <Download className="w-3.5 h-3.5 mr-1.5" />Download cover
                  </Button>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pages.map((p, i) => (
                <Card key={i} className="p-4 space-y-3">
                  <Badge variant="outline">Page {i + 1}</Badge>
                  {p.image ? (
                    <img src={p.image} alt={`Illustration for page ${i + 1}`} className="w-full rounded-lg" loading="lazy" />
                  ) : null}
                  <p className="text-sm leading-relaxed">{p.text}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={p.image ? "outline" : "default"}
                      disabled={illustrating !== null}
                      onClick={() => illustrate(i)}
                    >
                      {illustrating === i ? (
                        <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Drawing…</>
                      ) : (
                        <><ImagePlus className="w-3.5 h-3.5 mr-1.5" />{p.image ? "Redraw" : "Illustrate"} (3)</>
                      )}
                    </Button>
                    {p.image && (
                      <Button size="sm" variant="ghost" onClick={() => download(p.image!, `fairytale-page-${i + 1}.png`)}>
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FairytaleBook;
