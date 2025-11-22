import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Library, Upload, Download, DollarSign, Euro } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UploadContentDialog } from "@/components/stock-library/UploadContentDialog";
import { ContentGrid } from "@/components/stock-library/ContentGrid";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const StockContentLibrary = () => {
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [allContent, setAllContent] = useState<any[]>([]);
  const [myContent, setMyContent] = useState<any[]>([]);
  const [myEarnings, setMyEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      // Load all content
      const { data: allData, error: allError } = await supabase
        .from('stock_content_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (allError) throw allError;
      setAllContent(allData || []);

      // Load my content if authenticated
      if (user) {
        const { data: myData, error: myError } = await supabase
          .from('stock_content_items')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (myError) throw myError;
        setMyContent(myData || []);

        // Calculate total earnings
        const totalRevenue = myData?.reduce((sum, item) => sum + parseFloat(String(item.total_revenue_eur || 0)), 0) || 0;
        const totalDownloads = myData?.reduce((sum, item) => sum + (item.total_downloads || 0), 0) || 0;
        
        setMyEarnings({
          total_revenue: totalRevenue * 0.7, // 70% for creator
          total_downloads: totalDownloads,
          items_count: myData?.length || 0
        });
      }
    } catch (error: any) {
      console.error("Error loading content:", error);
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <Library className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Stock Content Library</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload AI content for licensing. You earn 70% per download.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Upload Content</h3>
            <p className="text-muted-foreground">Share your AI creations</p>
          </Card>
          <Card className="p-6 text-center">
            <Download className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Get Downloads</h3>
            <p className="text-muted-foreground">People license your work</p>
          </Card>
          <Card className="p-6 text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Earn Passive Income</h3>
            <p className="text-muted-foreground">70% of each sale</p>
          </Card>
        </div>

        {userId && (
          <div className="mb-8">
            <Button size="lg" onClick={() => setUploadDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload to Library
            </Button>
          </div>
        )}

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Browse Content</TabsTrigger>
            {userId && (
              <>
                <TabsTrigger value="mycontent">My Content ({myContent.length})</TabsTrigger>
                <TabsTrigger value="earnings">My Earnings</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="browse">
            {loading ? (
              <div className="text-center py-12">Loading content...</div>
            ) : (
              <ContentGrid items={allContent} />
            )}
          </TabsContent>

          {userId && (
            <>
              <TabsContent value="mycontent">
                {loading ? (
                  <div className="text-center py-12">Loading your content...</div>
                ) : (
                  <ContentGrid items={myContent} />
                )}
              </TabsContent>

              <TabsContent value="earnings">
                {myEarnings && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="p-6">
                      <div className="flex items-center gap-4">
                        <Euro className="w-12 h-12 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Earnings</p>
                          <p className="text-3xl font-bold">€{myEarnings.total_revenue.toFixed(2)}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6">
                      <div className="flex items-center gap-4">
                        <Download className="w-12 h-12 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Downloads</p>
                          <p className="text-3xl font-bold">{myEarnings.total_downloads}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6">
                      <div className="flex items-center gap-4">
                        <Library className="w-12 h-12 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Items Published</p>
                          <p className="text-3xl font-bold">{myEarnings.items_count}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      <Footer />

      <UploadContentDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={loadData}
      />
    </div>
  );
};

export default StockContentLibrary;