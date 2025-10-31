/**
 * Mock Form Scraper Service
 * Simulates form scraping by analyzing image dimensions and generating realistic fields
 */

import { GovernmentForm, GovernmentDepartment, DocumentType, OriginalFormField } from "@/types/governmentForms";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { safeFirestoreOperation, sanitizeForFirestore, validateFormData, dbLogger, timestampHelpers } from "@/lib/firestoreHelpers";

interface ScrapeFormParams {
  imageBase64: string;
  formTitle: string;
  department: string;
  documentType: string;
  sourceUrl?: string;
}

interface ScrapeFormResult {
  success: boolean;
  formId: string;
  message: string;
  stats: {
    fieldsDetected: number;
    sectionsCreated: number;
    documentsRequired: number;
    extractedTextLength: number;
  };
  form?: GovernmentForm;
}

/**
 * Analyze image to estimate form complexity
 */
const analyzeFormImage = async (imageBase64: string): Promise<{ width: number; height: number; complexity: 'simple' | 'medium' | 'complex' }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const area = img.width * img.height;
      let complexity: 'simple' | 'medium' | 'complex' = 'medium';
      
      // Estimate complexity based on image size
      if (area < 500000) complexity = 'simple';
      else if (area > 2000000) complexity = 'complex';
      
      resolve({ width: img.width, height: img.height, complexity });
    };
    img.onerror = () => {
      resolve({ width: 800, height: 1200, complexity: 'medium' });
    };
    img.src = imageBase64;
  });
};

/**
 * Generate realistic form fields based on document type and complexity
 */
const generateFormFields = (
  documentType: string,
  formTitle: string,
  complexity: 'simple' | 'medium' | 'complex'
): OriginalFormField[] => {
  const fields: OriginalFormField[] = [];
  let fieldCounter = 1;
  let yPosition = 100;

  const addField = (label: string, type: OriginalFormField['type'], section: string, required: boolean = true, options?: string[], helpText?: string, labelNepali?: string) => {
    fields.push({
      id: `field_${fieldCounter}`,
      label,
      labelNepali,
      type,
      section,
      position: { page: Math.ceil(fieldCounter / 15), x: 100, y: yPosition, width: 350, height: type === 'address' ? 80 : 35 },
      required,
      options,
      helpText,
    });
    fieldCounter++;
    yPosition += type === 'address' ? 100 : 50;
    if (yPosition > 1000) yPosition = 100;
  };

  // Personal Information Section (Common to all forms)
  addField("Full Name", "text", "Personal Information", true, undefined, "Enter your complete name as per citizenship certificate", "पूरा नाम");
  addField("Name in Nepali", "text", "Personal Information", false, undefined, "Optional: Name in Devanagari script");
  addField("Father's Name", "text", "Personal Information", true, undefined, "Father's full name", "बुबाको नाम");
  addField("Mother's Name", "text", "Personal Information", true, undefined, "Mother's full name", "आमाको नाम");
  addField("Grandfather's Name", "text", "Personal Information", false, undefined, "Grandfather's full name", "हजुरबुबाको नाम");
  addField("Date of Birth (BS)", "date", "Personal Information", true, undefined, "Birth date in Bikram Sambat", "जन्म मिति (बि.सं.)");
  addField("Date of Birth (AD)", "date", "Personal Information", false, undefined, "Birth date in Anno Domini");
  addField("Gender", "select", "Personal Information", true, ["Male", "Female", "Other"], "Select your gender", "लिङ्ग");
  addField("Marital Status", "select", "Personal Information", complexity !== 'simple', ["Single", "Married", "Divorced", "Widowed"]);
  
  // Contact Information
  addField("Mobile Number", "phone", "Contact Information", true, undefined, "10-digit mobile number", "मोबाइल नम्बर");
  addField("Alternative Phone", "phone", "Contact Information", false, undefined, "Landline or alternative number");
  addField("Email Address", "email", "Contact Information", complexity === 'complex', undefined, "Valid email address for correspondence");
  
  // Address Information
  addField("Permanent Address - Province", "select", "Address Information", true, 
    ["Province 1", "Madhesh Province", "Bagmati Province", "Gandaki Province", "Lumbini Province", "Karnali Province", "Sudurpashchim Province"],
    "Select your province", "प्रदेश");
  addField("Permanent Address - District", "text", "Address Information", true, undefined, "District name", "जिल्ला");
  addField("Permanent Address - Municipality/VDC", "text", "Address Information", true, undefined, "Municipality or Rural Municipality", "नगरपालिका/गाउँपालिका");
  addField("Permanent Address - Ward No.", "number", "Address Information", true, undefined, "Ward number", "वडा नं.");
  addField("Permanent Address - Tole/Village", "text", "Address Information", true, undefined, "Locality/Tole name", "टोल");
  addField("Full Permanent Address", "address", "Address Information", true, undefined, "Complete permanent address in one field");
  
  // Temporary Address (for complex forms)
  if (complexity !== 'simple') {
    addField("Is Temporary Address Same as Permanent?", "select", "Temporary Address", true, ["Yes", "No"]);
    addField("Temporary Address - District", "text", "Temporary Address", false, undefined, "If different from permanent");
    addField("Temporary Address - Municipality", "text", "Temporary Address", false);
    addField("Temporary Address - Ward No.", "number", "Temporary Address", false);
    addField("Full Temporary Address", "address", "Temporary Address", false);
  }

  // Document-specific fields
  if (formTitle.toLowerCase().includes('passport') || documentType.toLowerCase().includes('passport')) {
    addField("Citizenship Number", "text", "Identity Documents", true, undefined, "Nepalese citizenship certificate number");
    addField("Citizenship Issue Date", "date", "Identity Documents", true);
    addField("Citizenship Issue District", "text", "Identity Documents", true);
    addField("Previous Passport Number", "text", "Passport Details", false, undefined, "If renewing passport");
    addField("Previous Passport Issue Date", "date", "Passport Details", false);
    addField("Purpose of Passport", "select", "Passport Details", true, 
      ["Tourism", "Employment", "Study", "Business", "Official", "Pilgrimage"]);
    addField("Proposed Date of Departure", "date", "Travel Information", false);
    addField("Destination Country", "text", "Travel Information", false);
  }
  
  if (formTitle.toLowerCase().includes('citizenship') || documentType.toLowerCase().includes('citizenship')) {
    addField("Birth Certificate Number", "text", "Birth Information", true);
    addField("Birth Registration Office", "text", "Birth Information", true);
    addField("Place of Birth", "text", "Birth Information", true);
    addField("Citizenship by", "select", "Citizenship Type", true, ["Descent", "Birth", "Naturalization"]);
  }

  if (formTitle.toLowerCase().includes('pan') || formTitle.toLowerCase().includes('tax')) {
    addField("PAN Number", "text", "Tax Information", false, undefined, "If already have PAN");
    addField("Occupation", "select", "Professional Information", true, 
      ["Service", "Business", "Agriculture", "Professional", "Student", "Unemployed", "Other"]);
    addField("Annual Income Range", "select", "Financial Information", true,
      ["Below 5 Lakhs", "5-10 Lakhs", "10-20 Lakhs", "20-50 Lakhs", "Above 50 Lakhs"]);
  }

  if (complexity === 'complex') {
    addField("Educational Qualification", "select", "Background Information", true,
      ["Under SLC", "SLC", "10+2", "Bachelor", "Master", "PhD"]);
    addField("Profession/Occupation", "text", "Background Information", true);
  }

  // Emergency Contact
  if (complexity !== 'simple') {
    addField("Emergency Contact Person Name", "text", "Emergency Contact", false);
    addField("Emergency Contact Number", "phone", "Emergency Contact", false);
    addField("Relationship with Emergency Contact", "text", "Emergency Contact", false);
  }

  // Declaration
  addField("I declare that all information provided is true", "checkbox", "Declaration", true, undefined, "Check to confirm accuracy of information");
  addField("Place of Application", "text", "Declaration", true, undefined, "City/District where applying");
  addField("Date of Application", "date", "Declaration", true);
  addField("Applicant's Signature", "text", "Declaration", true, undefined, "Type your name to sign digitally");

  return fields;
};

/**
 * Generate sections based on unique section names in fields
 */
const generateSections = (fields: OriginalFormField[]) => {
  const sectionMap = new Map<string, { fields: string[]; firstIndex: number }>();
  
  fields.forEach((field, index) => {
    if (!sectionMap.has(field.section)) {
      sectionMap.set(field.section, { fields: [], firstIndex: index });
    }
    sectionMap.get(field.section)!.fields.push(field.id);
  });

  return Array.from(sectionMap.entries()).map(([sectionName, data], index) => ({
    id: `section_${index + 1}`,
    title: sectionName,
    description: `Complete all fields in ${sectionName}`,
    order: index + 1,
    fields: data.fields,
    estimatedTimeMinutes: Math.ceil(data.fields.length * 0.5),
  }));
};

/**
 * Generate required documents based on form type
 */
const generateRequiredDocuments = (documentType: string, formTitle: string) => {
  const docs = [];
  
  // Common documents
  docs.push({
    id: "doc_citizenship",
    name: "Citizenship Certificate",
    type: "citizenship" as const,
    description: "Original and photocopy of citizenship certificate",
    required: true,
    acceptedFormats: ["pdf", "jpg", "png"],
    maxSizeBytes: 5242880,
  });

  docs.push({
    id: "doc_photo",
    name: "Passport Size Photo",
    type: "passport" as const,
    description: "Recent photo with white background (35mm x 45mm)",
    required: true,
    acceptedFormats: ["jpg", "png"],
    maxSizeBytes: 2097152,
  });

  if (formTitle.toLowerCase().includes('passport')) {
    docs.push({
      id: "doc_birth_cert",
      name: "Birth Certificate",
      type: "other" as const,
      description: "Birth certificate from local government",
      required: false,
      acceptedFormats: ["pdf", "jpg"],
      maxSizeBytes: 5242880,
    });
  }

  return docs;
};

/**
 * Mock form scraping - generates comprehensive form structure
 */
export const scrapeGovernmentFormMock = async (
  params: ScrapeFormParams
): Promise<ScrapeFormResult> => {
  // Analyze the uploaded image
  const imageAnalysis = await analyzeFormImage(params.imageBase64);
  
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2500));

  const formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Generate comprehensive fields based on document type and complexity
  const originalFields = generateFormFields(
    params.documentType,
    params.formTitle,
    imageAnalysis.complexity
  );

  // Generate sections from fields
  const sections = generateSections(originalFields);

  // Generate required documents
  const requiredDocuments = generateRequiredDocuments(params.documentType, params.formTitle);

  // Create mock form data
  const mockForm: GovernmentForm = {
    id: formId,
    name: params.formTitle,
    department: mapDepartmentToType(params.department) as GovernmentDepartment,
    documentType: mapDocumentType(params.documentType) as DocumentType,
    version: "1.0",
    difficulty: imageAnalysis.complexity === 'simple' ? 'easy' : imageAnalysis.complexity === 'complex' ? 'hard' : 'medium',
    officialUrl: params.sourceUrl || undefined,
    
    originalFields,
    sections,
    requiredDocuments,

    fieldMappings: [],
    annotations: [],
    simplifiedFields: [],

    aiAnalysis: {
      estimatedCompletionMinutes: Math.ceil(originalFields.length * 0.5),
      complexityScore: imageAnalysis.complexity === 'simple' ? 0.3 : imageAnalysis.complexity === 'complex' ? 0.8 : 0.5,
      legalTermsCount: Math.floor(originalFields.length * 0.2),
    },

    statistics: {
      totalSubmissions: 0,
      successRate: 0,
      averageCompletionTime: 0,
      popularityScore: 0,
    },

    isActive: true,
    isVerified: false,
    needsUpdate: false,
    // Community publishing defaults
    published: false,
    publishedByUserId: undefined,
    publishedByName: undefined,
    publishedByEmail: undefined,
    publishedAt: undefined,
    tags: [params.documentType.toLowerCase(), params.department.toLowerCase(), 'scraped'],
    keywords: [params.formTitle.toLowerCase(), params.documentType.toLowerCase()],
    createdAt: new Date() as unknown as import('firebase/firestore').Timestamp,
    updatedAt: new Date() as unknown as import('firebase/firestore').Timestamp,
    scrapedAt: new Date() as unknown as import('firebase/firestore').Timestamp,
  };

  // Save to localStorage so it appears in Form Library
  const existingForms = JSON.parse(localStorage.getItem("scraped_forms") || "[]");
  existingForms.push(mockForm);
  localStorage.setItem("scraped_forms", JSON.stringify(existingForms));

  // Also persist to Firestore with validation and error handling
  await safeFirestoreOperation(
    async () => {
      const ref = doc(db, "government_forms", formId);
      const sanitizedForm = sanitizeForFirestore(mockForm as unknown as Record<string, unknown>);
      
      // Add server timestamp
      sanitizedForm.createdAt = serverTimestamp();
      sanitizedForm.updatedAt = serverTimestamp();
      
      // Validate before writing
      const validation = validateFormData(sanitizedForm);
      if (!validation.valid) {
        console.warn('Form validation warnings:', validation.errors);
      }
      
      await setDoc(ref, sanitizedForm, { merge: true });
      dbLogger.write("government_forms", formId, "create");
      return true;
    },
    undefined,
    "scrapeForm"
  );

  return {
    success: true,
    formId: formId,
    message: `Successfully scraped "${params.formTitle}"`,
    stats: {
      fieldsDetected: mockForm.originalFields.length,
      sectionsCreated: mockForm.sections.length,
      documentsRequired: mockForm.requiredDocuments.length,
      extractedTextLength: 1250,
    },
    form: mockForm,
  };
};

/**
 * Helper function to map department name to type
 */
function mapDepartmentToType(department: string): string {
  const mapping: Record<string, string> = {
    "Department of Passports": "home-affairs",
    "Department of Revenue": "finance",
    "Department of National ID": "home-affairs",
    "Department of Immigration": "home-affairs",
    "Ministry of Home Affairs": "home-affairs",
    "Ministry of Foreign Affairs": "other",
    "Local Government": "other",
    "Other": "other",
  };
  return mapping[department] || "other";
}

/**
 * Helper function to map document type name to type
 */
function mapDocumentType(documentType: string): string {
  const mapping: Record<string, string> = {
    "Passport Application": "passport",
    "Citizenship Application": "citizenship",
    "National ID Application": "citizenship",
    "Tax Registration": "pan-card",
    "Voter Registration": "other",
    "Birth Certificate": "other",
    "Marriage Certificate": "other",
    "Land Registration": "land-ownership",
    "Business License": "business-registration",
    "Other": "other",
  };
  return mapping[documentType] || "other";
}

/**
 * Get all scraped forms from localStorage
 */
export const getScrapedForms = (): GovernmentForm[] => {
  try {
    const forms = localStorage.getItem("scraped_forms");
    return forms ? JSON.parse(forms) : [];
  } catch (error) {
    console.error("Error loading scraped forms:", error);
    return [];
  }
};

/**
 * Delete a scraped form from localStorage
 */
export const deleteScrapedForm = (formId: string): boolean => {
  try {
    const forms = getScrapedForms();
    const updatedForms = forms.filter((form) => form.id !== formId);
    localStorage.setItem("scraped_forms", JSON.stringify(updatedForms));
    
    // Also try to delete from Firestore with proper error handling
    safeFirestoreOperation(
      async () => {
        const { deleteDoc } = await import('firebase/firestore');
        const ref = doc(db, "government_forms", formId);
        await deleteDoc(ref);
        dbLogger.write("government_forms", formId, "delete");
        return true;
      },
      undefined,
      "deleteForm"
    );
    
    return true;
  } catch (error) {
    console.error("Error deleting scraped form:", error);
    return false;
  }
};

/**
 * Publish a scraped form to make it visible in the Form Library
 */
export const publishScrapedForm = (
  formId: string,
  publisher: { userId: string; name?: string | null; email?: string | null }
): GovernmentForm | null => {
  try {
    const forms = getScrapedForms();
    const idx = forms.findIndex((f) => f.id === formId);
    if (idx === -1) return null;
    
    const updated: GovernmentForm = {
      ...forms[idx],
      published: true,
      publishedByUserId: publisher.userId,
      publishedByName: publisher.name || undefined,
      publishedByEmail: publisher.email || undefined,
      publishedAt: timestampHelpers.now() as unknown as import('firebase/firestore').Timestamp,
      updatedAt: timestampHelpers.now() as unknown as import('firebase/firestore').Timestamp,
    };
    forms[idx] = updated;
    localStorage.setItem("scraped_forms", JSON.stringify(forms));

    // Update Firestore with proper error handling
    safeFirestoreOperation(
      async () => {
        const ref = doc(db, "government_forms", formId);
        const updateData = {
          published: true,
          publishedByUserId: updated.publishedByUserId || null,
          publishedByName: updated.publishedByName || null,
          publishedByEmail: updated.publishedByEmail || null,
          publishedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await updateDoc(ref, updateData);
        dbLogger.write("government_forms", formId, "update");
        return true;
      },
      undefined,
      "publishForm"
    );
    
    return updated;
  } catch (error) {
    console.error("Error publishing scraped form:", error);
    return null;
  }
};
