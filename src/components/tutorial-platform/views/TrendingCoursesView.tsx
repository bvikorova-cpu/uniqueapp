import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Users, Star, Flame, BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Course {
  id: string;
  title: string;
  price: number;
  total_enrollments: number | null;
  total_lessons: number | null;
  average_rating: number | null;
}

interface Props { onBack: () => void; }

export function TrendingCoursesView({ onBack }: Props) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("courses")
        .select("id,title,price,total_enrollments,total_lessons,average_rating")
        .eq("is_published", true)
        .order("total_enrollments", { ascending: false, nullsFirst: false })
        .limit(20);
      setCourses(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <FloatingHowItWorks title={"Trending Courses View - How it works"} steps={[{ title: 'Open', desc: 'Access the Trending Courses View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Trending Courses View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Trending Courses</h2>
          <p className="text-sm text-muted-foreground">Most popular courses</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
      ) : courses.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No courses published yet.</p>
      ) : (
        <div className="space-y-3">
          {courses.map((c, i) => {
            const rank = i + 1;
            return (
              <Card key={c.id} onClick={() => navigate(`/tutorial-course/${c.id}`)} className={`p-4 hover:shadow-xl transition-all cursor-pointer ${rank <= 3 ? "border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-black w-10 text-center ${rank <= 3 ? "bg-gradient-to-b from-amber-400 to-orange-500 bg-clip-text text-transparent" : "text-muted-foreground"}`}>#{rank}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold truncate">{c.title}</h3>
                      {rank <= 3 && <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-[10px] px-1.5"><Flame className="w-3 h-3 mr-0.5" />HOT</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(c.total_enrollments || 0).toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-amber-500" />{(c.average_rating || 0).toFixed(1)}</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{c.total_lessons || 0} lessons</span>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-bold shrink-0">€{Number(c.price).toFixed(2)}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}
