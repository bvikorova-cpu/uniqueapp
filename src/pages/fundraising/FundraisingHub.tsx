import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";

export default function FundraisingHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <h1 className="text-4xl font-black mb-4 text-foreground">Fundraising Hub</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
          Support causes you care about or create your own campaign
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button size="lg" onClick={() => navigate("/fundraising/dashboard")}>
            <Sparkles className="mr-2 h-4 w-4" /> My Campaigns
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/fundraising/medical/create")}>
            <Heart className="mr-2 h-4 w-4" /> Create Campaign
          </Button>
        </div>
      </section>
    </div>
  );
}
