import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CafeListProps {
  onSelectCafe: (cafeId: string) => void;
}

export const CafeList = ({ onSelectCafe }: CafeListProps) => {
  const { data: cafes, isLoading } = useQuery({
    queryKey: ['coffee-cafes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coffee_cafes')
        .select('*')
        .order('total_checkins', { ascending: false })
        .limit(12);

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div>Loading cafes...</div>;

  return (
    <>
      <FloatingHowItWorks title={"Cafe List - How it works"} steps={[{ title: 'Open', desc: 'Access the Cafe List section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Cafe List.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cafes?.map((cafe) => (
        <Card key={cafe.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            {cafe.image_url && (
              <img 
                src={cafe.image_url} 
                alt={cafe.name}
                className="w-full h-48 object-cover rounded-t-lg mb-4"
              />
            )}
            <CardTitle>{cafe.name}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {cafe.city}, {cafe.country}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{cafe.average_rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({cafe.total_reviews})</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {cafe.total_checkins} check-ins
              </span>
            </div>
            <Button className="w-full" onClick={() => onSelectCafe(cafe.id)}>
              Check In Here
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
    </>
  );
};