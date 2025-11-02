import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Room {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  theme: string;
  price: number;
  duration_minutes: number;
  max_players: number;
  room_type: string;
  total_plays: number;
  rating: number;
  thumbnail_url: string | null;
}

interface RoomGalleryProps {
  onSelectRoom: (roomId: string) => void;
}

const difficultyColors = {
  easy: "bg-green-500/20 text-green-700 dark:text-green-300",
  medium: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  hard: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  expert: "bg-red-500/20 text-red-700 dark:text-red-300"
};

const themeIcons = {
  horror: "👻",
  mystery: "🔍",
  "sci-fi": "🚀",
  adventure: "🗺️",
  fantasy: "🧙‍♂️",
  educational: "📚",
  corporate: "💼"
};

const RoomGallery = ({ onSelectRoom }: RoomGalleryProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchRooms();
  }, [selectedTheme]);

  const fetchRooms = async () => {
    try {
      let query = supabase
        .from("escape_rooms")
        .select("*")
        .eq("is_published", true)
        .order("total_plays", { ascending: false });

      if (selectedTheme !== "all") {
        query = query.eq("theme", selectedTheme);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast({
        title: "Error",
        description: "Failed to load escape rooms",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlayRoom = (roomId: string, price: number) => {
    if (price > 0) {
      toast({
        title: "Payment Required",
        description: `This room costs €${price}. Payment integration coming soon!`
      });
      return;
    }
    onSelectRoom(roomId);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap justify-center">
        <Button
          variant={selectedTheme === "all" ? "default" : "outline"}
          onClick={() => setSelectedTheme("all")}
        >
          All Themes
        </Button>
        {Object.keys(themeIcons).map((theme) => (
          <Button
            key={theme}
            variant={selectedTheme === theme ? "default" : "outline"}
            onClick={() => setSelectedTheme(theme)}
          >
            {themeIcons[theme as keyof typeof themeIcons]} {theme}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12">
          <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No rooms available yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl">{themeIcons[room.theme as keyof typeof themeIcons]}</span>
                  <Badge className={difficultyColors[room.difficulty as keyof typeof difficultyColors]}>
                    {room.difficulty}
                  </Badge>
                </div>
                <CardTitle>{room.title}</CardTitle>
                <CardDescription>{room.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {room.duration_minutes}m
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {room.max_players}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    {room.rating.toFixed(1)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    {room.price > 0 ? (
                      <span className="text-lg font-bold">€{room.price}</span>
                    ) : (
                      <Badge variant="secondary">Free</Badge>
                    )}
                  </div>
                  <Button onClick={() => handlePlayRoom(room.id, room.price)}>
                    {room.price > 0 ? "Buy & Play" : "Play Now"}
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  {room.total_plays} plays • {room.room_type}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomGallery;
