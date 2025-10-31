import { GovernmentForm, SimplifiedFormField, OriginalFormField, FormSection, RequiredDocument, FormAnnotation, FieldMapping } from "@/types/governmentForms";
import { Timestamp } from 'firebase/firestore';

/**
 * Mock Government Forms Data
 * This file contains sample data to demonstrate the application features
 * without needing to deploy Firebase or use AI services
 */

export const mockForms: GovernmentForm[] = [
  {
    id: "passport-application-2024",
    name: "Passport Application Form",
    nameNepali: "राहदानी आवेदन फारम",
    department: "home-affairs",
    documentType: "passport",
    version: "2024.1",
    difficulty: "medium",
    officialUrl: "https://www.nepalpassport.gov.np",
    pdfUrl: "/sample-forms/passport-application.pdf",
    
    originalFields: [
      {
        id: "field_1",
        label: "Full Name (As per Citizenship Certificate)",
        labelNepali: "पूरा नाम (नागरिकता प्रमाणपत्र अनुसार)",
        type: "text",
        section: "Personal Information",
        position: { page: 1, x: 100, y: 150, width: 300, height: 30 },
        required: true,
        placeholder: "Enter your full name",
        helpText: "Name should match your citizenship certificate exactly",
        isComplex: false,
      },
      {
        id: "field_2",
        label: "Date of Birth (B.S.)",
        type: "date",
        section: "Personal Information",
        position: { page: 1, x: 100, y: 200, width: 200, height: 30 },
        required: true,
        placeholder: "YYYY-MM-DD",
        helpText: "Enter date in Bikram Sambat calendar",
        isComplex: true,
      },
      {
        id: "field_3",
        label: "Citizenship Certificate Number",
        type: "text",
        section: "Personal Information",
        position: { page: 1, x: 100, y: 250, width: 250, height: 30 },
        required: true,
        placeholder: "e.g., 123-456-789",
        validation: [
          {
            type: "pattern",
            value: "^[0-9]{3}-[0-9]{3}-[0-9]{3}$",
            message: "Format: XXX-XXX-XXX",
          },
        ],
        isComplex: false,
      },
      {
        id: "field_4",
        label: "Permanent Address (Tole, Ward, Municipality, District)",
        type: "address",
        section: "Address Details",
        position: { page: 1, x: 100, y: 300, width: 400, height: 60 },
        required: true,
        placeholder: "Full address",
        isComplex: false,
      },
      {
        id: "field_5",
        label: "Contact Number (Mobile)",
        type: "phone",
        section: "Contact Information",
        position: { page: 1, x: 100, y: 380, width: 200, height: 30 },
        required: true,
        placeholder: "98XXXXXXXX",
        validation: [
          {
            type: "pattern",
            value: "^9[78][0-9]{8}$",
            message: "Must be valid Nepali mobile number",
          },
        ],
        isComplex: false,
      },
      {
        id: "field_6",
        label: "Email Address",
        type: "email",
        section: "Contact Information",
        position: { page: 1, x: 100, y: 430, width: 300, height: 30 },
        required: false,
        placeholder: "your.email@example.com",
        isComplex: false,
      },
      {
        id: "field_7",
        label: "Passport Type",
        type: "select",
        section: "Passport Details",
        position: { page: 2, x: 100, y: 100, width: 200, height: 30 },
        required: true,
        options: ["Regular", "Official", "Diplomatic"],
        isComplex: true,
      },
      {
        id: "field_8",
        label: "Purpose of Passport",
        type: "select",
        section: "Passport Details",
        position: { page: 2, x: 100, y: 150, width: 250, height: 30 },
        required: true,
        options: ["Tourism", "Employment", "Education", "Business", "Other"],
        isComplex: false,
      },
    ],

    simplifiedFields: [
      {
        id: "simplified_field_1",
        label: "Your Full Name",
        labelNepali: "तपाईंको पूरा नाम",
        type: "text",
        description: "Write your complete name exactly as it appears on your citizenship certificate",
        descriptionNepali: "तपाईंको नागरिकता प्रमाणपत्रमा भएको जस्तै पूरा नाम लेख्नुहोस्",
        required: true,
        placeholder: "Ramesh Kumar Sharma",
        hint: "Double-check spelling and spacing - it must match your citizenship",
        hintNepali: "हिज्जे र खाली ठाउँ जाँच गर्नुहोस् - यो तपाईंको नागरिकतासँग मिल्नुपर्छ",
        example: "Sita Devi Thapa",
        mappingTo: "field_1",
        validation: [],
      },
      {
        id: "simplified_field_2",
        label: "When Were You Born?",
        type: "date",
        description: "Select your birth date from the calendar. The system will convert to Bikram Sambat automatically.",
        required: true,
        placeholder: "Click to select date",
        hint: "If you only know the B.S. date, you can use an online converter first",
        example: "15/08/1990",
        mappingTo: "field_2",
        validation: [],
      },
      {
        id: "simplified_field_3",
        label: "Citizenship Number",
        type: "text",
        description: "Enter the number from your citizenship certificate (format: XXX-XXX-XXX)",
        required: true,
        placeholder: "123-456-789",
        hint: "Include the dashes between numbers",
        example: "012-345-678",
        mappingTo: "field_3",
        validation: [
          {
            type: "pattern",
            value: "^[0-9]{3}-[0-9]{3}-[0-9]{3}$",
            message: "Use format: XXX-XXX-XXX (with dashes)",
          },
        ],
      },
      {
        id: "simplified_field_4",
        label: "Where Do You Live?",
        type: "address",
        description: "Enter your complete permanent address including tole/street, ward number, municipality, and district",
        required: true,
        placeholder: "Thamel-26, Ward 3, Kathmandu Metropolitan City, Kathmandu",
        hint: "Use your permanent address, not temporary residence",
        example: "Bouddha, Ward 6, Kathmandu Metropolitan City, Kathmandu",
        mappingTo: "field_4",
        validation: [],
      },
      {
        id: "simplified_field_5",
        label: "Your Mobile Number",
        type: "phone",
        description: "Enter your 10-digit mobile number that you actively use",
        required: true,
        placeholder: "9801234567",
        hint: "Make sure this number is active - you'll receive updates here",
        example: "9851234567",
        mappingTo: "field_5",
        validation: [
          {
            type: "pattern",
            value: "^9[78][0-9]{8}$",
            message: "Must start with 97 or 98 and be 10 digits",
          },
        ],
      },
      {
        id: "simplified_field_6",
        label: "Email Address (Optional)",
        type: "email",
        description: "If you have an email, enter it here. You'll receive application updates via email.",
        required: false,
        placeholder: "ramesh.sharma@gmail.com",
        hint: "You can skip this if you don't have email",
        example: "sita.thapa@yahoo.com",
        mappingTo: "field_6",
        validation: [],
      },
      {
        id: "simplified_field_7",
        label: "What Type of Passport?",
        type: "select",
        description: "Most people need 'Regular' passport. Choose 'Official' only if you're a government employee traveling for official work.",
        required: true,
        placeholder: "Select passport type",
        hint: "Regular passport is for personal travel (tourism, work abroad, etc.)",
        mappingTo: "field_7",
        options: [
          { value: "Regular", label: "Regular (for personal use)" },
          { value: "Official", label: "Official (for government employees)" },
          { value: "Diplomatic", label: "Diplomatic (for diplomats only)" },
        ],
        validation: [],
      },
      {
        id: "simplified_field_8",
        label: "Why Do You Need a Passport?",
        type: "select",
        description: "Select the main reason you're applying for a passport",
        required: true,
        placeholder: "Select purpose",
        hint: "Choose the option that best matches your situation",
        mappingTo: "field_8",
        options: [
          { value: "Tourism", label: "Tourism (vacation, visiting family)" },
          { value: "Employment", label: "Employment (going abroad for work)" },
          { value: "Education", label: "Education (studying abroad)" },
          { value: "Business", label: "Business (business trips)" },
          { value: "Other", label: "Other purposes" },
        ],
        validation: [],
      },
    ],

    sections: [
      {
        id: "section_1",
        title: "Personal Information",
        titleNepali: "व्यक्तिगत जानकारी",
        description: "Basic details about yourself",
        order: 1,
        fields: ["field_1", "field_2", "field_3"],
        estimatedTimeMinutes: 5,
      },
      {
        id: "section_2",
        title: "Address Details",
        titleNepali: "ठेगाना विवरण",
        description: "Your residential information",
        order: 2,
        fields: ["field_4"],
        estimatedTimeMinutes: 3,
      },
      {
        id: "section_3",
        title: "Contact Information",
        titleNepali: "सम्पर्क जानकारी",
        description: "How we can reach you",
        order: 3,
        fields: ["field_5", "field_6"],
        estimatedTimeMinutes: 2,
      },
      {
        id: "section_4",
        title: "Passport Details",
        titleNepali: "राहदानी विवरण",
        description: "Type and purpose of passport",
        order: 4,
        fields: ["field_7", "field_8"],
        estimatedTimeMinutes: 3,
      },
    ],

    fieldMappings: [
      {
        simplifiedFieldId: "simplified_field_1",
        originalFieldId: "field_1",
        originalSection: "Personal Information",
        originalFieldName: "Full Name (As per Citizenship Certificate)",
        instructions: "Copy your name from 'Your Full Name' field to 'Full Name (As per Citizenship Certificate)' in Personal Information section",
      },
      {
        simplifiedFieldId: "simplified_field_2",
        originalFieldId: "field_2",
        originalSection: "Personal Information",
        originalFieldName: "Date of Birth (B.S.)",
        instructions: "The selected date will be automatically converted to Bikram Sambat format",
      },
      {
        simplifiedFieldId: "simplified_field_3",
        originalFieldId: "field_3",
        originalSection: "Personal Information",
        originalFieldName: "Citizenship Certificate Number",
        instructions: "Copy the citizenship number with dashes to the official form",
      },
      {
        simplifiedFieldId: "simplified_field_4",
        originalFieldId: "field_4",
        originalSection: "Address Details",
        originalFieldName: "Permanent Address",
        instructions: "Enter the complete address in the Permanent Address field",
      },
      {
        simplifiedFieldId: "simplified_field_5",
        originalFieldId: "field_5",
        originalSection: "Contact Information",
        originalFieldName: "Contact Number (Mobile)",
        instructions: "Enter the 10-digit mobile number",
      },
      {
        simplifiedFieldId: "simplified_field_6",
        originalFieldId: "field_6",
        originalSection: "Contact Information",
        originalFieldName: "Email Address",
        instructions: "Copy email address if provided (optional field)",
      },
      {
        simplifiedFieldId: "simplified_field_7",
        originalFieldId: "field_7",
        originalSection: "Passport Details",
        originalFieldName: "Passport Type",
        instructions: "Select the passport type from dropdown",
      },
      {
        simplifiedFieldId: "simplified_field_8",
        originalFieldId: "field_8",
        originalSection: "Passport Details",
        originalFieldName: "Purpose of Passport",
        instructions: "Select the purpose from dropdown menu",
      },
    ],

    annotations: [
      {
        id: "annot_1",
        sectionId: "section_1",
        fieldId: "field_2",
        type: "tooltip",
        title: "Bikram Sambat (B.S.)",
        titleNepali: "बिक्रम संवत",
        content: "Bikram Sambat is the official Nepali calendar. It's about 56-57 years ahead of the Gregorian (English) calendar. For example, 2024 A.D. is approximately 2080-2081 B.S.",
        contentNepali: "बिक्रम संवत नेपालको आधिकारिक पात्रो हो। यो ग्रेगोरियन (अंग्रेजी) पात्रो भन्दा लगभग ५६-५७ वर्ष अगाडि छ।",
        aiGenerated: true,
        verified: false,
      },
      {
        id: "annot_2",
        sectionId: "section_4",
        fieldId: "field_7",
        type: "info",
        title: "Passport Types Explained",
        content: "Regular passports are for ordinary citizens for personal travel. Official passports are issued to government employees for official duties. Diplomatic passports are only for diplomats and high-ranking officials.",
        aiGenerated: true,
        verified: false,
      },
    ],

    requiredDocuments: [
      {
        id: "doc_1",
        name: "Citizenship Certificate (Original + Photocopy)",
        nameNepali: "नागरिकता प्रमाणपत्र (मूल + प्रतिलिपि)",
        type: "citizenship",
        description: "Original citizenship certificate and 2 photocopies",
        descriptionNepali: "मूल नागरिकता प्रमाणपत्र र २ प्रतिलिपि",
        required: true,
        acceptedFormats: ["pdf", "jpg"],
        maxSizeBytes: 5242880, // 5MB
      },
      {
        id: "doc_2",
        name: "Passport Size Photos (4 copies)",
        nameNepali: "राहदानी साइज फोटो (४ प्रति)",
        type: "passport",
        description: "Recent passport-size photos with white background",
        required: true,
        acceptedFormats: ["jpg", "png"],
        maxSizeBytes: 2097152, // 2MB
      },
      {
        id: "doc_3",
        name: "Payment Receipt",
        type: "other",
        description: "Proof of payment for passport fee",
        required: true,
        acceptedFormats: ["pdf", "jpg"],
        maxSizeBytes: 2097152,
      },
    ],

    aiAnalysis: {
      estimatedCompletionMinutes: 15,
      complexityScore: 60,
      legalTermsCount: 3,
      commonMistakes: [
        "Name mismatch with citizenship",
        "Incorrect date format",
        "Missing signature",
      ],
    },

    statistics: {
      totalSubmissions: 15420,
      successRate: 89,
      averageCompletionTime: 18,
      popularityScore: 95,
    },

    isActive: true,
    isVerified: true,
    needsUpdate: false,
    tags: ["passport", "travel", "identification"],
    keywords: ["passport", "application", "travel document", "राहदानी"],
    createdAt: Timestamp.fromDate(new Date("2024-01-15")),
    updatedAt: Timestamp.fromDate(new Date("2024-10-20")),
    scrapedAt: Timestamp.fromDate(new Date("2024-10-20")),
  },

  // Add more mock forms...
  {
    id: "pan-card-registration",
    name: "PAN Card Registration Form",
    nameNepali: "स्थायी लेखा नम्बर (PAN) दर्ता फारम",
    department: "finance",
    documentType: "pan-card",
    version: "2024.2",
    difficulty: "easy",
    officialUrl: "https://www.ird.gov.np",
    
    originalFields: [
      {
        id: "pan_field_1",
        label: "Full Name",
        type: "text",
        section: "Basic Information",
        position: { page: 1, x: 100, y: 100, width: 300, height: 30 },
        required: true,
        placeholder: "Your full name",
      },
      {
        id: "pan_field_2",
        label: "Date of Birth",
        type: "date",
        section: "Basic Information",
        position: { page: 1, x: 100, y: 150, width: 200, height: 30 },
        required: true,
      },
      {
        id: "pan_field_3",
        label: "Father's Name",
        type: "text",
        section: "Family Details",
        position: { page: 1, x: 100, y: 200, width: 300, height: 30 },
        required: true,
      },
      {
        id: "pan_field_4",
        label: "Occupation",
        type: "select",
        section: "Professional Details",
        position: { page: 1, x: 100, y: 250, width: 250, height: 30 },
        required: true,
        options: ["Business", "Service", "Agriculture", "Student", "Other"],
      },
    ],

    simplifiedFields: [
      {
        id: "simplified_pan_1",
        label: "What's Your Name?",
        type: "text",
        description: "Enter your complete name as it appears on official documents",
        required: true,
        placeholder: "Ramesh Kumar Sharma",
        hint: "Use your legal name",
        example: "Sita Devi Thapa",
        mappingTo: "pan_field_1",
      },
      {
        id: "simplified_pan_2",
        label: "Your Date of Birth",
        type: "date",
        description: "Select when you were born",
        required: true,
        placeholder: "Select date",
        hint: "Must be 16 years or older to get PAN",
        example: "01/01/2000",
        mappingTo: "pan_field_2",
      },
      {
        id: "simplified_pan_3",
        label: "Father's Full Name",
        type: "text",
        description: "Enter your father's complete name",
        required: true,
        placeholder: "Hari Bahadur Sharma",
        hint: "As per citizenship certificate",
        example: "Krishna Prasad Thapa",
        mappingTo: "pan_field_3",
      },
      {
        id: "simplified_pan_4",
        label: "What Do You Do?",
        type: "select",
        description: "Select your primary occupation or source of income",
        required: true,
        placeholder: "Choose occupation",
        hint: "Select the option that best describes you",
        mappingTo: "pan_field_4",
        options: [
          { value: "Business", label: "Business Owner" },
          { value: "Service", label: "Salaried Employee" },
          { value: "Agriculture", label: "Farmer" },
          { value: "Student", label: "Student" },
          { value: "Other", label: "Other" },
        ],
      },
    ],

    sections: [
      {
        id: "pan_section_1",
        title: "Basic Information",
        description: "Your personal details",
        order: 1,
        fields: ["pan_field_1", "pan_field_2"],
        estimatedTimeMinutes: 3,
      },
      {
        id: "pan_section_2",
        title: "Family Details",
        description: "Information about your family",
        order: 2,
        fields: ["pan_field_3"],
        estimatedTimeMinutes: 2,
      },
      {
        id: "pan_section_3",
        title: "Professional Details",
        description: "Your occupation information",
        order: 3,
        fields: ["pan_field_4"],
        estimatedTimeMinutes: 2,
      },
    ],

    fieldMappings: [],
    annotations: [],
    requiredDocuments: [
      {
        id: "pan_doc_1",
        name: "Citizenship Certificate Copy",
        type: "citizenship",
        description: "Photocopy of citizenship certificate",
        required: true,
        acceptedFormats: ["pdf", "jpg"],
        maxSizeBytes: 5242880,
      },
      {
        id: "pan_doc_2",
        name: "Passport Size Photo",
        type: "passport",
        description: "Recent passport-size photo",
        required: true,
        acceptedFormats: ["jpg", "png"],
        maxSizeBytes: 2097152,
      },
    ],

    aiAnalysis: {
      estimatedCompletionMinutes: 8,
      complexityScore: 30,
      legalTermsCount: 2,
      commonMistakes: ["Missing father's name", "Incorrect date format"],
    },

    statistics: {
      totalSubmissions: 8540,
      successRate: 94,
      averageCompletionTime: 10,
      popularityScore: 90,
    },

    isActive: true,
    isVerified: true,
    needsUpdate: false,
    tags: ["pan", "tax", "finance", "identification"],
    keywords: ["pan card", "tax", "finance", "permanent account number"],
    createdAt: Timestamp.fromDate(new Date("2024-02-10")),
    updatedAt: Timestamp.fromDate(new Date("2024-10-15")),
    scrapedAt: Timestamp.fromDate(new Date("2024-10-15")),
  },
];

// Export individual mock form by ID
export const getMockFormById = (id: string): GovernmentForm | undefined => {
  return mockForms.find((form) => form.id === id);
};

// Export all active mock forms
export const getActiveMockForms = (): GovernmentForm[] => {
  return mockForms.filter((form) => form.isActive);
};

// Export mock forms by department
export const getMockFormsByDepartment = (department: string): GovernmentForm[] => {
  return mockForms.filter((form) => form.department === department);
};

// Export mock forms by document type
export const getMockFormsByDocumentType = (docType: string): GovernmentForm[] => {
  return mockForms.filter((form) => form.documentType === docType);
};
