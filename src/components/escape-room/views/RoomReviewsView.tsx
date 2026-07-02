import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function RoomReviewsView({ onBack }: Props) {
  const reviews = [
    { room: "Haunted Manor", user: "Alex M.", rating: 5, text: "Absolutely terrifying! Best horror escape room I've ever played. The puzzles are brilliantly designed.", time: "2 hours ago" },
    { room: "Cyberpunk Heist 2077", user: "Sarah K.", rating: 4, text: "Great atmosphere and creative puzzles. Some hints were too vague though.", time: "5 hours ago" },
    { room: "Dragon's Lair", user: "Mike R.", rating: 5, text: "Epic fantasy setting! The riddles fit perfectly with the medieval theme.", time: "1 day ago" },
    { room: "Mars Colony Mystery", user: "Emily L.", rating: 4, text: "Really immersive sci-fi experience. Loved the space station puzzles.", time: "2 days ago" },
    { room: "Detective's Office", user: "Tom H.", rating: 5, text: "Perfect mystery room! Felt like a real detective investigation.", time: "3 days ago" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Room Reviews View - How it works"} steps={[{ title: 'Open', desc: 'Access the Room Reviews View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Room Reviews View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Room Reviews</h2>
            <p className="text-muted-foreground">Community ratings & feedback</p>
          </div>
        </div>

        <div className="space-y-3">
          {reviews.map((r, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-sm">{r.room}</div>
                    <div className="text-xs text-muted-foreground">by {r.user} • {r.time}</div>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                    {"⭐".repeat(r.rating)} {r.rating}/5
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{r.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
