import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Maximize2, BedDouble, DollarSign, Camera, Video, Megaphone, TrendingUp, Calculator, MessageSquare, Check, Plus, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyDetailDialog } from "@/components/property/PropertyDetailDialog";
import { LeadBoostDialog } from "@/components/property/LeadBoostDialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePropertyExpiration } from "@/hooks/usePropertyExpiration";

const LISTING_PACKAGES = [
  {
    id: "basic",
    name: "Basic Listing",
    price: 29,
    duration: "30 days",
    features: [
      "Photo gallery",
      "Property description",
      "Standard location on listings",
      "Email notifications"
    ],
    icon: Camera,
    popular: false
  },
  {
    id: "premium",
    name: "Premium Listing",
    price: 79,
    duration: "60 days",
    features: [
      "Video tour upload support",
      "Top placement in search",
      "3D virtual walkthrough",
      "Priority support",
      "Featured badge"
    ],
    icon: Video,
    popular: true
  },
  {
    id: "featured",
    name: "Featured Listing",
    price: 149,
    duration: "90 days",
    features: [
      "Homepage banner placement",
      "Social media sharing tools",
      "3D tour upload support",
      "Premium placement",
      "Priority customer support",
      "Advanced analytics dashboard"
    ],
    icon: Megaphone,
    popular: false
  }
];

const ADDITIONAL_SERVICES = [
  {
    id: "virtual_tour",
    name: "Virtual Tour Hosting",
    price: 99,
    description: "Add interactive 3D virtual tours to your property listings",
    icon: Video,
    active: true
  },
  {
    id: "lead_boost",
    name: "Lead Boost",
    price: 19,
    description: "Push listing to 1000+ potential buyers via email",
    icon: TrendingUp,
    active: true
  },
  {
    id: "home_decor",
    name: "Home Decor Marketplace",
    price: 7.99,
    description: "AI-powered room design + marketplace for decorations with AR preview",
    icon: Sparkles,
    isSubscription: true,
    link: "/home-decor"
  }
];

export default function PropertyMarketplace() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [leadBoostDialogOpen, setLeadBoostDialogOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    priceMin: "",
    priceMax: "",
    location: "",
    area: "",
    rooms: ""
  });

  // Hook for checking expired listings
  usePropertyExpiration();

  useEffect(() => {
    checkAuth();
    fetchProperties();
    
    // Handle payment success/cancel
    const payment = searchParams.get('payment');
    
    if (payment === 'success') {
      toast({
        title: "Payment Successful!",
        description: "Your listing has been activated.",
      });
    } else if (payment === 'cancelled') {
      toast({
        title: "Payment Canceled",
        description: "You can complete the payment later.",
        variant: "destructive"
      });
    }
  }, [searchParams]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(image_url, is_primary)
        `)
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewProperty = async (id: string) => {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (image_url, is_primary),
        property_videos (video_url)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load property details",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedProperty(data);
    setShowDetailDialog(true);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_images(image_url, is_primary)
        `)
        .eq('status', 'active');

      if (searchFilters.location) {
        query = query.or(`city.ilike.%${searchFilters.location}%,location.ilike.%${searchFilters.location}%`);
      }
      if (searchFilters.priceMin) {
        query = query.gte('price', parseFloat(searchFilters.priceMin));
      }
      if (searchFilters.priceMax) {
        query = query.lte('price', parseFloat(searchFilters.priceMax));
      }
      if (searchFilters.area) {
        query = query.gte('area_sqm', parseInt(searchFilters.area));
      }
      if (searchFilters.rooms) {
        query = query.gte('rooms', parseInt(searchFilters.rooms));
      }

      const { data, error } = await query
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error searching properties:', error);
      toast({
        title: "Error",
        description: "Failed to search properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to create a listing",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    navigate("/property-submission");
  };

  const handlePurchaseListing = (packageId: string, price: number) => {
    toast({
      title: "Coming Soon",
      description: `${packageId} listing package (€${price}) will be available soon!`,
    });
  };

  const handlePurchaseService = (serviceId: string, price: number, link?: string) => {
    if (link) {
      navigate(link);
      return;
    }
    
    if (serviceId === "virtual_tour") {
      // Virtual Tour Hosting is now active
      toast({
        title: "Virtual Tour Hosting",
        description: `After purchasing a property listing package, you can add 3D virtual tours to your properties from your dashboard.`,
      });
      return;
    }

    if (serviceId === "lead_boost") {
      setLeadBoostDialogOpen(true);
      return;
    }
    
    toast({
      title: "Coming Soon",
      description: `This service (€${price}) will be available soon!`,
    });
  };

  return (
    <div className="min-h-screen bg-background
      <div className="container mx-auto px-4 py-24">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-6 pt-12">
          <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Property Marketplace
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional platform for real estate agents and private sellers
          </p>
          <Button size="lg" className="mt-4" onClick={handleCreateListing}>
            <Plus className="mr-2 h-5 w-5" />
            Add Listing
          </Button>
        </div>

        {/* About Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">What is Property Marketplace?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Property Marketplace is a comprehensive real estate platform designed for both professional agents and private sellers. 
              Whether you're looking to buy your dream home, sell a property, or expand your real estate portfolio, our platform 
              provides all the tools you need for a successful transaction.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  How to List Your Property
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li><strong>Sign in</strong> to your account or create a new one</li>
                  <li>Click <strong>"Add Listing"</strong> button above</li>
                  <li>Fill in property details: location, price, area, rooms, and description</li>
                  <li>Upload <strong>high-quality photos</strong> of your property</li>
                  <li>Choose a <strong>listing package</strong> (Basic, Premium, or Featured)</li>
                  <li>Complete payment and your listing goes live immediately</li>
                </ol>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  How to Find a Property
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Use the <strong>search filters</strong> below to narrow your search</li>
                  <li>Filter by <strong>location, price range, area, and number of rooms</strong></li>
                  <li>Browse through available listings in the <strong>property grid</strong></li>
                  <li>Click on any property to view <strong>full details and photos</strong></li>
                  <li>Contact the seller directly through the <strong>built-in messaging system</strong></li>
                  <li>Save favorite properties to your <strong>wishlist</strong> for later</li>
                </ol>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">Listing Package Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-medium text-primary">Basic (€29)</div>
                  <p className="text-muted-foreground">30-day listing with photo gallery, property description, and email notifications. Perfect for private sellers.</p>
                </div>
                <div className="space-y-2">
                  <div className="font-medium text-primary">Premium (€79)</div>
                  <p className="text-muted-foreground">60-day listing with video tours, top search placement, 3D virtual walkthrough, featured badge, and priority support.</p>
                </div>
                <div className="space-y-2">
                  <div className="font-medium text-primary">Featured (€149)</div>
                  <p className="text-muted-foreground">90-day listing with homepage banner, social media tools, 3D tours, premium placement, and advanced analytics dashboard.</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Additional Services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>• Virtual Tour Hosting (€99):</strong> Add interactive 3D virtual tours to attract more buyers</li>
                <li><strong>• Lead Boost (€19):</strong> Push your listing to 1000+ potential buyers via email marketing</li>
                <li><strong>• Home Decor Marketplace (€7.99/month):</strong> AI-powered room design with AR preview for decorations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Search */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Find Your Perfect Property</CardTitle>
            <CardDescription>Use advanced filters to search properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="City, district..."
                    className="pl-9"
                    value={searchFilters.location}
                    onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Min €"
                    type="number"
                    value={searchFilters.priceMin}
                    onChange={(e) => setSearchFilters({...searchFilters, priceMin: e.target.value})}
                  />
                  <Input 
                    placeholder="Max €"
                    type="number"
                    value={searchFilters.priceMax}
                    onChange={(e) => setSearchFilters({...searchFilters, priceMax: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Area (m²)</label>
                <div className="relative">
                  <Maximize2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Min area..."
                    type="number"
                    className="pl-9"
                    value={searchFilters.area}
                    onChange={(e) => setSearchFilters({...searchFilters, area: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rooms</label>
                <Select value={searchFilters.rooms} onValueChange={(value) => setSearchFilters({...searchFilters, rooms: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Number of rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 room</SelectItem>
                    <SelectItem value="2">2 rooms</SelectItem>
                    <SelectItem value="3">3 rooms</SelectItem>
                    <SelectItem value="4">4+ rooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium invisible">Search</label>
                <Button className="w-full" onClick={handleSearch}>
                  Search Properties
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-black mb-8">Available Properties</h2>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onViewDetails={handleViewProperty}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">No properties found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search filters</p>
            </Card>
          )}
        </div>
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Listing Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LISTING_PACKAGES.map((pkg) => {
              const Icon = pkg.icon;
              return (
                <Card key={pkg.id} className={`relative ${pkg.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    <div className="text-4xl font-bold text-primary mt-4">
                      €{pkg.price}
                    </div>
                    <CardDescription className="text-base">
                      {pkg.duration}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => handlePurchaseListing(pkg.name, pkg.price)}
                      className="w-full"
                      variant={pkg.popular ? "default" : "outline"}
                    >
                      Choose Plan
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Additional Services */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Additional Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ADDITIONAL_SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{service.name}</CardTitle>
                          <CardDescription className="mt-2">{service.description}</CardDescription>
                          {service.isSubscription && (
                            <Badge variant="secondary" className="mt-2">€{service.price}/month</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {service.isSubscription ? '' : `€${service.price}`}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => handlePurchaseService(service.id, service.price, service.link)}
                      className="w-full"
                      variant="outline"
                    >
                      {service.link ? "Explore" : service.active ? "Learn More" : "Coming Soon"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Commission & Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Commission Rate</CardTitle>
                  <CardDescription>Fair and transparent pricing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">1% Commission</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or minimum €500 per sale
                  </p>
                </div>
                <p className="text-sm">
                  Only pay when your property sells successfully. No hidden fees, complete transparency.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Calculator className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Mortgage Calculator</CardTitle>
                  <CardDescription>Calculate monthly payments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input placeholder="Property price" type="number" />
                <Input placeholder="Down payment" type="number" />
                <Input placeholder="Interest rate %" type="number" step="0.1" />
                <Button variant="outline" className="w-full">
                  Calculate Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Platform Features</CardTitle>
            <CardDescription>Everything you need for successful property sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Virtual Tours & 360°</h3>
                <p className="text-sm text-muted-foreground">
                  Immersive property viewing experience
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Direct Messaging</h3>
                <p className="text-sm text-muted-foreground">
                  Connect directly with agents and buyers
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Financial Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Built-in mortgage and ROI calculators
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Market Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time market trends and insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Detail Dialog */}
      <PropertyDetailDialog
        property={selectedProperty}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />

      {/* Lead Boost Dialog */}
      <LeadBoostDialog
        open={leadBoostDialogOpen}
        onOpenChange={setLeadBoostDialogOpen}
      />
    </div>
  );
}
