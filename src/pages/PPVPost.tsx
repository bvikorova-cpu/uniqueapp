import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import { usePPVCheckout, usePPVUnlockStatus, type PPVPost as PPVPostType } from "@/hooks/usePPV";
import { useOneOffPaymentVerify } from "@/hooks/useOneOffPaymentVerify";

export default function PPVPostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PPVPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const unlocked = usePPVUnlockStatus(id);
  const { buy, loading: buying } = usePPVCheckout();

  useOneOffPaymentVerify({
    fn: "ppv-verify" as any,
    successTitle: "Unlocked!",
    successDescription: "You now have access to this content.",
    onSuccess: () => window.location.reload(),
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("influking_ppv_posts").select("*").eq("id", id).maybeSingle();
      setPost(data as PPVPostType);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Post not found.</div>;

  const isVideo = post.content_type === "video";

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button variant="ghost" asChild className="mb-4 gap-2">
          <Link to="/influ-king"><ArrowLeft className="h-4 w-4" /> Back to InfluKing</Link>
        </Button>

        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle>{post.title}</CardTitle>
              <Badge variant="outline">€{(post.price_cents / 100).toFixed(2)}</Badge>
              {unlocked && <Badge className="bg-emerald-500">Unlocked</Badge>}
            </div>
            {post.description && <CardDescription>{post.description}</CardDescription>}
          </CardHeader>

          <CardContent>
            {unlocked ? (
              isVideo ? (
                <video src={post.content_url} controls className="w-full rounded-lg" />
              ) : (
                <img src={post.content_url} alt={post.title} className="w-full rounded-lg" />
              )
            ) : (
              <div className="relative">
                {post.preview_url ? (
                  <img src={post.preview_url} alt="Preview" className="w-full rounded-lg blur-md" />
                ) : (
                  <div className="w-full aspect-video bg-muted rounded-lg" />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
                  <Lock className="h-10 w-10 mb-3 text-primary" />
                  <p className="font-semibold mb-1">Locked content</p>
                  <p className="text-sm text-muted-foreground mb-4">Unlock for €{(post.price_cents / 100).toFixed(2)}</p>
                  <Button size="lg" onClick={() => id && buy(id)} disabled={buying || unlocked === null}>
                    {buying ? "Redirecting…" : "Unlock now"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">Secure Stripe checkout · 85% goes to the creator</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
