import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Hash, User, FileText, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SearchResult {
  posts: any[];
  users: any[];
  hashtags: any[];
}

export const SearchBar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({ posts: [], users: [], hashtags: [] });
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Live search as user types
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults({ posts: [], users: [], hashtags: [] });
      return;
    }

    // Debounce search by 300ms
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const [postsResult, usersResult, hashtagsResult] = await Promise.all([
          // Search posts
          supabase
            .from("posts")
            .select("id, content, created_at")
            .ilike("content", `%${query}%`)
            .order("created_at", { ascending: false })
            .limit(5),
          // Search ALL users via safe RPC (works across users without exposing PII)
          (supabase as any).rpc("search_users", { q: query, lim: 8 }),
          // Search hashtags
          supabase
            .from("hashtags")
            .select("id, tag, use_count")
            .ilike("tag", `%${query}%`)
            .order("use_count", { ascending: false })
            .limit(5),
        ]);

        setResults({
          posts: postsResult.data || [],
          users: usersResult.data || [],
          hashtags: hashtagsResult.data || [],
        });
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleUserClick = (userId: string) => {
    setOpen(false);
    setQuery("");
    navigate(`/profile/${userId}`);
  };

  const handlePostClick = (postId: string) => {
    setOpen(false);
    setQuery("");
    navigate(`/post/${postId}`);
  };

  const handleHashtagClick = (tag: string) => {
    setOpen(false);
    setQuery("");
    navigate(`/wall?hashtag=${tag}`);
  };

  const handleSeeAllResults = () => {
    if (query.trim()) {
      setOpen(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      handleSeeAllResults();
    }
  };

  const totalResults = results.posts.length + results.users.length + results.hashtags.length;
  const hasResults = totalResults > 0;

  return (
    <Popover open={open && (query.length > 0 || hasResults)} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search posts, people, hashtags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10 border-2 border-violet-600/50 bg-violet-50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-900/40 focus:border-violet-600 transition-all"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ScrollArea className="max-h-[400px]">
          {searching && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!searching && query && !hasResults && (
            <div className="text-center text-muted-foreground py-6 text-sm">
              No results for "{query}"
            </div>
          )}

          {!searching && hasResults && (
            <div className="py-2">
              {/* Users section */}
              {results.users.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    People
                  </div>
                  {results.users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserClick(user.id)}
                      className="w-full px-3 py-2 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {user.full_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.full_name || "User"}</p>
                        {user.bio && (
                          <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Posts section */}
              {results.posts.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5 border-t">
                    <FileText className="h-3 w-3" />
                    Posts
                  </div>
                  {results.posts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => handlePostClick(post.id)}
                      className="w-full px-3 py-2 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">P</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{post.content}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Hashtags section */}
              {results.hashtags.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5 border-t">
                    <Hash className="h-3 w-3" />
                    Hashtags
                  </div>
                  {results.hashtags.map((hashtag) => (
                    <button
                      key={hashtag.id}
                      onClick={() => handleHashtagClick(hashtag.tag)}
                      className="w-full px-3 py-2 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Hash className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">#{hashtag.tag}</p>
                        <p className="text-xs text-muted-foreground">{hashtag.use_count || 0} posts</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* See all results button */}
              <div className="border-t p-2">
                <button
                  onClick={handleSeeAllResults}
                  className="w-full px-3 py-2 text-sm font-medium text-primary hover:bg-accent rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  See all results for "{query}"
                </button>
              </div>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
