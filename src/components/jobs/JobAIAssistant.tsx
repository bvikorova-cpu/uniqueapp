import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface JobMatch {
  jobId: string;
  score: number;
  reasons: string[];
  gaps?: string[];
  recommendation: string;
  job: {
    id: string;
    title: string;
    company: string;
    category: string;
    job_type: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
  };
}

export function JobAIAssistant() {
  const [open, setOpen] = useState(false);
  const [cvText, setCvText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!cvText.trim()) {
      toast({
        title: "Chyba",
        description: "Prosím, vložte váš životopis",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setMatches([]);

    try {
      const { data, error } = await supabase.functions.invoke("job-ai-matcher", {
        body: { cvText },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setMatches(data.matches || []);

      if (!data.matches || data.matches.length === 0) {
        toast({
          title: "Žiadne zhody",
          description: "Momentálne sme nenašli žiadne vhodné pozície pre váš profil.",
        });
      } else {
        toast({
          title: "Analýza dokončená",
          description: `Našli sme ${data.matches.length} vhodných pozícií`,
        });
      }
    } catch (error: any) {
      console.error("Error analyzing CV:", error);
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa analyzovať životopis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "Výborná zhoda";
    if (score >= 60) return "Dobrá zhoda";
    return "Možná zhoda";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Asistent pre hľadanie práce
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Asistent pre hľadanie práce
          </DialogTitle>
          <DialogDescription>
            Vložte váš životopis a AI vám pomôže najsť najvhodnejšie pracovné pozície
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Váš životopis (CV)
            </label>
            <Textarea
              placeholder="Vložte text vášho životopisu sem... (vzdelanie, skúsenosti, zručnosti, atď.)"
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              className="min-h-[200px]"
              disabled={isAnalyzing}
            />
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !cvText.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzujem...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyzovať a nájsť vhodné pozície
              </>
            )}
          </Button>

          {matches.length > 0 && (
            <div className="space-y-4 mt-6">
              <h3 className="font-semibold text-lg">
                Odporúčané pozície ({matches.length})
              </h3>
              
              {matches.map((match) => (
                <Card key={match.jobId} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">
                          {match.job.title}
                        </CardTitle>
                        <CardDescription>
                          {match.job.company} • {match.job.location}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(match.score)}`}>
                          {match.score}%
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {getScoreBadge(match.score)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">{match.job.category}</Badge>
                      <Badge variant="secondary">{match.job.job_type}</Badge>
                      {match.job.salary_min && (
                        <Badge variant="secondary">
                          €{match.job.salary_min} - €{match.job.salary_max}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Prečo ste vhodný kandidát:
                      </h4>
                      <ul className="text-sm space-y-1 ml-6">
                        {match.reasons.map((reason, idx) => (
                          <li key={idx} className="list-disc">{reason}</li>
                        ))}
                      </ul>
                    </div>

                    {match.gaps && match.gaps.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          Oblasti na zlepšenie:
                        </h4>
                        <ul className="text-sm space-y-1 ml-6">
                          {match.gaps.map((gap, idx) => (
                            <li key={idx} className="list-disc">{gap}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm">
                        <strong>Odporúčanie:</strong> {match.recommendation}
                      </p>
                    </div>

                    <Button
                      onClick={() => {
                        navigate(`/jobs/${match.jobId}`);
                        setOpen(false);
                      }}
                      className="w-full"
                    >
                      Zobraziť detaily pozície
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
