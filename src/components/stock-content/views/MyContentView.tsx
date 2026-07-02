import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ImageIcon, Download, Euro, Layers, Upload, Trash2, ShieldCheck, ShieldAlert, FileSignature } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReleaseManagerDialog } from "../ReleaseManagerDialog";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface MyContentViewProps {
  onBack: () => void;
  onUpload: () => void;
}

export function MyContentView({ onBack, onUpload }: MyContentViewProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [releaseItem, setReleaseItem] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('stock_content_items')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  return (
    <>
      <FloatingHowItWorks title={"My Content View - How it works"} steps={[{ title: 'Open', desc: 'Access the My Content View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in My Content View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Layers className="w-6 h-6 text-indigo-500" /> My Content</h2>
          <Badge variant="secondary">{items.length} items</Badge>
        </div>
        <Button onClick={onUpload}><Upload className="w-4 h-4 mr-1" /> Upload New</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No content uploaded yet</h3>
          <p className="text-muted-foreground mb-4">Start earning by uploading your digital creations</p>
          <Button onClick={onUpload}><Upload className="w-4 h-4 mr-1" /> Upload Your First Asset</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-40 bg-secondary/20">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-muted-foreground" /></div>
                )}
                <Badge className="absolute top-2 right-2" variant={item.is_active ? "default" : "destructive"}>
                  {item.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {item.total_downloads} downloads</span>
                  <Badge variant="outline">{item.content_type}</Badge>
                </div>
                {item.requires_release && (
                  <Badge className={`mb-2 text-[10px] ${item.releases_verified ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'}`}>
                    {item.releases_verified ? <ShieldCheck className="w-3 h-3 mr-1" /> : <ShieldAlert className="w-3 h-3 mr-1" />}
                    {item.releases_verified ? 'Releases verified' : 'Releases pending'}
                  </Badge>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold flex items-center gap-0.5"><Euro className="w-3.5 h-3.5" />{item.price_eur?.toFixed(2)}</span>
                  <span className="text-sm text-green-500 font-semibold">€{(parseFloat(String(item.total_revenue_eur || 0)) * 0.7).toFixed(2)} earned</span>
                </div>
                <Button size="sm" variant="outline" className="w-full" onClick={() => setReleaseItem({ id: item.id, title: item.title })}>
                  <FileSignature className="w-3.5 h-3.5 mr-1" /> Manage releases
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {releaseItem && (
        <ReleaseManagerDialog
          open={!!releaseItem}
          onOpenChange={(o) => { if (!o) { setReleaseItem(null); loadContent(); } }}
          contentItemId={releaseItem.id}
          contentTitle={releaseItem.title}
        />
      )}
    </div>
    </>
  );
}
