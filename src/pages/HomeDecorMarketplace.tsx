import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Home, Upload, ShoppingBag, Store, Star, Sparkles, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { AIRoomDesigner } from "@/components/home-decor/AIRoomDesigner";
import { useDecorSubscription } from "@/hooks/useDecorSubscription";
import { CheckCircle } from "lucide-react";
import { SellerConnectGate } from "@/components/commerce/SellerConnectGate";

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

const HomeDecorMarketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, manageSubscription } = useDecorSubscription();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
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
      const imageUrl = await uploadImage();

      const { error } = await supabase
        .from('home_decor_items')
        .insert({
          title: formData.title,
          price: parseFloat(formData.price),
          description: formData.description,
          category: formData.category,
          condition: formData.condition,
          image_url: imageUrl,
          user_id: currentUserId,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your item has been added to the marketplace",
      });

      setFormData({
        title: "",
        price: "",
        description: "",
        category: "furniture",
        condition: "Like New",
      });
      setImageFile(null);
      setImagePreview("");
      await loadItems();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "Please log in to upgrade",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-decor-subscription');
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

  const handlePurchaseItem = async (itemId: string) => {
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Home className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Home Decor Marketplace
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            AI-powered inspiration + marketplace for home decor
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
            <TabsTrigger value="browse">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="sell">
              <Store className="h-4 w-4 mr-2" />
              Sell
            </TabsTrigger>
          </TabsList>

          {/* AI Designer Tab */}
          <TabsContent value="ai-designer">
            <AIRoomDesigner 
              subscription={subscription}
            />
          </TabsContent>

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-6">
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-4 w-4" />
                          <span>Seller</span>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handlePurchaseItem(item.id)}
                          disabled={item.user_id === currentUserId}
                        >
                          {item.user_id === currentUserId ? "Your Item" : "Buy"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Info about commission */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <span>Sales commission: 15% • Secure payments via Stripe</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sell Tab */}
          <TabsContent value="sell">
            <Card>
              <CardHeader>
                <CardTitle>Add New Item</CardTitle>
                <CardDescription>
                  Add photos and description of your decoration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Photo *</label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full h-64 object-contain mx-auto rounded-lg"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview("");
                          }}
                        >
                          Change Photo
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title *</label>
                    <Input
                      placeholder="e.g. Modern wall clock"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Price (€) *</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Category *</label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
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
                  </div>

                  <div>
                    <label className="text-sm font-medium">Condition *</label>
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
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description *</label>
                    <Textarea
                      placeholder="Detailed description of your decoration..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="w-full"
                  size="lg"
                >
                  {uploading ? "Adding..." : "Add Item"}
                </Button>

                <div className="text-sm text-muted-foreground text-center">
                  15% commission on each sale
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
};

export default HomeDecorMarketplace;

