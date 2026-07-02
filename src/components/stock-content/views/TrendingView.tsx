import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Download, Euro, ImageIcon, Flame, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface TrendingViewProps {
  onBack: () => void;
}

export function TrendingView({ onBack }: TrendingViewProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('stock_content_items')
        .select('*')
        .eq('is_active', true)
        .order('total_downloads', { ascending: false })
        .limit(20);
      setItems(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <FloatingHowItWorks title={"Trending View - How it works"} steps={[{ title: 'Open', desc: 'Access the Trending View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Trending View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="w-6 h-6 text-rose-500" /> Trending Content</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20 text-center">
          <Flame className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-2xl font-black">#1 Trending</p>
          <p className="text-xs text-muted-foreground">Most downloaded this week</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-center">
          <Crown className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-black">Top Sellers</p>
          <p className="text-xs text-muted-foreground">Highest revenue creators</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-center">
          <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-black">Rising Stars</p>
          <p className="text-xs text-muted-foreground">New creators gaining traction</p>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading trending...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No trending content yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <Card key={item.id} className="flex items-center gap-4 p-4 hover:shadow-md transition-shadow">
              <span className="text-2xl font-black text-muted-foreground w-8 text-center">#{i + 1}</span>
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary/20 flex-shrink-0">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-muted-foreground" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{item.content_type}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Download className="w-3 h-3" />{item.total_downloads}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold flex items-center gap-0.5"><Euro className="w-3.5 h-3.5" />{item.price_eur?.toFixed(2)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
