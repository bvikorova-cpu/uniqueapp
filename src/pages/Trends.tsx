import { TrendingUp, Flame, Users, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrendingPosts, useActiveUsers } from "@/hooks/useTrends";
import { useNavigate } from "react-router-dom";

const Trends = () => {
  const { data: trendingPosts, isLoading: postsLoading } = useTrendingPosts();
  const { data: activeUsers, isLoading: usersLoading } = useActiveUsers();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Trendy</h1>
          <p className="text-muted-foreground">
            Najpopulárnejší obsah za posledný týždeň
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Trending Posts */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Najpopulárnejšie príspevky
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {postsLoading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4 p-4">
                      <Skeleton className="h-16 w-16 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </>
              ) : trendingPosts && trendingPosts.length > 0 ? (
                trendingPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="flex gap-4 p-4 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate("/wall")}
                  >
                    <div className="flex items-center justify-center min-w-[3rem]">
                      <div className="text-2xl font-bold text-muted-foreground">
                        #{index + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.profiles?.avatar_url} />
                          <AvatarFallback>
                            {post.profiles?.full_name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">
                          {post.profiles?.full_name || "Používateľ"}
                        </span>
                      </div>

                      <p className="text-sm line-clamp-2 mb-2">{post.content}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          ❤️ {post.likes_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          💬 {post.comments_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          🔁 {post.reposts_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          📤 {post.shares_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Zatiaľ žiadne trendujúce príspevky
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Users */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Najaktívnejší
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {usersLoading ? (
                <>
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </>
              ) : activeUsers && activeUsers.length > 0 ? (
                activeUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/profile/${user.id}`)}
                  >
                    <div className="flex items-center justify-center min-w-[2rem]">
                      {index < 3 ? (
                        <span className="text-xl">
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.full_name?.[0] || "U"}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {user.full_name || "Používateľ"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.post_count} príspevkov
                      </p>
                    </div>

                    {index < 3 && (
                      <Badge variant="secondary" className="text-xs">
                        Top {index + 1}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Žiadni aktívni používatelia
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Trends;
