import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Save, Download, RotateCcw, ChevronRight, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { toast } from "sonner";
import { saveFormDraft } from "@/services/formService";
import { useAuthContext } from "@/contexts/AuthContext";
import { getAutofillData, type AutofillData } from "@/services/userProfileService";

type FormData = {
  service: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  fatherName: string;
  motherName: string;
};

// Extra: Detailed NID fields (dummy UI data for NID)
type NidDetails = {
  // Identification
  nin: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dobBS: string; // B.S.
  dobAD: string; // A.D.
  citizenshipNo: string;
  citizenshipIssueDate: string;
  citizenshipIssueDistrict: string;
  citizenshipType: string;
  birthPlace: string;
  maritalStatus: string;
  religion: string;
  education: string;
  profession: string;

  // Permanent Address
  permState: string;
  permDistrict: string;
  permMunicipality: string;
  permWard: string;
  permVillage: string;
  permPhone: string;
  permMobile: string;

  // Temporary Address
  tempState: string;
  tempDistrict: string;
  tempMunicipality: string;
  tempWard: string;
  tempVillage: string;

  // Family - Father
  fatherFirstName: string;
  fatherMiddleName: string;
  fatherLastName: string;
  fatherCitizenshipNo: string;
  fatherNin: string;

  // Family - Mother
  motherFirstName: string;
  motherMiddleName: string;
  motherLastName: string;
  motherCitizenshipNo: string;
  motherNin: string;

  // Family - Spouse
  spouseFirstName: string;
  spouseMiddleName: string;
  spouseLastName: string;
  spouseCitizenshipNo: string;
  spouseNin: string;
};

const FormFiller = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const location = useLocation();
  const { user } = useAuthContext();
  const [autofillAvailable, setAutofillAvailable] = useState(false);
  const [autofillData, setAutofillData] = useState<AutofillData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    service: "",
    fullName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    fatherName: "",
    motherName: "",
  });

  // NID details state (only used when service === 'National ID (NID)')
  const [nidDetails, setNidDetails] = useState<NidDetails>({
    nin: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dobBS: "",
    dobAD: "",
    citizenshipNo: "",
    citizenshipIssueDate: "",
    citizenshipIssueDistrict: "",
    citizenshipType: "",
    birthPlace: "",
    maritalStatus: "",
    religion: "",
    education: "",
    profession: "",
    permState: "",
    permDistrict: "",
    permMunicipality: "",
    permWard: "",
    permVillage: "",
    permPhone: "",
    permMobile: "",
    tempState: "",
    tempDistrict: "",
    tempMunicipality: "",
    tempWard: "",
    tempVillage: "",
    fatherFirstName: "",
    fatherMiddleName: "",
    fatherLastName: "",
    fatherCitizenshipNo: "",
    fatherNin: "",
    motherFirstName: "",
    motherMiddleName: "",
    motherLastName: "",
    motherCitizenshipNo: "",
    motherNin: "",
    spouseFirstName: "",
    spouseMiddleName: "",
    spouseLastName: "",
    spouseCitizenshipNo: "",
    spouseNin: "",
  });

  // Limited to four core services
  const services = [
    "National ID (NID)",
    "Passport",
    "Citizenship",
    "Voter Card",
  ];

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Check if NID is selected - show all fields at once for NID
  const isNIDForm = formData.service === "National ID (NID)";
  const showAllFields = isNIDForm;

  useEffect(() => {
    // Load autofill data if user is logged in
    const loadAutofillData = async () => {
      if (user) {
        try {
          const data = await getAutofillData(user.uid);
          if (data) {
            setAutofillData(data);
            setAutofillAvailable(true);
          }
        } catch (error) {
          console.error('Error loading autofill data:', error);
        }
      }
    };
    loadAutofillData();

    // Load saved form data from localStorage
    const saved = localStorage.getItem("formData");
    if (saved) {
      setFormData(JSON.parse(saved));
    }
    const savedNid = localStorage.getItem("nidDetails");
    if (savedNid) {
      try {
        setNidDetails(JSON.parse(savedNid));
      } catch (e) {
        console.warn('Failed to parse nidDetails from storage');
      }
    }
    // Prefill service from query string (e.g., /form-filler?service=Passport)
    const params = new URLSearchParams(location.search);
    const svc = params.get("service");
    if (svc) {
      setFormData((prev) => ({ ...prev, service: svc }));
      // Move to next step automatically if service provided
      setCurrentStep(2);
    }
  }, [location.search, user]);

  const applyAutofill = () => {
    if (!autofillData) return;
    
    setFormData(prev => ({
      ...prev,
      fullName: autofillData.fullName || prev.fullName,
      dateOfBirth: autofillData.dateOfBirth || prev.dateOfBirth,
      gender: autofillData.gender || prev.gender,
      email: autofillData.email || prev.email,
      phone: autofillData.phone || prev.phone,
      fatherName: autofillData.fatherName || prev.fatherName,
      motherName: autofillData.motherName || prev.motherName,
    }));
    
    toast.success('Form autofilled successfully!', {
      description: 'Review and update any fields as needed',
      icon: <Sparkles className="h-4 w-4" />,
    });
  };

  // Email notification helpers (Renewal & Status)
  const sendRenewalEmail = async () => {
    const to = (autofillData?.email || user?.email || '').trim();
    if (!to || !to.includes('@')) {
      toast.error('No valid email available for notifications');
      return;
    }
    try {
      const { sendRenewalReminder } = await import('@/services/notificationService');
      await sendRenewalReminder(to, {
        serviceName: formData.service || 'Government Service',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
        applicationId: 'APP-' + Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0'),
        office: 'Nearest Service Center',
        link: window.location.origin + '/form-progress',
        notes: 'This is a friendly reminder to renew before the due date.'
      });
      toast.success('Renewal reminder email sent!');
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      console.error('Renewal email error:', errorMsg);
      toast.error(`Failed to send renewal email: ${errorMsg}`);
    }
  };

  const sendStatusEmail = async () => {
    const to = (autofillData?.email || user?.email || '').trim();
    if (!to || !to.includes('@')) {
      toast.error('No valid email available for notifications');
      return;
    }
    try {
      const { sendStatusUpdate } = await import('@/services/notificationService');
      const statuses = ['received', 'under_review', 'approved', 'ready_for_collection'] as const;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      await sendStatusUpdate(to, {
        serviceName: formData.service || 'Government Service',
        status,
        applicationId: 'APP-' + Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0'),
        lastUpdated: new Date().toISOString(),
        office: 'Nearest Service Center',
        link: window.location.origin + '/form-progress',
        etaDays: status === 'under_review' ? 7 : undefined,
      });
      toast.success('Status update email sent!');
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      console.error('Status email error:', errorMsg);
      toast.error(`Failed to send status email: ${errorMsg}`);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNidChange = (field: keyof NidDetails, value: string) => {
    setNidDetails((prev) => ({ ...prev, [field]: value }));
  };

  const saveProgress = async () => {
    // Save to localStorage for quick recovery
    localStorage.setItem("formData", JSON.stringify(formData));
    localStorage.setItem("nidDetails", JSON.stringify(nidDetails));
    
    // Also save to Firebase Firestore
    try {
      await saveFormDraft(
        user?.uid || 'anonymous',
        formData.service || 'general',
        { ...formData, nidDetails }
      );
      
      if (user) {
        toast.success("Progress saved to your dashboard!");
      } else {
        toast.success("Progress saved locally!");
        toast.info("Log in to save forms to your dashboard", {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Failed to save to Firestore:', error);
      toast.success("Progress saved locally!");
    }
  };

  const resetForm = () => {
    setFormData({
      service: "",
      fullName: "",
      dateOfBirth: "",
      gender: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      fatherName: "",
      motherName: "",
    });
    setNidDetails({
      nin: "",
      firstName: "",
      middleName: "",
      lastName: "",
      dobBS: "",
      dobAD: "",
      citizenshipNo: "",
      citizenshipIssueDate: "",
      citizenshipIssueDistrict: "",
      citizenshipType: "",
      birthPlace: "",
      maritalStatus: "",
      religion: "",
      education: "",
      profession: "",
      permState: "",
      permDistrict: "",
      permMunicipality: "",
      permWard: "",
      permVillage: "",
      permPhone: "",
      permMobile: "",
      tempState: "",
      tempDistrict: "",
      tempMunicipality: "",
      tempWard: "",
      tempVillage: "",
      fatherFirstName: "",
      fatherMiddleName: "",
      fatherLastName: "",
      fatherCitizenshipNo: "",
      fatherNin: "",
      motherFirstName: "",
      motherMiddleName: "",
      motherLastName: "",
      motherCitizenshipNo: "",
      motherNin: "",
      spouseFirstName: "",
      spouseMiddleName: "",
      spouseLastName: "",
      spouseCitizenshipNo: "",
      spouseNin: "",
    });
    setCurrentStep(1);
    localStorage.removeItem("formData");
    localStorage.removeItem("nidDetails");
    toast.success("Form reset successfully!");
  };

  const downloadForm = () => {
    if (!formData.service || !formData.fullName) {
      toast.error("Please fill in at least service type and full name");
      return;
    }
    toast.success(
      "Your form has been prepared! In the full version, this would download a PDF."
    );
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1 && !formData.service) {
      toast.error("Please select a service type");
      return;
    }
    
    if (currentStep === 2) {
      if (!formData.fullName || !formData.dateOfBirth || !formData.gender) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    
    if (currentStep === 3) {
      if (!formData.email || !formData.phone) {
        toast.error("Please fill in email and phone number");
        return;
      }
      // Basic email validation
      if (!formData.email.includes('@')) {
        toast.error("Please enter a valid email address");
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
                      to save your forms to your dashboard and resume them later.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Autofill Available Banner */}
          {user && autofillAvailable && (
            <Alert className="mb-6 border-blue-500/50 bg-blue-500/10">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm">
                  Saved information detected! You can autofill common fields from your profile.
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyAutofill}
                  className="ml-4"
                >
                  <Sparkles className="h-3 w-3 mr-2" />
                  Autofill Now
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Smart Form Filler
            </h1>
            <p className="text-lg text-muted-foreground">
              Fill a simplified demo form similar to the official one
            </p>
          </div>

          {/* Notification shortcuts (visible when we can email) */}
          {user && (autofillData?.email || user.email) && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Email Notifications:</span>
              <Button variant="outline" size="sm" onClick={sendRenewalEmail}>
                <Sparkles className="h-3 w-3 mr-2" /> Send Renewal Reminder
              </Button>
              <Button variant="outline" size="sm" onClick={sendStatusEmail}>
                <Sparkles className="h-3 w-3 mr-2" /> Send Status Update
              </Button>
            </div>
          )}

          {/* Automated Autofill - Coming Soon */}
          {formData.service && (
            <Alert className="mb-6 flex items-center gap-3 border-dashed">
              <Sparkles className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <div className="font-semibold">Automated Autofill</div>
                <AlertDescription>
                  Coming soon: we'll auto-fill this form from your saved profile and documents.
                </AlertDescription>
              </div>
              <Button variant="secondary" disabled>
                Enable Autofill
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  Coming soon
                </span>
              </Button>
            </Alert>
          )}

          {/* Progress Bar - Hide for NID form */}
          {!showAllFields && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">
                {showAllFields ? "National ID (NID) Application Form" : (
                  <>
                    {currentStep === 1 && "Select Service"}
                    {currentStep === 2 && "Personal Details"}
                    {currentStep === 3 && "Contact Information"}
                    {currentStep === 4 && "Family Details"}
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Show all fields for NID, or step-by-step for others */}
              {showAllFields ? (
                /* All fields visible for NID */
                <div className="space-y-8">
                  {/* Service Selection */}
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg">Service Selection</h3>
                    <div className="space-y-2">
                      <Label>Selected Government Service</Label>
                      <Select
                        value={formData.service}
                        onValueChange={(value) => handleInputChange("service", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg">Personal Details</h3>
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          handleInputChange("dateOfBirth", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleInputChange("gender", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* NID Identification Details */}
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg">NID Identification Details</h3>
                    <div className="space-y-2">
                      <Label>National Identity Number (NIN)</Label>
                      <Input
                        value={nidDetails.nin}
                        onChange={(e) => handleNidChange("nin", e.target.value)}
                        placeholder="Enter NIN (if available)"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>First Name (पहिलो नाम)</Label>
                        <Input
                          value={nidDetails.firstName}
                          onChange={(e) => handleNidChange("firstName", e.target.value)}
                          placeholder="Ram / राम"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Middle Name (बीचको नाम)</Label>
                        <Input
                          value={nidDetails.middleName}
                          onChange={(e) => handleNidChange("middleName", e.target.value)}
                          placeholder="Bahadur / बहादुर"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name (थर)</Label>
                        <Input
                          value={nidDetails.lastName}
                          onChange={(e) => handleNidChange("lastName", e.target.value)}
                          placeholder="Sharma / शर्मा"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date of Birth (B.S.)</Label>
                        <Input
                          type="date"
                          value={nidDetails.dobBS}
                          onChange={(e) => handleNidChange("dobBS", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date of Birth (A.D.)</Label>
                        <Input
                          type="date"
                          value={nidDetails.dobAD}
                          onChange={(e) => handleNidChange("dobAD", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Citizenship Certificate No.</Label>
                        <Input
                          value={nidDetails.citizenshipNo}
                          onChange={(e) => handleNidChange("citizenshipNo", e.target.value)}
                          placeholder="e.g., 123-456-789"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Issue Date</Label>
                        <Input
                          type="date"
                          value={nidDetails.citizenshipIssueDate}
                          onChange={(e) => handleNidChange("citizenshipIssueDate", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Issue District</Label>
                        <Input
                          value={nidDetails.citizenshipIssueDistrict}
                          onChange={(e) => handleNidChange("citizenshipIssueDistrict", e.target.value)}
                          placeholder="Kathmandu"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Citizenship Type</Label>
                        <Select
                          value={nidDetails.citizenshipType}
                          onValueChange={(v) => handleNidChange("citizenshipType", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "वंशज",
                              "जन्मसिद्ध",
                              "अंगीकृत",
                              "सम्मानार्थ",
                              "वैवाहिक अंगीकृत",
                            ].map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Birth Place (जन्म स्थान)</Label>
                        <Input
                          value={nidDetails.birthPlace}
                          onChange={(e) => handleNidChange("birthPlace", e.target.value)}
                          placeholder="Birth place"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Marital Status</Label>
                        <Select
                          value={nidDetails.maritalStatus}
                          onValueChange={(v) => handleNidChange("maritalStatus", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {["विवाहित", "अविवाहित", "सम्बन्ध विच्छेद", "विधुर/विधवा"].map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Religion (धर्म)</Label>
                        <Select
                          value={nidDetails.religion}
                          onValueChange={(v) => handleNidChange("religion", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select religion" />
                          </SelectTrigger>
                          <SelectContent>
                            {["हिन्दु", "बौद्ध", "किरात", "क्रिश्चियन", "मुस्लिम", "अन्य"].map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Educational Qualification</Label>
                        <Select
                          value={nidDetails.education}
                          onValueChange={(v) => handleNidChange("education", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select education" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "निरक्षर",
                              "प्राथमिक",
                              "माध्यमिक",
                              "एस.एल.सी. वा सो सरह",
                              "उच्च माध्यमिक",
                              "स्नातक",
                              "स्नातकोत्तर",
                              "विद्यावारिधी",
                            ].map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Profession (पेशा)</Label>
                      <Select
                        value={nidDetails.profession}
                        onValueChange={(v) => handleNidChange("profession", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select profession" />
                        </SelectTrigger>
                        <SelectContent>
                          {["कृषक", "गृहणी", "सरकारी सेवा", "निजी सेवा", "स्वरोजगार", "विद्यार्थी", "अवकाश प्राप्त", "अन्य"].map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg">Contact Information</h3>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="House No, Street, Area"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          placeholder="State"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Pincode</Label>
                      <Input
                        value={formData.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value)}
                        placeholder="XXXXXX"
                        maxLength={6}
                      />
                    </div>
                  </div>

                  {/* Permanent Address (स्थायी ठेगाना) */}
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg">Permanent Address (स्थायी ठेगाना)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>State (प्रदेश)</Label>
                        <Input value={nidDetails.permState} onChange={(e) => handleNidChange("permState", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>District (जिल्ला)</Label>
                        <Input value={nidDetails.permDistrict} onChange={(e) => handleNidChange("permDistrict", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Rural/Municipality (गा.पा./न.पा.)</Label>
                        <Input value={nidDetails.permMunicipality} onChange={(e) => handleNidChange("permMunicipality", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Ward No. (वडा नं.)</Label>
                        <Input value={nidDetails.permWard} onChange={(e) => handleNidChange("permWard", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Village/Tole (गाउँ टोल)</Label>
                        <Input value={nidDetails.permVillage} onChange={(e) => handleNidChange("permVillage", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone No. (फोन नं.)</Label>
                        <Input value={nidDetails.permPhone} onChange={(e) => handleNidChange("permPhone", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile No. (मोबाइल नं.)</Label>
                      <Input value={nidDetails.permMobile} onChange={(e) => handleNidChange("permMobile", e.target.value)} />
                    </div>
                  </div>

                  {/* Temporary Address (अस्थायी ठेगाना) */}
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg">Temporary Address (अस्थायी ठेगाना)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>State (प्रदेश)</Label>
                        <Input value={nidDetails.tempState} onChange={(e) => handleNidChange("tempState", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>District (जिल्ला)</Label>
                        <Input value={nidDetails.tempDistrict} onChange={(e) => handleNidChange("tempDistrict", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Rural/Municipality (गा.पा./न.पा.)</Label>
                        <Input value={nidDetails.tempMunicipality} onChange={(e) => handleNidChange("tempMunicipality", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ward No. (वडा नं.)</Label>
                        <Input value={nidDetails.tempWard} onChange={(e) => handleNidChange("tempWard", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Village/Tole (गाउँ टोल)</Label>
                        <Input value={nidDetails.tempVillage} onChange={(e) => handleNidChange("tempVillage", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Family Details (Section ५) */}
                  <div className="space-y-6 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg">Family Details (Section ५)</h3>

                    {/* Father */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Father's Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input placeholder="First Name" value={nidDetails.fatherFirstName} onChange={(e) => handleNidChange("fatherFirstName", e.target.value)} />
                        <Input placeholder="Middle Name" value={nidDetails.fatherMiddleName} onChange={(e) => handleNidChange("fatherMiddleName", e.target.value)} />
                        <Input placeholder="Last Name" value={nidDetails.fatherLastName} onChange={(e) => handleNidChange("fatherLastName", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Citizenship Certificate No." value={nidDetails.fatherCitizenshipNo} onChange={(e) => handleNidChange("fatherCitizenshipNo", e.target.value)} />
                        <Input placeholder="National Identity Number (NIN)" value={nidDetails.fatherNin} onChange={(e) => handleNidChange("fatherNin", e.target.value)} />
                      </div>
                    </div>

                    {/* Mother */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Mother's Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input placeholder="First Name" value={nidDetails.motherFirstName} onChange={(e) => handleNidChange("motherFirstName", e.target.value)} />
                        <Input placeholder="Middle Name" value={nidDetails.motherMiddleName} onChange={(e) => handleNidChange("motherMiddleName", e.target.value)} />
                        <Input placeholder="Last Name" value={nidDetails.motherLastName} onChange={(e) => handleNidChange("motherLastName", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Citizenship Certificate No." value={nidDetails.motherCitizenshipNo} onChange={(e) => handleNidChange("motherCitizenshipNo", e.target.value)} />
                        <Input placeholder="National Identity Number (NIN)" value={nidDetails.motherNin} onChange={(e) => handleNidChange("motherNin", e.target.value)} />
                      </div>
                    </div>

                    {/* Spouse */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Spouse's Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input placeholder="First Name" value={nidDetails.spouseFirstName} onChange={(e) => handleNidChange("spouseFirstName", e.target.value)} />
                        <Input placeholder="Middle Name" value={nidDetails.spouseMiddleName} onChange={(e) => handleNidChange("spouseMiddleName", e.target.value)} />
                        <Input placeholder="Last Name" value={nidDetails.spouseLastName} onChange={(e) => handleNidChange("spouseLastName", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Citizenship Certificate No." value={nidDetails.spouseCitizenshipNo} onChange={(e) => handleNidChange("spouseCitizenshipNo", e.target.value)} />
                        <Input placeholder="National Identity Number (NIN)" value={nidDetails.spouseNin} onChange={(e) => handleNidChange("spouseNin", e.target.value)} />
                      </div>
                    </div>
                  </div>


                  {/* Family Details */}
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg">Family Details</h3>
                    <div className="space-y-2">
                      <Label>Father's Name</Label>
                      <Input
                        value={formData.fatherName}
                        onChange={(e) =>
                          handleInputChange("fatherName", e.target.value)
                        }
                        placeholder="Enter father's full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mother's Name</Label>
                      <Input
                        value={formData.motherName}
                        onChange={(e) =>
                          handleInputChange("motherName", e.target.value)
                        }
                        placeholder="Enter mother's full name"
                      />
                    </div>
                  </div>

                  {/* Form Summary */}
                  <div className="p-6 bg-primary/10 rounded-lg border border-primary/20">
                    <h4 className="font-bold text-foreground mb-4">
                      Form Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Service:
                        </span>{" "}
                        {formData.service || "Not selected"}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Name:</span>{" "}
                        {formData.fullName || "Not filled"}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Email:
                        </span>{" "}
                        {formData.email || "Not filled"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Step-by-step form for other services */
                <>
                  {/* Step 1: Service Selection */}
                  {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Government Service</Label>
                    <Select
                      value={formData.service}
                      onValueChange={(value) => handleInputChange("service", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 2: Personal Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange("gender", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Information */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="House No, Street, Area"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Pincode</Label>
                    <Input
                      value={formData.pincode}
                      onChange={(e) => handleInputChange("pincode", e.target.value)}
                      placeholder="XXXXXX"
                      maxLength={6}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Family Details */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Father's Name</Label>
                    <Input
                      value={formData.fatherName}
                      onChange={(e) =>
                        handleInputChange("fatherName", e.target.value)
                      }
                      placeholder="Enter father's full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mother's Name</Label>
                    <Input
                      value={formData.motherName}
                      onChange={(e) =>
                        handleInputChange("motherName", e.target.value)
                      }
                      placeholder="Enter mother's full name"
                    />
                  </div>

                  {/* Form Summary */}
                  <div className="mt-8 p-6 bg-primary/10 rounded-lg border border-primary/20">
                    <h4 className="font-bold text-foreground mb-4">
                      Form Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Service:
                        </span>{" "}
                        {formData.service || "Not selected"}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Name:</span>{" "}
                        {formData.fullName || "Not filled"}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Email:
                        </span>{" "}
                        {formData.email || "Not filled"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons - Only for step-by-step forms */}
              {!showAllFields && (
                <div className="flex gap-4 pt-6">
                  {currentStep > 1 && (
                    <Button onClick={prevStep} variant="outline">
                      Previous
                    </Button>
                  )}
                  {currentStep < totalSteps ? (
                    <Button
                      onClick={nextStep}
                      className="ml-auto bg-gradient-primary hover:shadow-glow"
                    >
                      Next <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={downloadForm}
                      className="ml-auto bg-gradient-success hover:shadow-glow"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download Form
                    </Button>
                  )}
                </div>
              )}
              </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-border">
                {showAllFields && (
                  <Button
                    onClick={downloadForm}
                    className="bg-gradient-success hover:shadow-glow"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download Form
                  </Button>
                )}
                <Button onClick={saveProgress} variant="outline">
                  <Save className="w-4 h-4 mr-2" /> Save Progress
                </Button>
                <Button onClick={resetForm} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FormFiller;
