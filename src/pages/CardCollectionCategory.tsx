import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CardCategoryCollection, type CardCategory } from "@/components/collections/CardCategoryCollection";

/** Single collectible-card collection: draw, album and ranking. */
const CardCollectionCategory = () => {
  const { slug = "" } = useParams();

  const { data: category, isLoading } = useQuery({
    queryKey: ["card-category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_categories")
        .select("slug, name, description, emoji, gradient")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as CardCategory | null;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="container mx-auto max-w-5xl pt-20 pb-28 md:pb-8">
        <Button asChild variant="ghost" className="mb-4 gap-2 text-muted-foreground hover:text-foreground">
          <Link to="/card-collections">
            <ArrowLeft className="h-4 w-4" /> All collections
          </Link>
        </Button>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !category ? (
          <Card className="p-8 text-center">
            <p className="font-bold mb-1">Collection not found</p>
            <p className="text-sm text-muted-foreground mb-4">This card collection does not exist.</p>
            <Button asChild><Link to="/card-collections">Browse collections</Link></Button>
          </Card>
        ) : (
          <CardCategoryCollection category={category} />
        )}
      </div>
    </div>
  );
};

export default CardCollectionCategory;
