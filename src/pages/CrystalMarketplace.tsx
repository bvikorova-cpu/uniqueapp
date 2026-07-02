import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gem, ShoppingCart, Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useOneOffPaymentVerify } from "@/hooks/useOneOffPaymentVerify";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SellerConnectGate } from "@/components/commerce/SellerConnectGate";

interface CrystalItem {
  id: string;
  title: string;
  description: string;
  crystal_type: string;
  weight_grams: number;
  price: number;
  image_url: string;
  energy_profile: any;
  authenticity_certificate: string;
  views_count: number;
}

export default function CrystalMarketplace() {
  const [items, setItems] = useState<CrystalItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [listingForm, setListingForm] = useState({
    title: "",
    description: "",
    crystal_type: "",
    weight_grams: "",
    price: "",
  });
  const [submittingListing, setSubmittingListing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useOneOffPaymentVerify({
    fn: "verify-crystal-purchase",
    successTitle: "Crystal purchased!",
    successDescription: "Your order has been confirmed. The seller will ship it shortly.",
    onSuccess: () => loadItems(),
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from("crystal_marketplace_items")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error loading items:", error);
      toast({
        title: "Error",
        description: "Failed to load marketplace items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (itemId: string) => {
    try {
      setPurchasingItem(itemId);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Login Required",
          description: "Please sign in to purchase crystals",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // For demo, use mock shipping address
      const shippingAddress = {
        street: "123 Crystal Street",
        city: "Energy City",
        country: "Crystal Kingdom",
        postal_code: "12345",
      };

      const { data, error } = await supabase.functions.invoke("create-crystal-purchase", {
        body: { itemId, shippingAddress },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Error",
        description: "Failed to start purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchasingItem(null);
    }
  };

  const handleSubmitListing = async () => {
    try {
      setSubmittingListing(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Login Required", description: "Please sign in to list a crystal", variant: "destructive" });
        navigate("/auth");
        return;
      }

      if (!listingForm.title || !listingForm.description || !listingForm.crystal_type || !listingForm.price) {
        toast({ title: "Missing Fields", description: "Please fill all required fields", variant: "destructive" });
        return;
      }

      const { error } = await supabase.from("crystal_marketplace_items").insert({
        seller_id: session.user.id,
        title: listingForm.title,
        description: listingForm.description,
        crystal_type: listingForm.crystal_type,
        weight_grams: listingForm.weight_grams ? parseFloat(listingForm.weight_grams) : null,
        price: parseFloat(listingForm.price),
        is_available: true,
      });

      if (error) throw error;

      toast({ title: "Crystal Listed!", description: "Your crystal has been added to the marketplace." });
      setListDialogOpen(false);
      setListingForm({ title: "", description: "", crystal_type: "", weight_grams: "", price: "" });
      loadItems();
    } catch (error) {
      console.error("Listing error:", error);
      toast({ title: "Error", description: "Failed to create listing", variant: "destructive" });
    } finally {
      setSubmittingListing(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.crystal_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <FloatingHowItWorks title="How Crystal Marketplace works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-background to-pink-500/10" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <div className="inline-block mb-6 px-6 py-2 bg-violet-500/20 rounded-full border border-violet-500/30">
            <span className="text-violet-600 dark:text-violet-400 font-semibold text-sm uppercase tracking-wider">
              Crystal Marketplace
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Authentic Crystals Worldwide
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Buy and sell verified crystals with AI-powered authenticity certificates and energy profiles. 15% platform commission on all sales.
          </p>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search crystals by name or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>

          <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                List Your Crystal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>List Your Crystal for Sale</DialogTitle>
                <DialogDescription>
                  Add your crystal to the marketplace. 15% platform commission on sales.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <SellerConnectGate />
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Natural Amethyst Cluster"
                    value={listingForm.title}
                    onChange={(e) => setListingForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crystal_type">Crystal Type *</Label>
                  <Select
                    value={listingForm.crystal_type}
                    onValueChange={(v) => setListingForm(f => ({ ...f, crystal_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Amethyst", "Rose Quartz", "Clear Quartz", "Citrine", "Black Tourmaline", "Selenite", "Labradorite", "Obsidian", "Fluorite", "Moonstone", "Other"].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your crystal, origin, quality..."
                    value={listingForm.description}
                    onChange={(e) => setListingForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (grams)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="e.g. 150"
                      value={listingForm.weight_grams}
                      onChange={(e) => setListingForm(f => ({ ...f, weight_grams: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (€) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 29.99"
                      value={listingForm.price}
                      onChange={(e) => setListingForm(f => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleSubmitListing}
                  disabled={submittingListing}
                >
                  {submittingListing ? "Listing..." : "List Crystal for Sale"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading crystals...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Gem className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl font-semibold mb-2">No Crystals Found</p>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Check back soon for new listings"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all">
                <div className="aspect-square relative bg-gradient-to-br from-violet-500/10 to-pink-500/10">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gem className="h-24 w-24 text-violet-500/50" />
                    </div>
                  )}
                  <Badge className="absolute top-4 right-4 bg-violet-600">
                    {item.crystal_type}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="font-semibold">{item.weight_grams}g</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Views:</span>
                    <span className="font-semibold">{item.views_count}</span>
                  </div>
                  {item.authenticity_certificate && (
                    <Badge variant="outline" className="w-full justify-center">
                      ✓ AI Verified Authentic
                    </Badge>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-violet-600">
                        €{item.price.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      className="w-full gap-2"
                      onClick={() => handlePurchase(item.id)}
                      disabled={purchasingItem === item.id}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {purchasingItem === item.id ? "Processing..." : "Purchase Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-violet-600" />
                AI Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Every crystal is verified using advanced AI analysis to ensure authenticity and quality.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-violet-600" />
                Secure Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All payments processed securely through Stripe with buyer protection guaranteed.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-violet-600" />
                Energy Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Each crystal comes with a detailed AI-generated energy profile and healing properties.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
    );
}
