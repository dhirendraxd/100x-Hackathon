import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getScrapedForms, publishScrapedForm } from "@/services/formScraperService.mock";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuthContext } from "@/contexts/AuthContext";
import { GovernmentForm, OriginalFormField, FormAnnotation } from "@/types/governmentForms";
import {
  FileText,
  Clock,
  BarChart3,
  Download,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Info,
  Eye,
  BookOpen,
  FileCheck,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

const FormViewer = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<GovernmentForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    if (formId) {
      loadForm(formId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const loadForm = async (id: string) => {
    setIsLoading(true);
    try {
      // Try local scraped forms first
      const scrapedForms = getScrapedForms();
      let data = scrapedForms.find(form => form.id === id) || null;
      // Fallback to Firestore for cross-user access
      if (!data) {
        const ref = doc(db, "government_forms", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const payload = snap.data() as unknown as Omit<GovernmentForm, 'id'>;
          data = { id: snap.id, ...payload } as GovernmentForm;
        }
      }
      
      if (data) {
        setForm(data);
        if (data.sections && data.sections.length > 0) {
          setSelectedSection(data.sections[0].id);
        }
      } else {
        toast.error("Form not found");
        navigate("/form-library");
      }
    } catch (error) {
      console.error("Error loading form:", error);
      toast.error("Failed to load form");
      navigate("/form-library");
    } finally {
      setIsLoading(false);
    }
  };

  const canPublish = () => {
    if (!user || !form) return false;
    const isScraped = form.tags?.includes('scraped');
    return !!(isScraped && !form.published);
  };

  const handlePublish = () => {
    if (!form || !user) return;
    const updated = publishScrapedForm(form.id!, {
      userId: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      email: user.email || null,
    });
    if (updated) {
      setForm(updated);
      toast.success("Form published", {
        description: "Your form is now visible in the Form Library.",
      });
    } else {
      toast.error("Failed to publish form");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "hard":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return "T";
      case "number":
        return "#";
      case "email":
        return "@";
      case "date":
        return "📅";
      case "checkbox":
        return "☑";
      case "radio":
        return "⚪";
      case "select":
        return "▼";
      case "file-upload":
        return "📎";
      case "signature":
        return "✍";
      default:
        return "?";
    }
  };

  const getCurrentSectionFields = (): OriginalFormField[] => {
    if (!form || !selectedSection) return [];
    
    const section = form.sections.find(s => s.id === selectedSection);
    if (!section) return [];
    
    return form.originalFields.filter(field => 
      section.fields.includes(field.id)
    );
  };

  const getFieldAnnotations = (fieldId: string): FormAnnotation[] => {
    if (!form || !form.annotations) return [];
    return form.annotations.filter(annotation => annotation.fieldId === fieldId);
  };

  const handleAnnotationsGenerated = () => {
    // Reload form data to show new annotations
    if (formId) {
      loadForm(formId);
    }
  };

  const handleStartFilling = () => {
    if (form?.id) {
      navigate(`/form-builder/${form.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
  <Navigation />
  <div className="h-20 md:h-28" />
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-12 w-3/4 mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64 md:col-span-2" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
  <Navigation />
  <div className="h-20 md:h-28" />

      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/form-library")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Button>

        {/* Form Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{form.name}</h1>
              {form.nameNepali && (
                <p className="text-xl text-gray-400">{form.nameNepali}</p>
              )}
            </div>
            <Badge className={getDifficultyColor(form.difficulty)}>
              {form.difficulty}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">{form.department}</Badge>
            <Badge variant="outline">{form.documentType}</Badge>
            <Badge variant="outline">v{form.version}</Badge>
            {form.isVerified && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/30 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {form.aiAnalysis?.estimatedCompletionMinutes || 15}
                    </p>
                    <p className="text-xs text-gray-400">Minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {form.originalFields?.length || 0}
                    </p>
                    <p className="text-xs text-gray-400">Fields</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {form.statistics?.totalSubmissions || 0}
                    </p>
                    <p className="text-xs text-gray-400">Submissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {Math.round((form.statistics?.successRate || 0) * 100)}%
                    </p>
                    <p className="text-xs text-gray-400">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Analysis */}
            {form.aiAnalysis && (
              <Card className="bg-card/50 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="h-5 w-5 text-primary" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Complexity Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-primary"
                          style={{ width: `${form.aiAnalysis.complexityScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-white">
                        {form.aiAnalysis.complexityScore}/100
                      </span>
                    </div>
                  </div>

                  {form.aiAnalysis.tips && form.aiAnalysis.tips.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-white mb-2">Tips</p>
                      <ul className="space-y-1">
                        {form.aiAnalysis.tips.map((tip, index) => (
                          <li key={index} className="text-sm text-gray-400 flex gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {form.aiAnalysis.commonMistakes && form.aiAnalysis.commonMistakes.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-white mb-2">Common Mistakes</p>
                      <ul className="space-y-1">
                        {form.aiAnalysis.commonMistakes.map((mistake, index) => (
                          <li key={index} className="text-sm text-gray-400 flex gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span>{mistake}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Required Documents */}
            {form.requiredDocuments && form.requiredDocuments.length > 0 && (
              <Card className="bg-card/50 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    Required Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {form.requiredDocuments.map((doc) => (
                      <li key={doc.id} className="flex items-start gap-2">
                        {doc.required ? (
                          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{doc.name}</p>
                          <p className="text-xs text-gray-400">{doc.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Formats: {doc.acceptedFormats.join(", ")}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card className="bg-gradient-primary border-0">
              <CardContent className="p-6 space-y-3">
                <Button
                  onClick={handleStartFilling}
                  className="w-full bg-white text-primary hover:bg-gray-100"
                  size="lg"
                >
                  <FileCheck className="mr-2 h-5 w-5" />
                  Start Filling Form
                </Button>
                {canPublish() && (
                  <Button
                    onClick={handlePublish}
                    className="w-full"
                    variant="secondary"
                    size="lg"
                  >
                    Publish to Library
                  </Button>
                )}
                {!user && form.tags?.includes('scraped') && !form.published && (
                  <Alert className="border-blue-500/50 bg-blue-500/10">
                    <Info className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-200 text-sm">
                      Log in to publish this form to the library and share it with others.
                    </AlertDescription>
                  </Alert>
                )}
                {form.pdfUrl && (
                  <Button
                    onClick={() => window.open(form.pdfUrl, "_blank")}
                    className="w-full"
                    variant="outline"
                    size="lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download PDF
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Form Structure */}
          <div className="md:col-span-2">
            {/* Original Form View */}
            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Form Structure
                </CardTitle>
                <CardDescription>
                  Navigate through form sections and view all fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedSection || undefined} onValueChange={setSelectedSection}>
                  <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${form.sections.length}, 1fr)` }}>
                    {form.sections.map((section) => (
                      <TabsTrigger key={section.id} value={section.id}>
                        {section.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                      {form.sections.map((section) => (
                        <TabsContent key={section.id} value={section.id} className="space-y-4 mt-6">
                          {section.description && (
                            <Alert className="bg-blue-500/10 border-blue-500/30">
                              <Info className="h-4 w-4 text-blue-400" />
                              <AlertDescription className="text-blue-200">
                                {section.description}
                              </AlertDescription>
                            </Alert>
                          )}

                          {section.estimatedTimeMinutes && (
                            <p className="text-sm text-gray-400">
                              Estimated time: {section.estimatedTimeMinutes} minutes
                            </p>
                          )}

                          <Separator className="bg-white/10" />

                          {/* Fields List */}
                          <div className="space-y-3">
                            <TooltipProvider>
                              {getCurrentSectionFields().map((field, index) => {
                                const fieldAnnotations = getFieldAnnotations(field.id);
                                const hasAnnotations = fieldAnnotations.length > 0;
                                
                                return (
                                  <Card
                                    key={field.id}
                                    className={`bg-card/30 border-white/10 hover:border-primary/50 transition-all cursor-pointer ${
                                      highlightedField === field.id ? "border-primary shadow-glow" : ""
                                    } ${hasAnnotations ? "border-l-4 border-l-blue-500/50" : ""}`}
                                    onMouseEnter={() => setHighlightedField(field.id)}
                                    onMouseLeave={() => setHighlightedField(null)}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                                          {index + 1}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-start gap-2">
                                              <div>
                                                <p className="font-semibold text-white">
                                                  {field.label}
                                                  {field.required && (
                                                    <span className="text-red-400 ml-1">*</span>
                                                  )}
                                                </p>
                                                {field.labelNepali && (
                                                  <p className="text-sm text-gray-400">{field.labelNepali}</p>
                                                )}
                                              </div>
                                              {hasAnnotations && (
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <HelpCircle className="h-4 w-4 text-blue-400 cursor-help" />
                                                  </TooltipTrigger>
                                                  <TooltipContent className="max-w-sm p-3" side="right">
                                                    <div className="space-y-2">
                                                      {fieldAnnotations.map((annotation) => (
                                                        <div key={annotation.id}>
                                                          <p className="font-semibold text-xs text-blue-400 mb-1">
                                                            {annotation.title}
                                                          </p>
                                                          <p className="text-xs text-gray-300">
                                                            {annotation.content}
                                                          </p>
                                                          {annotation.aiGenerated && (
                                                            <p className="text-xs text-gray-500 mt-1 italic">
                                                              AI-generated
                                                            </p>
                                                          )}
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </TooltipContent>
                                                </Tooltip>
                                              )}
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                              {getFieldTypeIcon(field.type)} {field.type}
                                            </Badge>
                                          </div>
                                          
                                          {field.helpText && (
                                            <p className="text-sm text-gray-400 mb-2">{field.helpText}</p>
                                          )}
                                      
                                      {field.options && field.options.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-xs text-gray-500 mb-1">Options:</p>
                                          <div className="flex flex-wrap gap-1">
                                            {field.options.map((option, i) => (
                                              <Badge key={i} variant="outline" className="text-xs">
                                                {option}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {field.validation && field.validation.length > 0 && (
                                        <div className="mt-2 text-xs text-gray-500">
                                          {field.validation.map((rule, i) => (
                                            <p key={i}>• {rule.message}</p>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                              );
                            })}
                            </TooltipProvider>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FormViewer;
