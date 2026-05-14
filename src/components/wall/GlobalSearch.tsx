import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Hash, User, FileText, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearch } from "@/hooks/useSearch";
import { useDebounce } from "@/hooks/use-debounce";

interface Props {
  onClose?: () => void;
  initialQuery?: string;
}

export const GlobalSearch = ({ onClose, initialQuery = "" }: Props) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<"all" | "posts" | "users" | "hashtags">("all");
  const [results, setResults] = useState<any>({});
  const { search, searching } = useSearch();
  const debounced = useDebounce(query, 300);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults({});
      return;
    }
    search(debounced, tab).then(setResults).catch(() => {});
  }, [debounced, tab]);

  const go = (path: string) => {
    onClose?.();
    navigate(path);
  };

  return (
    <Card className="p-4 bg-card/95 backdrop-blur-xl border-border/50">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts, users, hashtags..."
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="users">People</TabsTrigger>
          <TabsTrigger value="hashtags">Tags</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[420px] mt-3">
          {searching && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}

          {!searching && !query.trim() && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Start typing to search…
            </p>
          )}

          <TabsContent value="all" className="space-y-4 mt-0">
            {results.users?.length > 0 && (
              <Section title="People" icon={<User className="h-4 w-4" />}>
                {results.users.slice(0, 5).map((u: any) => (
                  <UserRow key={u.id} user={u} onClick={() => go(`/profile/${u.id}`)} />
                ))}
              </Section>
            )}
            {results.hashtags?.length > 0 && (
              <Section title="Hashtags" icon={<Hash className="h-4 w-4" />}>
                {results.hashtags.slice(0, 5).map((h: any) => (
                  <HashtagRow key={h.id} hashtag={h} onClick={() => go(`/wall?hashtag=${h.tag}`)} />
                ))}
              </Section>
            )}
            {results.posts?.length > 0 && (
              <Section title="Posts" icon={<FileText className="h-4 w-4" />}>
                {results.posts.slice(0, 5).map((p: any) => (
                  <PostRow key={p.id} post={p} onClick={() => go(`/post/${p.id}`)} />
                ))}
              </Section>
            )}
          </TabsContent>

          <TabsContent value="posts" className="space-y-2 mt-0">
            {results.posts?.map((p: any) => (
              <PostRow key={p.id} post={p} onClick={() => go(`/post/${p.id}`)} />
            ))}
          </TabsContent>

          <TabsContent value="users" className="space-y-2 mt-0">
            {results.users?.map((u: any) => (
              <UserRow key={u.id} user={u} onClick={() => go(`/profile/${u.id}`)} />
            ))}
          </TabsContent>

          <TabsContent value="hashtags" className="space-y-2 mt-0">
            {results.hashtags?.map((h: any) => (
              <HashtagRow key={h.id} hashtag={h} onClick={() => go(`/wall?hashtag=${h.tag}`)} />
            ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};

const Section = ({ title, icon, children }: any) => (
  <div>
    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
      {icon}
      {title}
    </div>
    <div className="space-y-1">{children}</div>
  </div>
);

const UserRow = ({ user, onClick }: any) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/60 text-left transition-colors"
  >
    <Avatar className="h-9 w-9">
      <AvatarImage src={user.avatar_url || undefined} />
      <AvatarFallback>{user.full_name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm truncate">{user.full_name || "Unknown"}</p>
      {user.username && <p className="text-xs text-muted-foreground truncate">@{user.username}</p>}
    </div>
  </button>
);

const HashtagRow = ({ hashtag, onClick }: any) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/60 text-left transition-colors"
  >
    <span className="font-medium text-sm text-primary">#{hashtag.tag}</span>
    <span className="text-xs text-muted-foreground">{hashtag.use_count} posts</span>
  </button>
);

const PostRow = ({ post, onClick }: any) => (
  <button
    onClick={onClick}
    className="flex items-start gap-3 w-full p-2 rounded-lg hover:bg-muted/60 text-left transition-colors"
  >
    <Avatar className="h-8 w-8">
      <AvatarImage src={post.profiles?.avatar_url || undefined} />
      <AvatarFallback>{post.profiles?.full_name?.[0] || "?"}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{post.profiles?.full_name || "Unknown"}</p>
      <p className="text-sm line-clamp-2">{post.content}</p>
    </div>
  </button>
);
