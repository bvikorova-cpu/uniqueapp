import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePages } from "@/hooks/usePages";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const SuggestedPages = () => {
  const { followPage } = usePages();

  const { data: suggestedPages, isLoading } = useQuery({
    queryKey: ["suggested-pages"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from("pages")
        .select("*, page_followers(count)")
        .order("created_at", { ascending: false })
        .limit(5);

      if (user) {
        // Get pages user already follows
        const { data: userPages } = await supabase
          .from("page_followers")
          .select("page_id")
          .eq("user_id", user.id);
        
        const userPageIds = userPages?.map(p => p.page_id) || [];
        
        if (userPageIds.length > 0) {
          query = query.not("id", "in", `(${userPageIds.join(",")})`);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !suggestedPages?.length) return null;

  return (
    <>
      <FloatingHowItWorks title={"Suggested Pages - How it works"} steps={[{ title: 'Open', desc: 'Access the Suggested Pages section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Suggested Pages.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="glass-post-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Popular Pages</h3>
      </div>
      <div className="space-y-3">
        {suggestedPages.map((page) => (
          <div
            key={page.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
              {page.cover_image_url ? (
                <img
                  src={page.cover_image_url}
                  alt={page.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileText className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{page.name}</p>
              <p className="text-xs text-muted-foreground">
                {(page.page_followers as any)?.[0]?.count || 0} followers
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => followPage(page.id)}
            >
              Follow
            </Button>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};
