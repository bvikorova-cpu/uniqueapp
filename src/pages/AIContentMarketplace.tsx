import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Store, Upload, Euro, TrendingUp, Image, Eye, ShoppingCart, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AIContentMarketplace = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  // Mock marketplace items
  const marketplaceItems = [
    {
      id: 1,
      title: "Modern Logo Pack",
      description: "10 AI-generated minimalist logos",
      price: 29.99,
      seller: "CreativeAI",
      sales: 156,
      image: "https://images.unsplash.com/photo-1634942537034-2531766767d1?w=400&q=80",
    },
    {
      id: 2,
      title: "Social Media Banner Set",
      description: "20 unique banners for all platforms",
      price: 49.99,
      seller: "DesignMaster",
      sales: 243,
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80",
    },
    {
      id: 3,
      title: "Product Photography Bundle",
      description: "50 high-quality AI product photos",
      price: 79.99,
      seller: "PhotoPro",
      sales: 89,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    },
  ];

  const handleUpload = () => {
    if (!title || !description || !price) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Content uploaded!",
      description: "Your content is now available in the marketplace.",
    });

    setTitle("");
    setDescription("");
    setPrice("");
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Store className="w-16 h-16 text-primary" />
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-black mb-4">AI Content Marketplace</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sell your AI-generated content and earn money. Platform fee: 15-20% per sale.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Upload Content</h3>
            <p className="text-muted-foreground">Generate and share your AI creations</p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Euro className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Set Your Price</h3>
            <p className="text-muted-foreground">You keep 80-85% of sales</p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Earn Money</h3>
            <p className="text-muted-foreground">Get paid via Stripe instantly</p>
          </Card>
        </div>

        {/* Browse Marketplace */}
        <div className="mb-12">
          <h2 className="text-3xl font-black mb-6">Browse Content</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {marketplaceItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <Badge className="absolute top-2 right-2 bg-primary">
                    €{item.price}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <div className="flex justify-between items-center text-sm mb-3">
                    <span className="text-muted-foreground">by {item.seller}</span>
                    <div className="flex items-center gap-1">
                      <ShoppingCart className="w-4 h-4" />
                      <span>{item.sales} sales</span>
                    </div>
                  </div>
                  <Button className="w-full">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Purchase
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Upload Form */}
        <Card className="p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Image className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">Upload Your Content</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Content Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Professional Logo Pack"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what buyers will get..."
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price (€)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Set your price"
                min="1"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You'll receive {price ? (parseFloat(price) * 0.85).toFixed(2) : "0.00"} after platform fee (15%)
              </p>
            </div>
            <Button onClick={handleUpload} className="w-full" size="lg">
              <Upload className="w-4 h-4 mr-2" />
              Upload & List Content
            </Button>
          </div>
        </Card>

        {/* Why It Works */}
        <div className="mt-12 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl font-black mb-4">Why AI Content Marketplace Works</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 text-left">
              <h4 className="font-semibold mb-2">High Demand</h4>
              <p className="text-sm text-muted-foreground">
                Businesses and creators need quality content fast. AI-generated assets provide unique,
                ready-to-use solutions.
              </p>
            </Card>
            <Card className="p-6 text-left">
              <h4 className="font-semibold mb-2">Quick Production</h4>
              <p className="text-sm text-muted-foreground">
                Generate content in minutes using OpenAI, list it instantly, and start earning
                passive income.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIContentMarketplace;
