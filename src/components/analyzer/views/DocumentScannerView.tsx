import { FileText } from "lucide-react";
import { AnalyzerToolLayout } from "../AnalyzerToolLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const DocumentScannerView = ({ onBack }: { onBack: () => void }) => {
  const [scanAction, setScanAction] = useState("full-analysis");
  const [targetLanguage, setTargetLanguage] = useState("English");

  return (
    <>
      <FloatingHowItWorks title={"Document Scanner View - How it works"} steps={[{ title: 'Open', desc: 'Access the Document Scanner View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Document Scanner View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <AnalyzerToolLayout
      title="AI Document Scanner"
      description="OCR, translate, summarize & analyze any document or text content"
      icon={<FileText className="w-7 h-7" />}
      action="document-scanner"
      creditCost={3}
      placeholder="Paste or describe the document/text you want to analyze (e.g., a receipt in Japanese, a contract clause, handwritten notes)"
      gradient="from-violet-600 to-indigo-600"
      onBack={onBack}
      buildBody={(input) => ({ text: input, scanAction, targetLanguage })}
    >
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium mb-1 block text-muted-foreground">Action</label>
          <Select value={scanAction} onValueChange={setScanAction}>
            <SelectTrigger className="border-cyan-500/20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full-analysis">Full Analysis</SelectItem>
              <SelectItem value="extract-text">Extract Text (OCR)</SelectItem>
              <SelectItem value="translate">Translate</SelectItem>
              <SelectItem value="summarize">Summarize</SelectItem>
              <SelectItem value="extract-entities">Extract Entities</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block text-muted-foreground">Target Language</label>
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger className="border-cyan-500/20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="German">German</SelectItem>
              <SelectItem value="Japanese">Japanese</SelectItem>
              <SelectItem value="Chinese">Chinese</SelectItem>
              <SelectItem value="Slovak">Slovak</SelectItem>
              <SelectItem value="Czech">Czech</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </AnalyzerToolLayout>
    </>
  );
};
