import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, ArrowRightLeft, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface SkillOffering {
  id: string;
  title: string;
  description: string;
  category: string;
  price_per_hour: number | null;
  is_active: boolean | null;
}

interface SkillSwapProfile {
  skills_offered: string[] | null;
  skills_wanted: string[] | null;
  completed_exchanges: number | null;
  rating_average: number | null;
}

interface MySkillsHubProps {
  userId: string;
  isOwnProfile: boolean;
}

export const MySkillsHub = ({ userId, isOwnProfile }: MySkillsHubProps) => {
  const [offerings, setOfferings] = useState<SkillOffering[]>([]);
  const [swapProfile, setSwapProfile] = useState<SkillSwapProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      // Load marketplace offerings
      const { data: offeringsData } = await supabase
        .from("skill_offerings")
        .select("id, title, description, category, price_per_hour, is_active")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      setOfferings(offeringsData || []);

      // Load skill swap profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("skills_offered, skills_wanted, completed_exchanges, rating_average")
        .eq("id", userId)
        .single();

      setSwapProfile(profileData);
    } catch (error) {
      console.error("Error loading skills data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"My Skills Hub - How it works"} steps={[{ title: 'Open', desc: 'Access the My Skills Hub section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in My Skills Hub.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </Card>
    </>
  );
  }

  return (
    <Tabs defaultValue="marketplace" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="marketplace">
          <Sparkles className="h-4 w-4 mr-2" />
          Marketplace
        </TabsTrigger>
        <TabsTrigger value="swap">
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Skill Swap
        </TabsTrigger>
      </TabsList>

      <TabsContent value="marketplace" className="mt-4 space-y-4">
        {offerings.length === 0 ? (
          <Card className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No service offerings yet</p>
            {isOwnProfile && (
              <Button onClick={() => navigate("/marketplace?action=create")}>
                Create Service Offering
              </Button>
            )}
          </Card>
        ) : (
          <>
            {isOwnProfile && (
              <div className="flex justify-end">
                <Button onClick={() => navigate("/marketplace?action=create")}>
                  + New Offering
                </Button>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {offerings.map((offering) => (
                <Card key={offering.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{offering.title}</h3>
                    <Badge variant={offering.is_active ? "default" : "secondary"}>
                      {offering.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {offering.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{offering.category}</Badge>
                      {offering.price_per_hour && (
                        <span className="font-bold text-primary">€{offering.price_per_hour}/hr</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </TabsContent>

      <TabsContent value="swap" className="mt-4 space-y-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {swapProfile?.completed_exchanges || 0}
                </div>
                <div className="text-xs text-muted-foreground">Exchanges</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-2xl font-bold">
                    {swapProfile?.rating_average?.toFixed(1) || "0.0"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
            </div>
            {isOwnProfile && (
              <Button variant="outline" onClick={() => navigate("/skill-swap/profile/edit")}>
                Edit Skills
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Skills I Can Teach
              </h4>
              {swapProfile?.skills_offered && swapProfile.skills_offered.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {swapProfile.skills_offered.map((skill, i) => (
                    <Badge key={i} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No skills listed</p>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-primary" />
                Skills I Want to Learn
              </h4>
              {swapProfile?.skills_wanted && swapProfile.skills_wanted.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {swapProfile.skills_wanted.map((skill, i) => (
                    <Badge key={i} variant="outline">{skill}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No skills listed</p>
              )}
            </div>
          </div>
        </Card>

        {isOwnProfile && (
          <div className="flex justify-center">
            <Button onClick={() => navigate("/skill-swap")}>
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Go to Skill Swap
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
