import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ImageIcon, Heart } from "lucide-react";

const PublicAIGallery = () => {
  const { userId = "" } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["public-ai-gallery", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: flag } = await supabase
        .from("ai_public_profiles")
        .select("enabled")
        .eq("user_id", userId)
        .maybeSingle();

      if (!flag?.enabled) return { enabled: false, items: [] as any[] };

      const { data: items } = await supabase
        .from("ai_community_gallery")
        .select("*")
        .eq("user_id", userId)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(60);

      return { enabled: true, items: items || [] };
    },
  });

  return (
    <>
      <Helmet>
        <title>Public AI Gallery | Unique</title>
        <meta name="description" content="Browse this creator's shared AI generations on Unique." />
      </Helmet>
      <main className="container max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black mb-2">🌐 Public AI Gallery</h1>
        <p className="text-muted-foreground text-sm mb-8">Shared AI generations from this creator.</p>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : !data?.enabled ? (
          <div className="rounded-xl border border-border bg-card/80 p-8 text-center">
            <p className="font-bold mb-1">This gallery is private</p>
            <p className="text-sm text-muted-foreground">The owner has not enabled a public showcase.</p>
          </div>
        ) : data.items.length === 0 ? (
          <div className="rounded-xl border border-border bg-card/80 p-8 text-center">
            <ImageIcon className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="font-bold mb-1">Nothing shared yet</p>
            <p className="text-sm text-muted-foreground">No public generations to display.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((item: any) => (
              <article key={item.id} className="rounded-xl border border-border bg-card/80 overflow-hidden">
                {item.image_url && (
                  <img src={item.image_url} alt={item.title || item.prompt || "AI generation"} loading="lazy" className="w-full aspect-square object-cover" />
                )}
                <div className="p-3 space-y-1">
                  <p className="font-bold text-sm line-clamp-1">{item.title || "Untitled"}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.prompt}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Heart className="w-3 h-3" /> {item.likes_count || 0}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link to="/" className="text-sm text-primary underline">Back to Unique</Link>
        </div>
      </main>
    </>
  );
};

export default PublicAIGallery;
