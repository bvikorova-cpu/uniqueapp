import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plane, MapPin, Star, Plus, Camera, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Destination {
  id: string;
  name: string;
  description: string;
  location: string;
  created_at: string;
  user_id: string;
  photos?: { id: string; photo_url: string }[];
  reviews?: { 
    id: string; 
    rating: number; 
    comment: string; 
    user_id: string;
  }[];
}

const Vacationer = () => {
  const { toast } = useToast();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form states
  const [newDestination, setNewDestination] = useState({
    name: "",
    location: "",
    description: "",
  });
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    fetchUser();
    fetchDestinations();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchDestinations = async () => {
    const { data, error } = await supabase
      .from("destinations")
      .select(`
        *,
        photos:destination_photos(*),
        reviews:destination_reviews(*)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa načítať destinácie",
        variant: "destructive",
      });
    } else {
      setDestinations(data || []);
    }
  };

  const handleAddDestination = async () => {
    if (!user) {
      toast({
        title: "Vyžaduje sa prihlásenie",
        description: "Pre pridanie destinácie sa musíte prihlásiť",
        variant: "destructive",
      });
      return;
    }

    if (!newDestination.name || !newDestination.location || !newDestination.description) {
      toast({
        title: "Neúplné údaje",
        description: "Vyplňte všetky polia",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("destinations")
      .insert([{
        ...newDestination,
        user_id: user.id,
      }]);

    if (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa pridať destináciu",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Úspech",
        description: "Destinácia bola pridaná",
      });
      setNewDestination({ name: "", location: "", description: "" });
      setIsAddDialogOpen(false);
      fetchDestinations();
    }
  };

  const handleAddReview = async () => {
    if (!user) {
      toast({
        title: "Vyžaduje sa prihlásenie",
        description: "Pre pridanie recenzie sa musíte prihlásiť",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDestination || !newReview.comment) {
      toast({
        title: "Neúplné údaje",
        description: "Napíšte komentár",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("destination_reviews")
      .insert([{
        destination_id: selectedDestination.id,
        user_id: user.id,
        rating: newReview.rating,
        comment: newReview.comment,
      }]);

    if (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa pridať recenziu",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Úspech",
        description: "Recenzia bola pridaná",
      });
      setNewReview({ rating: 5, comment: "" });
      setIsReviewDialogOpen(false);
      fetchDestinations();
    }
  };

  const calculateAverageRating = (destination: Destination) => {
    if (!destination.reviews || destination.reviews.length === 0) return 0;
    const sum = destination.reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / destination.reviews.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge className="bg-primary text-primary-foreground">
            <Plane className="h-4 w-4 mr-1" />
            Dovolenkové destinácie
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Vacationer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Objavte úžasné dovolenkové destinácie a zdieľajte svoje zážitky
          </p>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Pridať destináciu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nová destinácia</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Názov</label>
                  <Input
                    value={newDestination.name}
                    onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
                    placeholder="Napríklad: Krásna pláž v Chorvátsku"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Lokalita</label>
                  <Input
                    value={newDestination.location}
                    onChange={(e) => setNewDestination({ ...newDestination, location: e.target.value })}
                    placeholder="Napríklad: Dubrovník, Chorvátsko"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Popis</label>
                  <Textarea
                    value={newDestination.description}
                    onChange={(e) => setNewDestination({ ...newDestination, description: e.target.value })}
                    placeholder="Opíšte destináciu..."
                    className="min-h-24"
                  />
                </div>
                <Button onClick={handleAddDestination} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Pridať destináciu
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-video bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
                  {destination.photos && destination.photos.length > 0 ? (
                    <img
                      src={destination.photos[0].photo_url}
                      alt={destination.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <CardTitle>{destination.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {destination.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {destination.description}
                </p>
                
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(Number(calculateAverageRating(destination)))
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {calculateAverageRating(destination)} ({destination.reviews?.length || 0} recenzií)
                  </span>
                </div>

                {/* Reviews */}
                {destination.reviews && destination.reviews.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {destination.reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="bg-secondary/50 p-2 rounded text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-xs">
                            Používateľ
                          </span>
                          <div className="flex ml-auto">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                <Dialog open={isReviewDialogOpen && selectedDestination?.id === destination.id} onOpenChange={(open) => {
                  setIsReviewDialogOpen(open);
                  if (open) setSelectedDestination(destination);
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Star className="h-4 w-4 mr-2" />
                      Pridať recenziu
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Pridať recenziu - {destination.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Hodnotenie</label>
                        <div className="flex items-center gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-8 w-8 cursor-pointer ${
                                star <= newReview.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Komentár</label>
                        <Textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder="Napíšte svoju recenziu..."
                          className="min-h-24"
                        />
                      </div>
                      <Button onClick={handleAddReview} className="w-full">
                        <Send className="h-4 w-4 mr-2" />
                        Odoslať recenziu
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {destinations.length === 0 && (
          <div className="text-center py-12">
            <Plane className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">
              Zatiaľ žiadne destinácie. Buďte prvý, kto pridá destináciu!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vacationer;