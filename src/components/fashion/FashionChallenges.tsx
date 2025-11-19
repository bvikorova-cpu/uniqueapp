import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FashionChallenges() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Fashion Challenges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Challenges Coming Soon!</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Participate in weekly fashion design challenges, compete with other creators, and win amazing prizes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Weekly Themes</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                New design challenges every week with different themes and styles
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Community Voting</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Get your designs voted by the community and climb the leaderboard
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Award className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Exclusive Prizes</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Win AI credits, premium features, and showcase your work
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Rankings & Badges</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Earn achievements and build your reputation as a fashion designer
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center pt-4">
          <Button size="lg" disabled>
            <Trophy className="mr-2 h-5 w-5" />
            Join Waitlist
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Be the first to know when challenges launch
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
