import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gift, Heart, DollarSign } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const VirtualGiftsShop = ({ onBack }: Props) => {
  const { data: gifts, isLoading } = useQuery({
    queryKey: ["platform-gifts-shop"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platform_gifts").select("*").order("price", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <FloatingHowItWorks title="How Virtual Gifts Shop works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>
      <div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Virtual Gifts Shop</h2>
        <p className="text-muted-foreground text-sm mt-1">Support your favorite artists with virtual gifts. 80% goes directly to the musician!</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gifts?.map((gift) => (
            <Card key={gift.id} className="hover:shadow-xl transition-all hover:scale-105 border hover:border-primary group">
              <CardHeader className="text-center pb-2">
                <div className="text-5xl mb-2 group-hover:scale-125 transition-transform">{gift.icon}</div>
                <CardTitle className="text-base">{gift.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{gift.category}</p>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <Badge className="text-lg px-4 py-1">€{gift.price.toFixed(2)}</Badge>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center justify-center gap-1"><Heart className="h-3 w-3 text-pink-500" />80% to artist</p>
                  <p className="flex items-center justify-center gap-1"><DollarSign className="h-3 w-3 text-emerald-500" />20% platform</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
    );
};
