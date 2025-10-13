import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plane, MapPin, Star, Plus, Camera, Send, X, Upload, Eye, Trash2 } from "lucide-react";
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
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form states
  const [newDestination, setNewDestination] = useState({
    name: "",
    location: "",
    description: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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
        title: "Error",
        description: "Failed to load destinations",
        variant: "destructive",
      });
    } else {
      setDestinations(data || []);
    }
  };

  const handleAddDestination = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must be logged in to add a destination",
        variant: "destructive",
      });
      return;
    }

    if (!newDestination.name || !newDestination.location || !newDestination.description) {
      toast({
        title: "Incomplete Data",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Insert destination
      const { data: destinationData, error: destError } = await supabase
        .from("destinations")
        .insert([{
          ...newDestination,
          user_id: user.id,
        }])
        .select()
        .single();

      if (destError) throw destError;

      // Upload files if any
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('destination-media')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('destination-media')
            .getPublicUrl(fileName);

          // Insert photo record
          await supabase
            .from('destination_photos')
            .insert([{
              destination_id: destinationData.id,
              photo_url: publicUrl,
            }]);
        });

        await Promise.all(uploadPromises);
      }

      toast({
        title: "Success",
        description: "Destination has been added",
      });
      setNewDestination({ name: "", location: "", description: "" });
      setSelectedFiles([]);
      setIsAddDialogOpen(false);
      fetchDestinations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add destination",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isUnder10MB = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isImage && !isVideo) {
        toast({
          title: "Invalid File",
          description: `${file.name} is not an image or video`,
          variant: "destructive",
        });
        return false;
      }
      
      if (!isUnder10MB) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the 10MB limit`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddReview = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must be logged in to add a review",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDestination || !newReview.comment) {
      toast({
        title: "Incomplete Data",
        description: "Please write a comment",
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
        title: "Error",
        description: "Failed to add review",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Review has been added",
      });
      setNewReview({ rating: 5, comment: "" });
      setIsReviewDialogOpen(false);
      fetchDestinations();
    }
  };

  
  const handleDeleteDestination = async (destinationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("destinations")
        .delete()
        .eq("id", destinationId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Destination has been deleted",
      });
      setIsDetailDialogOpen(false);
      fetchDestinations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete destination",
        variant: "destructive",
      });
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
            Holiday Destinations
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Vacationer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing holiday destinations and share your experiences
          </p>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Add Destination
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Destination</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={newDestination.name}
                    onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
                    placeholder="For example: Beautiful Beach in Croatia"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={newDestination.location}
                    onChange={(e) => setNewDestination({ ...newDestination, location: e.target.value })}
                    placeholder="For example: Dubrovnik, Croatia"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newDestination.description}
                    onChange={(e) => setNewDestination({ ...newDestination, description: e.target.value })}
                    placeholder="Describe the destination..."
                    className="min-h-24"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Images and Videos (max 5, up to 10MB)</label>
                  <div className="mt-2 space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="media-upload"
                        disabled={selectedFiles.length >= 5}
                      />
                      <label htmlFor="media-upload">
                        <Button
                          type="button"
                          variant="outline"
                          className="cursor-pointer"
                          asChild
                          disabled={selectedFiles.length >= 5}
                        >
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Select Files
                          </span>
                        </Button>
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {selectedFiles.length}/5 files
                      </span>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
                              {file.type.startsWith('image/') ? (
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Camera className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {file.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button onClick={handleAddDestination} className="w-full" disabled={isUploading}>
                  <Send className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Add Destination"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="aspect-video bg-gradient-secondary rounded-t-lg overflow-hidden">
                  {destination.photos && destination.photos.length > 0 ? (
                    <img
                      src={destination.photos[0].photo_url}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div>
                  <CardTitle 
                    className="cursor-pointer hover:text-primary transition-colors line-clamp-1"
                    onClick={() => {
                      setSelectedDestination(destination);
                      setIsDetailDialogOpen(true);
                    }}
                  >
                    {destination.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {destination.location}
                  </CardDescription>
                </div>
                
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
                    {calculateAverageRating(destination)} ({destination.reviews?.length || 0})
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedDestination(destination);
                      setIsDetailDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedDestination(destination);
                      setIsReviewDialogOpen(true);
                    }}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl">{selectedDestination?.name}</DialogTitle>
                  <CardDescription className="flex items-center gap-1 text-base">
                    <MapPin className="h-5 w-5" />
                    {selectedDestination?.location}
                  </CardDescription>
                </div>
                {user?.id === selectedDestination?.user_id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Destination?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. The destination and all its photos and reviews will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => selectedDestination && handleDeleteDestination(selectedDestination.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </DialogHeader>
            
            {selectedDestination && (
              <div className="space-y-6">
                {/* Images Gallery */}
                {selectedDestination.photos && selectedDestination.photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDestination.photos.map((photo) => (
                      <div key={photo.id} className="aspect-video rounded-lg overflow-hidden">
                        <img
                          src={photo.photo_url}
                          alt={selectedDestination.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 ${
                          star <= Math.round(Number(calculateAverageRating(selectedDestination)))
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">
                    {calculateAverageRating(selectedDestination)}
                  </span>
                  <span className="text-muted-foreground">
                    ({selectedDestination.reviews?.length || 0} reviews)
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {selectedDestination.description}
                  </p>
                </div>

                {/* Reviews */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
                      Reviews ({selectedDestination.reviews?.length || 0})
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        setIsReviewDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Review
                    </Button>
                  </div>
                  
                  {selectedDestination.reviews && selectedDestination.reviews.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDestination.reviews.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>U</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">User</span>
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= review.rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{review.comment}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-6">
                      No reviews yet. Be the first to add a review!
                    </p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Review - {selectedDestination?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rating</label>
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
                <label className="text-sm font-medium">Comment</label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Write your review..."
                  className="min-h-24"
                />
              </div>
              <Button onClick={handleAddReview} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Submit Review
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {destinations.length === 0 && (
          <div className="text-center py-12">
            <Plane className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">
              No destinations yet. Be the first to add a destination!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vacationer;
