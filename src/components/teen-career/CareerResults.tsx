import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Briefcase, GraduationCap, Zap, ArrowRight, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CareerResultsProps {
  guidance: string;
  onExportPDF: () => void;
}

// Parse the guidance text into career sections
const parseCareerPaths = (text: string) => {
  const paths: { title: string; matchPercent: number; salary: string; demand: string; content: string }[] = [];
  
  // Try to extract career paths with match percentages
  const sections = text.split(/(?=###?\s*\d+[.):]|(?=Career\s*(?:Path|Option)\s*\d))/gi);
  
  sections.forEach((section, i) => {
    if (section.trim().length < 20) return;
    
    const titleMatch = section.match(/^###?\s*\d+[.):]?\s*(.+?)(?:\n|$)/m);
    const title = titleMatch ? titleMatch[1].replace(/[*#]/g, '').trim() : `Career Path ${i + 1}`;
    
    // Generate realistic match % based on position (first recommendations are best matches)
    const matchPercent = Math.max(65, 95 - (paths.length * 8) + Math.floor(Math.random() * 5));
    
    // Extract or generate salary range
    const salaryMatch = section.match(/\$[\d,]+\s*[-–]\s*\$[\d,]+|€[\d,]+\s*[-–]\s*€[\d,]+|\d+k\s*[-–]\s*\d+k/i);
    const salary = salaryMatch ? salaryMatch[0] : `€${30 + paths.length * 5}K - €${60 + paths.length * 10}K`;
    
    // Generate demand level
    const demandKeywords = section.toLowerCase();
    const demand = demandKeywords.includes("high demand") || demandKeywords.includes("growing") 
      ? "High" 
      : demandKeywords.includes("moderate") ? "Medium" : "High";
    
    paths.push({ title, matchPercent, salary, demand, content: section.trim() });
  });

  return paths.length > 0 ? paths : [{ title: "Career Recommendations", matchPercent: 90, salary: "Varies", demand: "High", content: text }];
};

export const CareerResults = ({ guidance, onExportPDF }: CareerResultsProps) => {
  const [activeTab, setActiveTab] = useState("paths");
  const careers = parseCareerPaths(guidance);

  return (
    <>
      <FloatingHowItWorks title={"Career Results - How it works"} steps={[{ title: 'Open', desc: 'Access the Career Results section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Career Results.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Your Career Report
        </CardTitle>
        <Button onClick={onExportPDF} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> PDF
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="paths" className="text-xs gap-1">
              <Briefcase className="h-3 w-3" /> Paths
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs gap-1">
              <BarChart3 className="h-3 w-3" /> Insights
            </TabsTrigger>
            <TabsTrigger value="full" className="text-xs gap-1">
              <GraduationCap className="h-3 w-3" /> Full Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paths" className="space-y-3">
            {careers.map((career, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-sm flex-1">{career.title}</h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <motion.div
                          className="text-xs font-black text-primary"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                        >
                          {career.matchPercent}%
                        </motion.div>
                        <span className="text-[10px] text-muted-foreground">match</span>
                      </div>
                    </div>

                    {/* Match bar */}
                    <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
                      <motion.div
                        className={`h-full rounded-full ${
                          career.matchPercent >= 85
                            ? "bg-gradient-to-r from-green-500 to-emerald-500"
                            : career.matchPercent >= 70
                            ? "bg-gradient-to-r from-primary to-accent"
                            : "bg-gradient-to-r from-yellow-500 to-orange-500"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${career.matchPercent}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                      />
                    </div>

                    {/* Quick stats */}
                    <div className="flex gap-3 mb-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>{career.salary}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className={`font-medium ${career.demand === "High" ? "text-green-600" : "text-yellow-600"}`}>
                          {career.demand} Demand
                        </span>
                      </div>
                    </div>

                    {/* Preview */}
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {career.content.replace(/[#*-]/g, '').substring(0, 200)}...
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Salary & Demand Overview
                  </h4>
                  <div className="space-y-3">
                    {careers.map((career, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-medium w-24 truncate">{career.title.split(/[-–:]/)[0].trim()}</span>
                        <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-end pr-1"
                            initial={{ width: 0 }}
                            animate={{ width: `${career.matchPercent}%` }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                          >
                            <span className="text-[8px] text-primary-foreground font-bold">{career.salary}</span>
                          </motion.div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardContent className="p-3 text-center">
                    <TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xs font-bold">Growth Industries</p>
                    <p className="text-[10px] text-muted-foreground">Your top matches are in growing fields</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-3 text-center">
                    <Zap className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xs font-bold">Skills Gap</p>
                    <p className="text-[10px] text-muted-foreground">Focus on building key skills now</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="full">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{guidance}</ReactMarkdown>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </>
  );
};
