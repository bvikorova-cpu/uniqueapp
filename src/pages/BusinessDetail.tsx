import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Phone, Mail, MessageCircle, Clock, Star, Euro } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ["business", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["business_products", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_products")
        .select("*")
        .eq("business_id", id)
        .eq("is_available", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ["business_reviews", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_reviews")
        .select("*")
        .eq("business_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      if (!data || data.length === 0) return [];

      // Fetch profiles separately
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      return data.map(review => ({
        ...review,
        profiles: profilesData?.find(p => p.id === review.user_id) || null
      }));
    },
  });

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Business not found</p>
            <Button onClick={() => navigate("/minibiz")}>Back to Marketplace</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleContact = (type: "phone" | "whatsapp" | "email") => {
    if (type === "phone" && business.phone) {
      window.location.href = `tel:${business.phone}`;
    } else if (type === "whatsapp" && business.whatsapp) {
      window.open(`https://wa.me/${business.whatsapp}`, "_blank");
    } else if (type === "email" && business.email) {
      window.location.href = `mailto:${business.email}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div
        className="h-64 bg-cover bg-center relative"
        style={{
          backgroundImage: business.cover_image_url
            ? `url(${business.cover_image_url})`
            : "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-end pb-8">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/minibiz")}
            className="absolute top-4 left-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-end gap-6">
            {business.logo_url && (
              <div className="w-24 h-24 rounded-full bg-background border-4 border-background shadow-lg overflow-hidden">
                <img
                  src={business.logo_url}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="text-white pb-2">
              <h1 className="text-4xl font-bold mb-2">{business.name}</h1>
              <div className="flex items-center gap-4 text-sm">
                <Badge className="bg-white/20 text-white">
                  {business.category}
                </Badge>
                {business.is_open_now && (
                  <Badge className="bg-green-500 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    Open Now
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{business.total_rating.toFixed(1)}</span>
                  <span className="text-white/70">
                    ({business.review_count} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="products">
              <TabsList className="w-full">
                <TabsTrigger value="products" className="flex-1">
                  Products
                </TabsTrigger>
                <TabsTrigger value="about" className="flex-1">
                  About
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">
                  Reviews ({reviews?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="mt-6">
                {products && products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="hover:shadow-lg transition-shadow">
                        {product.image_url && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                            <div className="flex items-center gap-1 text-lg font-bold text-primary">
                              <Euro className="h-5 w-5" />
                              {Number(product.price).toFixed(2)}
                            </div>
                          </div>
                          {product.description && (
                            <CardDescription className="text-sm">
                              {product.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">No products listed yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">About {business.name}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {business.description || "No description available."}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">
                                  {review.profiles?.full_name || "Anonymous"}
                                </span>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {review.comment}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(review.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">No reviews yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Contact Info */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{business.address}</p>
                    </div>
                  </div>
                )}

                {business.phone && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleContact("phone")}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {business.phone}
                  </Button>
                )}

                {business.whatsapp && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleContact("whatsapp")}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}

                {business.email && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleContact("email")}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {business.email}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
