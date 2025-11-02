import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Library, Download, DollarSign, Image } from "lucide-react";

const StockContentLibrary = () => {
  const content = [
    { title: "Abstract Landscape", downloads: 245, earnings: "$343", category: "Art" },
    { title: "Business Portrait", downloads: 189, earnings: "$265", category: "Business" },
    { title: "Nature Scene", downloads: 312, earnings: "$437", category: "Nature" },
    { title: "Tech Background", downloads: 156, earnings: "$218", category: "Tech" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Library className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Stock Content Library</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload AI content for licensing. You earn 70% per download.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Image className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Upload Content</h3>
            <p className="text-muted-foreground">Share your creations</p>
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

        <div className="mb-8">
          <Button size="lg" className="w-full md:w-auto">
            <Image className="w-4 h-4 mr-2" />
            Upload to Library
          </Button>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Your Stock Content</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {content.map((item, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <Badge variant="secondary">{item.category}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{item.earnings}</p>
                    <p className="text-sm text-muted-foreground">{item.downloads} downloads</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockContentLibrary;
