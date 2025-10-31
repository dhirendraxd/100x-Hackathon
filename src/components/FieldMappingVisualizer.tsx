import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SimplifiedFormField, OriginalFormField, FieldMapping } from "@/types/governmentForms";
import { ArrowRight, Info, MapPin, Layers, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldMappingVisualizerProps {
  simplifiedFields: SimplifiedFormField[];
  originalFields: OriginalFormField[];
  fieldMappings?: FieldMapping[];
}

export default function FieldMappingVisualizer({
  simplifiedFields,
  originalFields,
  fieldMappings,
}: FieldMappingVisualizerProps) {
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const getOriginalField = (simplifiedField: SimplifiedFormField): OriginalFormField | undefined => {
    return originalFields.find((f) => f.id === simplifiedField.mappingTo);
  };

  const getMapping = (simplifiedFieldId: string): FieldMapping | undefined => {
    return fieldMappings?.find((m) => m.simplifiedFieldId === simplifiedFieldId);
  };

  const getTransformationDescription = (
    simplified: SimplifiedFormField,
    original: OriginalFormField
  ): string[] => {
    const transformations: string[] = [];

    if (simplified.label !== original.label) {
      transformations.push(`Label simplified from "${original.label}" to "${simplified.label}"`);
    }

    if (simplified.description) {
      transformations.push(`Added clear description: "${simplified.description}"`);
    }

    if (simplified.example) {
      transformations.push(`Added example: "${simplified.example}"`);
    }

    if (simplified.hint) {
      transformations.push(`Added helpful hint: "${simplified.hint}"`);
    }

    if (simplified.placeholder !== original.placeholder) {
      transformations.push(`Improved placeholder text`);
    }

    return transformations;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <MapPin className="h-4 w-4" />
          View Field Mappings
          <Badge variant="secondary" className="ml-2">
            {simplifiedFields.length}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Field Mapping Visualization
          </DialogTitle>
          <DialogDescription>
            See how simplified fields map to original form fields
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Each simplified field corresponds to one or more original fields. Click on a
              mapping to see the transformation details.
            </AlertDescription>
          </Alert>

          {/* Mappings List */}
          <div className="space-y-3">
            {simplifiedFields.map((simplifiedField, index) => {
              const originalField = getOriginalField(simplifiedField);
              const mapping = getMapping(simplifiedField.id);
              const isSelected = selectedMapping === simplifiedField.id;

              if (!originalField) return null;

              const transformations = getTransformationDescription(
                simplifiedField,
                originalField
              );

              return (
                <div key={simplifiedField.id} className="space-y-2">
                  <Card
                    className={cn(
                      "transition-all cursor-pointer hover:border-primary/50",
                      isSelected && "border-primary shadow-lg"
                    )}
                    onClick={() =>
                      setSelectedMapping(isSelected ? null : simplifiedField.id)
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Index */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                          {index + 1}
                        </div>

                        {/* Simplified Field */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Layers className="h-4 w-4 text-green-400" />
                            <p className="font-semibold text-white">
                              {simplifiedField.label}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              Simplified
                            </Badge>
                          </div>
                          {simplifiedField.description && (
                            <p className="text-sm text-gray-400 ml-6">
                              {simplifiedField.description}
                            </p>
                          )}
                        </div>

                        {/* Arrow */}
                        <ArrowRight className="h-6 w-6 text-primary flex-shrink-0" />

                        {/* Original Field */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-blue-400" />
                            <p className="font-semibold text-white">
                              {originalField.label}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              Original
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 ml-6">
                            Section: {originalField.section}
                          </p>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                          {/* Transformations */}
                          <div>
                            <p className="text-sm font-semibold text-white mb-2">
                              Transformations Applied:
                            </p>
                            <div className="space-y-1">
                              {transformations.map((transform, i) => (
                                <div
                                  key={i}
                                  className="text-sm text-gray-300 flex items-start gap-2"
                                >
                                  <span className="text-green-400">✓</span>
                                  <span>{transform}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Field Details Comparison */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Simplified */}
                            <div className="bg-green-500/10 rounded p-3 border border-green-500/30">
                              <p className="text-xs font-semibold text-green-400 mb-2">
                                SIMPLIFIED VERSION
                              </p>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-500">Type:</span>{" "}
                                  <span className="text-white">{simplifiedField.type}</span>
                                </div>
                                {simplifiedField.placeholder && (
                                  <div>
                                    <span className="text-gray-500">Placeholder:</span>{" "}
                                    <span className="text-gray-300">
                                      {simplifiedField.placeholder}
                                    </span>
                                  </div>
                                )}
                                {simplifiedField.example && (
                                  <div>
                                    <span className="text-gray-500">Example:</span>{" "}
                                    <span className="text-gray-300">
                                      {simplifiedField.example}
                                    </span>
                                  </div>
                                )}
                                {simplifiedField.hint && (
                                  <div>
                                    <span className="text-gray-500">Hint:</span>{" "}
                                    <span className="text-gray-300">
                                      {simplifiedField.hint}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Original */}
                            <div className="bg-blue-500/10 rounded p-3 border border-blue-500/30">
                              <p className="text-xs font-semibold text-blue-400 mb-2">
                                ORIGINAL VERSION
                              </p>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-500">Type:</span>{" "}
                                  <span className="text-white">{originalField.type}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Section:</span>{" "}
                                  <span className="text-gray-300">
                                    {originalField.section}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Required:</span>{" "}
                                  <span className="text-gray-300">
                                    {originalField.required ? "Yes" : "No"}
                                  </span>
                                </div>
                                {originalField.helpText && (
                                  <div>
                                    <span className="text-gray-500">Help Text:</span>{" "}
                                    <span className="text-gray-300">
                                      {originalField.helpText}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Mapping Instructions */}
                          {mapping && (
                            <div className="bg-yellow-500/10 rounded p-3 border border-yellow-500/30">
                              <p className="text-xs font-semibold text-yellow-400 mb-2">
                                MAPPING INSTRUCTIONS
                              </p>
                              <p className="text-sm text-gray-300">
                                {mapping.instructions}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <Card className="bg-card/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Mapping Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Simplified Fields:</span>
                <span className="text-white font-semibold">
                  {simplifiedFields.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Original Fields:</span>
                <span className="text-white font-semibold">
                  {originalFields.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mapping Coverage:</span>
                <span className="text-green-400 font-semibold">100%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
