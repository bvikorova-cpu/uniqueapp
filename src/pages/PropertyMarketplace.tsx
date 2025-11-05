import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Maximize2, BedDouble, DollarSign, Camera, Video, Megaphone, TrendingUp, Calculator, MessageSquare, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      "Social media promotion",
      "3D tour upload support",
      "Premium placement",
      "Dedicated account manager",
      "Enhanced analytics"
    ],
    icon: Megaphone,
    popular: false
  }
];

const ADDITIONAL_SERVICES = [
  {
    id: "virtual_tour",
    name: "Virtual Tour Package",
    price: 99,
    description: "Professional 3D property walkthrough",
    icon: Video
  },
  {
    id: "lead_boost",
    name: "Lead Boost",
    price: 19,
    description: "Push listing to 1000+ potential buyers via email",
    icon: TrendingUp
  }
];

export default function PropertyMarketplace() {
  const { toast } = useToast();
  const [searchFilters, setSearchFilters] = useState({
    priceMin: "",
    priceMax: "",
    location: "",
    area: "",
    rooms: ""
  });

  const handlePurchaseListing = (packageId: string, price: number) => {
    toast({
      title: "Coming Soon",
      description: `${packageId} listing package (€${price}) will be available soon!`,
    });
  };

  const handlePurchaseService = (serviceId: string, price: number) => {
    toast({
      title: "Coming Soon",
      description: `This service (€${price}) will be available soon!`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Property Marketplace</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional platform for real estate agents and private sellers
          </p>
        </div>

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
                <Button className="w-full">
                  Search Properties
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listing Packages */}
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
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        €{service.price}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => handlePurchaseService(service.name, service.price)}
                      className="w-full"
                      variant="outline"
                    >
                      Add Service
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
    </div>
  );
}
