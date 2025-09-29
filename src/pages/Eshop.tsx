import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Filter, Star, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Eshop = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const categories = [
    { id: "all", name: "Všetko" },
    { id: "clothing", name: "Oblečenie" },
    { id: "accessories", name: "Doplnky" },
    { id: "electronics", name: "Elektronika" },
    { id: "books", name: "Knihy" },
    { id: "sports", name: "Šport" },
  ];

  const products = [
    {
      id: 1,
      name: "Megatalent Tričko",
      price: 25.99,
      originalPrice: 35.99,
      category: "clothing",
      rating: 4.5,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
      badge: "Bestseller"
    },
    {
      id: 2,
      name: "Premium Mikina",
      price: 45.99,
      category: "clothing",
      rating: 4.8,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop",
      badge: "Nové"
    },
    {
      id: 3,
      name: "Bluetooth Slúchadlá",
      price: 79.99,
      category: "electronics",
      rating: 4.6,
      reviews: 203,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      badge: "Premium"
    },
    {
      id: 4,
      name: "Športová Fľaša",
      price: 15.99,
      category: "sports",
      rating: 4.3,
      reviews: 67,
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=300&h=300&fit=crop"
    },
    {
      id: 5,
      name: "Megatalent Čiapka",
      price: 19.99,
      originalPrice: 29.99,
      category: "accessories",
      rating: 4.4,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=300&h=300&fit=crop",
      badge: "Zľava"
    },
    {
      id: 6,
      name: "Motivačná Kniha",
      price: 12.99,
      category: "books",
      rating: 4.7,
      reviews: 342,
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop"
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (productName: string) => {
    toast({
      title: "Pridané do košíka",
      description: `${productName} bol pridaný do košíka`,
    });
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold">
            Megatalent{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Eshop
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Exkluzívne produkty a merchandise pre našu komunitu
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Hľadať produkty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Banner */}
        <Card className="mb-8 bg-gradient-gold text-gold-foreground">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="space-y-2 mb-4 md:mb-0">
                <h3 className="text-2xl font-bold">🔥 Exkluzívna zľava pre Premium členov</h3>
                <p className="text-lg">Získaj 20% zľavu na všetky produkty s Premium predplatným</p>
              </div>
              <Button variant="outline" className="border-gold-foreground text-gold-foreground hover:bg-gold-foreground hover:text-gold">
                Aktivovať zľavu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-glow transition-all duration-300 hover:scale-105">
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {product.badge && (
                    <Badge 
                      className={`absolute top-2 left-2 ${
                        product.badge === "Premium" ? "bg-primary" :
                        product.badge === "Nové" ? "bg-success" :
                        product.badge === "Zľava" ? "bg-destructive" :
                        "bg-gold"
                      }`}
                    >
                      {product.badge}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating) 
                            ? "text-gold fill-current" 
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviews})
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-primary">
                      €{product.price}
                    </div>
                    {product.originalPrice && (
                      <div className="text-sm text-muted-foreground line-through">
                        €{product.originalPrice}
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => handleAddToCart(product.name)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Do košíka
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">Žiadne produkty sa nenašli</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="mt-4"
            >
              Vymazať filtre
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Eshop;