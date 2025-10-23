import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function FashionChallenges() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Fashion Challenges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Súťaže budú dostupné čoskoro. Zúčastnite sa módnych výziev a vyhrajte ceny!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}