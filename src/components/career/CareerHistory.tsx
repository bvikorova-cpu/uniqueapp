import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

const CareerHistory = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [cvs, setCvs] = useState<any[]>([]);
  const [linkedinEnhancements, setLinkedinEnhancements] = useState<any[]>([]);
  const [negotiations, setNegotiations] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [interviewsRes, cvsRes, linkedinRes, negotiationsRes] = await Promise.all([
        supabase.from("interview_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("cv_documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("linkedin_enhancements").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("negotiation_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      setInterviews(interviewsRes.data || []);
      setCvs(cvsRes.data || []);
      setLinkedinEnhancements(linkedinRes.data || []);
      setNegotiations(negotiationsRes.data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const downloadCV = (cv: any) => {
    const doc = new jsPDF();
    const content = cv.optimized_content || cv.original_content;
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 15, 15);
    doc.save(`${cv.title}.pdf`);
    toast({ title: "Downloaded", description: "CV downloaded as PDF" });
  };

  const deleteItem = async (table: "interview_sessions" | "cv_documents" | "linkedin_enhancements" | "negotiation_sessions", id: string) => {
    try {
      await supabase.from(table).delete().eq("id", id);
      await loadHistory();
      toast({ title: "Deleted", description: "Item deleted successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Career Hub History</CardTitle>
        <CardDescription>View and manage your career development sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="interviews">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="interviews">Interviews ({interviews.length})</TabsTrigger>
            <TabsTrigger value="cvs">CVs ({cvs.length})</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn ({linkedinEnhancements.length})</TabsTrigger>
            <TabsTrigger value="negotiations">Negotiations ({negotiations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="interviews" className="space-y-4">
            {interviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No interview sessions yet</p>
            ) : (
              interviews.map((interview) => (
                <Card key={interview.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{interview.job_title}</CardTitle>
                        <CardDescription>
                          {interview.difficulty_level} | {interview.duration_minutes} min
                          {interview.overall_score && ` | Score: ${interview.overall_score}/100`}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteItem("interview_sessions", interview.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  {interview.ai_feedback && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {interview.ai_feedback}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="cvs" className="space-y-4">
            {cvs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No CVs saved yet</p>
            ) : (
              cvs.map((cv) => (
                <Card key={cv.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{cv.title}</CardTitle>
                        <CardDescription>{cv.target_role || "General"}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => downloadCV(cv)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteItem("cv_documents", cv.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="linkedin" className="space-y-4">
            {linkedinEnhancements.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No LinkedIn enhancements yet</p>
            ) : (
              linkedinEnhancements.map((enhancement) => (
                <Card key={enhancement.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">LinkedIn Profile Enhancement</CardTitle>
                        <CardDescription>{enhancement.target_industry || "General Industry"}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteItem("linkedin_enhancements", enhancement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="negotiations" className="space-y-4">
            {negotiations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No negotiation sessions yet</p>
            ) : (
              negotiations.map((negotiation) => (
                <Card key={negotiation.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{negotiation.job_title}</CardTitle>
                        <CardDescription>
                          {negotiation.current_salary && `Current: $${negotiation.current_salary}`}
                          {negotiation.target_salary && ` | Target: $${negotiation.target_salary}`}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteItem("negotiation_sessions", negotiation.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CareerHistory;