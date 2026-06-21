import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Users, FileText, Hash, Filter, SlidersHorizontal, Calendar, MapPin, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import PostCard from "@/components/feed/PostCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FilterType = "all" | "people" | "posts" | "hashtags";

interface SearchFilters {
  recentPosts: boolean;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const filterParam = (searchParams.get("filter") as FilterType) || "all";
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [activeFilter, setActiveFilter] = useState<FilterType>(filterParam);
  const [filters, setFilters] = useState<SearchFilters>({ recentPosts: false });
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<{
    posts: any[];
    users: any[];
    hashtags: any[];
  }>({ posts: [], users: [], hashtags: [] });

  const filterOptions = [
    { id: "all", label: "All", icon: Filter },
    { id: "people", label: "People", icon: Users },
    { id: "posts", label: "Posts", icon: FileText },
    { id: "hashtags", label: "Hashtags", icon: Hash },
  ];

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, activeFilter, filters]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const promises: Promise<any>[] = [];

      // Search posts
      let postsResult = { data: [] as any[] };
      let usersResult = { data: [] as any[] };
      let hashtagsResult = { data: [] as any[] };

      if (activeFilter === "all" || activeFilter === "posts") {
        let postsQuery = supabase
          .from("posts")
          .select(`
            *,
            profiles(id, full_name, avatar_url),
            media(*)
          `)
          .ilike("content", `%${searchTerm}%`)
          .order("created_at", { ascending: false });

        if (filters.recentPosts) {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          postsQuery = postsQuery.gte("created_at", weekAgo.toISOString());
        }

        postsResult = await postsQuery.limit(50);
      }

      // Search users — use public_profiles view (safe columns only) and restrict to full_name
      // ILIKE on bio is too expensive at scale and exposes private data.
      if (activeFilter === "all" || activeFilter === "people") {
        usersResult = await supabase
          .from("public_profiles")
          .select("id, full_name, avatar_url, username")
          .ilike("full_name", `%${searchTerm}%`)
          .limit(50);
      }

      // Search hashtags
      if (activeFilter === "all" || activeFilter === "hashtags") {
        hashtagsResult = await supabase
          .from("hashtags")
          .select("*")
          .ilike("tag", `%${searchTerm}%`)
          .order("use_count", { ascending: false })
          .limit(30);
      }

      setResults({
        posts: postsResult.data || [],
        users: usersResult.data || [],
        hashtags: hashtagsResult.data || [],
      });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery, filter: activeFilter });
    }
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setSearchParams({ q: query, filter });
  };

  const totalResults = results.posts.length + results.users.length + results.hashtags.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with search */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex">
        {/* Left Sidebar - Filters */}
        <aside className="w-80 shrink-0 border-r min-h-[calc(100vh-65px)] sticky top-[65px] hidden md:block">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Search Results</h2>
            
            {/* Filter options */}
            <div className="space-y-1">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                const isActive = activeFilter === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleFilterChange(option.id as FilterType)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent"
                    )}
                  >
                    <div className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center",
                      isActive ? "bg-primary-foreground/20" : "bg-muted"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Advanced filters */}
            {activeFilter === "posts" && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Post Filters
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.recentPosts}
                      onChange={(e) => setFilters({ ...filters, recentPosts: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Recent posts only</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-2xl mx-auto p-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-20 w-full" />
                  </Card>
                ))}
              </div>
            ) : totalResults === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results for "{query}"</h3>
                <p className="text-muted-foreground">Try a different search term or change filters</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* People results */}
                {results.users.length > 0 && (activeFilter === "all" || activeFilter === "people") && (
                  <section>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      People
                    </h3>
                    <div className="space-y-2">
                      {results.users.slice(0, activeFilter === "people" ? undefined : 5).map((user) => (
                        <Card
                          key={user.id}
                          className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => navigate(`/profile/${user.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-14 w-14">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>{user.full_name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold">{user.full_name || "User"}</p>
                              {user.bio && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
                              )}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => { window.location.href = `/profile/${user.id || user.user_id || ""}`; }}>
                              View Profile
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                    {activeFilter === "all" && results.users.length > 5 && (
                      <Button 
                        variant="ghost" 
                        className="w-full mt-2"
                        onClick={() => handleFilterChange("people")}
                      >
                        View all ({results.users.length})
                      </Button>
                    )}
                  </section>
                )}

                {/* Hashtags results */}
                {results.hashtags.length > 0 && (activeFilter === "all" || activeFilter === "hashtags") && (
                  <section>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Hash className="h-5 w-5" />
                      Hashtagy
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {results.hashtags.slice(0, activeFilter === "hashtags" ? undefined : 10).map((hashtag) => (
                        <Button
                          key={hashtag.id}
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/wall?hashtag=${hashtag.tag}`)}
                          className="gap-1"
                        >
                          <Hash className="h-3 w-3" />
                          {hashtag.tag}
                          <span className="text-muted-foreground ml-1">({hashtag.use_count || 0})</span>
                        </Button>
                      ))}
                    </div>
                    {activeFilter === "all" && results.hashtags.length > 10 && (
                      <Button 
                        variant="ghost" 
                        className="w-full mt-2"
                        onClick={() => handleFilterChange("hashtags")}
                      >
                        View all ({results.hashtags.length})
                      </Button>
                    )}
                  </section>
                )}

                {/* Posts results */}
                {results.posts.length > 0 && (activeFilter === "all" || activeFilter === "posts") && (
                  <section>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Posts
                    </h3>
                    <div className="space-y-4">
                      {results.posts.map((post) => (
                        <PostCard 
                          key={post.id} 
                          post={post} 
                          onDelete={() => {
                            setResults(prev => ({
                              ...prev,
                              posts: prev.posts.filter(p => p.id !== post.id)
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
