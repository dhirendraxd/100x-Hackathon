import { useState } from "react";
import { Upload, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { toast } from "sonner";
import { saveValidationResult, fileToBase64 } from "@/services/documentValidation";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";
import { useAuthContext } from "@/contexts/AuthContext";

type ValidationResult = {
  check: string;
  passed: boolean;
  message: string;
};

const DocumentChecker = () => {
  const [documentType, setDocumentType] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const { user } = useAuthContext();

  const documentTypes = [
    "Passport Photo",
    "PAN Card Photo",
    "Signature",
    "Address Proof",
    "ID Proof",
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setResults([]);
      toast.success("File uploaded successfully!");
    }
  };

  const validateDocument = async () => {
    if (!uploadedFile || !documentType) {
      toast.error("Please select document type and upload a file");
      return;
    }

    setIsChecking(true);

    try {
      // Basic file validation
      const basicResults: ValidationResult[] = [
        {
          check: "File Format",
          passed: uploadedFile.type.includes("image"),
          message: uploadedFile.type.includes("image")
            ? "Valid image format (JPG/PNG)"
            : "Please upload an image file",
        },
        {
          check: "File Size",
          passed: uploadedFile.size < 5000000,
          message:
            uploadedFile.size < 5000000
              ? "File size is within limits (< 5MB)"
              : "File size too large. Please compress.",
        },
      ];

      // Convert file to base64 for AI validation
      const imageBase64 = await fileToBase64(uploadedFile);

      try {
        // Use Firebase Callable Function (works with emulators and production)
        const callValidate = httpsCallable(functions, 'validateDocument');
        const resp = await callValidate({ imageBase64, documentType });
        const data = (resp && 'data' in resp ? (resp as { data: unknown }).data : {}) as {
          results?: ValidationResult[];
          error?: string;
        };
        
        // Check for API errors
        if (data.error) {
          console.error('Document validation API error:', data.error);
          throw new Error(data.error);
        }
        
        const aiResults = data.results || [];

        // Combine basic and AI results
        const allResults = [...basicResults, ...aiResults];
        setResults(allResults);

        const allPassed = allResults.every((r) => r.passed);
        
        // Save validation results to Firebase Firestore
        try {
          await saveValidationResult({
            userId: user?.uid || 'anonymous',
            documentType,
            fileName: uploadedFile.name,
            fileSize: uploadedFile.size,
            results: allResults,
            timestamp: Timestamp.now(),
            status: allPassed ? 'completed' : 'failed',
          });
          
          // Notify user about saving
          if (user) {
            toast.success("Validation saved to your dashboard!");
          } else {
            toast.info("Log in to save validations to your dashboard", {
              duration: 5000,
            });
          }
        } catch (saveError) {
          console.error('Failed to save validation to Firestore:', saveError);
          // Don't block the user if saving fails
        }

        setIsChecking(false);

        if (allPassed) {
          toast.success("All checks passed! Your document is ready.");
        } else {
          toast.error("Some checks failed. Please review the results.");
        }
      } catch (error) {
        console.error('AI validation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Check if it's a configuration error
        if (errorMessage.includes('HUGGING_FACE_ACCESS_TOKEN')) {
          toast.error("API not configured. Please set up Hugging Face token in Firebase Functions.", {
            duration: 6000,
          });
        } else if (errorMessage.includes('not found') || errorMessage.includes('INTERNAL')) {
          toast.error("Firebase Functions not deployed. Please deploy functions first.", {
            duration: 6000,
          });
        } else {
          toast.warning("Using basic validation. AI features temporarily unavailable.");
        }
        
        // Use fallback results if AI validation fails
        const fallbackResults = [
          ...basicResults,
          { check: 'AI Validation', passed: true, message: 'Using basic validation (AI temporarily unavailable)' }
        ];
        setResults(fallbackResults);
        setIsChecking(false);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setIsChecking(false);
      toast.error("Validation failed. Please try again.");
    }
  };

  const resetChecker = () => {
    setUploadedFile(null);
    setDocumentType("");
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-dark relative">
  <ParticleBackground />
      <Navigation />
      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Login prompt for non-authenticated users */}
          {!user && (
            <Card className="mb-6 border-yellow-500/50 bg-yellow-500/10">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <a href="/login" className="font-semibold text-primary hover:underline">
                        Log in
                      </a>{' '}
                      to save your validations to your dashboard and track your progress.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Document Checker
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload your documents to verify they meet official requirements
            </p>
          </div>

          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">Upload & Validate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Document Type Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Document Type
                </label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload Zone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Upload Document
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      {uploadedFile
                        ? uploadedFile.name
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supported formats: JPG, PNG (Max 5MB)
                    </p>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={validateDocument}
                  disabled={!uploadedFile || !documentType || isChecking}
                  className="flex-1 bg-gradient-success hover:shadow-glow"
                >
                  {isChecking ? "Checking..." : "Validate Document"}
                </Button>
                <Button
                  onClick={resetChecker}
                  variant="outline"
                  disabled={!uploadedFile && !results.length}
                >
                  Reset
                </Button>
              </div>

              {/* Validation Results */}
              {results.length > 0 && (
                <div className="space-y-4 mt-8">
                  <h3 className="text-xl font-bold text-foreground">
                    Validation Results
                  </h3>
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`flex gap-4 p-4 rounded-lg ${
                        result.passed
                          ? "bg-secondary/10 border border-secondary/20"
                          : "bg-destructive/10 border border-destructive/20"
                      }`}
                    >
                      {result.passed ? (
                        <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {result.check}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {result.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tips Section */}
              {documentType === "Passport Photo" && (
                <div className="mt-8 p-6 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex gap-3">
                    <AlertCircle className="w-6 h-6 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-foreground mb-2">
                        Passport Photo Requirements
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Dimensions: 35mm x 45mm</li>
                        <li>• Background: White or light-colored</li>
                        <li>• Face coverage: 70-80% of photo</li>
                        <li>• Expression: Neutral, mouth closed</li>
                        <li>• No glasses or accessories</li>
                        <li>• Photo must be less than 6 months old</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DocumentChecker;
