import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Download, 
  Users, 
  BarChart, 
  Settings, 
  FolderOpen,
  Plus,
  Trash2,
  Edit,
  Share2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Collection {
  id: string;
  name: string;
  subject: string;
  pageCount: number;
  downloads: number;
  createdAt: string;
}

interface Teacher {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to access teacher dashboard");
        return;
      }
      setUser(session.user);
      loadDashboardData();
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    // Mock data for now - in production, fetch from database
    setCollections([
      {
        id: "1",
        name: "Mathematics Basics",
        subject: "Mathematics",
        pageCount: 25,
        downloads: 142,
        createdAt: "2025-01-15"
      },
      {
        id: "2",
        name: "Nature Exploration",
        subject: "Science",
        pageCount: 30,
        downloads: 98,
        createdAt: "2025-01-20"
      }
    ]);

    setTeachers([
      {
        id: "1",
        email: "teacher1@school.com",
        name: "Jane Smith",
        role: "Primary Teacher"
      }
    ]);
  };

  const handleNewCollection = () => {
    toast.info("Create new collection feature coming soon!");
  };

  const handleEditCollection = (id: string) => {
    toast.info(`Edit collection ${id} - feature coming soon!`);
  };

  const handleDownloadCollection = (id: string, name: string) => {
    toast.success(`Downloading ${name}...`);
  };

  const handleShareCollection = (id: string) => {
    toast.success("Share link copied to clipboard!");
  };

  const handleDeleteCollection = (id: string) => {
    toast.success("Collection deleted successfully");
    setCollections(collections.filter(c => c.id !== id));
  };

  const handleInviteTeacher = () => {
    toast.info("Invite teacher feature coming soon!");
  };

  const handleEditTeacher = (id: string) => {
    toast.info(`Edit teacher ${id} - feature coming soon!`);
  };

  const handleDeleteTeacher = (id: string) => {
    toast.success("Teacher removed successfully");
    setTeachers(teachers.filter(t => t.id !== id));
  };

  const handleUploadLogo = () => {
    toast.info("Upload logo feature coming soon!");
  };

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully!");
  };

  const handleUpgradePlan = () => {
    toast.info("Upgrade plan feature coming soon!");
  };

  const handleCancelSubscription = () => {
    toast.info("Cancel subscription feature coming soon!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 mt-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Teacher Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your educational content and team
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{collections.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {collections.reduce((acc, c) => acc + c.pageCount, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {collections.reduce((acc, c) => acc + c.downloads, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{teachers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="collections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="collections">
              <FolderOpen className="h-4 w-4 mr-2" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Collections</h2>
              <Button onClick={handleNewCollection}>
                <Plus className="h-4 w-4 mr-2" />
                New Collection
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Card key={collection.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{collection.name}</CardTitle>
                        <CardDescription>{collection.subject}</CardDescription>
                      </div>
                      <Badge variant="secondary">{collection.pageCount} pages</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Downloads</span>
                        <span className="font-medium">{collection.downloads}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium">{collection.createdAt}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditCollection(collection.id)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleDownloadCollection(collection.id, collection.name)}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleShareCollection(collection.id)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteCollection(collection.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Team Members</h2>
              <Button onClick={handleInviteTeacher}>
                <Plus className="h-4 w-4 mr-2" />
                Invite Teacher
              </Button>
            </div>

            <div className="grid gap-4">
              {teachers.map((teacher) => (
                <Card key={teacher.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{teacher.role}</Badge>
                      <Button size="sm" variant="outline" onClick={() => handleEditTeacher(teacher.id)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteTeacher(teacher.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <h2 className="text-2xl font-bold">Usage Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Most Popular Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Mathematics</span>
                      <Badge>142 downloads</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Science</span>
                      <Badge>98 downloads</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Geography</span>
                      <Badge>76 downloads</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Pages Generated</span>
                      <span className="font-bold">84</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Downloads</span>
                      <span className="font-bold">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Collections Created</span>
                      <span className="font-bold">3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-2xl font-bold">School Settings</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>School Branding</CardTitle>
                <CardDescription>
                  Customize how your school's logo appears on coloring pages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">School Logo</label>
                  <Button variant="outline" onClick={handleUploadLogo}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">School Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter school name"
                  />
                </div>
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>
                  Manage your school subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Elementary Standard</p>
                    <p className="text-sm text-muted-foreground">$15/month</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleUpgradePlan}>Upgrade Plan</Button>
                  <Button variant="outline" onClick={handleCancelSubscription}>Cancel Subscription</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
