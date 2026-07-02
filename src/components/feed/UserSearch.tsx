import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
}

const UserSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();
  const debounced = useDebounce(searchQuery, 200);

  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 1) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setSearching(true);
      try {
        const { data, error } = await (supabase as any).rpc("search_users", { q: q, lim: 20 });
        if (error) throw error;
        if (!cancelled) setSearchResults(((data as unknown) as Profile[]) || []);
      } catch (error: any) {
        if (!cancelled) {
          toast({ title: "Search error", description: error.message, variant: "destructive" });
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debounced, toast]);

  return (
    <div className="mb-6">
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {searching && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {!searching && searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((profile) => (
              <div
                key={profile.id}
                onClick={() => navigate(`/profile/${profile.id}`)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <Avatar>
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile.full_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-foreground">
                    {profile.full_name || profile.username || "No name"}
                  </p>
                  {profile.username && (
                    <p className="text-sm text-muted-foreground truncate">@{profile.username}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!searching && debounced.trim() && searchResults.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No users found
          </p>
        )}
      </Card>
    </div>
  );
};

export default UserSearch;
