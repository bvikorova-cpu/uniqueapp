import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Send, Sparkles, Upload, Coins, Image as ImageIcon, Crown } from "lucide-react";
import {
  useGalleryItems,
  useMyGalleryLikes,
  useToggleGalleryLike,
  useSubmitGalleryItem,
  useMyGallerySubmissions,
  useGalleryTour,
} from "@/hooks/useHandwritingGallery";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function PublicGalleryCard() {
  const [tab, setTab] = useState<"all" | "famous" | "community">("all");
  const items = useGalleryItems(tab);
  const likes = useMyGalleryLikes();
  const myItems = useMyGallerySubmissions();
  const toggleLike = useToggleGalleryLike();
  const submit = useSubmitGalleryItem();
  const [activeItem, setActiveItem] = useState<any>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  // submission form
  const [file, setFile] = useState<File | null>(null);
  const [figureName, setFigureName] = useState("");
  const [era, setEra] = useState("");
  const [region, setRegion] = useState("");
  const [story, setStory] = useState("");

  const tour = useGalleryTour(activeItem?.id ?? null);
  const [chatInput, setChatInput] = useState("");

  const submitForm = () => {
    if (!file || !figureName.trim()) return;
    submit.mutate(
      { file, figureName: figureName.trim(), era: era.trim() || undefined, region: region.trim() || undefined, story: story.trim() || undefined },
      {
        onSuccess: () => {
          setFile(null); setFigureName(""); setEra(""); setRegion(""); setStory("");
          setSubmitOpen(false);
        },
      },
    );
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    tour.ask.mutate({ message: chatInput.trim() }, { onSuccess: () => setChatInput("") });
  };

  return (
    <>
      <FloatingHowItWorks title={"Public Gallery Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Public Gallery Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Public Gallery Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-amber-50/80 to-orange-100/60 dark:from-amber-950/30 dark:to-orange-900/20 border-amber-300/40">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-700" /> The Public Gallery
          </CardTitle>
          <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Upload className="w-4 h-4" /> Submit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Submit a handwriting sample</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Image *</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Figure name *</Label>
                  <Input value={figureName} onChange={(e) => setFigureName(e.target.value)} placeholder="e.g. My grandmother" maxLength={80} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Era</Label>
                    <Input value={era} onChange={(e) => setEra(e.target.value)} placeholder="1920s" maxLength={40} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Region</Label>
                    <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Slovakia" maxLength={40} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Story</Label>
                  <Textarea value={story} onChange={(e) => setStory(e.target.value)} maxLength={400} rows={3} placeholder="A short context for the gallery viewer." />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  AI will auto-moderate (no faces, no copyrighted art, handwriting only). Approved entries appear in the public gallery.
                </p>
                <Button onClick={submitForm} disabled={!file || !figureName.trim() || submit.isPending} className="w-full gap-2">
                  <Sparkles className="w-4 h-4" />
                  {submit.isPending ? "AI reviewing…" : "Submit for AI review"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-xs text-amber-900/80 dark:text-amber-200/80">
          Walk through famous handwriting + community submissions. Tap any to chat with the AI tour guide.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="famous">Famous</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="mt-3">
            {items.isLoading ? (
              <p className="text-xs text-amber-900/70">Loading gallery…</p>
            ) : items.data && items.data.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {items.data.map((it: any) => {
                  const isLiked = likes.data?.has(it.id);
                  return (
                    <motion.button
                      key={it.id}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative rounded-md overflow-hidden border-2 border-amber-300/30 bg-white/60 group text-left"
                      onClick={() => setActiveItem(it)}
                    >
                      <div className="w-full aspect-square bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center p-3">
                        <img
                          src={it.image_url}
                          alt=""
                          className="max-w-full max-h-full object-contain"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const t = e.currentTarget;
                            t.style.display = "none";
                            const parent = t.parentElement;
                            if (parent && !parent.querySelector(".initials-fallback")) {
                              const initials = (it.figure_name || "?")
                                .split(" ")
                                .map((w: string) => w[0])
                                .join("")
                                .slice(0, 3)
                                .toUpperCase();
                              const span = document.createElement("span");
                              span.className = "initials-fallback text-3xl font-serif italic text-amber-700";
                              span.textContent = initials;
                              parent.appendChild(span);
                            }
                          }}
                        />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-[10px] font-semibold text-white truncate">{it.figure_name}</p>
                        <p className="text-[9px] text-white/70 truncate">{it.era}</p>
                      </div>
                      {it.source_type === "seeded" && (
                        <Badge className="absolute top-1 left-1 text-[8px] py-0 px-1.5 bg-amber-500/90 hover:bg-amber-500/90">Famous</Badge>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleLike.mutate({ itemId: it.id, liked: !!isLiked }); }}
                        className={`absolute top-1 right-1 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isLiked ? "bg-rose-500" : "bg-black/50 hover:bg-rose-500/80"}`}
                        aria-label={isLiked ? "Unlike" : "Like"}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-white text-white" : "text-white"}`} />
                      </button>
                      {it.likes_count > 0 && (
                        <div className="absolute top-9 right-1 text-[9px] text-white bg-black/60 rounded px-1">{it.likes_count}</div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-amber-900/70 py-6 text-center border border-dashed border-amber-300/40 rounded-lg">
                No items yet in this view.
              </p>
            )}
          </TabsContent>
        </Tabs>

        {/* My submissions status */}
        {myItems.data && myItems.data.length > 0 && (
          <div className="rounded-lg bg-amber-100/40 dark:bg-amber-900/20 border border-amber-300/30 p-2 space-y-1">
            <p className="text-[11px] font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> My submissions
            </p>
            {myItems.data.slice(0, 3).map((m: any) => (
              <div key={m.id} className="flex items-center justify-between text-[11px] text-amber-900/80">
                <span className="truncate">{m.figure_name}</span>
                <Badge
                  variant={m.status === "approved" ? "default" : m.status === "rejected" ? "destructive" : "outline"}
                  className="text-[9px] py-0 px-1.5 ml-2"
                >
                  {m.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Tour-guide dialog */}
      <Dialog open={!!activeItem} onOpenChange={(o) => !o && setActiveItem(null)}>
        <DialogContent className="max-w-lg">
          {activeItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {activeItem.figure_name}
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Coins className="w-3 h-3" /> 3 cr / question
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <img
                  src={activeItem.image_url}
                  alt={activeItem.figure_name}
                  className="w-full max-h-48 object-contain rounded-md bg-white border border-amber-200 p-3"
                  referrerPolicy="no-referrer"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
                <p className="text-xs text-muted-foreground">{activeItem.story}</p>
                <div className="flex gap-1 flex-wrap text-[10px]">
                  {activeItem.era && <Badge variant="outline">{activeItem.era}</Badge>}
                  {activeItem.region && <Badge variant="outline">{activeItem.region}</Badge>}
                  {(activeItem.tags ?? []).slice(0, 4).map((t: string) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>

                <ScrollArea className="h-48 rounded-md border border-border/40 p-2 bg-muted/20">
                  {tour.history.data && tour.history.data.length > 0 ? (
                    <div className="space-y-2">
                      {tour.history.data.map((m: any) => (
                        <div key={m.id} className={`text-xs ${m.role === "user" ? "text-right" : ""}`}>
                          <span className={`inline-block px-2 py-1 rounded-lg ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border/40"}`}>
                            {m.content}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center py-6">
                      Ask the curator anything — "What does the slant tell us?"
                    </p>
                  )}
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask the AI tour guide…"
                    onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }}
                    maxLength={500}
                    disabled={tour.ask.isPending}
                  />
                  <Button size="icon" onClick={sendChat} disabled={!chatInput.trim() || tour.ask.isPending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
    </>
  );
}
