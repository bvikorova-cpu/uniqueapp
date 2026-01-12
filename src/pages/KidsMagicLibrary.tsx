import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Palette, Sparkles, Crown, Image, Download, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useKidsGoldPass } from "@/hooks/useKidsGoldPass";
import castleBg from "@/assets/kids/disney-castle-bg.jpg";

interface Story {
  id: string;
  title: string;
  category: string;
  story_content: string;
  illustration_url: string | null;
  created_at: string;
}

interface Drawing {
  id: string;
  title: string;
  image_url: string;
  category: string;
  created_at: string;
}

interface Character {
  id: string;
  name: string;
  hair_color: string;
  superpower: string;
  eye_color: string;
  costume_color: string;
  personality: string;
  image_url: string | null;
  created_at: string;
}

export default function KidsMagicLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasGoldPass } = useKidsGoldPass();
  const [activeTab, setActiveTab] = useState("stories");

  // Fetch stories - using localStorage for demo
  const { data: stories = [], isLoading: storiesLoading } = useQuery({
    queryKey: ["kids-stories", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const stored = localStorage.getItem(`kids_stories_${user.id}`);
      return stored ? JSON.parse(stored) as Story[] : [];
    },
    enabled: !!user,
  });

  // Fetch drawings - using localStorage for demo
  const { data: drawings = [], isLoading: drawingsLoading } = useQuery({
    queryKey: ["kids-drawings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const stored = localStorage.getItem(`kids_drawings_${user.id}`);
      return stored ? JSON.parse(stored) as Drawing[] : [];
    },
    enabled: !!user,
  });

  // Fetch characters
  const { data: characters = [], isLoading: charactersLoading } = useQuery({
    queryKey: ["kids-characters", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("created_characters")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Character[];
    },
    enabled: !!user,
  });

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      toast.success("Downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download");
    }
  };

  const isLoading = storiesLoading || drawingsLoading || charactersLoading;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0">
        <img 
          src={castleBg} 
          alt="Disney Castle" 
          className="w-full h-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-100/80 via-pink-100/80 to-blue-100/80" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/kids-channel")}
            className="hover:bg-white/70"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Kids Channel
          </Button>
          
          {hasGoldPass && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white gap-1">
              <Crown className="w-4 h-4" /> Gold Pass
            </Badge>
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-4">
            My Magic Library ✨📚
          </h1>
          <p className="text-xl text-muted-foreground">
            All your magical creations in one place!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
          <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 text-center">
            <CardContent className="pt-4 pb-4">
              <BookOpen className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <div className="text-3xl font-bold text-purple-700">{stories.length}</div>
              <div className="text-sm text-purple-600">Stories</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-100 to-pink-200 border-pink-300 text-center">
            <CardContent className="pt-4 pb-4">
              <Palette className="w-8 h-8 mx-auto text-pink-600 mb-2" />
              <div className="text-3xl font-bold text-pink-700">{drawings.length}</div>
              <div className="text-sm text-pink-600">Drawings</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 text-center">
            <CardContent className="pt-4 pb-4">
              <Sparkles className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <div className="text-3xl font-bold text-blue-700">{characters.length}</div>
              <div className="text-sm text-blue-600">Characters</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm mb-6">
            <TabsTrigger value="stories" className="gap-2">
              <BookOpen className="w-4 h-4" /> Stories
            </TabsTrigger>
            <TabsTrigger value="drawings" className="gap-2">
              <Palette className="w-4 h-4" /> Drawings
            </TabsTrigger>
            <TabsTrigger value="characters" className="gap-2">
              <Sparkles className="w-4 h-4" /> Characters
            </TabsTrigger>
          </TabsList>

          {/* Stories Tab */}
          <TabsContent value="stories">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
              </div>
            ) : stories.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm text-center py-12">
                <CardContent>
                  <BookOpen className="w-16 h-16 mx-auto text-purple-300 mb-4" />
                  <h3 className="text-xl font-semibold text-purple-700 mb-2">No Stories Yet!</h3>
                  <p className="text-muted-foreground mb-4">Create your first magical story!</p>
                  <Button onClick={() => navigate("/kids-story-creator")} className="bg-gradient-to-r from-purple-500 to-pink-500">
                    Create a Story ✨
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story) => (
                  <Card key={story.id} className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg">
                    {story.illustration_url && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img src={story.illustration_url} alt={story.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-purple-700">{story.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">{story.category}</Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(story.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3">{story.story_content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Drawings Tab */}
          <TabsContent value="drawings">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto" />
              </div>
            ) : drawings.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm text-center py-12">
                <CardContent>
                  <Palette className="w-16 h-16 mx-auto text-pink-300 mb-4" />
                  <h3 className="text-xl font-semibold text-pink-700 mb-2">No Drawings Yet!</h3>
                  <p className="text-muted-foreground mb-4">Start your artistic journey!</p>
                  <Button onClick={() => navigate("/kids-drawing-buddy")} className="bg-gradient-to-r from-pink-500 to-rose-500">
                    Start Drawing 🎨
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drawings.map((drawing) => (
                  <Card key={drawing.id} className="bg-white/90 backdrop-blur-sm border-2 border-pink-200 hover:border-pink-400 transition-all hover:shadow-lg group">
                    <div className="aspect-square overflow-hidden rounded-t-lg relative">
                      <img src={drawing.image_url} alt={drawing.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handleDownload(drawing.image_url, `${drawing.title}.png`)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-pink-700">{drawing.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">{drawing.category}</Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(drawing.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Characters Tab */}
          <TabsContent value="characters">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              </div>
            ) : characters.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm text-center py-12">
                <CardContent>
                  <Sparkles className="w-16 h-16 mx-auto text-blue-300 mb-4" />
                  <h3 className="text-xl font-semibold text-blue-700 mb-2">No Characters Yet!</h3>
                  <p className="text-muted-foreground mb-4">Create your first hero!</p>
                  <Button onClick={() => navigate("/kids-stories/create-character")} className="bg-gradient-to-r from-blue-500 to-cyan-500">
                    Create a Hero 🦸
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characters.map((character) => (
                  <Card key={character.id} className="bg-white/90 backdrop-blur-sm border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg">
                    {character.image_url && (
                      <div className="aspect-square overflow-hidden rounded-t-lg">
                        <img src={character.image_url} alt={character.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-blue-700">{character.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(character.created_at), "MMM d, yyyy")}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-blue-50 rounded px-2 py-1">
                          <span className="text-blue-600">Power:</span> {character.superpower}
                        </div>
                        <div className="bg-purple-50 rounded px-2 py-1">
                          <span className="text-purple-600">Hair:</span> {character.hair_color}
                        </div>
                        <div className="bg-pink-50 rounded px-2 py-1">
                          <span className="text-pink-600">Eyes:</span> {character.eye_color}
                        </div>
                        <div className="bg-green-50 rounded px-2 py-1">
                          <span className="text-green-600">Trait:</span> {character.personality}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
