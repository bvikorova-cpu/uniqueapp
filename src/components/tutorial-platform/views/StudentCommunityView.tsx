import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Users, Send, MessageCircle, ThumbsUp, Clock } from "lucide-react";

const mockThreads = [
  { id: 1, title: "How to handle async state in React?", author: "StudentJohn", replies: 12, likes: 34, time: "2h ago", course: "Web Development" },
  { id: 2, title: "Best resources for ML math prerequisites?", author: "DataSarah", replies: 8, likes: 21, time: "5h ago", course: "Machine Learning" },
  { id: 3, title: "SEO vs Paid Ads — what works better in 2026?", author: "MarketMike", replies: 24, likes: 56, time: "1d ago", course: "Digital Marketing" },
  { id: 4, title: "Python decorators explained simply", author: "PyEmily", replies: 6, likes: 18, time: "1d ago", course: "Python" },
  { id: 5, title: "Figma vs Framer for prototyping?", author: "DesignAlex", replies: 15, likes: 42, time: "2d ago", course: "UX Design" },
];

interface Props { onBack: () => void; }

export function StudentCommunityView({ onBack }: Props) {
  const [newThread, setNewThread] = useState(false);

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black flex items-center gap-2"><Users className="w-6 h-6 text-sky-500" />Student Community</h2>
        <Button onClick={() => setNewThread(!newThread)}><MessageCircle className="w-4 h-4 mr-2" />New Thread</Button>
      </div>

      {newThread && (
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-3">
            <Input placeholder="Thread title..." />
            <Textarea placeholder="What's on your mind?" rows={3} />
            <Button><Send className="w-4 h-4 mr-2" />Post Thread</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {mockThreads.map(thread => (
          <Card key={thread.id} className="p-4 hover:shadow-md cursor-pointer transition-all">
            <h3 className="font-semibold mb-1">{thread.title}</h3>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>by {thread.author}</span>
              <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{thread.replies}</span>
              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{thread.likes}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{thread.time}</span>
              <span className="text-emerald-500">{thread.course}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
