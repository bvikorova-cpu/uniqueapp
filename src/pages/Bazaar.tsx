import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, MapPin, Clock, User, MessageCircle, Upload, X, Trash2, Crown, AlertCircle, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubscription } from "@/hooks/useSubscription";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BazaarItem {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  category: string;
  condition: string;
  listing_type: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  is_sold: boolean;
  profiles?: {
    full_name: string | null;
  } | null;
}

const Bazaar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState<BazaarItem | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [items, setItems] = useState<BazaarItem[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    location: "",
    description: "",
    category: "electronics",
    condition: "Like New",
    listing_type: "sell",
  });
  const { toast } = useToast();
  const { limits, canCreateListing, calculateCommission } = useSubscription();

  useEffect(() => {
    loadItems();
    checkCurrentUser();
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    const transactionId = urlParams.get('transaction_id');

    if (paymentStatus === 'success' && sessionId && transactionId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const { data, error } = await supabase.functions.invoke('verify-bazaar-payment', {
          body: { sessionId, transactionId },
          headers: session?.access_token ? {
            Authorization: `Bearer ${session.access_token}`
          } : undefined
        });

        if (error) throw error;

        toast({
          title: "Payment successful! 🎉",
          description: "Your purchase was processed successfully.",
        });

        // Remove URL parameters
        window.history.replaceState({}, '', window.location.pathname);
        
        // Reload items to reflect changes
        loadItems();
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast({
          title: "Error",
          description: "Failed to verify payment. Please contact support.",
          variant: "destructive",
        });
      }
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment cancelled",
        description: "The payment was cancelled.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadItems = async () => {
    const { data, error } = await supabase
      .from('bazaar_items')
      .select('*, profiles(full_name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading items:', error);
      return;
    }

    setItems(data || []);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum image size is 5MB",
          variant: "destructive",
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
    setImagePreview("");
  };

  const categories = [
    { id: "all", name: "All" },
    { id: "electronics", name: "Electronics" },
    { id: "clothing", name: "Clothing" },
    { id: "home", name: "Home & Garden" },
    { id: "sports", name: "Sports" },
    { id: "books", name: "Books" },
    { id: "other", name: "Other" },
  ];

  const conditions = ["Like New", "Very Good", "Good", "Used"];

  const listingTypes = [
    { id: "sell", name: "Sell" },
    { id: "buy", name: "Buy" },
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks === 1) return "1 week ago";
    return `${diffInWeeks} weeks ago`;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.location) {
      toast({
        title: "Error",
        description: "Fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check subscription limits
    const canCreate = await canCreateListing('bazaar');
    if (!canCreate) {
      toast({
        title: "Limit reached",
        description: `You have reached the limit of ${limits.bazaarListingsPerMonth} listings/month. Upgrade your subscription for more.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('bazaar_images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('bazaar_images')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const price = parseFloat(formData.price);
      const commission = calculateCommission(price);

      const { error: insertError } = await supabase
        .from('bazaar_items')
        .insert({
          user_id: user.id,
          title: formData.title,
          price: price,
          location: formData.location,
          description: formData.description,
          category: formData.category,
          condition: formData.condition,
          listing_type: formData.listing_type,
          image_url: imageUrl,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: commission > 0 
          ? `Listing added. On sale, a ${limits.commissionRate}% commission (€${commission.toFixed(2)}) will be charged`
          : "Listing added without commission",
      });

      setFormData({ title: "", price: "", location: "", description: "", category: "electronics", condition: "Like New", listing_type: "sell" });
      setImageFile(null);
      setImagePreview("");
      setIsDialogOpen(false);
      loadItems();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to add listing",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleContact = (item: BazaarItem) => {
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive",
      });
      return;
    }
    
    if (currentUserId === item.user_id) {
      toast({
        title: "Warning",
        description: "You cannot contact yourself",
        variant: "destructive",
      });
      return;
    }

    setSelectedItem(item);
    setIsContactDialogOpen(true);
  };

  const openDetail = (item: BazaarItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedItem || !currentUserId || !contactMessage.trim()) {
      toast({
        title: "Error",
        description: "Fill in message",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('bazaar_messages')
        .insert({
          item_id: selectedItem.id,
          sender_id: currentUserId,
          receiver_id: selectedItem.user_id,
          message: contactMessage,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message sent to seller",
      });

      setContactMessage("");
      setIsContactDialogOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from('bazaar_items')
        .delete()
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing deleted",
      });

      setIsDeleteDialogOpen(false);
      setIsDetailOpen(false);
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
    }
  };

  const handleBuyItem = async () => {
    if (!selectedItem || !currentUserId) return;

    if (selectedItem.is_sold) {
      toast({
        title: "Already sold",
        description: "This item has already been sold.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('create-bazaar-checkout', {
        body: { itemId: selectedItem.id },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to payment",
          description: "Stripe payment gateway opened in a new window.",
        });
      }
    } catch (error) {
      console.error('Buy item error:', error);
      toast({
        title: "Error",
        description: "Failed to initialize payment.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold">
                Online{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Bazaar
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mt-2 mb-4">
                Buy and sell with confidence in our community
              </p>
              <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 space-y-3">
                <h2 className="text-lg font-semibold">How It Works</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>List Items:</strong> Create listings to sell or trade items. Upload photos, set prices in EUR (€), and specify condition and category. Free tier allows 5 listings, Premium (€5/month) offers unlimited listings.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Browse & Search:</strong> Filter by category (electronics, furniture, fashion, sports, etc.), search by keywords, and view listings by condition (Like New, Good, Fair, For Parts).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Connect & Buy:</strong> Message sellers directly through the platform. Complete purchases securely via Stripe payment integration with automatic commission handling (5% for free users, 2% for premium).</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

            <div className="flex flex-col gap-2">
              {limits.bazaarListingsPerMonth !== -1 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Limit: {limits.bazaarListingsPerMonth} listings/month • Commission: {limits.commissionRate}%
                    {limits.tier === 'basic' && (
                      <Link to="/subscription" className="ml-2 text-primary hover:underline">
                        Upgrade
                      </Link>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Listing
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>New Listing</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Listing Type</label>
                    <Select 
                      value={formData.listing_type} 
                      onValueChange={(value) => setFormData({...formData, listing_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {listingTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                <Input
                  placeholder="Product Name" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
                <Input 
                  placeholder="Price (€)" 
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
                <Input 
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
                <Textarea 
                  placeholder="Product description..." 
                  className="min-h-20"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.id !== "all").map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Condition</label>
                  <Select 
                    value={formData.condition} 
                    onValueChange={(value) => setFormData({...formData, condition: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((cond) => (
                        <SelectItem key={cond} value={cond}>
                          {cond}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Image</label>
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
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload image
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Max. 5MB (JPG, PNG, WEBP)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </label>
                  )}
                </div>

                <Button variant="hero" className="w-full" disabled={uploading} onClick={handleSubmit}>
                  {uploading ? "Uploading..." : "Publish Listing"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in bazaar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Trust Banner */}
        <Card className="mb-8 bg-gradient-secondary border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="space-y-2 mb-4 md:mb-0">
                <h3 className="text-xl font-bold">🛡️ Secure Shopping Guaranteed</h3>
                <p className="text-muted-foreground">All sellers are verified members of our community</p>
              </div>
              <Badge className="bg-success text-success-foreground">
                ✓ Verified Profiles
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-glow transition-all duration-300 hover:scale-105">
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={item.image_url || "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=300&h=300&fit=crop"}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-2 left-2 bg-background/90 text-foreground">
                    {item.condition}
                  </Badge>
                  <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground">
                    {listingTypes.find(t => t.id === item.listing_type)?.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 
                  className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 cursor-pointer"
                  onClick={() => openDetail(item)}
                >
                  {item.title}
                </h3>
                
                <div className="text-2xl font-bold text-success mb-3">
                  €{item.price}
                </div>

                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {item.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {getTimeAgo(item.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {item.profiles?.full_name || "Anonymous user"}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedItem?.title}</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-6">
                {selectedItem.image_url && (
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={selectedItem.listing_type === 'sell' ? 'default' : 'secondary'}>
                        {listingTypes.find(t => t.id === selectedItem.listing_type)?.name}
                      </Badge>
                      <Badge>{selectedItem.condition}</Badge>
                    </div>
                    <div className="text-3xl font-bold text-success">
                      €{selectedItem.price}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedItem.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{getTimeAgo(selectedItem.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedItem.profiles?.full_name || "Anonymous user"}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Category</h4>
                    <p className="text-muted-foreground">
                      {categories.find(c => c.id === selectedItem.category)?.name}
                    </p>
                  </div>

                  {selectedItem.description && (
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {selectedItem.description}
                      </p>
                    </div>
                  )}

                  {/* Commission Info */}
                  {selectedItem.listing_type === 'sell' && limits.commissionRate > 0 && currentUserId !== selectedItem.user_id && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Platform commission: {limits.commissionRate}% (€{calculateCommission(selectedItem.price).toFixed(2)})
                        <br />
                        <Link to="/subscription" className="text-primary hover:underline text-sm">
                          Upgrade to Premium = 0% commission
                        </Link>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    {currentUserId !== selectedItem.user_id && selectedItem.listing_type === 'sell' && (
                      <Button 
                        className="flex-1" 
                        size="lg"
                        onClick={handleBuyItem}
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Buy Now
                      </Button>
                    )}
                    
                    <Button 
                      className="flex-1" 
                      size="lg"
                      variant="outline"
                      onClick={() => handleContact(selectedItem)}
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Contact
                    </Button>
                    
                    {currentUserId === selectedItem.user_id && (
                      <Button 
                        variant="destructive"
                        size="lg"
                        onClick={handleDeleteClick}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete listing?</AlertDialogTitle>
              <AlertDialogDescription>
                This action is irreversible. The listing will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Contact Seller Dialog */}
        <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Contact Seller</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Send a message to the seller regarding: <strong>{selectedItem?.title}</strong>
                </p>
                <Textarea
                  placeholder="Write your message..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="min-h-32"
                />
              </div>
              <Button 
                onClick={handleSendMessage} 
                className="w-full"
                disabled={!contactMessage.trim()}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No listings found</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="mt-4"
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">🔒 Security</h3>
              <p className="text-sm text-muted-foreground">
                All transactions are protected by our system
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">⚡ Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Local sellers for quick pickup
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">💬 Support</h3>
              <p className="text-sm text-muted-foreground">
                24/7 support for all community members
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Bazaar;