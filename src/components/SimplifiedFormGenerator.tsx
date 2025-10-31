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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wand2, CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react";
import { toast } from "sonner";

interface SimplifiedFormGeneratorProps {
  formId: string;
  hasSimplifiedFields: boolean;
  currentFieldsCount: number;
  onFieldsGenerated: () => void;
}

interface GenerationResult {
  success: boolean;
  formId: string;
  message: string;
  cached?: boolean;
  stats?: {
    totalFields: number;
    simplifiedFields: number;
    fieldMappings: number;
  };
}

export default function SimplifiedFormGenerator({
  formId,
  hasSimplifiedFields,
  currentFieldsCount,
  onFieldsGenerated,
}: SimplifiedFormGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (regenerate: boolean = false) => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const functions = getFunctions();
      const generateSimplifiedForm = httpsCallable<
        { formId: string; regenerate: boolean },
        GenerationResult
      >(functions, "generateSimplifiedForm");

      const response = await generateSimplifiedForm({
        formId,
        regenerate,
      });

      setResult(response.data);

      if (response.data.success) {
        toast.success(
          regenerate ? "Simplified fields regenerated!" : "Simplified fields generated!",
          {
            description: response.data.message,
          }
        );

        // Refresh the form data
        onFieldsGenerated();
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

  const handleRegenerate = () => {
    if (
      confirm(
        "Are you sure you want to regenerate simplified fields? This will replace existing simplified fields."
      )
    ) {
      handleGenerate(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Wand2 className="h-4 w-4" />
          {hasSimplifiedFields ? "Simplified Fields" : "Generate Simplified"}
          {hasSimplifiedFields && (
            <span className="text-xs text-muted-foreground">
              ({currentFieldsCount})
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            AI-Powered Simplified Form Generator
          </DialogTitle>
          <DialogDescription>
            Transform complex government form fields into user-friendly versions
            with clear language, examples, and helpful hints.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* How it works */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>How it works:</strong>
              <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                <li>AI analyzes each form field</li>
                <li>Generates simple labels and descriptions</li>
                <li>Adds helpful examples and hints</li>
                <li>Creates field mappings for data export</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Current status */}
          {hasSimplifiedFields && !result && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                This form already has <strong>{currentFieldsCount}</strong>{" "}
                simplified fields. You can regenerate them if needed.
              </AlertDescription>
            </Alert>
          )}

          {/* Generation result */}
          {result && result.success && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">{result.message}</p>
                  {result.stats && (
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>Total fields:</strong> {result.stats.totalFields}
                      </p>
                      <p>
                        <strong>Simplified fields:</strong>{" "}
                        {result.stats.simplifiedFields}
                      </p>
                      <p>
                        <strong>Field mappings:</strong>{" "}
                        {result.stats.fieldMappings}
                      </p>
                    </div>
                  )}
                  {result.cached && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Fields were already generated. Use regenerate to create new
                      ones.
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            {!hasSimplifiedFields || result?.cached ? (
              <Button
                onClick={() => handleGenerate(false)}
                disabled={isGenerating}
                className="flex-1 gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generate Simplified Fields
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleRegenerate}
                disabled={isGenerating}
                variant="outline"
                className="flex-1 gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Regenerate Simplified Fields
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Note about timing */}
          <p className="text-xs text-muted-foreground text-center">
            Generation may take 1-3 minutes depending on form complexity.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
