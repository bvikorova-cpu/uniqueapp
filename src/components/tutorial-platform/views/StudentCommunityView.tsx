import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Send, MessageCircle, ThumbsUp, Clock, Flame, Pin } from "lucide-react";
import { toast } from "sonner";

const mockThreads = [
  { id: 1, title: "How to handle async state in React?", author: "StudentJohn", replies: 12, likes: 34, time: "2h ago", course: "Web Development", pinned: true, hot: true },
  { id: 2, title: "Best resources for ML math prerequisites?", author: "DataSarah", replies: 8, likes: 21, time: "5h ago", course: "Machine Learning", pinned: false, hot: false },
  { id: 3, title: "SEO vs Paid Ads — what works better in 2026?", author: "MarketMike", replies: 24, likes: 56, time: "1d ago", course: "Digital Marketing", pinned: false, hot: true },
  { id: 4, title: "Python decorators explained simply", author: "PyEmily", replies: 6, likes: 18, time: "1d ago", course: "Python", pinned: false, hot: false },
  { id: 5, title: "Figma vs Framer for prototyping?", author: "DesignAlex", replies: 15, likes: 42, time: "2d ago", course: "UX Design", pinned: false, hot: false },
  { id: 6, title: "Tips for building a portfolio that stands out", author: "CreativeMax", replies: 31, likes: 78, time: "3d ago", course: "Career", pinned: false, hot: true },
];

interface Props { onBack: () => void; }

export function StudentCommunityView({ onBack }: Props) {
  const [newThread, setNewThread] = useState(false);
  const [threads, setThreads] = useState(mockThreads);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handlePost = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and content required");
      return;
    }
    setThreads([{
      id: Date.now(),
      title: title.trim(),
      author: "You",
      replies: 0,
      likes: 0,
      time: "now",
      course: "General",
      pinned: false,
      hot: false,
    }, ...threads]);
    setTitle(""); setBody("");
    setNewThread(false);
    toast.success("Thread posted!");
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Student Community</h2>
            <p className="text-sm text-muted-foreground">{mockThreads.length} active discussions</p>
          </div>
        </div>
        <Button onClick={() => setNewThread(!newThread)} className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
          <MessageCircle className="w-4 h-4 mr-2" />New Thread
        </Button>
      </div>

      {newThread && (
        <Card className="mb-6 border-sky-500/20">
          <CardContent className="pt-6 space-y-3">
            <Input placeholder="Thread title..." className="h-11" />
            <Textarea placeholder="What's on your mind? Share your question or insight..." rows={4} />
            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-sky-500 to-blue-600" onClick={() => toast.info("Post Thread — coming soon")}><Send className="w-4 h-4 mr-2" />Post Thread</Button>
              <Button variant="outline" onClick={() => setNewThread(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {mockThreads.map(thread => (
          <Card key={thread.id} className={`p-4 hover:shadow-lg cursor-pointer transition-all ${thread.pinned ? "border-amber-500/20 bg-amber-500/5" : ""}`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center shrink-0 mt-0.5 text-sm font-bold">
                {thread.author.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {thread.pinned && <Pin className="w-3.5 h-3.5 text-amber-500" />}
                  <h3 className="font-bold">{thread.title}</h3>
                  {thread.hot && <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-[9px] px-1.5 py-0"><Flame className="w-2.5 h-2.5 mr-0.5" />Hot</Badge>}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1.5">
                  <span className="font-medium">{thread.author}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{thread.replies}</span>
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{thread.likes}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{thread.time}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5">{thread.course}</Badge>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}