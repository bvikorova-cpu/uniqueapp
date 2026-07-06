import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Plus, ExternalLink, Megaphone } from "lucide-react";
import { useResolvedStorageUrl } from "@/lib/storageSigned";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import SEO from "@/components/SEO";
import promoVideo from "@/assets/section-videos/promotions-board.mp4.asset.json";

interface PromoListing {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_type: "image" | "video";
  link_url: string | null;
  tier: "standard" | "top";
  active_until: string | null;
}

function PromoMedia({ url, type, alt }: { url: string; type: string; alt: string }) {
  const resolved = useResolvedStorageUrl(url);
  if (!resolved) {
    return <div className="w-full h-full bg-muted animate-pulse" />;
  }
  if (type === "video") {
    return (
      <video
        src={resolved}
        muted
        loop
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
    );
  }
  return <img src={resolved} alt={alt} loading="lazy" className="w-full h-full object-cover" />;
}

function PromoCard({ listing }: { listing: PromoListing }) {
  const isTop = listing.tier === "top";
  const inner = (
    <Card
      className={`overflow-hidden group hover:shadow-xl transition-all duration-300 h-full ${
        isTop ? "ring-2 ring-primary shadow-lg shadow-primary/20" : ""
      }`}
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <PromoMedia url={listing.media_url} type={listing.media_type} alt={listing.title} />
        {isTop && (
          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-primary to-accent text-white shadow-md">
            <Crown className="h-3 w-3 mr-1" /> TOP
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg line-clamp-2 mb-1">{listing.title}</h3>
        {listing.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{listing.description}</p>
        )}
        {listing.link_url && (
          <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary">
            <ExternalLink className="h-3 w-3" /> Visit
          </div>
        )}
      </CardContent>
    </Card>
  );
  if (listing.link_url) {
    return (
      <a href={listing.link_url} target="_blank" rel="noopener noreferrer sponsored">
        {inner}
      </a>
    );
  }
  return inner;
}

export default function PromotionsBoard() {
  const [listings, setListings] = useState<PromoListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("promo_listings")
        .select("id,title,description,media_url,media_type,link_url,tier,active_until")
        .eq("status", "active")
        .gt("active_until", new Date().toISOString())
        .order("tier", { ascending: true }) // 'top' < 'standard' alphabetically
        .order("created_at", { ascending: false })
        .limit(200);
      setListings((data as PromoListing[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const topListings = listings.filter((l) => l.tier === "top");
  const standardListings = listings.filter((l) => l.tier === "standard");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Promotions Board — Unique"
        description="Public promotions board. Publish your flyer, poster or promo video from €20/month. Boost to TOP for €50/month."
      />

      {/* Hero */}
      <div className="relative h-[55vh] min-h-[380px] max-h-[560px] overflow-hidden">
        <video
          src={promoVideo.url}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-background" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <Megaphone className="h-14 w-14 text-white mb-3 drop-shadow-lg" />
          <h1
            className="text-4xl md:text-6xl font-black text-white mb-4"
            style={{ textShadow: "0 4px 30px rgba(139,92,246,0.55)" }}
          >
            Promotions <span className="bg-gradient-to-r from-purple-400 via-primary to-pink-400 bg-clip-text text-transparent">Board</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-6">
            Promote your business, event or offer. Public visibility from just €20/month.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" variant="premium">
              <Link to="/promotions/new"><Plus className="h-4 w-4 mr-1" /> Publish a promo</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-background/20 backdrop-blur border-white/30 text-white hover:bg-background/40">
              <Link to="/promotions/mine">My promotions</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="grid grid-cols-1">
          <FloatingHowItWorks
            title="Promotions Board — How it works"
            intro="A public board for anyone who wants to promote a business, product, event or offer."
            steps={[
              { title: "Upload", desc: "Add a photo or video (flyer, poster, promo clip) and a short description." },
              { title: "Choose a plan", desc: "Standard placement €20/month, or TOP placement (pinned to the top) €50/month." },
              { title: "Pay securely", desc: "Checkout via Stripe. Your listing goes live for 30 days once payment succeeds." },
              { title: "Get seen", desc: "Your promo appears on this public board — visible to every visitor of Unique." },
              { title: "Manage", desc: "Edit, hide or re-publish anytime from My promotions." },
            ]}
          />
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-16">Loading promotions…</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <Megaphone className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No active promotions yet</h2>
            <p className="text-muted-foreground mb-6">Be the first to promote something!</p>
            <Button asChild variant="premium">
              <Link to="/promotions/new"><Plus className="h-4 w-4 mr-1" /> Publish the first promo</Link>
            </Button>
          </div>
        ) : (
          <>
            {topListings.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">Top promotions</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topListings.map((l) => (
                    <PromoCard key={l.id} listing={l} />
                  ))}
                </div>
              </section>
            )}

            {standardListings.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">All promotions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {standardListings.map((l) => (
                    <PromoCard key={l.id} listing={l} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
