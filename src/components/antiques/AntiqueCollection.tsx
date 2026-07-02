import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export const AntiqueCollection = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("antiques").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setItems(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading collection...</div>;

  if (items.length === 0) {
    return (
      <>
        <FloatingHowItWorks title="How Antique Collection works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <Card className="bg-card/80 backdrop-blur-xl">
        <CardContent className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Your analyzed antiques will appear here</p>
          <p className="text-sm text-muted-foreground mt-2">Upload and analyze your first antique to start your collection!</p>
        </CardContent>
      </Card>
      </>
      );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}>
          <Card className="bg-card/80 backdrop-blur-xl overflow-hidden">
            {item.image_url && (
              <img src={item.image_url} alt="Antique" className="w-full h-48 object-cover" />
            )}
            <CardHeader className="p-3">
              <CardTitle className="text-sm capitalize">{item.analysis_type} Analysis</CardTitle>
              <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
            </CardHeader>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
