import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Flag, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WallPages() {
  const { toast } = useToast();
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

      const { data: pages } = await supabase
        .from("pages")
        .select("*")
        .eq("user_id", user.id);

      return pages || [];
    },
    enabled: !!user,
  });

  const { data: followedPages = [], refetch: refetchFollowed } = useQuery({
    queryKey: ["followed-pages", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: follows } = await supabase
        .from("page_followers")
        .select("page_id")
        .eq("user_id", user.id);

      if (!follows || follows.length === 0) return [];

      const pageIds = follows.map(f => f.page_id);

      const { data: pages } = await supabase
        .from("pages")
        .select("*")
        .in("id", pageIds);

      return pages || [];
    },
    enabled: !!user,
  });

  const { data: allPages = [] } = useQuery({
    queryKey: ["all-pages", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("pages")
        .select("*")
        .order("follower_count", { ascending: false });

      if (searchQuery.trim()) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data } = await query.limit(20);
      return data || [];
    },
  });

  const createPage = async () => {
    if (!user || !newPageName.trim()) return;

    const { error } = await supabase
      .from("pages")
      .insert({
        name: newPageName,
        description: newPageDescription,
        category: newPageCategory,
        user_id: user.id,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create page",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Page created successfully",
    });

    setIsCreateDialogOpen(false);
    setNewPageName("");
    setNewPageDescription("");
    setNewPageCategory("");
    refetchPages();
  };

  const followPage = async (pageId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("page_followers")
      .insert({
        page_id: pageId,
        user_id: user.id,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to follow page",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Following page",
    });

    refetchFollowed();
  };

  const unfollowPage = async (pageId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("page_followers")
      .delete()
      .eq("page_id", pageId)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow page",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Unfollowed page",
    });

    refetchFollowed();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Flag className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Pages</h2>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Page
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Page</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Page Name</label>
                  <Input
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    placeholder="Enter page name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={newPageCategory}
                    onChange={(e) => setNewPageCategory(e.target.value)}
                    placeholder="e.g., Business, Entertainment, Sports"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newPageDescription}
                    onChange={(e) => setNewPageDescription(e.target.value)}
                    placeholder="What's your page about?"
                    rows={3}
                  />
                </div>
                <Button onClick={createPage} className="w-full">
                  Create Page
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pages..."
              className="pl-10"
            />
          </div>
        </div>

        {myPages.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">My Pages ({myPages.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myPages.map((page) => (
                <Card 
                  key={page.id} 
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/wall/pages/${page.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 rounded-md">
                      <AvatarImage src={page.avatar_url || undefined} />
                      <AvatarFallback className="rounded-md">{page.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold">{page.name}</h4>
                      {page.category && (
                        <p className="text-xs text-muted-foreground">{page.category}</p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {page.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {page.follower_count} followers
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {followedPages.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Following ({followedPages.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {followedPages.map((page) => (
                <Card key={page.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-12 w-12 rounded-md">
                        <AvatarImage src={page.avatar_url || undefined} />
                        <AvatarFallback className="rounded-md">{page.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{page.name}</h4>
                        {page.category && (
                          <p className="text-xs text-muted-foreground">{page.category}</p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {page.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {page.follower_count} followers
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unfollowPage(page.id)}
                    >
                      Following
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-4">Discover Pages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allPages
              .filter(p => !myPages.find(mp => mp.id === p.id) && !followedPages.find(fp => fp.id === p.id))
              .map((page) => (
                <Card key={page.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-12 w-12 rounded-md">
                        <AvatarImage src={page.avatar_url || undefined} />
                        <AvatarFallback className="rounded-md">{page.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{page.name}</h4>
                        {page.category && (
                          <p className="text-xs text-muted-foreground">{page.category}</p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {page.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {page.follower_count} followers
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => followPage(page.id)}
                    >
                      Follow
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
