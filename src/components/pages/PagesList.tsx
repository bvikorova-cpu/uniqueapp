import { useState, useEffect } from "react";
import { usePages } from "@/hooks/usePages";
import { PageCard } from "./PageCard";
import { CreatePageDialog } from "./CreatePageDialog";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const PagesList = () => {
  const { pages, isLoading, followPage, unfollowPage } = usePages();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followedPages, setFollowedPages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFollowedPages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        const { data } = await supabase
          .from("page_followers")
          .select("page_id")
          .eq("user_id", user.id);
        
        if (data) {
          setFollowedPages(new Set(data.map(f => f.page_id)));
        }
      }
    };

    fetchFollowedPages();
  }, [pages]);

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
            Pages
          </h1>
        </div>
        <CreatePageDialog />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 glass-card"
        />
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPages.map((page) => (
          <PageCard
            key={page.id}
            page={page}
            onFollow={followPage}
            onUnfollow={unfollowPage}
            isFollowing={followedPages.has(page.id)}
          />
        ))}
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center py-12 glass-post-card">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {searchQuery ? "No pages found" : "No pages yet. Create one to get started!"}
          </p>
        </div>
      )}
    </div>
  );
};
