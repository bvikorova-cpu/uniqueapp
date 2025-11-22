import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Map, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BusinessCard from "@/components/minibiz/BusinessCard";
import BusinessMap from "@/components/minibiz/BusinessMap";

export default function MiniBizMarketplace() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: businesses, isLoading } = useQuery({
    queryKey: ["businesses", searchQuery, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("businesses")
        .select("*")
        .eq("is_active", true);

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const categories = [
    { value: "all", label: "All" },
    { value: "restaurant", label: "Restaurant" },
    { value: "retail", label: "Retail" },
    { value: "services", label: "Services" },
    { value: "fashion", label: "Fashion" },
    { value: "food", label: "Food & Drink" },
    { value: "beauty", label: "Beauty" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-bold mb-4 flex items-center gap-3">
                <Store className="h-10 w-10 text-primary" />
                Mini Business Marketplace
              </h1>
              <p className="text-muted-foreground text-xl mb-6">
                Discover and support local businesses without websites
              </p>
              <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 space-y-3">
                <h2 className="text-lg font-semibold">How It Works</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>For Business Owners:</strong> Create your business profile for free. Add your menu, products, services, and contact information. Accept orders directly through the platform.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>For Customers:</strong> Browse local businesses, view their offerings, read reviews, and place orders. Contact businesses via phone or WhatsApp instantly.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Features:</strong> Search by category, view on map, leave reviews, place orders, and discover businesses near you that don't have traditional websites.</span>
                  </li>
                </ul>
              </div>
            </div>
            <Button onClick={() => navigate("/minibiz/create")} size="lg" className="self-start">
              <Plus className="h-5 w-5 mr-2" />
              Add Your Business
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search businesses by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="grid" className="space-y-6">
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              </div>
            ) : businesses && businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No businesses found. Be the first to add yours!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="map">
            <BusinessMap businesses={businesses || []} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
