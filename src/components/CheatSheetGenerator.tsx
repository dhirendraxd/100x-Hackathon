import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  MapPin,
  Lightbulb,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";

interface CheatSheetData {
  id: string;
  formId: string;
  formName: string;
  title: string;
  summary: string;
  preparationChecklist: string[];
  stepByStepGuide: Array<{
    step: number;
    title: string;
    description: string;
    tip: string;
  }>;
  commonMistakes: Array<{
    mistake: string;
    solution: string;
  }>;
  requiredDocumentsGuide: Array<{
    document: string;
    purpose: string;
    format: string;
    tips: string;
  }>;
  importantReminders: string[];
  processingTime: string;
  fees: string;
  whereToSubmit: string;
  generatedAt: Date;
  version: string;
}

interface CheatSheetGeneratorProps {
  formId: string;
  formName: string;
}

interface GenerationResult {
  success: boolean;
  cheatSheet: CheatSheetData;
  message: string;
}

export default function CheatSheetGenerator({
  formId,
  formName,
}: CheatSheetGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cheatSheet, setCheatSheet] = useState<CheatSheetData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const functions = getFunctions();
      const generateCheatSheet = httpsCallable<
        { formId: string },
        GenerationResult
      >(functions, "generateCheatSheet");

      const response = await generateCheatSheet({ formId });

      if (response.data.success) {
        setCheatSheet(response.data.cheatSheet);
        toast.success("Cheat sheet generated!", {
          description: "Your personalized guide is ready.",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      toast.error("Generation failed", {
        description: errorMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!cheatSheet) return;

    // Create a formatted text version for download
    const content = `
${cheatSheet.title}
${"=".repeat(cheatSheet.title.length)}

${cheatSheet.summary}

PREPARATION CHECKLIST
${"=".repeat(20)}
${cheatSheet.preparationChecklist.map((item, i) => `${i + 1}. ${item}`).join("\n")}

STEP-BY-STEP GUIDE
${"=".repeat(20)}
${cheatSheet.stepByStepGuide.map((step) => `
STEP ${step.step}: ${step.title}
${step.description}
💡 TIP: ${step.tip}
`).join("\n")}

COMMON MISTAKES TO AVOID
${"=".repeat(25)}
${cheatSheet.commonMistakes.map((item, i) => `
${i + 1}. MISTAKE: ${item.mistake}
   SOLUTION: ${item.solution}
`).join("\n")}

REQUIRED DOCUMENTS
${"=".repeat(20)}
${cheatSheet.requiredDocumentsGuide.map((doc, i) => `
${i + 1}. ${doc.document}
   Purpose: ${doc.purpose}
   Format: ${doc.format}
   Tips: ${doc.tips}
`).join("\n")}

IMPORTANT REMINDERS
${"=".repeat(20)}
${cheatSheet.importantReminders.map((item, i) => `${i + 1}. ${item}`).join("\n")}

PROCESSING INFORMATION
${"=".repeat(22)}
Processing Time: ${cheatSheet.processingTime}
Fees: ${cheatSheet.fees}
Where to Submit: ${cheatSheet.whereToSubmit}

---
Generated on: ${new Date().toLocaleDateString()}
Form Mitra Smart - Your Government Forms Assistant
`;

    // Create blob and download
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formName.replace(/[^a-z0-9]/gi, "_")}_Cheat_Sheet.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Cheat sheet downloaded!", {
      description: "Saved as a text file",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <FileText className="h-4 w-4" />
          Cheat Sheet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Form Cheat Sheet
          </DialogTitle>
          <DialogDescription>
            Quick reference guide with tips and important information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {!cheatSheet && !isGenerating && !error && (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">
                Generate a personalized cheat sheet for this form
              </p>
              <Button onClick={handleGenerate} size="lg" className="gap-2">
                <Lightbulb className="h-4 w-4" />
                Generate Cheat Sheet
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-400">Generating your personalized cheat sheet...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a minute</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {cheatSheet && (
            <div className="space-y-4">
              {/* Header */}
              <Card className="bg-gradient-primary border-0">
                <CardHeader>
                  <CardTitle className="text-white">{cheatSheet.title}</CardTitle>
                  <CardDescription className="text-gray-200">
                    {cheatSheet.summary}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Preparation Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-green-400" />
                    Preparation Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cheatSheet.preparationChecklist.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step-by-Step Guide */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Step-by-Step Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cheatSheet.stepByStepGuide.map((step) => (
                    <div key={step.step} className="border-l-4 border-l-primary pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">Step {step.step}</Badge>
                        <h4 className="font-semibold">{step.title}</h4>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{step.description}</p>
                      <div className="flex items-start gap-2 text-sm text-yellow-400">
                        <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{step.tip}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Common Mistakes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    Common Mistakes to Avoid
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cheatSheet.commonMistakes.map((item, index) => (
                    <div key={index} className="bg-red-500/10 rounded p-3 border border-red-500/30">
                      <p className="text-sm font-semibold text-red-400 mb-1">
                        ❌ {item.mistake}
                      </p>
                      <p className="text-sm text-gray-300">
                        ✅ {item.solution}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Required Documents */}
              {cheatSheet.requiredDocumentsGuide.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Required Documents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {cheatSheet.requiredDocumentsGuide.map((doc, index) => (
                      <div key={index} className="bg-blue-500/10 rounded p-3 border border-blue-500/30">
                        <p className="font-semibold text-white mb-2">{doc.document}</p>
                        <div className="space-y-1 text-sm text-gray-300">
                          <p><strong>Purpose:</strong> {doc.purpose}</p>
                          <p><strong>Format:</strong> {doc.format}</p>
                          <p><strong>Tips:</strong> {doc.tips}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Important Reminders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Important Reminders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cheatSheet.importantReminders.map((reminder, index) => (
                      <Alert key={index} className="bg-yellow-500/10 border-yellow-500/30">
                        <AlertDescription className="text-yellow-200">
                          {reminder}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Processing Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Processing Time</p>
                      <p className="text-sm font-semibold">{cheatSheet.processingTime}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Fees</p>
                      <p className="text-sm font-semibold">{cheatSheet.fees}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Where to Submit</p>
                      <p className="text-sm font-semibold">{cheatSheet.whereToSubmit}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Download Button */}
              <div className="flex justify-end gap-2 pt-4">
                <Button onClick={handleDownloadPDF} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download as Text File
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
