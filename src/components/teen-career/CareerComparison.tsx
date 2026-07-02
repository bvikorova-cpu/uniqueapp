import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Check, X, Minus } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Career {
  name: string;
  salary: string;
  education: string;
  workLife: "Excellent" | "Good" | "Fair";
  demand: "High" | "Medium" | "Low";
  creativity: "High" | "Medium" | "Low";
  remote: boolean;
}

const sampleCareers: Career[] = [
  { name: "Software Engineer", salary: "€50K - €90K", education: "Bachelor's / Self-taught", workLife: "Good", demand: "High", creativity: "High", remote: true },
  { name: "Doctor", salary: "€60K - €120K", education: "Medical Degree (6+ years)", workLife: "Fair", demand: "High", creativity: "Medium", remote: false },
  { name: "Graphic Designer", salary: "€30K - €55K", education: "Bachelor's / Portfolio", workLife: "Excellent", demand: "Medium", creativity: "High", remote: true },
  { name: "Lawyer", salary: "€45K - €100K", education: "Law Degree (5+ years)", workLife: "Fair", demand: "Medium", creativity: "Medium", remote: false },
  { name: "Data Scientist", salary: "€55K - €95K", education: "Master's recommended", workLife: "Good", demand: "High", creativity: "Medium", remote: true },
  { name: "Teacher", salary: "€30K - €50K", education: "Bachelor's + Certification", workLife: "Excellent", demand: "High", creativity: "High", remote: false },
];

const levelColor = (level: string) => {
  if (level === "High" || level === "Excellent") return "text-green-600";
  if (level === "Medium" || level === "Good") return "text-yellow-600";
  return "text-red-500";
};

export const CareerComparison = () => {
  const [selected, setSelected] = useState<number[]>([0, 1]);
  const [showSelector, setShowSelector] = useState(false);

  const toggleCareer = (index: number) => {
    if (selected.includes(index)) {
      if (selected.length > 1) setSelected(selected.filter(i => i !== index));
    } else if (selected.length < 3) {
      setSelected([...selected, index]);
    }
  };

  const compared = selected.map(i => sampleCareers[i]);

  const rows: { label: string; key: keyof Career }[] = [
    { label: "💰 Salary Range", key: "salary" },
    { label: "🎓 Education Required", key: "education" },
    { label: "⚖️ Work-Life Balance", key: "workLife" },
    { label: "📈 Market Demand", key: "demand" },
    { label: "🎨 Creativity Level", key: "creativity" },
    { label: "🏠 Remote Friendly", key: "remote" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Career Comparison - How it works"} steps={[{ title: 'Open', desc: 'Access the Career Comparison section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Career Comparison.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-primary" />
          Career Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">Compare careers side by side to make informed decisions</p>

        {/* Career selector */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSelector(!showSelector)}
          className="w-full mb-3 text-xs"
        >
          {showSelector ? "Hide Options" : "Change Careers to Compare"}
        </Button>

        {showSelector && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="flex flex-wrap gap-1.5 mb-4"
          >
            {sampleCareers.map((career, i) => (
              <button
                key={i}
                onClick={() => toggleCareer(i)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  selected.includes(i)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {career.name}
              </button>
            ))}
            <p className="text-[10px] text-muted-foreground w-full">Select 2-3 careers to compare</p>
          </motion.div>
        )}

        {/* Comparison table */}
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-2 font-medium text-muted-foreground w-28">Criteria</th>
                {compared.map((c, i) => (
                  <th key={i} className="text-center py-2 px-1 font-bold text-primary text-[11px]">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <motion.tr
                  key={row.key}
                  className="border-b border-border/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td className="py-2 pr-2 font-medium">{row.label}</td>
                  {compared.map((career, j) => {
                    const val = career[row.key];
                    return (
                      <td key={j} className="text-center py-2 px-1">
                        {typeof val === "boolean" ? (
                          val ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-red-400 mx-auto" />
                        ) : (
                          <span className={typeof val === "string" && ["High", "Medium", "Low", "Excellent", "Good", "Fair"].includes(val) ? levelColor(val) : ""}>
                            {val}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
    </>
  );
};
