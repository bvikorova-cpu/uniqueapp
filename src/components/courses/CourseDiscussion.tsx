import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Pin, CheckCircle, Eye, Send, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Discussion {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_answered: boolean;
  views_count: number;
  created_at: string;
  user_id: string;
  reply_count: number;
}

interface Reply {
  id: string;
  content: string;
  is_instructor_reply: boolean;
  is_accepted_answer: boolean;
  created_at: string;
  user_id: string;
}

interface CourseDiscussionProps {
  courseId: string;
  userHasAccess: boolean;
  isInstructor: boolean;
}

export const CourseDiscussion = ({ courseId, userHasAccess, isInstructor }: CourseDiscussionProps) => {
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ["course-discussions", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_discussions")
        .select(`
          *,
          discussion_replies(count)
        `)
        .eq("course_id", courseId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(d => ({
        ...d,
        reply_count: Array.isArray(d.discussion_replies) ? d.discussion_replies.length : 0
      })) as Discussion[];
    },
  });

  const { data: replies = [] } = useQuery({
    queryKey: ["discussion-replies", selectedDiscussion],
    queryFn: async () => {
      if (!selectedDiscussion) return [];
      
      const { data, error } = await supabase
        .from("discussion_replies")
        .select("*")
        .eq("discussion_id", selectedDiscussion)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Reply[];
    },
    enabled: !!selectedDiscussion,
  });

  const createDiscussion = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("course_discussions")
        .insert({
          course_id: courseId,
          user_id: user.id,
          title: newTitle,
          content: newContent,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-discussions", courseId] });
      setNewTitle("");
      setNewContent("");
      setShowNewTopic(false);
      toast({ title: "Success", description: "Discussion topic created" });
    },
  });

  const createReply = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("discussion_replies")
        .insert({
          discussion_id: selectedDiscussion,
          user_id: user.id,
          content: replyContent,
          is_instructor_reply: isInstructor,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussion-replies", selectedDiscussion] });
      setReplyContent("");
      toast({ title: "Success", description: "Reply posted" });
    },
  });

  const incrementViews = async (discussionId: string) => {
    const { data: discussion } = await supabase
      .from("course_discussions")
      .select("views_count")
      .eq("id", discussionId)
      .single();
    
    if (discussion) {
      await supabase
        .from("course_discussions")
        .update({ views_count: (discussion.views_count || 0) + 1 })
        .eq("id", discussionId);
    }
  };

  const handleSelectDiscussion = (id: string) => {
    setSelectedDiscussion(id);
    incrementViews(id);
  };

  if (!userHasAccess) {
    return (
      <>
        <FloatingHowItWorks title="How Course Discussion works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Enroll in this course to join the discussion</p>
        </CardContent>
      </Card>
      </>
      );
  }

  if (selectedDiscussion) {
    const discussion = discussions.find(d => d.id === selectedDiscussion);
    if (!discussion) return null;

    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelectedDiscussion(null)}>
          ← Back to Discussions
        </Button>

        <Card>
          <CardHeader>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {discussion.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                {discussion.is_answered && <CheckCircle className="h-4 w-4 text-green-500" />}
                <CardTitle>{discussion.title}</CardTitle>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {discussion.views_count} views
                </div>
                <span>{formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{discussion.content}</p>
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{replies.length} Replies</h3>
          {replies.map((reply) => (
            <Card key={reply.id} className={reply.is_instructor_reply ? "border-primary" : ""}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {reply.is_instructor_reply && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Instructor
                        </Badge>
                      )}
                      {reply.is_accepted_answer && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                          Accepted Answer
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reply Form */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Textarea
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
            />
            <Button
              onClick={() => createReply.mutate()}
              disabled={!replyContent.trim() || createReply.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              Post Reply
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Course Discussions</h3>
        <Button onClick={() => setShowNewTopic(!showNewTopic)}>
          <MessageSquare className="mr-2 h-4 w-4" />
          New Topic
        </Button>
      </div>

      {showNewTopic && (
        <Card>
          <CardHeader>
            <CardTitle>Start a Discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Discussion title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div>
              <Textarea
                placeholder="What would you like to discuss?"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={5}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => createDiscussion.mutate()}
                disabled={!newTitle.trim() || !newContent.trim() || createDiscussion.isPending}
              >
                Post Discussion
              </Button>
              <Button variant="outline" onClick={() => setShowNewTopic(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="text-center text-muted-foreground">Loading discussions...</p>}

      {!isLoading && discussions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No discussions yet. Start the conversation!</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {discussions.map((discussion) => (
          <Card
            key={discussion.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleSelectDiscussion(discussion.id)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {discussion.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                    {discussion.is_answered && <CheckCircle className="h-4 w-4 text-green-500" />}
                    <h4 className="font-semibold hover:text-primary">{discussion.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{discussion.content}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {discussion.reply_count} replies
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {discussion.views_count} views
                    </div>
                    <span>{formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
