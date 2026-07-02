import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, TrendingUp, DollarSign, Eye } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface InfluencerCardProps {
  influencer: {
    id: string;
    name: string;
    description: string | null;
    personality: string | null;
    niche: string | null;
    avatar_url: string | null;
    followers: number;
    engagement_rate: number | string;
    total_earnings: number | string;
    status: string;
  };
  onSelect: () => void;
}

const InfluencerCard = ({ influencer, onSelect }: InfluencerCardProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Influencer Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Influencer Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Influencer Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={influencer.avatar_url || ""} alt={influencer.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl">
            {influencer.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{influencer.name}</h3>
          <div className="flex gap-2 flex-wrap">
            {influencer.niche && (
              <Badge variant="secondary" className="text-xs">
                {influencer.niche}
              </Badge>
            )}
            <Badge
              variant={influencer.status === "active" ? "default" : "outline"}
              className="text-xs"
            >
              {influencer.status}
            </Badge>
          </div>
        </div>
      </div>

      {influencer.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {influencer.description}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-muted/50 rounded">
          <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Followers</p>
          <p className="font-semibold text-sm">{influencer.followers.toLocaleString()}</p>
        </div>

        <div className="text-center p-2 bg-muted/50 rounded">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Engagement</p>
          <p className="font-semibold text-sm">{Number(influencer.engagement_rate).toFixed(1)}%</p>
        </div>

        <div className="text-center p-2 bg-muted/50 rounded">
          <DollarSign className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Earned</p>
          <p className="font-semibold text-sm">€{Number(influencer.total_earnings).toFixed(0)}</p>
        </div>
      </div>

      <Button onClick={onSelect} className="w-full" variant="outline">
        <Eye className="h-4 w-4 mr-2" />
        View Dashboard
      </Button>
    </Card>
    </>
  );
};

export default InfluencerCard;
