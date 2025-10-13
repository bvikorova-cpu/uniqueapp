import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Brain, GraduationCap, Send, Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const quizCategories = [
  { id: "math", name: "Mathematics", icon: "📐" },
  { id: "biology", name: "Biology", icon: "🧬" },
  { id: "physics", name: "Physics", icon: "⚛️" },
  { id: "chemistry", name: "Chemistry", icon: "🧪" },
  { id: "geography", name: "Geography", icon: "🌍" },
  { id: "history", name: "History", icon: "📜" },
  { id: "literature", name: "Literature", icon: "📚" },
  { id: "english", name: "English", icon: "🇬🇧" },
  { id: "computer", name: "Computer Science", icon: "💻" },
  { id: "art", name: "Art", icon: "🎨" },
  { id: "celebrity", name: "Celebrities", icon: "⭐" },
  { id: "sport", name: "Sports", icon: "⚽" },
  { id: "movies", name: "Film & TV", icon: "🎬" },
  { id: "music", name: "Music", icon: "🎵" },
  { id: "food", name: "Food & Cooking", icon: "🍳" },
  { id: "travel", name: "Travel", icon: "✈️" },
  { id: "fashion", name: "Fashion", icon: "👗" },
  { id: "nature", name: "Nature", icon: "🌿" },
  { id: "cars", name: "Cars", icon: "🚗" },
  { id: "gaming", name: "Gaming", icon: "🎮" },
  { id: "business", name: "Business", icon: "💼" },
  { id: "psychology", name: "Psychology", icon: "🧠" },
  { id: "health", name: "Health & Fitness", icon: "💪" },
  { id: "technology", name: "Technology", icon: "📱" },
  { id: "science", name: "Science", icon: "🔬" },
  { id: "politics", name: "Politics", icon: "🏛️" },
  { id: "economics", name: "Economics", icon: "💰" },
  { id: "astronomy", name: "Astronomy", icon: "🌟" },
  { id: "animals", name: "Animals", icon: "🦁" },
  { id: "architecture", name: "Architecture", icon: "🏗️" },
  { id: "languages", name: "World Languages", icon: "🗣️" },
  { id: "mythology", name: "Mythology", icon: "⚡" },
  { id: "religion", name: "Religions", icon: "🕉️" },
  { id: "philosophy", name: "Philosophy", icon: "🤔" },
  { id: "law", name: "Law", icon: "⚖️" },
  { id: "medicine", name: "Medicine", icon: "⚕️" },
  { id: "environment", name: "Environment", icon: "♻️" },
  { id: "beauty", name: "Beauty & Care", icon: "💄" },
  { id: "photography", name: "Photography", icon: "📷" },
  { id: "dance", name: "Dance", icon: "💃" },
  { id: "cooking", name: "Culinary Arts", icon: "👨‍🍳" },
  { id: "wine", name: "Wine & Gastronomy", icon: "🍷" },
  { id: "coffee", name: "Coffee", icon: "☕" },
  { id: "pets", name: "Pets", icon: "🐕" },
  { id: "gardening", name: "Gardening", icon: "🌱" },
  { id: "diy", name: "DIY & Crafts", icon: "🔨" },
  { id: "magic", name: "Magic & Illusions", icon: "🎩" },
  { id: "comics", name: "Comics", icon: "💥" },
  { id: "anime", name: "Anime & Manga", icon: "🎌" },
  { id: "socialMedia", name: "Social Media", icon: "📲" },
  { id: "brands", name: "Brands & Logos", icon: "™️" },
  { id: "flags", name: "Flags & Countries", icon: "🏁" },
];

const courseCategories = [
  {
    name: "Business & Finance",
    icon: "💼",
    courses: [
      "Digital Marketing Mastery",
      "Financial Planning Essentials",
      "Entrepreneurship 101",
      "E-commerce Success",
      "Investment Strategies",
      "SEO and Content Marketing",
      "Social Media Marketing",
      "Email Marketing Strategies",
      "Brand Building",
      "Sales Techniques",
      "Customer Service Excellence",
      "Business Analytics",
      "Corporate Strategy",
      "Negotiation Skills",
      "Strategic Planning",
      "Risk Management",
      "Business Intelligence",
      "Real Estate Investing",
      "Stock Market Trading",
      "Forex Trading",
      "Options Trading",
      "Retirement Planning",
      "Tax Planning",
      "Estate Planning",
      "Insurance Planning",
      "Debt Management",
      "Credit Score Improvement",
      "Budgeting Mastery",
      "Personal Finance",
      "Luxury Brand Management",
      "Fashion Marketing",
      "Pet Business"
    ]
  },
  {
    name: "Technology & Programming",
    icon: "💻",
    courses: [
      "Web Development Fundamentals",
      "Python Programming",
      "Data Science Basics",
      "Mobile App Development",
      "Cybersecurity Essentials",
      "Data Analytics with Excel",
      "SQL for Data Analysis",
      "R Programming",
      "Machine Learning Basics",
      "Artificial Intelligence Fundamentals",
      "Deep Learning",
      "Natural Language Processing",
      "Computer Vision",
      "Blockchain Technology",
      "Cryptocurrency Trading",
      "Cloud Computing AWS",
      "Cloud Computing Azure",
      "DevOps Engineering",
      "Docker and Kubernetes",
      "Linux Administration",
      "Network Security",
      "Ethical Hacking",
      "Penetration Testing",
      "Information Security Management",
      "GDPR Compliance",
      "JavaScript Advanced",
      "React Development",
      "Angular Framework",
      "Vue.js Development",
      "Node.js Backend",
      "PHP Programming",
      "Ruby on Rails",
      "Java Programming",
      "C++ Programming",
      "Swift iOS Development",
      "Android Development",
      "Flutter Development",
      "Game Development Unity",
      "Unreal Engine"
    ]
  },
  {
    name: "Health & Wellness",
    icon: "💪",
    courses: [
      "Nutrition and Diet Planning",
      "Fitness Training",
      "Mental Health Awareness",
      "Yoga and Mindfulness",
      "Stress Management",
      "Yoga Teacher Training",
      "Pilates Instructor",
      "Personal Training Certification",
      "Nutrition Coaching",
      "Weight Loss Strategies",
      "Muscle Building",
      "Sports Nutrition",
      "Sustainable Living",
      "Zero Waste Lifestyle",
      "Minimalism",
      "Meditation Mastery",
      "Mindfulness Practice",
      "Breathwork",
      "Tai Chi",
      "Qigong",
      "Sleep Improvement",
      "Insomnia Solutions",
      "Mental Health First Aid",
      "Addiction Recovery",
      "Grief Counseling",
      "Trauma Healing",
      "PTSD Management",
      "Anxiety Relief",
      "Depression Support"
    ]
  },
  {
    name: "Personal Development",
    icon: "🌟",
    courses: [
      "Time Management Mastery",
      "Public Speaking",
      "Leadership Skills",
      "Emotional Intelligence",
      "Goal Setting and Achievement",
      "Conflict Resolution",
      "Team Building",
      "Change Management",
      "Communication Skills",
      "Positive Discipline",
      "Positive Affirmations",
      "Gratitude Practice",
      "Vision Board Creation",
      "Life Coaching",
      "Career Coaching",
      "Executive Coaching",
      "Business Coaching"
    ]
  },
  {
    name: "Beauty & Makeup",
    icon: "💄",
    courses: [
      "Makeup Artistry",
      "Skincare Routine",
      "Hair Styling Techniques",
      "Nail Art Design",
      "Bridal Makeup",
      "Special Effects Makeup",
      "Airbrush Makeup",
      "Color Analysis",
      "Perfume Making",
      "Aromatherapy",
      "Essential Oils"
    ]
  },
  {
    name: "Fashion & Style",
    icon: "👗",
    courses: [
      "Fashion Design",
      "Personal Styling",
      "Wardrobe Planning",
      "Fashion Trends",
      "Sustainable Fashion",
      "Vintage Fashion",
      "Textile Design",
      "Pattern Making",
      "Sewing Techniques",
      "Knitting and Crochet",
      "Embroidery",
      "Quilting",
      "Leather Working",
      "Shoe Design",
      "Accessory Design",
      "Hat Making",
      "Jewelry Design"
    ]
  },
  {
    name: "Wellness & Spa",
    icon: "🧖",
    courses: [
      "Massage Therapy",
      "Reflexology",
      "Acupressure",
      "Reiki Healing",
      "Crystal Healing",
      "Sound Therapy",
      "Energy Healing",
      "Chakra Balancing",
      "Aura Reading"
    ]
  },
  {
    name: "Creative Arts & Design",
    icon: "🎨",
    courses: [
      "Photography Basics",
      "Graphic Design",
      "Creative Writing",
      "Music Production",
      "Digital Illustration",
      "UI/UX Design",
      "Adobe Photoshop",
      "Adobe Illustrator",
      "Video Editing Premiere Pro",
      "After Effects Animation",
      "3D Modeling Blender",
      "AutoCAD Design",
      "Interior Design",
      "Product Design",
      "Packaging Design",
      "Web Design",
      "Logo Design",
      "Typography",
      "Color Theory",
      "Drawing and Sketching",
      "Oil Painting",
      "Watercolor Techniques",
      "Digital Painting"
    ]
  },
  {
    name: "Photography & Video",
    icon: "📷",
    courses: [
      "Portrait Photography",
      "Landscape Photography",
      "Wedding Photography",
      "Food Photography",
      "Product Photography",
      "Street Photography",
      "Lightroom Editing",
      "Photo Retouching",
      "Video Production",
      "Cinematography",
      "Wildlife Photography",
      "Pet Photography"
    ]
  },
  {
    name: "Writing & Content",
    icon: "✍️",
    courses: [
      "Screenwriting",
      "Storytelling",
      "Copywriting",
      "Technical Writing",
      "Content Writing",
      "Blog Writing",
      "Academic Writing",
      "Resume Writing",
      "Grant Writing",
      "Poetry Writing",
      "Fiction Writing",
      "Journalism"
    ]
  },
  {
    name: "Music & Performance",
    icon: "🎵",
    courses: [
      "Voice Acting",
      "Podcasting",
      "Audio Engineering",
      "Music Theory",
      "Guitar Mastery",
      "Piano Lessons",
      "Singing Techniques",
      "Drum Lessons",
      "Electronic Music Production",
      "DJ Techniques",
      "Songwriting",
      "Music Business",
      "Dance Choreography",
      "Ballet Training",
      "Hip Hop Dance",
      "Salsa Dancing",
      "Ballroom Dancing"
    ]
  },
  {
    name: "Martial Arts & Sports",
    icon: "🥋",
    courses: [
      "Martial Arts",
      "Self Defense",
      "Boxing Training",
      "Kickboxing",
      "MMA Fundamentals",
      "Wrestling Techniques",
      "Judo",
      "Karate",
      "Taekwondo",
      "Brazilian Jiu Jitsu",
      "Muay Thai"
    ]
  },
  {
    name: "Relationships & Family",
    icon: "❤️",
    courses: [
      "Relationship Coaching",
      "Dating Mastery",
      "Marriage Counseling",
      "Parenting Skills",
      "Child Development",
      "Teenage Psychology",
      "Baby Care",
      "Breastfeeding Support",
      "Pregnancy Fitness",
      "Prenatal Yoga",
      "Postpartum Recovery",
      "Family Therapy",
      "Homeschooling",
      "Educational Games",
      "Child Nutrition",
      "Sleep Training",
      "Potty Training",
      "Speech Development",
      "Sign Language for Babies",
      "Adoption Guide",
      "Foster Parenting",
      "Blended Family Management",
      "Single Parenting",
      "Co-Parenting",
      "Elderly Care",
      "Dementia Care",
      "Disability Support"
    ]
  },
  {
    name: "Spiritual & Metaphysical",
    icon: "🔮",
    courses: [
      "Dream Analysis",
      "Lucid Dreaming",
      "Astrology Basics",
      "Tarot Reading",
      "Numerology",
      "Palm Reading",
      "Feng Shui Mastery",
      "Vastu Shastra",
      "Psychic Development",
      "Intuition Training",
      "Manifestation Techniques",
      "Law of Attraction",
      "Spiritual Coaching"
    ]
  },
  {
    name: "Project & Operations Management",
    icon: "📊",
    courses: [
      "Project Management Professional",
      "Agile and Scrum Methodologies",
      "Human Resources Management",
      "Supply Chain Management",
      "Operations Management",
      "Quality Management",
      "Lean Six Sigma"
    ]
  },
  {
    name: "Culinary Arts",
    icon: "👨‍🍳",
    courses: [
      "Vegan Cooking",
      "Baking Masterclass",
      "Pastry Arts",
      "Wine Tasting",
      "Coffee Brewing",
      "Cocktail Mixing"
    ]
  },
  {
    name: "Home & Lifestyle",
    icon: "🏡",
    courses: [
      "Gardening Basics",
      "Organic Farming",
      "Permaculture Design",
      "Beekeeping",
      "Home Organization",
      "Feng Shui",
      "Wedding Planning",
      "Event Planning",
      "Party Planning",
      "Travel Planning",
      "Decluttering",
      "Minimalist Living",
      "Tiny House Living",
      "Van Life",
      "RV Living",
      "Off-Grid Living",
      "Homesteading"
    ]
  },
  {
    name: "Outdoor & Adventure",
    icon: "🏔️",
    courses: [
      "Survival Skills",
      "Wilderness Survival",
      "Urban Survival",
      "Emergency Preparedness",
      "First Aid Advanced",
      "CPR Certification",
      "Disaster Management",
      "Fire Safety",
      "Water Safety",
      "Outdoor Adventures",
      "Camping Skills",
      "Hiking Guide",
      "Rock Climbing",
      "Mountaineering",
      "Kayaking",
      "Canoeing",
      "Surfing",
      "Scuba Diving",
      "Snorkeling",
      "Sailing",
      "Fishing Techniques",
      "Fly Fishing",
      "Ice Fishing",
      "Hunting Basics"
    ]
  },
  {
    name: "Nature & Science",
    icon: "🔬",
    courses: [
      "Bird Watching",
      "Marine Biology",
      "Oceanography",
      "Meteorology",
      "Geology",
      "Botany",
      "Mycology",
      "Entomology"
    ]
  },
  {
    name: "Pet Care & Training",
    icon: "🐾",
    courses: [
      "Veterinary Care",
      "Dog Training",
      "Cat Behavior",
      "Horse Training",
      "Bird Care",
      "Reptile Care",
      "Aquarium Management",
      "Pet Grooming",
      "Animal Rescue"
    ]
  },
  {
    name: "Coaching & Counseling",
    icon: "🎯",
    courses: [
      "Health Coaching",
      "Financial Coaching",
      "Retirement Planning Coaching"
    ]
  }
];

export default function Education() {
  const navigate = useNavigate();
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("tutoring-chat", {
        body: { message: userMessage, history: chatHistory }
      });

      if (error) throw error;

      setChatHistory(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = (categoryId: string) => {
    navigate(`/quiz?category=${categoryId}`);
  };

  const handleEnrollCourse = (courseName: string) => {
    navigate(`/course/${encodeURIComponent(courseName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Education
          </h1>
          <p className="text-muted-foreground text-lg">
            Online tutoring, quizzes and courses for your personal development
          </p>
        </div>

        <Tabs defaultValue="tutoring" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="tutoring" className="gap-2">
              <Brain className="h-4 w-4" />
              Tutoring
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Quiz
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Courses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tutoring">
            <Card>
              <CardHeader>
                <CardTitle>Online Tutoring</CardTitle>
                <CardDescription>
                  Ask anything and get an instant answer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="min-h-[300px] max-h-[500px] overflow-y-auto space-y-4 p-4 bg-muted/50 rounded-lg">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Start a conversation by asking a question</p>
                    </div>
                  ) : (
                    chatHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground ml-12"
                            : "bg-background mr-12"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p>Teacher is thinking...</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Write your question..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[80px]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !chatMessage.trim()}
                    size="icon"
                    className="h-[80px] w-[80px]"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quizCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-3xl">{category.icon}</span>
                      {category.name}
                    </CardTitle>
                    <CardDescription>20 questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleStartQuiz(category.id)}
                      className="w-full"
                    >
                      Start
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <div className="mb-6 flex justify-end">
              <Button
                onClick={() => navigate('/generate-courses')}
                variant="outline"
                className="gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Generate Course Content
              </Button>
            </div>
            <div className="space-y-8">
              {courseCategories.map((category, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <span className="text-4xl">{category.icon}</span>
                      {category.name}
                    </CardTitle>
                    <CardDescription>
                      {category.courses.length} available courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {category.courses.map((course, courseIdx) => (
                        <Button
                          key={courseIdx}
                          variant="outline"
                          className="justify-start h-auto py-3 px-4 text-left"
                          onClick={() => handleEnrollCourse(course)}
                        >
                          <span className="truncate">{course}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
