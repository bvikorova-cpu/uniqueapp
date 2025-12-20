import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, MapPin, Clock, Euro, Upload, X, Send, Trash2, ShoppingBag, Store } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ServiceOrderDialog } from "@/components/marketplace/ServiceOrderDialog";
import { MyOrders } from "@/components/marketplace/MyOrders";

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

interface SkillOffering {
  id: string;
  title: string;
  description: string;
  category: string;
  price_per_hour: number | null;
  location: string | null;
  image_url: string | null;
  user_id: string;
  created_at: string;
  profiles: Profile | null;
}

const CATEGORIES = {
  construction: "Construction",
  repairs: "Repairs",
  cleaning: "Cleaning",
  gardening: "Gardening",
  technology: "Technology",
  teaching: "Education",
  creative: "Creative",
  other: "Other"
};

const Marketplace = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [offerings, setOfferings] = useState<SkillOffering[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<SkillOffering | null>(null);
  const [orderOffering, setOrderOffering] = useState<SkillOffering | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [isSendingResponse, setIsSendingResponse] = useState(false);
  const [offeringToDelete, setOfferingToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("browse");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price_per_hour: "",
    location: ""
  });

  useEffect(() => {
    checkAuth();
    loadOfferings();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      const { data: subscription } = await supabase
        .from("marketplace_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      
      setIsSubscribed(!!subscription);
    }
  };

  const loadOfferings = async () => {
    const { data: offeringsData, error } = await supabase
      .from("skill_offerings")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading offerings:", error);
      return;
    }

    if (!offeringsData || offeringsData.length === 0) {
      setOfferings([]);
      return;
    }

    // Fetch profiles for all user_ids
    const userIds = [...new Set(offeringsData.map(o => o.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    // Combine offerings with profiles
    const offeringsWithProfiles = offeringsData.map(offering => ({
      ...offering,
      profiles: profilesData?.find(p => p.id === offering.user_id) || null
    }));

    setOfferings(offeringsWithProfiles);
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must log in to subscribe",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from("marketplace_subscriptions")
      .insert({
        user_id: user.id,
        status: "active"
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create subscription",
        variant: "destructive"
      });
      return;
    }

    setIsSubscribed(true);
    toast({
      title: "Success!",
      description: "Subscription activated"
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum image size is 5 MB",
          variant: "destructive"
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSendResponse = async () => {
    if (!responseMessage.trim() || !selectedOffering || !user) return;

    setIsSendingResponse(true);

    const { error } = await supabase
      .from("marketplace_responses")
      .insert({
        offering_id: selectedOffering.id,
        sender_id: user.id,
        receiver_id: selectedOffering.user_id,
        message: responseMessage.trim()
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      setIsSendingResponse(false);
      return;
    }

    toast({
      title: "Message sent",
      description: "Your interest has been sent to the service provider"
    });

    setResponseMessage("");
    setSelectedOffering(null);
    setIsSendingResponse(false);
  };

  const handleDeleteOffering = async () => {
    if (!offeringToDelete) return;

    const { error } = await supabase
      .from("skill_offerings")
      .delete()
      .eq("id", offeringToDelete);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete offer",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success!",
      description: "Offer deleted"
    });

    setOfferingToDelete(null);
    setSelectedOffering(null);
    loadOfferings();
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('marketplace-images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('marketplace-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload error",
        description: "Failed to upload image",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Login Required",
        description: "You must log in to create an offer",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await uploadImage();
    }

    const { error } = await supabase
      .from("skill_offerings")
      .insert([{
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        price_per_hour: formData.price_per_hour ? parseFloat(formData.price_per_hour) : null,
        location: formData.location || null,
        image_url: imageUrl
      }]);

    setIsUploading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success!",
      description: "Your offer has been created"
    });

    setFormData({
      title: "",
      description: "",
      category: "",
      price_per_hour: "",
      location: ""
    });
    setImageFile(null);
    setImagePreview(null);
    setShowCreateForm(false);
    loadOfferings();
  };

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-24 pb-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="border-primary/20">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-4xl font-bold">Skills Marketplace</CardTitle>
              <CardDescription className="text-lg">
                Offer your skills to the world
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-semibold">What you get for 2 EUR/month:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Create unlimited service offers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Reach thousands of potential customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Full control over prices and availability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Present yourself professionally</span>
                  </li>
                </ul>
              </div>

              <div className="text-center space-y-4">
                <p className="text-3xl font-bold text-primary">€2 / month</p>
                <Button 
                  onClick={handleSubscribe}
                  size="lg" 
                  className="w-full max-w-md"
                >
                  Activate Subscription
                </Button>
                <p className="text-sm text-muted-foreground">
                  Payment gateway will be connected later
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-20 sm:pt-24 pb-12">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-4xl font-bold mb-2 flex items-center gap-2">
                <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                Skills Marketplace
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mb-4">Find skilled professionals or offer your services</p>
              <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-3 sm:p-6 space-y-3 sm:space-y-4">
                <h2 className="text-base sm:text-lg font-semibold">How It Works</h2>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Our Skills Marketplace connects service providers with clients looking for professional help. 
                  Whether you offer translation services, graphic design, tutoring, home repairs, or any other skill — 
                  this is the place to monetize your expertise and find trusted professionals.
                </p>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="bg-primary/5 rounded-lg p-3">
                    <h3 className="font-semibold text-sm mb-2">For Service Providers</h3>
                    <ul className="space-y-1.5 text-muted-foreground text-xs">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">1.</span>
                        <span><strong>Create Your Offering:</strong> Describe your service, set your price, and specify delivery time.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">2.</span>
                        <span><strong>Receive Orders:</strong> Clients purchase your service and describe their requirements.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">3.</span>
                        <span><strong>Communicate & Deliver:</strong> Chat with clients, clarify details, and deliver within the deadline.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">4.</span>
                        <span><strong>Get Paid:</strong> Receive 85% of the payment (15% platform fee) after client approval.</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <h3 className="font-semibold text-sm mb-2">For Clients</h3>
                    <ul className="space-y-1.5 text-muted-foreground text-xs">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">1.</span>
                        <span><strong>Browse Services:</strong> Find the perfect professional for your needs.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">2.</span>
                        <span><strong>Place an Order:</strong> Describe your requirements and pay securely.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">3.</span>
                        <span><strong>Collaborate:</strong> Use the built-in chat to communicate with the provider.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">4.</span>
                        <span><strong>Approve & Complete:</strong> Review the delivered work and confirm completion.</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                  <strong>Secure Payments:</strong> All transactions are processed through Stripe. Funds are held securely 
                  until you approve the delivered work. Platform commission (15%) is automatically deducted.
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {user && (
                <Button variant="outline" onClick={() => setActiveTab("orders")}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  My Orders
                </Button>
              )}
              <Button onClick={() => setShowCreateForm(!showCreateForm)} className="flex-1 sm:flex-none">
                {showCreateForm ? "Cancel" : "Add Offering"}
              </Button>
            </div>
          </div>
        </div>

        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Offering</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOffering} className="space-y-4">
                <div>
                  <Input
                    placeholder="Service Name"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Service Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                  />
                </div>
                
                {/* Image upload section */}
                <div className="space-y-2">
                  <Label>Offer Image (optional)</Label>
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to select image
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Maximum size: 5 MB
                        </p>
                      </label>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price per hour (€)"
                    value={formData.price_per_hour}
                    onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                  />
                  <Input
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isUploading}>
                  {isUploading ? "Creating..." : "Create Offering"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offerings.map((offering) => (
            <Card key={offering.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              {offering.image_url && (
                <div className="w-full h-48 overflow-hidden">
                  <img 
                    src={offering.image_url} 
                    alt={offering.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle 
                    className="text-xl cursor-pointer hover:text-primary transition-colors flex-1"
                    onClick={() => setSelectedOffering(offering)}
                  >
                    {offering.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {CATEGORIES[offering.category as keyof typeof CATEGORIES]}
                    </Badge>
                    {user && offering.user_id === user.id && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOfferingToDelete(offering.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription className="flex items-center gap-1 text-sm">
                  {offering.profiles?.full_name || "Anonymous user"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {offering.description}
                </p>
                <div className="space-y-2 text-sm">
                  {offering.price_per_hour && (
                    <div className="flex items-center gap-2 text-primary">
                      <Euro className="w-4 h-4" />
                      <span className="font-semibold">{offering.price_per_hour}€/hr</span>
                    </div>
                  )}
                  {offering.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{offering.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(offering.created_at).toLocaleDateString('en-US')}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => setSelectedOffering(offering)}
                    variant="outline"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  {user && offering.user_id !== user.id && (
                    <Button 
                      className="flex-1"
                      onClick={() => setOrderOffering(offering)}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {offerings.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No offers yet</h3>
            <p className="text-muted-foreground">Be the first to offer your services!</p>
          </div>
        )}
      </div>

      {/* Offering Detail Dialog */}
      <Dialog open={!!selectedOffering} onOpenChange={(open) => !open && setSelectedOffering(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOffering && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedOffering.title}</DialogTitle>
                    <DialogDescription>
                      <Badge variant="secondary" className="mt-2">
                        {CATEGORIES[selectedOffering.category as keyof typeof CATEGORIES]}
                      </Badge>
                    </DialogDescription>
                  </div>
                  {user && selectedOffering.user_id === user.id && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setOfferingToDelete(selectedOffering.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </DialogHeader>
              
              {selectedOffering.image_url && (
                <div className="w-full h-64 overflow-hidden rounded-lg">
                  <img 
                    src={selectedOffering.image_url} 
                    alt={selectedOffering.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedOffering.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedOffering.price_per_hour && (
                    <div className="flex items-center gap-2 text-primary">
                      <Euro className="w-5 h-5" />
                      <span className="font-semibold text-lg">{selectedOffering.price_per_hour}€/hr</span>
                    </div>
                  )}
                  {selectedOffering.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <span>{selectedOffering.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span>{new Date(selectedOffering.created_at).toLocaleDateString('en-US')}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Respond to Offer</h3>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Write a message to the service provider..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      rows={4}
                    />
                    <Button 
                      onClick={handleSendResponse} 
                      disabled={!responseMessage.trim() || isSendingResponse}
                      className="w-full"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSendingResponse ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!offeringToDelete} onOpenChange={(open) => !open && setOfferingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Do you really want to delete this offer?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is irreversible. The offer will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOffering} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order Dialog */}
      {orderOffering && (
        <ServiceOrderDialog
          open={!!orderOffering}
          onOpenChange={(open) => !open && setOrderOffering(null)}
          offering={orderOffering}
        />
      )}

      {/* My Orders Section - accessible via tab or URL param */}
      {user && activeTab === "orders" && (
        <Dialog open={activeTab === "orders"} onOpenChange={() => setActiveTab("browse")}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>My Orders</DialogTitle>
            </DialogHeader>
            <MyOrders userId={user.id} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Marketplace;