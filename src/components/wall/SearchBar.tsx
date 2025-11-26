import { useState } from "react";
import { Search, Hash, User, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@/hooks/useSearch";

export const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>({});
  const { search, searching } = useSearch();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const searchResults = await search(query);
    setResults(searchResults);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full md:w-96 justify-start border-2 border-violet-600/50 bg-violet-50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:border-violet-600 transition-all duration-300 hover:scale-[1.02]"
        >
          <Search className="h-4 w-4 mr-2 animate-pulse" />
          Search posts, people, hashtags...
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="What are you looking for?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={searching}>
            {searching ? "Searching..." : "Search"}
          </Button>
        </form>

        {Object.keys(results).length > 0 && (
          <Tabs defaultValue="posts" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="posts" className="gap-2">
                <FileText className="h-4 w-4" />
                Posts ({results.posts?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <User className="h-4 w-4" />
                Users ({results.users?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="hashtags" className="gap-2">
                <Hash className="h-4 w-4" />
                Hashtags ({results.hashtags?.length || 0})
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-96 mt-4">
              <TabsContent value="posts" className="space-y-3">
                {results.posts?.map((post: any) => (
                  <div key={post.id} className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback>{post.profiles?.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-sm">{post.profiles?.full_name}</span>
                    </div>
                    <p className="text-sm line-clamp-3">{post.content}</p>
                  </div>
                ))}
                {results.posts?.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">No posts found</div>
                )}
              </TabsContent>

              <TabsContent value="users" className="space-y-3">
                {results.users?.map((user: any) => (
                  <div key={user.id} className="p-3 border rounded-lg hover:bg-accent cursor-pointer flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.full_name}</p>
                      {user.username && (
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      )}
                    </div>
                  </div>
                ))}
                {results.users?.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">No users found</div>
                )}
              </TabsContent>

              <TabsContent value="hashtags" className="space-y-3">
                {results.hashtags?.map((hashtag: any) => (
                  <div key={hashtag.id} className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <Badge variant="secondary" className="gap-1">
                      <Hash className="h-3 w-3" />
                      {hashtag.tag}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      {hashtag.use_count} posts
                    </p>
                  </div>
                ))}
                {results.hashtags?.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">No hashtags found</div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
