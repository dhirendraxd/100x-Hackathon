import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { scrapeGovernmentForm, publishScrapedForm } from "@/services/formScraperService";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";
import { safeFirestoreOperation, sanitizeForFirestore, dbLogger } from "@/lib/firestoreHelpers";

const FormScraper = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    formTitle: "",
    department: "",
    documentType: "",
    sourceUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scrapingResult, setScrapingResult] = useState(null);
  const [publishAfterScrape, setPublishAfterScrape] = useState(true);

  // Internal save of scraped JSON for AI (not user-downloadable)
  const saveScrapedJsonInternal = (formId: string, formObject: unknown) => {
    try {
      localStorage.setItem(`scraped_form_json_${formId}`, JSON.stringify(formObject));
    } catch (e) {
      console.error("Failed to persist scraped JSON:", e);
    }
    // Also attempt to persist in Firestore under the form document with proper error handling
    safeFirestoreOperation(
      async () => {
        const ref = doc(db, "government_forms", formId);
        const sanitized = sanitizeForFirestore({ 
          rawJson: formObject, 
          updatedAt: serverTimestamp() 
        });
        await setDoc(ref, sanitized, { merge: true });
        dbLogger.write("government_forms", formId, "update");
        return true;
      },
      undefined,
      "saveScrapedJson"
    );
  };

  const departments = [
    "Department of Passports",
    "Department of Revenue",
    "Department of National ID",
    "Department of Immigration",
    "Ministry of Home Affairs",
    "Ministry of Foreign Affairs",
    "Local Government",
    "Other",
  ];

  const documentTypes = [
    "Passport Application",
    "Citizenship Application",
    "National ID Application",
    "Tax Registration",
    "Voter Registration",
    "Birth Certificate",
    "Marriage Certificate",
    "Land Registration",
    "Business License",
    "Other",
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images, PDF, DOCX)
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (!isImage && !isPdf && !isDocx) {
      toast.error("Please upload an image, PDF, or DOCX file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);

  // Create preview for images
  if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleScrapeForm = async () => {
    if (!user) {
      toast.error("Please log in to scrape forms");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!formData.formTitle) {
      toast.error("Please enter a form title");
      return;
    }

    // Note: Hugging Face API is optional - only needed for AI guidance generation
    // Form scraping works with Tesseract OCR + manual parsing (no AI required)

    setIsLoading(true);
    setScrapingResult(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const imageBase64 = await base64Promise;

      // Call Real AI Scraper Service
      toast.info("Starting AI analysis...", {
        description: "This may take 30-60 seconds",
      });

      const scrapedForm = await scrapeGovernmentForm(
        imageBase64,
        formData.formTitle,
        formData.documentType || "Application"
      );

      console.log("Scraping completed:", scrapedForm);
      
      // Create result object
      const result = {
        success: true,
        formId: scrapedForm.id!,
        message: "Form scraped successfully",
        stats: {
          fieldsDetected: scrapedForm.originalFields.length,
          sectionsCreated: scrapedForm.sections.length,
          documentsRequired: scrapedForm.requiredDocuments.length,
          extractedTextLength: 0,
        },
        form: scrapedForm,
      };
      
      setScrapingResult(result);
      toast.success(`Form "${formData.formTitle}" scraped successfully!`, {
        description: `Detected ${scrapedForm.originalFields.length} fields - Form is ready to use!`,
      });
      
      // Save scraped JSON internally (localStorage for guest users)
      saveScrapedJsonInternal(scrapedForm.id!, scrapedForm);
      
      // AI guidance is now OPTIONAL - user can generate hints later from Form Builder
      // No automatic AI calls during scraping
      
      // Optionally publish to library (only for logged-in users)
      if (user && publishAfterScrape) {
        await publishScrapedForm(scrapedForm, user.uid, user.displayName || user.email?.split('@')[0] || 'Anonymous', user.email || '');
        toast.success("Form published to library", {
          description: "Others can now find and use this form in the library.",
        });
      } else if (user) {
        toast.info("Form saved to your account", {
          description: "You can publish it later from Form Viewer.",
        });
      } else {
        toast.info("Form saved locally", {
          description: "Log in to publish forms and save to your account history.",
        });
      }

      // Reset form
      setFormData({
        formTitle: "",
        department: "",
        documentType: "",
        sourceUrl: "",
      });
      setSelectedFile(null);
      setImagePreview("");

      // Navigate to the form builder to help user fill the scraped form
      setTimeout(() => {
        navigate(`/form-builder/${scrapedForm.id}`);
      }, 2000);
    } catch (error) {
      console.error("Scraping error:", error);
      toast.error("Failed to scrape form", {
        description: (error as Error).message || "An error occurred during AI analysis",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
  <Navigation />
  <div className="h-20 md:h-28" />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Guest User Notice */}
          {!user && (
            <Alert className="border-blue-500/50 bg-blue-500/10 mb-6">
              <Info className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-200">
                You're using Form Scraper as a guest. Your forms will work but won't be saved to your account history. 
                <strong> Log in to publish forms to the library and save your scraping history.</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Government Form Scraper
            </h1>
            <p className="text-gray-300 text-lg">
              Upload and digitize government forms using AI-powered analysis
            </p>
          </div>

          {/* Main Card */}
          <Card className="bg-card/50 backdrop-blur border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Upload Form Document
              </CardTitle>
              <CardDescription>
                Upload an image or PDF of a government form to extract its structure and fields
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">Form Document</Label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-300">
                      {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </label>
                </div>
                
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg border border-white/10"
                    />
                  </div>
                )}
              </div>

              {/* Form Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="form-title">Form Title *</Label>
                  <Input
                    id="form-title"
                    placeholder="e.g., Passport Application Form"
                    value={formData.formTitle}
                    onChange={(e) => handleInputChange("formTitle", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Government Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleInputChange("department", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document-type">Document Type</Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={(value) => handleInputChange("documentType", value)}
                  >
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

                <div className="space-y-2">
                  <Label htmlFor="source-url">Source URL (Optional)</Label>
                  <Input
                    id="source-url"
                    type="url"
                    placeholder="https://example.gov.np/forms/passport"
                    value={formData.sourceUrl}
                    onChange={(e) => handleInputChange("sourceUrl", e.target.value)}
                  />
                </div>
              </div>

              {/* Action Button */}
              {/* Publish toggle - only for logged-in users */}
              {user && (
                <div className="flex items-center gap-2 -mt-2">
                  <Checkbox
                    id="publish-after-scrape"
                    checked={publishAfterScrape}
                    onCheckedChange={(checked) => setPublishAfterScrape(Boolean(checked))}
                  />
                  <Label htmlFor="publish-after-scrape" className="cursor-pointer">
                    Publish to library after scraping
                  </Label>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={handleScrapeForm}
                disabled={isLoading || !selectedFile || !formData.formTitle}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scraping Form...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Scrape Form
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {scrapingResult && (
            <Card className="mt-6 bg-green-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  Form Scraped Successfully!
                </CardTitle>
                <CardDescription className="text-green-200">
                  Redirecting to form builder where you can fill the form with helpful navigation...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {scrapingResult.stats?.fieldsDetected || 0}
                    </div>
                    <div className="text-sm text-gray-400">Fields Detected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {scrapingResult.stats?.sectionsCreated || 0}
                    </div>
                    <div className="text-sm text-gray-400">Sections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {scrapingResult.stats?.documentsRequired || 0}
                    </div>
                    <div className="text-sm text-gray-400">Documents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {scrapingResult.stats?.extractedTextLength || 0}
                    </div>
                    <div className="text-sm text-gray-400">Characters</div>
                  </div>
                </div>
                
                <Alert className="bg-primary/10 border-primary/30">
                  <AlertDescription className="text-sm">
                    Form ID: <span className="font-mono">{scrapingResult.formId}</span>
                    <br />
                    {scrapingResult.message}
                  </AlertDescription>
                </Alert>

                {/* JSON is saved internally for AI assistance; no user download */}
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Alert className="mt-6 bg-blue-500/10 border-blue-500/30">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-sm text-blue-200">
              <strong>How it works:</strong> Upload your government form (image or PDF), and our AI will 
              analyze it to extract fields, sections, and required documents. Once scraped, you'll be 
              redirected to an interactive form builder where you can easily fill out the form with 
              step-by-step navigation and helpful hints.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default FormScraper;
