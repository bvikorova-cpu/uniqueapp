import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Sparkles, Home, ShoppingCart, Search, Store, ShoppingBag, CheckCircle, Info, Star, Zap, Palette, Image } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIRoomDesigner } from "@/components/home-decor/AIRoomDesigner";
import { useDecorSubscription } from "@/hooks/useDecorSubscription";

interface DecorItem {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  condition: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
}

const HomeDesigner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, manageSubscription } = useDecorSubscription();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [marketplaceImagePreview, setMarketplaceImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [items, setItems] = useState<DecorItem[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "furniture",
    condition: "Like New",
  });

  useEffect(() => {
    checkAuth();
    loadItems();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const loadItems = async () => {
    const { data, error } = await supabase
      .from('home_decor_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading items:', error);
      return;
    }

    setItems(data || []);
  };

  const handleMarketplaceImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMarketplaceImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadMarketplaceImage = async () => {
    if (!imageFile || !currentUserId) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('home-decor-items')
      .upload(fileName, imageFile);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('home-decor-items')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "Please log in to add an item",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!formData.title || !formData.price || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await uploadMarketplaceImage();

      const { error } = await supabase
        .from('home_decor_items')
        .insert({
          ...formData,
          price: parseFloat(formData.price),
          image_url: imageUrl,
          user_id: currentUserId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item listed successfully",
      });

      setFormData({
        title: "",
        price: "",
        description: "",
        category: "furniture",
        condition: "Like New",
      });
      setImageFile(null);
      setMarketplaceImagePreview("");
      loadItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePurchase = async (itemId: string) => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase items",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-marketplace-item-checkout', {
        body: { item_id: itemId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate purchase",
        variant: "destructive",
      });
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: "All" },
    { value: "furniture", label: "Furniture" },
    { value: "decor", label: "Decor" },
    { value: "lighting", label: "Lighting" },
    { value: "textiles", label: "Textiles" },
    { value: "art", label: "Art" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 sm:pt-24 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 flex items-center gap-2">
            <Home className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Home Designer & Marketplace
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg">
            Design your space with AI or browse marketplace items
          </p>
          
          {subscription.subscribed && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Pro Subscriber
              </Badge>
              <Button onClick={manageSubscription} variant="outline" size="sm">
                Manage Subscription
              </Button>
            </div>
          )}
        </div>

        {/* Description Card */}
        <Card className="mb-6 bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-primary" />
              What is Home Designer & Marketplace?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Home Designer & Marketplace is your all-in-one platform for interior design and home decor shopping. 
              Use AI to visualize room designs based on your photos, browse unique decor items from other users, 
              or sell your own home decor pieces to the community.
            </p>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-primary" />
                How to Use
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li><strong>AI Designer:</strong> Upload a photo of your room and select a style - AI will generate design suggestions</li>
                <li><strong>Marketplace:</strong> Browse and purchase unique home decor items listed by other users</li>
                <li><strong>Sell Items:</strong> List your own furniture and decor for sale with photos and descriptions</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>AI Room Design</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Store className="h-4 w-4 text-primary" />
                <span>Buy & Sell</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Palette className="h-4 w-4 text-primary" />
                <span>Multiple Styles</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Image className="h-4 w-4 text-primary" />
                <span>Photo Upload</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="designer" className="space-y-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="designer" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">AI</span> Designer
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Store className="h-3 w-3 sm:h-4 sm:w-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
              Sell Items
            </TabsTrigger>
          </TabsList>

          <TabsContent value="designer">
            <AIRoomDesigner 
              subscription={subscription}
              onDesignComplete={loadItems}
            />
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Browse Marketplace</CardTitle>
                <CardDescription>Find unique home decor items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filteredItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No items found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                      <Card key={item.id}>
                        {item.image_url && (
                          <div className="aspect-video overflow-hidden rounded-t-lg">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{item.title}</CardTitle>
                              <Badge variant="secondary" className="mt-1">
                                {item.category}
                              </Badge>
                            </div>
                            <span className="text-2xl font-bold text-primary">
                              €{item.price}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.description}
                          </p>
                          <p className="text-xs text-muted-foreground mb-4">
                            Condition: {item.condition}
                          </p>
                          <Button
                            onClick={() => handlePurchase(item.id)}
                            className="w-full"
                            disabled={item.user_id === currentUserId}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {item.user_id === currentUserId ? "Your Item" : "Purchase"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sell">
            <Card>
              <CardHeader>
                <CardTitle>List Your Item</CardTitle>
                <CardDescription>
                  Add your home decor items to the marketplace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Item title"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c.value !== "all").map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => setFormData({ ...formData, condition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Like New">Like New</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="For Parts">For Parts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your item..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {marketplaceImagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={marketplaceImagePreview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <Button
                          onClick={() => {
                            setImageFile(null);
                            setMarketplaceImagePreview("");
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="marketplace-image-input" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload an image
                        </p>
                        <input
                          id="marketplace-image-input"
                          type="file"
                          accept="image/*"
                          onChange={handleMarketplaceImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Listing Item...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      List Item
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default HomeDesigner;
