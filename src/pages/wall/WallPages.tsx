import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Flag, Plus, Search, Star, Sparkles, Users, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function WallPages() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [newPageName, setNewPageName] = useState("");
  const [newPageDescription, setNewPageDescription] = useState("");
  const [newPageCategory, setNewPageCategory] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: myPages = [], refetch: refetchPages } = useQuery({
    queryKey: ["my-pages", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: pages } = await supabase.from("pages").select("*").eq("user_id", user.id);
      return pages || [];
    },
    enabled: !!user,
  });

  const { data: followedPages = [], refetch: refetchFollowed } = useQuery({
    queryKey: ["followed-pages", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: follows } = await supabase.from("page_followers").select("page_id").eq("user_id", user.id);
      if (!follows || follows.length === 0) return [];
      const pageIds = follows.map(f => f.page_id);
      const { data: pages } = await supabase.from("pages").select("*").in("id", pageIds);
      return pages || [];
    },
    enabled: !!user,
  });

  const { data: allPages = [], refetch: refetchAllPages } = useQuery({
    queryKey: ["all-pages", searchQuery],
    queryFn: async () => {
      let query = supabase.from("pages").select("*").order("follower_count", { ascending: false });
      if (searchQuery.trim()) query = query.ilike("name", `%${searchQuery}%`);
      const { data } = await query.limit(20);
      return data || [];
    },
  });

  const createPage = async () => {
    if (!user || !newPageName.trim()) return;
    try {
      const { data: page, error: pageError } = await supabase
        .from("pages").insert({ name: newPageName, description: newPageDescription, category: newPageCategory, user_id: user.id }).select().single();
      if (pageError || !page) { toast({ title: "Error", description: pageError?.message || "Failed to create page", variant: "destructive" }); return; }
      await supabase.from("page_followers").insert({ page_id: page.id, user_id: user.id });
      toast({ title: "Success", description: "Page created successfully" });
      setIsCreateDialogOpen(false); setNewPageName(""); setNewPageDescription(""); setNewPageCategory("");
      refetchPages(); refetchAllPages();
    } catch { toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" }); }
  };

  const followPage = async (pageId: string) => {
    if (!user) return;
    const { error } = await supabase.from("page_followers").insert({ page_id: pageId, user_id: user.id });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Following!" }); refetchFollowed(); refetchAllPages();
  };

  const unfollowPage = async (pageId: string) => {
    if (!user) return;
    const { error } = await supabase.from("page_followers").delete().eq("page_id", pageId).eq("user_id", user.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Unfollowed" }); refetchFollowed(); refetchAllPages();
  };

  const categoryColors: Record<string, string> = {
    "Business": "from-blue-500 to-indigo-500",
    "Entertainment": "from-purple-500 to-pink-500",
    "Community": "from-emerald-500 to-teal-500",
    "Sports": "from-orange-500 to-red-500",
  };

  const PageCard = ({ page, isFollowed, isOwned, index = 0 }: { page: any; isFollowed?: boolean; isOwned?: boolean; index?: number }) => {
    const grad = categoryColors[page.category] || "from-primary to-accent";
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
        <Card
          className="group overflow-hidden border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
          onClick={() => navigate(`/wall/pages/${page.id}`)}
        >
          <div className={`h-16 bg-gradient-to-br ${grad} relative`}>
            <div className="absolute inset-0 bg-black/10" />
            {isOwned && (
              <Badge className="absolute top-2 right-2 bg-white/20 text-white border-white/30 text-[10px]">
                <Star className="w-3 h-3 mr-1" /> Owner
              </Badge>
            )}
            <div className="absolute -bottom-5 left-4">
              <Avatar className="h-12 w-12 rounded-xl border-4 border-card shadow-lg">
                <AvatarImage src={page.avatar_url || undefined} />
                <AvatarFallback className={`rounded-xl bg-gradient-to-br ${grad} text-white font-bold`}>
                  {page.name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <CardContent className="pt-8 pb-4 px-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{page.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  {page.category && <Badge variant="secondary" className="text-[10px]">{page.category}</Badge>}
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" /> {page.follower_count || 0}
                  </span>
                </div>
                {page.description && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{page.description}</p>}
              </div>
              {!isOwned && (
                isFollowed ? (
                  <Button variant="outline" size="sm" className="shrink-0 text-xs"
                    onClick={(e) => { e.stopPropagation(); unfollowPage(page.id); }}>
                    Following
                  </Button>
                ) : (
                  <Button size="sm" className="shrink-0 text-xs gap-1 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                    onClick={(e) => { e.stopPropagation(); followPage(page.id); }}>
                    <Heart className="w-3 h-3" /> Follow
                  </Button>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-8 space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <Flag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Pages</h1>
            <p className="text-sm text-muted-foreground">Follow brands, creators & communities</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search pages..." className="pl-10" />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 gap-2 shadow-lg">
                <Plus className="h-4 w-4" /> Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Create New Page</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div><label className="text-sm font-medium">Page Name</label><Input value={newPageName} onChange={(e) => setNewPageName(e.target.value)} placeholder="Enter page name" /></div>
                <div><label className="text-sm font-medium">Category</label><Input value={newPageCategory} onChange={(e) => setNewPageCategory(e.target.value)} placeholder="e.g., Business, Entertainment" /></div>
                <div><label className="text-sm font-medium">Description</label><Textarea value={newPageDescription} onChange={(e) => setNewPageDescription(e.target.value)} placeholder="What's your page about?" rows={3} /></div>
                <Button onClick={createPage} className="w-full bg-gradient-to-r from-primary to-accent text-white">Create Page</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* My Pages */}
      {myPages.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4"><Star className="w-5 h-5 text-primary" /><h2 className="text-lg font-bold">My Pages</h2><Badge variant="secondary" className="text-xs">{myPages.length}</Badge></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myPages.map((page, i) => <PageCard key={page.id} page={page} isOwned index={i} />)}
          </div>
        </section>
      )}

      {/* Following */}
      {followedPages.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4"><Heart className="w-5 h-5 text-accent" /><h2 className="text-lg font-bold">Following</h2><Badge variant="secondary" className="text-xs">{followedPages.length}</Badge></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {followedPages.map((page, i) => <PageCard key={page.id} page={page} isFollowed index={i} />)}
          </div>
        </section>
      )}

      {/* Discover */}
      <section>
        <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-accent" /><h2 className="text-lg font-bold">Discover Pages</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allPages
            .filter(p => !myPages.find(mp => mp.id === p.id) && !followedPages.find(fp => fp.id === p.id))
            .map((page, i) => <PageCard key={page.id} page={page} index={i} />)}
        </div>
      </section>
    </div>
  );
}
