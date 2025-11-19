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
import { Loader2, Upload, Sparkles, Home, ShoppingCart, Search, Store, ShoppingBag, CheckCircle } from "lucide-react";
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
  
  // Marketplace state
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
        .insert([{
          ...formData,
          price: parseFloat(formData.price),
          image_url: imageUrl,
          user_id: currentUserId
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your item has been listed!",
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
      
      await loadItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing",
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
        description: "Please log in to make a purchase",
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
        description: error.message || "Failed to create checkout",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-decor-subscription');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription checkout",
        variant: "destructive",
      });
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "furniture", label: "Furniture" },
    { value: "lighting", label: "Lighting" },
    { value: "textiles", label: "Textiles & Rugs" },
    { value: "wall-art", label: "Wall Art" },
    { value: "accessories", label: "Accessories" },
    { value: "plants", label: "Plants & Planters" },
    { value: "storage", label: "Storage Solutions" },
    { value: "kitchenware", label: "Kitchenware" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Home className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Home Designer & Marketplace
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            AI-powered room design + marketplace for home decor
          </p>

          <div className="flex items-center justify-center gap-4 mt-4">
            {subscription.subscribed ? (
              <>
                <Badge variant="default" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Pro Designer ({subscription.designs_used}/{subscription.designs_limit} designs used)
                </Badge>
                <Button onClick={manageSubscription} size="sm" variant="outline">
                  Manage Subscription
                </Button>
              </>
            ) : (
              <Button onClick={handleSubscribe} size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Subscribe to Pro Designer (€9.99/month)
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="ai-designer" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="ai-designer">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Designer
            </TabsTrigger>
            <TabsTrigger value="marketplace">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="sell">
              <Store className="h-4 w-4 mr-2" />
              Sell Items
            </TabsTrigger>
          </TabsList>

          {/* AI Designer Tab */}
          <TabsContent value="ai-designer">
            <AIRoomDesigner subscription={subscription} />
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search decorations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items match your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {item.image_url ? (
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-gradient-subtle flex items-center justify-center">
                        <Home className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              {categories.find(c => c.value === item.category)?.label || item.category}
                            </Badge>
                            <Badge variant="outline">{item.condition}</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-primary">€{item.price}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2 mb-4">
                        {item.description}
                      </p>
                      <Button 
                        className="w-full gap-2" 
                        onClick={() => handlePurchase(item.id)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Buy Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Sell Tab */}
          <TabsContent value="sell">
            <Card>
              <CardHeader>
                <CardTitle>List Your Home Decor Item</CardTitle>
                <CardDescription>
                  Share your beautiful pieces with the community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="item-image">Item Photo</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    {marketplaceImagePreview ? (
                      <div className="space-y-4">
                        <img 
                          src={marketplaceImagePreview} 
                          alt="Item preview" 
                          className="max-w-full h-64 object-contain mx-auto rounded-lg"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setImageFile(null);
                            setMarketplaceImagePreview("");
                          }}
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <Input
                          id="item-image"
                          type="file"
                          accept="image/*"
                          onChange={handleMarketplaceImageSelect}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Item Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Beautiful Vintage Chair"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (€) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="99.99"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select 
                      value={formData.condition} 
                      onValueChange={(value) => setFormData({...formData, condition: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Brand New">Brand New</SelectItem>
                        <SelectItem value="Like New">Like New</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="Vintage">Vintage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your item..."
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Listing...
                    </>
                  ) : (
                    "List Item"
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
