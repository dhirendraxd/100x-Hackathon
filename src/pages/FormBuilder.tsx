import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getScrapedForms } from "@/services/formScraperService.mock";
import { loadGuidedAssist, GuidedForm, generateGuidedFormAssist, saveGuidedAssist } from "@/services/aiFormGenerator";
import { GovernmentForm, OriginalFormField } from "@/types/governmentForms";
import { useAuthContext } from "@/contexts/AuthContext";
import { isHuggingFaceConfigured } from "@/services/huggingface";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { safeFirestoreOperation, sanitizeForFirestore, timestampHelpers, dbLogger } from "@/lib/firestoreHelpers";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info,
  Save,
  Send,
  Calendar as CalendarIcon,
  Lightbulb,
  FileCheck,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FormData {
  [fieldId: string]: string | boolean | Date | string[];
}

interface FieldError {
  fieldId: string;
  message: string;
}

const FormBuilder = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<GovernmentForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [guidedAssist, setGuidedAssist] = useState<GuidedForm | null>(null);
  const [isGeneratingHints, setIsGeneratingHints] = useState(false);
  const { user } = useAuthContext();

  // Group fields into steps (5-7 fields per step)
  const FIELDS_PER_STEP = 6;
  const [steps, setSteps] = useState<OriginalFormField[][]>([]);

  useEffect(() => {
    if (formId) {
      loadForm(formId);
    }
    // Load saved draft from localStorage
    const savedData = localStorage.getItem(`form_draft_${formId}`);
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
        toast.info("Draft loaded", {
          description: "Your previous progress has been restored.",
        });
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const loadForm = async (id: string) => {
    setIsLoading(true);
    try {
      // Load from scraped forms first, then Firestore fallback
      const scrapedForms = getScrapedForms();
      let data = scrapedForms.find(form => form.id === id) || null;
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
  // Load AI guidance if it exists (optional - can be generated on-demand)
        const assist = await loadGuidedAssist(id);
        setGuidedAssist(assist);
        // Try to fetch guidance from Firestore if not in local storage
        if (!assist) {
          try {
            const ref = doc(db, "ai_guidance", id);
            const snap = await getDoc(ref);
            if (snap.exists()) {
              setGuidedAssist(snap.data() as GuidedForm);
            }
          } catch (_) {
            // Ignore errors; guidance is optional
          }
        }
        
        // Use original fields (scraped forms use originalFields)
        if (!data.originalFields || data.originalFields.length === 0) {
          toast.error("No form fields available", {
            description: "This form doesn't have any fields to fill.",
          });
          navigate(`/form-viewer/${id}`);
          return;
        }

        // Split fields into steps
        const fieldSteps: OriginalFormField[][] = [];
        for (let i = 0; i < data.originalFields.length; i += FIELDS_PER_STEP) {
          fieldSteps.push(data.originalFields.slice(i, i + FIELDS_PER_STEP));
        }
        setSteps(fieldSteps);
      } else {
        toast.error("Form not found");
        navigate("/form-library");
      }
    } catch (error) {
      console.error("Error loading form:", error);
      toast.error("Failed to load form");
    } finally {
      setIsLoading(false);
    }
  };

  const validateField = (field: OriginalFormField): FieldError | null => {
    const value = formData[field.id];

    // Check required fields
    if (field.required && (!value || (typeof value === "string" && value.trim() === ""))) {
      return {
        fieldId: field.id,
        message: `${field.label} is required`,
      };
    }

    // Check validation rules
    if (field.validation && value) {
      for (const rule of field.validation) {
        if (rule.type === "pattern" && typeof value === "string") {
          const regex = new RegExp(rule.value as string);
          if (!regex.test(value)) {
            return {
              fieldId: field.id,
              message: rule.message,
            };
          }
        }
        if (rule.type === "min-length" && typeof value === "string") {
          if (value.length < (rule.value as number)) {
            return {
              fieldId: field.id,
              message: rule.message,
            };
          }
        }
        if (rule.type === "max-length" && typeof value === "string") {
          if (value.length > (rule.value as number)) {
            return {
              fieldId: field.id,
              message: rule.message,
            };
          }
        }
      }
    }

    return null;
  };

  const validateCurrentStep = (): boolean => {
    const currentFields = steps[currentStep] || [];
    const newErrors: FieldError[] = [];

    currentFields.forEach((field) => {
      const error = validateField(field);
      if (error) {
        newErrors.push(error);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
        saveDraft();
      }
    } else {
      toast.error("Please fix the errors before continuing");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const saveDraft = async () => {
    if (formId) {
      localStorage.setItem(`form_draft_${formId}`, JSON.stringify(formData));
      toast.success("Progress saved", {
        description: "Your form data has been saved locally.",
      });
      // Also save to Firestore for authenticated users with proper error handling
      if (user && form) {
        await safeFirestoreOperation(
          async () => {
            const completedFields = Object.keys(formData).filter((k) => {
              const v = (formData as Record<string, unknown>)[k];
              return v !== undefined && v !== null && v !== "";
            });
            const payload = sanitizeForFirestore({
              userId: user.uid,
              formId,
              formVersion: form.version,
              data: formData,
              completedFields,
              completionPercentage: calculateProgress(),
              status: "draft" as const,
              lastModifiedAt: serverTimestamp(),
              createdAt: serverTimestamp(),
            });
            const ref = doc(db, "user_drafts", `${user.uid}_${formId}`);
            await setDoc(ref, payload, { merge: true });
            dbLogger.write("user_drafts", `${user.uid}_${formId}`, "update");
            return true;
          },
          undefined,
          "saveDraft"
        );
      }
    }
  };

  const handleSubmit = async () => {
    // Validate all fields
    let allValid = true;
    const allErrors: FieldError[] = [];

    form?.originalFields?.forEach((field) => {
      const error = validateField(field);
      if (error) {
        allErrors.push(error);
        allValid = false;
      }
    });

    if (!allValid) {
      setErrors(allErrors);
      toast.error("Form has errors", {
        description: "Please review and fix all errors before submitting.",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Save draft locally and to Firestore (if logged in)
      saveDraft();
      // Also record a submission document for analytics with proper error handling
      if (user && formId && form) {
        await safeFirestoreOperation(
          async () => {
            const ref = doc(db, "form_submissions", `${user.uid}_${formId}`);
            const submissionData = sanitizeForFirestore({
              userId: user.uid,
              formId,
              formVersion: form.version,
              data: formData,
              submittedAt: serverTimestamp(),
              status: "submitted",
            });
            await setDoc(ref, submissionData, { merge: true });
            dbLogger.write("form_submissions", `${user.uid}_${formId}`, "create");
            return true;
          },
          undefined,
          "submitForm"
        );
      }
      
      toast.success("Form submitted successfully!", {
        description: "Your form has been saved and is ready for export.",
      });

      // Navigate to export/preview page
      navigate(`/form-viewer/${formId}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAIHints = async () => {
    // Check if HF is configured
    if (!isHuggingFaceConfigured()) {
      toast.error("AI Guidance not available", {
        description: "Please set VITE_HUGGING_FACE_ACCESS_TOKEN in your .env file to use AI hints.",
      });
      return;
    }

    if (!form) {
      toast.error("No form loaded");
      return;
    }

    setIsGeneratingHints(true);
    try {
      toast.info("Generating AI hints...", {
        description: "This may take 30-60 seconds",
      });

      const guidedForm = await generateGuidedFormAssist(form);
      await saveGuidedAssist(guidedForm);
      setGuidedAssist(guidedForm);
      
      // Auto-show hints after generation
      setShowHints(true);

      toast.success("AI hints generated successfully!", {
        description: "Toggle 'Show Hints' to view AI suggestions for each field.",
      });
    } catch (error) {
      console.error("Error generating AI hints:", error);
      toast.error("Failed to generate AI hints", {
        description: (error as Error).message || "An error occurred during AI processing",
      });
    } finally {
      setIsGeneratingHints(false);
    }
  };

  const updateFieldValue = (fieldId: string, value: string | boolean | Date | string[] | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    
    // Clear error for this field
    setErrors((prev) => prev.filter((e) => e.fieldId !== fieldId));
  };

  const getFieldError = (fieldId: string): string | undefined => {
    return errors.find((e) => e.fieldId === fieldId)?.message;
  };

  const calculateProgress = (): number => {
    if (!form?.originalFields) return 0;
    const totalFields = form.originalFields.length;
    const filledFields = form.originalFields.filter((field) => {
      const value = formData[field.id];
      return value !== undefined && value !== "" && value !== null;
    }).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  const renderField = (field: OriginalFormField) => {
    const value = formData[field.id];
    const error = getFieldError(field.id);
    // Find guided field data from array
    const assist = guidedAssist?.fields?.find(f => f.id === field.id);

    const commonLabelProps = (
      <div className="space-y-1 mb-2">
        <Label htmlFor={field.id} className="text-base font-semibold text-white">
          {field.label}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </Label>
        {field.labelNepali && (
          <p className="text-sm text-gray-400">{field.labelNepali}</p>
        )}
        {field.helpText && (
          <p className="text-sm text-gray-400">{field.helpText}</p>
        )}
      </div>
    );

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <div key={field.id} className="space-y-2">
            {commonLabelProps}
            <Input
              id={field.id}
              type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
              value={(value as string) || ""}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              placeholder={assist?.placeholder}
              className={cn(
                "bg-card/50 border-white/20",
                error && "border-red-500"
              )}
            />
            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            {!error && assist?.aiExample && showHints && (
              <p className="text-sm text-green-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Example: {assist.aiExample}
              </p>
            )}
            {!error && assist?.aiHint && showHints && (
              <p className="text-sm text-yellow-400 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                {assist.aiHint}
              </p>
            )}
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="space-y-2">
            {commonLabelProps}
            <Input
              id={field.id}
              type="number"
              value={(value as string) || ""}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              className={cn(
                "bg-card/50 border-white/20",
                error && "border-red-500"
              )}
            />
            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>
        );

      case "address":
        return (
          <div key={field.id} className="space-y-2">
            {commonLabelProps}
            <Textarea
              id={field.id}
              value={(value as string) || ""}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              rows={4}
              placeholder={assist?.placeholder}
              className={cn(
                "bg-card/50 border-white/20",
                error && "border-red-500"
              )}
            />
            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            {!error && assist?.aiHint && showHints && (
              <p className="text-sm text-yellow-400 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                {assist.aiHint}
              </p>
            )}
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="space-y-2">
            {commonLabelProps}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-card/50 border-white/20",
                    !value && "text-muted-foreground",
                    error && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value instanceof Date ? format(value, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={value instanceof Date ? value : undefined}
                  onSelect={(date) => updateFieldValue(field.id, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            {commonLabelProps}
            <Select value={(value as string) || ""} onValueChange={(val) => updateFieldValue(field.id, val)}>
              <SelectTrigger className={cn("bg-card/50 border-white/20", error && "border-red-500")}>
                <SelectValue placeholder={assist?.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            {!error && assist?.aiHint && showHints && (
              <p className="text-sm text-yellow-400 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                {assist.aiHint}
              </p>
            )}
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-2">
            {commonLabelProps}
            <RadioGroup value={(value as string) || ""} onValueChange={(val) => updateFieldValue(field.id, val)}>
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}_${option}`} />
                  <Label htmlFor={`${field.id}_${option}`} className="font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            {!error && assist?.aiHint && showHints && (
              <p className="text-sm text-yellow-400 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                {assist.aiHint}
              </p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="space-y-2">
            {commonLabelProps}
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                checked={(value as boolean) || false}
                onCheckedChange={(checked) => updateFieldValue(field.id, checked)}
              />
              <Label htmlFor={field.id} className="font-normal cursor-pointer">
                {field.helpText || assist?.aiHint || "I agree"}
              </Label>
            </div>
            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.id} className="space-y-2">
            {commonLabelProps}
            <Input
              id={field.id}
              value={(value as string) || ""}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="bg-card/50 border-white/20"
            />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
  <Navigation />
  <div className="h-20 md:h-28" />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading form...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  const progress = calculateProgress();
  const totalFieldCount = form.originalFields?.length || 0;
  const filledFieldCount = form.originalFields?.filter((f) => {
    const v = formData[f.id];
    return v !== undefined && v !== "" && v !== null;
  }).length || 0;
  const currentFields = steps[currentStep] || [];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-dark">
  <Navigation />
  <div className="h-20 md:h-28" />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Guest User Notice */}
        {!user && (
          <Alert className="border-blue-500/50 bg-blue-500/10 mb-4">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200 text-sm">
              You're filling this form as a guest. Your progress will be saved locally but won't sync to your account. 
              <strong> Log in to save your forms and access them from any device.</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Dashboard Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/form-viewer/${formId}`)}
            className="mb-3 hover:bg-white/5"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Form Details
          </Button>

          {/* Main Stats Card */}
          <Card className="bg-gradient-to-br from-primary/10 via-card/50 to-card/30 backdrop-blur border-white/10 shadow-glow">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl md:text-3xl text-white flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <FileCheck className="h-6 w-6 text-primary" />
                    </div>
                    {form.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    Complete your application step by step
                  </CardDescription>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    onClick={saveDraft} 
                    size="sm"
                    className="bg-white/5 hover:bg-white/10 border-white/20"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  {!guidedAssist && (
                    <Button
                      variant="outline"
                      onClick={handleGenerateAIHints}
                      size="sm"
                      disabled={isGeneratingHints}
                      className="bg-white/5 hover:bg-white/10 border-white/20"
                    >
                      <Lightbulb className={cn("h-4 w-4 mr-2", isGeneratingHints && "animate-pulse text-yellow-400")} />
                      {isGeneratingHints ? "Generating..." : "AI Hints"}
                    </Button>
                  )}
                  {guidedAssist && (
                    <Button
                      variant="outline"
                      onClick={() => setShowHints(!showHints)}
                      size="sm"
                      className={cn(
                        "border-white/20",
                        showHints ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300" : "bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <Lightbulb className={cn("h-4 w-4 mr-2", showHints && "text-yellow-400")} />
                      {showHints ? "Hide" : "Show"} Hints
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Bar with Stats */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">Progress</span>
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                      Step {currentStep + 1} of {steps.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{filledFieldCount} / {totalFieldCount} fields</span>
                    <span className="text-2xl font-bold text-primary">{progress}%</span>
                  </div>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Form Section */}
          <div className="lg:col-span-8 space-y-4">
            {/* Form Fields Card */}
            <Card className="bg-card/50 backdrop-blur border-white/10 shadow-lg">
              <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Step {currentStep + 1}: Fill in the Details</CardTitle>
                    <CardDescription className="mt-1">
                      Complete all required fields marked with <span className="text-red-400">*</span>
                    </CardDescription>
                  </div>
                  {errors.length > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      {errors.length} {errors.length === 1 ? 'Error' : 'Errors'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {currentFields.map((field) => renderField(field))}
              </CardContent>
            </Card>

            {/* Navigation Card */}
            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="min-w-[120px]"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="hidden md:flex items-center gap-2">
                    {steps.map((_, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "h-2 w-12 rounded-full transition-all",
                          idx < currentStep && "bg-primary",
                          idx === currentStep && "bg-primary/50",
                          idx > currentStep && "bg-white/10"
                        )}
                      />
                    ))}
                  </div>

                  {isLastStep ? (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSaving} 
                      className="min-w-[120px] bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Form
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleNext}
                      className="min-w-[120px]"
                      size="lg"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Dashboard Stats */}
          <div className="lg:col-span-4 space-y-4">
            {/* Progress Overview Card */}
            <Card className="bg-gradient-to-br from-primary/5 to-card/50 backdrop-blur border-white/10 sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Circular Progress Visual */}
                <div className="flex items-center justify-center py-4">
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-white/10"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                        className="text-primary transition-all duration-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{progress}%</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-2xl font-bold text-primary">{filledFieldCount}</div>
                    <div className="text-xs text-gray-400">Completed</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-2xl font-bold text-gray-400">{totalFieldCount - filledFieldCount}</div>
                    <div className="text-xs text-gray-400">Remaining</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-2xl font-bold text-white">{steps.length}</div>
                    <div className="text-xs text-gray-400">Total Steps</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-2xl font-bold text-primary">{currentStep + 1}</div>
                    <div className="text-xs text-gray-400">Current Step</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Steps Tracker Card */}
            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Step Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer",
                      index === currentStep && "bg-primary/20 border border-primary/30",
                      index < currentStep && "bg-primary/5 border border-transparent hover:bg-primary/10",
                      index > currentStep && "bg-white/5 border border-transparent hover:bg-white/10"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                        index < currentStep && "bg-primary text-white",
                        index === currentStep && "bg-primary/50 text-white ring-4 ring-primary/20",
                        index > currentStep && "bg-white/10 text-gray-400"
                      )}
                    >
                      {index < currentStep ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className={cn(
                        "text-sm font-medium",
                        index === currentStep && "text-white",
                        index < currentStep && "text-gray-400",
                        index > currentStep && "text-gray-500"
                      )}>
                        Step {index + 1}
                      </div>
                      <div className="text-xs text-gray-500">
                        {index < currentStep && "Completed ✓"}
                        {index === currentStep && "In Progress..."}
                        {index > currentStep && "Pending"}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Help & Tips Card */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-card/50 backdrop-blur border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-400" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <p className="text-gray-400">Green examples show the correct format</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5"></div>
                  <p className="text-gray-400">Yellow tips help avoid common mistakes</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                  <p className="text-gray-400">Progress auto-saves as you type</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5"></div>
                  <p className="text-gray-400">Return anytime to continue where you left off</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
