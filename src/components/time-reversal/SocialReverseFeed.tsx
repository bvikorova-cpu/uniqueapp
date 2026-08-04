import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Loader2, Maximize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function SocialReverseFeed({ onBack }: Props) {
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  useEffect(() => { loadImages(); }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("time_reversal_posts")
        .select("id, image_url")
        .like("image_url", "%/time-reversal/collage/%")
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;

      setImages(((data as any[]) || []).map((row) => row.image_url).filter(Boolean));
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Could not load the gallery", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title="Public Gallery"
        steps={[
          { title: "Create a collage", desc: "Generate a complete age progression in Time-Lapse Creator." },
          { title: "Automatic publishing", desc: "Every finished collage appears in this public gallery." },
          { title: "Browse everything", desc: "See all age-progression collages generated on the platform." },
          { title: "Enlarge an image", desc: "Tap any collage to open it full-screen." },
        ]}
      />
      <div className="space-y-6">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-2xl font-black text-transparent">
              Public Gallery
            </h2>
            <p className="text-sm text-muted-foreground">All Time-Lapse collages generated on the platform</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          </div>
        ) : images.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No collages yet. Create one in Time-Lapse Creator.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((url, index) => (
              <button
                key={`${url}-${index}`}
                type="button"
                onClick={() => setExpandedImage(url)}
                className="group relative block aspect-square w-full overflow-hidden rounded-lg border border-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Enlarge collage"
              >
                <img
                  src={url}
                  alt="AI age progression collage"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />
                <span
                  className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-lg bg-background/90 text-foreground shadow-sm"
                  aria-hidden="true"
                >
                  <Maximize2 className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={Boolean(expandedImage)} onOpenChange={(open) => { if (!open) setExpandedImage(null); }}>
        <DialogContent className="h-[92dvh] w-[96vw] max-w-6xl border-0 bg-background/95 p-2 sm:p-4">
          <DialogTitle className="sr-only">Age progression collage</DialogTitle>
          <DialogDescription className="sr-only">Enlarged age progression collage</DialogDescription>
          {expandedImage && (
            <img
              src={expandedImage}
              alt="Enlarged AI age progression collage"
              className="h-full w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
