import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Briefcase, Building2, MapPin, Calendar, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface JobApplication {
  id: string;
  status: string | null;
  created_at: string | null;
  cover_letter: string | null;
  job: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    job_type: string;
  } | null;
}

interface MyJobApplicationsProps {
  userId: string;
  isOwnProfile: boolean;
}

export const MyJobApplications = ({ userId, isOwnProfile }: MyJobApplicationsProps) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOwnProfile) {
      loadApplications();
    } else {
      setLoading(false);
    }
  }, [userId, isOwnProfile]);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          id,
          status,
          created_at,
          cover_letter,
          job_listings:job_id (
            id,
            title,
            company_name,
            location,
            job_type
          )
        `)
        .eq("applicant_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform data to match our interface
      const transformed = (data || []).map(app => ({
        id: app.id,
        status: app.status,
        created_at: app.created_at,
        cover_letter: app.cover_letter,
        job: app.job_listings as any
      }));
      
      setApplications(transformed);
    } catch (error) {
      console.error("Error loading job applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "hired":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      case "interview":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "pending":
      default:
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
    }
  };

  if (!isOwnProfile) {
    return (
    <>
      <FloatingHowItWorks title={"My Job Applications - How it works"} steps={[{ title: 'Open', desc: 'Access the My Job Applications section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in My Job Applications.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-8 text-center">
        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Job applications are private</p>
      </Card>
    </>
  );
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">No job applications yet</p>
        <Button onClick={() => navigate("/jobs")}>
          Browse Jobs
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline">{applications.length} Applications</Badge>
          <Badge variant="outline" className="bg-green-500/10 text-green-700">
            {applications.filter(a => a.status === "accepted" || a.status === "hired").length} Accepted
          </Badge>
        </div>
        <Button onClick={() => navigate("/jobs")}>
          Find More Jobs
        </Button>
      </div>

      <div className="space-y-3">
        {applications.map((app) => (
          <Card key={app.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{app.job?.title || "Job Removed"}</h3>
                  <Badge className={getStatusColor(app.status)}>
                    {app.status || "pending"}
                  </Badge>
                </div>
                
                {app.job && (
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{app.job.company_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{app.job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{app.job.job_type}</span>
                    </div>
                  </div>
                )}

                {app.created_at && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Applied {format(new Date(app.created_at), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>

              {app.job && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/jobs/${app.job?.id}`)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
