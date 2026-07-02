import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, ShoppingCart, RefreshCw, ArrowLeft } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function EmotionMarket({ onBack }: { onBack?: () => void }) {
  const { toast } = useToast();
  const [listings, setListings] = useState<any[]>([]);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('emotion_market_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchListings();
    setIsRefreshing(false);
    toast({
      title: "Market Refreshed",
      description: "Latest listings loaded"
    });
  };

  const handleBuyEmotion = async (emotionType: string, amount: number, pricePerUnit: number, listingId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to buy emotions",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Redirecting to payment...",
        description: "Please wait while we prepare your checkout"
      });

      const { data, error } = await supabase.functions.invoke('create-emotion-market-checkout', {
        body: { emotionType, amount, pricePerUnit, listingId }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error buying emotion:', error);
      toast({
        title: "Error",
        description: "Failed to initiate purchase",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"Emotion Market"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      )}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Emotion Market</CardTitle>
              <CardDescription>Buy and sell emotions with other users</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={() => setShowCreateListing(!showCreateListing)}>
                {showCreateListing ? 'Close' : 'Create Listing'}
              </Button>
            </div>
          </div>
        </CardHeader>
        {showCreateListing && (
          <CardContent>
            <CreateListingForm onSuccess={() => {
              setShowCreateListing(false);
              fetchListings();
            }} />
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Sample listings */}
        <Card className="border-yellow-500/20 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Joy</CardTitle>
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                High Demand
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">50 units</span>
              <span className="text-lg font-semibold text-primary">€0.50/unit</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Total: €25.00</p>
              <p>Seller: @happyuser</p>
            </div>
            <Button className="w-full" onClick={() => handleBuyEmotion('joy', 50, 0.50)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy Joy
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Motivation</CardTitle>
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                Popular
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">100 units</span>
              <span className="text-lg font-semibold text-primary">€0.35/unit</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Total: €35.00</p>
              <p>Seller: @motivated123</p>
            </div>
            <Button className="w-full" onClick={() => handleBuyEmotion('motivation', 100, 0.35)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy Motivation
            </Button>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Love</CardTitle>
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                Trending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">30 units</span>
              <span className="text-lg font-semibold text-primary">€0.75/unit</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Total: €22.50</p>
              <p>Seller: @lovemaker</p>
            </div>
            <Button className="w-full" onClick={() => handleBuyEmotion('love', 30, 0.75)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy Love
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CreateListingForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    emotionType: "",
    amount: "",
    pricePerUnit: ""
  });

  const handleSubmit = async () => {
    if (!formData.emotionType || !formData.amount || !formData.pricePerUnit) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const totalPrice = parseFloat(formData.amount) * parseFloat(formData.pricePerUnit);

      const { error } = await supabase
        .from('emotion_market_listings')
        .insert({
          seller_id: user.id,
          emotion_type: formData.emotionType,
          amount: parseInt(formData.amount),
          price_per_unit: parseFloat(formData.pricePerUnit),
          total_price: totalPrice
        });

      if (error) throw error;

      toast({
        title: "Listing Created!",
        description: "Your emotions are now available on the market"
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid gap-4 border-t pt-4">
      <div className="space-y-2">
        <Label>Emotion Type</Label>
        <Select value={formData.emotionType} onValueChange={(value) => setFormData({ ...formData, emotionType: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select emotion..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="joy">Joy</SelectItem>
            <SelectItem value="love">Love</SelectItem>
            <SelectItem value="motivation">Motivation</SelectItem>
            <SelectItem value="excitement">Excitement</SelectItem>
            <SelectItem value="peace">Peace</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Amount</Label>
        <Input
          type="number"
          placeholder="How many units?"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Price per Unit (€)</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="Price per unit"
          value={formData.pricePerUnit}
          onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
        />
      </div>

      <Button onClick={handleSubmit}>Create Listing</Button>
    </div>
  );
}