import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Heart } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Submission {
  id: string;
  title: string;
  description: string | null;
  category: string;
  media_url: string | null;
  media_type: string | null;
  votes_count: number;
  created_at: string;
}

export const UserContests = ({ userId }: { userId: string }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const { data, error } = await supabase
        .from("talent_submissions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSubmissions(data);
      }
      setLoading(false);
    };

    fetchSubmissions();
  }, [userId]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (submissions.length === 0) {
    return (
    <>
      <FloatingHowItWorks title={"User Contests - How it works"} steps={[{ title: 'Open', desc: 'Access the User Contests section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in User Contests.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-8 text-center text-muted-foreground">
        No contest submissions yet
      </Card>
    </>
  );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id} className="p-4">
          <div className="flex items-start gap-4">
            {submission.media_url && (
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                {submission.media_type?.startsWith('image') ? (
                  <img
                    src={submission.media_url}
                    alt={submission.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={submission.media_url}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{submission.title}</h3>
                  <Badge variant="secondary" className="mt-1">
                    <Trophy className="h-3 w-3 mr-1" />
                    {submission.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Heart className="h-5 w-5" />
                  <span className="font-semibold">{submission.votes_count}</span>
                </div>
              </div>
              {submission.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {submission.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(submission.created_at).toLocaleDateString("en-US")}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
