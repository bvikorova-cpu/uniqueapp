import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, Reply, Send, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ForumPost {
  id: number;
  author: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  replies: number;
  timestamp: string;
}

const Megaforum = () => {
  const { toast } = useToast();
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Všeobecné");

  const categories = [
    "Všeobecné",
    "Technológie",
    "Šport",
    "Kultúra",
    "Hudba",
    "Film & TV",
    "Hry",
    "Iné"
  ];

  const samplePosts: ForumPost[] = [
    {
      id: 1,
      author: "Používateľ123",
      title: "Vitajte v Megafóre! 🎉",
      content: "Toto je komunita pre všetkých! Zdieľajte svoje nápady, diskutujte o témach ktoré vás zaujímajú a spoznávajte nových ľudí.",
      category: "Všeobecné",
      likes: 45,
      replies: 12,
      timestamp: "pred 2 hodinami"
    },
    {
      id: 2,
      author: "MusicLover",
      title: "Aká je vaša obľúbená skladba tohto roka?",
      content: "Zaujíma ma, čo počúvate. Ja osobne mám rád nové albumy od slovenských interpretov!",
      category: "Hudba",
      likes: 28,
      replies: 34,
      timestamp: "pred 5 hodinami"
    },
    {
      id: 3,
      author: "TechGuru",
      title: "Novinky v AI technológiách",
      content: "Diskusia o najnovších trendoch v umelej inteligencii a ako ovplyvňujú náš každodenný život.",
      category: "Technológie",
      likes: 67,
      replies: 23,
      timestamp: "pred 1 dňom"
    }
  ];

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Chyba",
        description: "Vyplňte prosím názov aj obsah príspevku.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Príspevok vytvorený!",
      description: "Váš príspevok bol úspešne pridaný do fóra.",
    });
    
    setNewPostTitle("");
    setNewPostContent("");
  };

  const handleLike = (postId: number) => {
    toast({
      title: "Páči sa mi",
      description: "Príspevok označený ako obľúbený",
    });
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <Badge className="bg-gradient-primary text-white">
            <Users className="h-4 w-4 mr-1" />
            Otvorené pre všetkých
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Megafórum
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Komunita kde sa môže zapojiť každý. Diskutujte, zdieľajte a inšpirujte sa navzájom.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kategórie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Štatistiky
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Príspevky:</span>
                    <span className="font-semibold">1,234</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Členovia:</span>
                    <span className="font-semibold">567</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Online:</span>
                    <span className="font-semibold text-green-500">89</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create New Post */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Vytvoriť nový príspevok
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kategória</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Input
                  placeholder="Názov príspevku..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Čo chcete zdieľať s komunitou?"
                  className="min-h-32"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={handleCreatePost}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Zverejniť príspevok
                </Button>
              </CardContent>
            </Card>

            {/* Forum Posts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Najnovšie diskusie</h2>
                <Badge variant="secondary">
                  {samplePosts.length} príspevkov
                </Badge>
              </div>

              {samplePosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-primary text-white">
                          {post.author.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{post.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {post.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {post.author} • {post.timestamp}
                            </p>
                          </div>
                        </div>

                        <p className="text-foreground">{post.content}</p>

                        <div className="flex items-center gap-4 pt-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className="hover:text-primary"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Reply className="h-4 w-4 mr-1" />
                            {post.replies} odpovedí
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Megaforum;
