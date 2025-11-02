import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Search, MessageCircle, Star } from "lucide-react";

interface Clone {
  id: string;
  clone_name: string;
  subscription_tier: string;
  total_conversations: number;
  personality_data: any;
}

export function CloneMarketplace() {
  const [clones, setClones] = useState<Clone[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPublicClones();
  }, []);

  const fetchPublicClones = async () => {
    try {
      const { data, error } = await supabase
        .from('personality_clones')
        .select('*')
        .eq('is_active', true)
        .eq('training_status', 'active')
        .order('total_conversations', { ascending: false })
        .limit(20);

      if (error) throw error;
      setClones(data || []);
    } catch (error) {
      console.error('Error fetching clones:', error);
    }
  };

  const filteredClones = clones.filter(clone =>
    clone.clone_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Explore AI Clones</CardTitle>
          <CardDescription>
            Chat with personality clones from around the world
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClones.map((clone) => (
          <Card key={clone.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{clone.clone_name}</CardTitle>
                </div>
                {clone.subscription_tier === 'celebrity' && (
                  <Badge variant="default">
                    <Star className="h-3 w-3 mr-1" />
                    Celebrity
                  </Badge>
                )}
              </div>
              <CardDescription>
                {clone.total_conversations} conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {clone.personality_data?.personality || "A unique AI personality"}
              </p>
              <Button className="w-full" variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClones.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No clones found matching your search</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}