import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Star, Target, TrendingUp } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CareerSkillsDashboardProps {
  interests: string[];
  workStyle: string[];
  values: string[];
  subjects: string[];
}

const skillCategories = [
  { label: "Analytical", icon: Brain, color: "from-blue-500 to-cyan-500" },
  { label: "Creative", icon: Star, color: "from-pink-500 to-rose-500" },
  { label: "Social", icon: Target, color: "from-green-500 to-emerald-500" },
  { label: "Technical", icon: TrendingUp, color: "from-purple-500 to-violet-500" },
];

const calculateSkills = (answers: CareerSkillsDashboardProps) => {
  const analytical = [
    answers.interests.includes("Science & Research"),
    answers.interests.includes("Business & Money"),
    answers.subjects.includes("Math"),
    answers.subjects.includes("Science"),
    answers.workStyle.includes("Independently"),
  ].filter(Boolean).length;

  const creative = [
    answers.interests.includes("Art & Design"),
    answers.interests.includes("Entertainment & Media"),
    answers.subjects.includes("Arts & Drama"),
    answers.subjects.includes("Music"),
    answers.values.includes("Innovation"),
  ].filter(Boolean).length;

  const social = [
    answers.interests.includes("Helping People"),
    answers.interests.includes("Law & Justice"),
    answers.workStyle.includes("In a team"),
    answers.workStyle.includes("Leading others"),
    answers.values.includes("Making a difference"),
  ].filter(Boolean).length;

  const technical = [
    answers.interests.includes("Technology & Coding"),
    answers.subjects.includes("Computer Science"),
    answers.subjects.includes("Math"),
    answers.workStyle.includes("Hands-on work"),
    answers.values.includes("Innovation"),
  ].filter(Boolean).length;

  const max = Math.max(analytical, creative, social, technical, 1);
  return [
    { ...skillCategories[0], score: Math.round((analytical / max) * 100) },
    { ...skillCategories[1], score: Math.round((creative / max) * 100) },
    { ...skillCategories[2], score: Math.round((social / max) * 100) },
    { ...skillCategories[3], score: Math.round((technical / max) * 100) },
  ];
};

export const CareerSkillsDashboard = (props: CareerSkillsDashboardProps) => {
  const skills = calculateSkills(props);
  const topSkill = skills.reduce((a, b) => (a.score > b.score ? a : b));
  const readinessScore = Math.round(skills.reduce((sum, s) => sum + s.score, 0) / skills.length);

  return (
    <>
      <FloatingHowItWorks title={"Career Skills Dashboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Career Skills Dashboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Career Skills Dashboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/20 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Your Skills Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Readiness Score */}
        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">Career Readiness</p>
          <motion.p
            className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            {readinessScore}%
          </motion.p>
          <p className="text-xs text-muted-foreground mt-1">
            Top strength: <span className="font-semibold text-primary">{topSkill.label}</span>
          </p>
        </div>

        {/* Skill bars */}
        <div className="space-y-3">
          {skills.map((skill, i) => (
            <motion.div
              key={skill.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <skill.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{skill.label}</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground">{skill.score}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.score}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick tags */}
        <div className="flex flex-wrap gap-1.5">
          {[...props.interests.slice(0, 3), ...props.values.slice(0, 2)].map((tag, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  );
};
