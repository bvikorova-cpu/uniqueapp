import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

const UserSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email")
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      toast({
        title: "Search error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="mb-6">
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
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
                    {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {profile.full_name || "No name"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {profile.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!searching && searchQuery && searchResults.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No users found
          </p>
        )}
      </Card>
    </div>
  );
};

export default UserSearch;
