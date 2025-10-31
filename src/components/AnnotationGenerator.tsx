import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Sparkles, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

interface AnnotationGeneratorProps {
  formId: string;
  currentAnnotationsCount?: number;
  onAnnotationsGenerated?: () => void;
}

interface AnnotationResult {
  success: boolean;
  formId: string;
  message: string;
  cached?: boolean;
  stats?: {
    totalFields: number;
    complexFields: number;
    annotationsGenerated: number;
  };
}

const AnnotationGenerator = ({ 
  formId, 
  currentAnnotationsCount = 0,
  onAnnotationsGenerated 
}: AnnotationGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AnnotationResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerateAnnotations = async (regenerate: boolean = false) => {
    setIsGenerating(true);
    setResult(null);

    try {
      const generateFunction = httpsCallable(functions, "generateFormAnnotations");
      const response = await generateFunction({
        formId,
        regenerate,
      });

      const data = response.data as AnnotationResult;
      
      if (data?.success) {
        setResult(data);
        toast.success(data.message || "Annotations generated successfully!");
        
        // Call callback to refresh form data
        if (onAnnotationsGenerated) {
          setTimeout(() => {
            onAnnotationsGenerated();
          }, 1000);
        }
      } else {
        toast.error("Failed to generate annotations");
      }
    } catch (error) {
      console.error("Error generating annotations:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred while generating annotations";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {currentAnnotationsCount > 0 ? "Regenerate" : "Generate"} AI Annotations
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Annotation Generator
          </DialogTitle>
          <DialogDescription>
            Automatically generate helpful explanations for complex legal and technical terms in this form.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          {currentAnnotationsCount > 0 && (
            <Alert className="bg-blue-500/10 border-blue-500/30">
              <Info className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-200">
                This form currently has {currentAnnotationsCount} AI-generated annotations.
              </AlertDescription>
            </Alert>
          )}

          {/* What it does */}
          <Card className="bg-card/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-base">How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-400">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Scans all form fields for complex legal, technical, and bureaucratic terms</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Uses advanced AI (Mistral-7B) to generate simple, easy-to-understand explanations</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Creates interactive tooltips to help users understand what each term means</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Provides practical context and examples relevant to the form</span>
              </p>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className={result.cached ? "bg-blue-500/10 border-blue-500/30" : "bg-green-500/10 border-green-500/30"}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {result.cached ? (
                    <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold mb-2 ${result.cached ? "text-blue-200" : "text-green-200"}`}>
                      {result.message}
                    </p>
                    {result.stats && (
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-2xl font-bold text-white">{result.stats.totalFields}</p>
                          <p className="text-xs text-gray-400">Total Fields</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{result.stats.complexFields}</p>
                          <p className="text-xs text-gray-400">Complex Fields</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{result.stats.annotationsGenerated}</p>
                          <p className="text-xs text-gray-400">Annotations</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warning */}
          {currentAnnotationsCount > 0 && (
            <Alert className="bg-yellow-500/10 border-yellow-500/30">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-200">
                Regenerating will replace all existing annotations. This process may take several minutes.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleGenerateAnnotations(false)}
              disabled={isGenerating || currentAnnotationsCount > 0}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Annotations
                </>
              )}
            </Button>
            
            {currentAnnotationsCount > 0 && (
              <Button
                onClick={() => handleGenerateAnnotations(true)}
                disabled={isGenerating}
                variant="outline"
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Regenerate All
                  </>
                )}
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            Estimated time: 30-60 seconds for most forms
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnnotationGenerator;
