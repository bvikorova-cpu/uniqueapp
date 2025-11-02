import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Shield, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CharacterGallery = () => {
  const { data: characters } = useQuery({
    queryKey: ["all-characters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .order("popularity_score", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Character Gallery</h2>
        <p className="text-muted-foreground">Discover the most powerful and popular characters</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters?.map((char, index) => (
          <Card key={char.id} className="p-4 hover:border-primary transition-all">
            <div className="relative">
              {index < 3 && (
                <Badge className="absolute top-2 right-2 bg-yellow-500">
                  <Trophy className="h-3 w-3 mr-1" />
                  Top {index + 1}
                </Badge>
              )}
              {char.image_url && (
                <img
                  src={char.image_url}
                  alt={char.name}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground font-bold text-lg">{char.name}</h3>
                <Badge variant="outline" className="text-xs">
                  Lvl {char.level}
                </Badge>
              </div>

              <Badge className="bg-purple-600">{char.category}</Badge>

              <p className="text-muted-foreground text-sm line-clamp-2">{char.description}</p>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-foreground">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>{char.hp} HP</span>
                </div>
                <div className="flex items-center gap-1 text-foreground">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>{char.attack} ATK</span>
                </div>
                <div className="flex items-center gap-1 text-foreground">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>{char.defense} DEF</span>
                </div>
                <div className="flex items-center gap-1 text-foreground">
                  <Trophy className="h-4 w-4 text-green-500" />
                  <span>{char.wins}W / {char.losses}L</span>
                </div>
              </div>

              {char.special_power && (
                <p className="text-foreground text-xs bg-muted p-2 rounded">
                  ⚡ {char.special_power}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
