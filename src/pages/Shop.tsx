import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingBag, Loader2 } from "lucide-react";
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, type ShopifyProduct } from "@/config/shopify";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  "All",
  "Action Figures",
  "Dolls & Plush",
  "Educational",
  "Games & Puzzles",
  "Vehicles",
  "Arts & Crafts",
  "Outdoor Toys"
];

export default function Shop() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching products from Shopify...');
        const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 50 });
        console.log('Shopify response:', data);
        
        if (data.data?.products?.edges) {
          setProducts(data.data.products.edges);
          console.log(`Found ${data.data.products.edges.length} products`);
          
          if (data.data.products.edges.length === 0) {
            toast.info("No products published yet", {
              description: "Please wait a moment or check in Shopify admin if the product is published to the 'Online Store' channel."
            });
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error("Error loading products", {
          description: error instanceof Error ? error.message : "Unknown error"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;

    addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions
    });
    
    toast.success("Added to cart", {
      description: product.node.title
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "All" || 
      product.node.productType?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      product.node.tags?.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesSearch = product.node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.node.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            🧸 Kids Toy Store
          </Link>
          <CartDrawer />
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-subtle py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to Our Toy Store
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            The best toys for your kids
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8">
          <Input
            type="search"
            placeholder="Search for toys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Products</h2>
            <p className="text-muted-foreground mb-4">
              We don't have any products yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Tell me what toys you'd like to add and I'll create them for you!
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No matches found</h2>
            <p className="text-muted-foreground">
              Try adjusting your search or filter selection
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const image = product.node.images.edges[0]?.node;
              const price = product.node.priceRange.minVariantPrice;
              
              return (
                <Card key={product.node.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/product/${product.node.handle}`}>
                    <div className="aspect-square bg-secondary/20 overflow-hidden">
                      {image ? (
                        <img
                          src={image.url}
                          alt={image.altText || product.node.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <CardContent className="p-4">
                    <Link to={`/product/${product.node.handle}`}>
                      <h3 className="font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
                        {product.node.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-2xl font-bold">
                        {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                      </span>
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
