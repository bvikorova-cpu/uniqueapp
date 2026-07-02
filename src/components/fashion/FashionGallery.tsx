import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Download, Eye, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function FashionGallery() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  // Get current user
  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
    });
  });

  // Fetch designs
  const { data: designs, isLoading } = useQuery({
    queryKey: ['fashion-designs', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('fashion_designs')
        .select(`
          *,
          fashion_categories(name),
          fashion_styles(name),
          fashion_materials(name)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(d => d.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        
        // Map profiles to designs
        return data.map(design => ({
          ...design,
          profile: profiles?.find(p => p.id === design.user_id)
        }));
      }

      return data;
    }
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (designId: string) => {
      if (!user) {
        toast.error("Please log in to like");
        return;
      }

      // Check if already liked
      const { data: existing } = await supabase
        .from('fashion_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('design_id', designId)
        .single();

      if (existing) {
        // Unlike
        const { error } = await supabase
          .from('fashion_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('design_id', designId);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('fashion_likes')
          .insert({ user_id: user.id, design_id: designId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fashion-designs'] });
    },
    onError: (error) => {
      toast.error("Error liking");
      console.error(error);
    }
  });

  const handleDownload = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Design downloaded!");
    } catch (error) {
      toast.error("Download error");
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Fashion Gallery works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      {/* Search */}
      <Card className="p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search designs..."
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : designs && designs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <Card key={design.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative overflow-hidden bg-muted">
                <img
                  src={design.image_url}
                  alt={design.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => likeMutation.mutate(design.id)}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handleDownload(design.image_url, design.title)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{design.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {(design as any).profile?.full_name || 'Anonymous'}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {design.likes_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {design.views_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {design.downloads_count}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No designs found</p>
        </div>
      )}
    </div>
    </>
    );
}