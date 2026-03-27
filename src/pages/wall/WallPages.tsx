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
import { Flag, Plus, Search, Star, Sparkles, Users, Heart, TrendingUp, Verified, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function WallPages() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [newPageName, setNewPageName] = useState("");
  const [newPageDescription, setNewPageDescription] = useState("");
  const [newPageCategory, setNewPageCategory] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"mine" | "following" | "discover">("mine");

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

  const categoryGradients: Record<string, string> = {
    "Business": "from-blue-600 via-indigo-500 to-violet-500",
    "Entertainment": "from-purple-600 via-pink-500 to-rose-400",
    "Community": "from-emerald-500 via-teal-500 to-cyan-400",
    "Sports": "from-orange-500 via-red-500 to-rose-500",
    "Technology": "from-cyan-500 via-blue-500 to-indigo-500",
    "Art": "from-fuchsia-500 via-purple-500 to-violet-500",
  };

  const defaultGradients = [
    "from-primary via-purple-500 to-accent",
    "from-blue-500 via-cyan-500 to-teal-400",
    "from-rose-500 via-pink-500 to-fuchsia-400",
  ];

  const discoverPages = allPages.filter(p => !myPages.find(mp => mp.id === p.id) && !followedPages.find(fp => fp.id === p.id));

  const PageCard = ({ page, isFollowed, isOwned, index = 0 }: { page: any; isFollowed?: boolean; isOwned?: boolean; index?: number }) => {
    const grad = categoryGradients[page.category] || defaultGradients[index % defaultGradients.length];
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: index * 0.06, type: "spring", stiffness: 200 }}
        whileHover={{ y: -4 }}
      >
        <Card
          className="group overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer"
          onClick={() => navigate(`/wall/pages/${page.id}`)}
        >
          <div className={`h-20 bg-gradient-to-br ${grad} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {isOwned && (
              <Badge className="absolute top-2 right-2 bg-white/20 backdrop-blur-md text-white border-white/30 text-[10px] gap-1 shadow-lg">
                <Crown className="w-3 h-3" /> Owner
              </Badge>
            )}
            <div className="absolute -bottom-6 left-4">
              <Avatar className="h-12 w-12 rounded-xl border-[3px] border-card shadow-xl ring-2 ring-primary/20">
                <AvatarImage src={page.avatar_url || undefined} />
                <AvatarFallback className={`rounded-xl bg-gradient-to-br ${grad} text-white font-black`}>
                  {page.name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <CardContent className="pt-9 pb-4 px-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-black text-sm truncate group-hover:text-primary transition-colors">{page.name}</h4>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {page.category && (
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0">{page.category}</Badge>
                  )}
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" /> {page.follower_count || 0}
                  </span>
                </div>
                {page.description && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{page.description}</p>}
              </div>
              {!isOwned && (
                isFollowed ? (
                  <Button variant="outline" size="sm" className="shrink-0 text-xs hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); unfollowPage(page.id); }}>
                    Following
                  </Button>
                ) : (
                  <Button size="sm" className="shrink-0 text-xs gap-1 bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 active:scale-95"
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

  const tabs = [
    { id: "mine" as const, label: "My Pages", icon: <Star className="w-3.5 h-3.5" />, count: myPages.length },
    { id: "following" as const, label: "Following", icon: <Heart className="w-3.5 h-3.5" />, count: followedPages.length },
    { id: "discover" as const, label: "Discover", icon: <Sparkles className="w-3.5 h-3.5" />, count: discoverPages.length },
  ];

  const activePages = activeTab === "mine" ? myPages : activeTab === "following" ? followedPages : discoverPages;

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-8 space-y-6">
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 via-primary/10 to-accent/5 border border-accent/20 p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/30" whileHover={{ rotate: -5, scale: 1.05 }}>
              <Flag className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Pages</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Follow brands, creators & communities</p>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 gap-2 shadow-xl shadow-primary/25 active:scale-[0.97]">
                <Plus className="h-4 w-4" /> Create Page
              </Button>
            </DialogTrigger>
            <DialogContent className="border-primary/20">
              <DialogHeader><DialogTitle className="flex items-center gap-2 text-lg"><Sparkles className="w-5 h-5 text-primary" /> Create New Page</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><label className="text-sm font-bold">Page Name</label><Input value={newPageName} onChange={(e) => setNewPageName(e.target.value)} placeholder="Enter page name" className="mt-1.5" /></div>
                <div><label className="text-sm font-bold">Category</label><Input value={newPageCategory} onChange={(e) => setNewPageCategory(e.target.value)} placeholder="e.g., Business, Entertainment" className="mt-1.5" /></div>
                <div><label className="text-sm font-bold">Description</label><Textarea value={newPageDescription} onChange={(e) => setNewPageDescription(e.target.value)} placeholder="What's your page about?" rows={3} className="mt-1.5" /></div>
                <Button onClick={createPage} className="w-full bg-gradient-to-r from-primary to-accent text-white shadow-lg">Create Page</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="relative flex items-center gap-6 mt-6">
          {tabs.map((tab, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{tab.icon}</div>
              <div>
                <p className="text-lg font-black">{tab.count}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{tab.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex bg-muted/50 rounded-xl p-1 border border-border/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                activeTab === tab.id ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search pages..." className="pl-10 bg-muted/30 border-border/50" />
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
          {activePages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePages.map((page, i) => (
                <PageCard
                  key={page.id}
                  page={page}
                  isOwned={activeTab === "mine"}
                  isFollowed={activeTab === "following"}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <CardContent className="py-16 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-5">
                  <Flag className="h-10 w-10 text-primary" />
                </motion.div>
                <h3 className="text-xl font-black mb-2">No pages here yet</h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
                  {activeTab === "mine" ? "Create your first page to share content as a brand or community" : "Explore and follow pages that interest you"}
                </p>
                <Button onClick={() => activeTab === "mine" ? setIsCreateDialogOpen(true) : setActiveTab("discover")} className="gap-2 bg-gradient-to-r from-primary to-accent text-white shadow-lg">
                  {activeTab === "mine" ? <><Plus className="w-4 h-4" /> Create Page</> : <><Search className="w-4 h-4" /> Discover</>}
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
