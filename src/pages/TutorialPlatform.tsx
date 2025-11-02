import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, BookOpen, Video, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const TutorialPlatform = () => {
  const { toast } = useToast();
  const [courseTitle, setCourseTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const courses = [
    { title: "AI Art Basics", students: 234, earnings: "$1,638", rating: "4.9" },
    { title: "Advanced Prompting", students: 156, earnings: "$1,092", rating: "4.8" },
    { title: "Content Creation", students: 312, earnings: "$2,184", rating: "5.0" },
  ];

  const handleCreateCourse = () => {
    toast({
      title: "Course created!",
      description: "Your course is now live on the platform.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Tutorial & Course Platform</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create courses and tutorials. Earn 70% of revenue.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Create Courses</h3>
            <p className="text-muted-foreground">Share your knowledge</p>
          </Card>
          <Card className="p-6 text-center">
            <Video className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Video & Text</h3>
            <p className="text-muted-foreground">Multiple formats</p>
          </Card>
          <Card className="p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Recurring Income</h3>
            <p className="text-muted-foreground">Sell multiple times</p>
          </Card>
        </div>

        <Card className="p-8 max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Course Title</label>
              <Input
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="e.g., Master AI Art Creation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will students learn?"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price ($)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Course price"
              />
            </div>
            <Button onClick={handleCreateCourse} className="w-full">
              Create Course
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Top Courses</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {courses.map((course, idx) => (
              <Card key={idx} className="p-6">
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">★ {course.rating} ({course.students} students)</p>
                <p className="text-2xl font-bold text-primary">{course.earnings}</p>
                <p className="text-xs text-muted-foreground">Total earnings</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialPlatform;
